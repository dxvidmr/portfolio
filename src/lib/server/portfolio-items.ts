import { db } from '$lib/server/db';
import type { PortfolioRelatedItem } from '$lib/types/portfolio';
import { getPublicAdditionalLinks, groupPublicAdditionalLinks } from '$lib/server/public-links';
import { getPublicDocuments, groupPublicDocuments } from '$lib/server/public-documents';

const nullable = (value: unknown) => (value == null ? null : String(value));

export async function getPortfolioItems(portfolioSlug?: string): Promise<PortfolioRelatedItem[]> {
	const where = portfolioSlug
		? "WHERE pi.portfolio_slug = ? AND e.public = 1 AND portfolio_project.publication_status = 'published'"
		: "WHERE e.public = 1 AND portfolio_project.publication_status = 'published'";
	const [result, publicLinks, publicDocuments] = await Promise.all([db.execute({
		sql: `SELECT pi.portfolio_slug, pi.entity_type, pi.entity_id,
		             pi.featured, pi.sort_order, e.title_cache AS title, e.sort_date,
			             COALESCE(
			               pub.publication_type,
			               event.contribution_type,
			               work.work_type,
			               teaching.teaching_type,
			               research_project.project_type,
			               service.activity_type,
			               award.award_type
			             ) AS subtype,
		             tv.label_es AS subtype_label_es,
		             tv.label_en AS subtype_label_en,
		             CASE
		               WHEN pi.entity_type = 'publications' THEN
		                 CASE
		                   WHEN NULLIF(TRIM(pub.journal_title), '') IS NOT NULL
		                     THEN pub.journal_title
		                   WHEN NULLIF(TRIM(pub.book_title), '') IS NOT NULL
		                     THEN pub.book_title ||
		                       CASE
		                         WHEN NULLIF(TRIM(pub.publisher), '') IS NOT NULL
		                           THEN ' · ' || pub.publisher
		                         ELSE ''
			             END
			           ELSE NULLIF(TRIM(pub.publisher), '')
			         END
			       WHEN pi.entity_type = 'talks' THEN
			         canonical_event.title ||
			           CASE
			             WHEN NULLIF(TRIM(canonical_event.institution), '') IS NOT NULL
			               AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.institution)) = 0
			               THEN ' · ' || canonical_event.institution
			             ELSE ''
			           END ||
			           CASE
			             WHEN NULLIF(TRIM(canonical_event.city), '') IS NOT NULL
			               AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.city)) = 0
			               THEN ' · ' || canonical_event.city
			             ELSE ''
			           END ||
			           CASE
			             WHEN NULLIF(TRIM(canonical_event.country), '') IS NOT NULL
			               AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.country)) = 0
			               THEN ' · ' || canonical_event.country
		                     ELSE ''
		                   END
		               WHEN pi.entity_type = 'service_activities' THEN
		                 COALESCE(canonical_service_event.title, service.venue_or_journal)
			               WHEN pi.entity_type = 'research_stays' THEN
			                 COALESCE(stay.faculty_or_dept, stay.city, stay.country)
			               ELSE COALESCE(
			                 work.institution,
			                 teaching.institution,
			                 research_project.research_group,
			                 research_project.institution,
			                 service.venue_or_journal,
			                 education.institution,
			                 course.institution,
			                 award.awarding_body,
			                 membership.role,
			                 skill.items_text,
			                 language.level
			               )
			             END AS detail,
			             COALESCE(
			               pub.url,
		               event.url,
		               canonical_event.url,
			               work.url,
			               teaching.url,
			               research_project.url,
		               service.url,
		               canonical_service_event.url,
			               education.url,
			               stay.url,
			               course.url,
			               award.url
			             ) AS url
		      FROM portfolio_items pi
		      JOIN portfolio_projects portfolio_project
		        ON portfolio_project.slug = pi.portfolio_slug
		      JOIN entries e
		        ON e.entity_type = pi.entity_type AND e.entity_id = pi.entity_id
		      LEFT JOIN publications pub
		        ON pi.entity_type = 'publications' AND pub.id = pi.entity_id
		      LEFT JOIN talks event
		        ON pi.entity_type = 'talks' AND event.id = pi.entity_id
		      LEFT JOIN events canonical_event
		        ON canonical_event.id = event.canonical_event_id
		      LEFT JOIN academic_works work
		        ON pi.entity_type = 'academic_works' AND work.id = pi.entity_id
		      LEFT JOIN teaching
		        ON pi.entity_type = 'teaching' AND teaching.id = pi.entity_id
		      LEFT JOIN projects research_project
		        ON pi.entity_type = 'projects' AND research_project.id = pi.entity_id
		      LEFT JOIN service_activities service
		        ON pi.entity_type = 'service_activities' AND service.id = pi.entity_id
		      LEFT JOIN events canonical_service_event
		        ON canonical_service_event.id = service.canonical_event_id
		      LEFT JOIN education
		        ON pi.entity_type = 'education' AND education.id = pi.entity_id
		      LEFT JOIN research_stays stay
		        ON pi.entity_type = 'research_stays' AND stay.id = pi.entity_id
		      LEFT JOIN courses course
		        ON pi.entity_type = 'courses' AND course.id = pi.entity_id
		      LEFT JOIN funding_awards award
		        ON pi.entity_type = 'funding_awards' AND award.id = pi.entity_id
		      LEFT JOIN memberships membership
		        ON pi.entity_type = 'memberships' AND membership.id = pi.entity_id
		      LEFT JOIN skills skill
		        ON pi.entity_type = 'skills' AND skill.id = pi.entity_id
		      LEFT JOIN languages language
		        ON pi.entity_type = 'languages' AND language.id = pi.entity_id
		      LEFT JOIN type_vocab tv
		        ON tv.code = COALESCE(
		          pub.publication_type,
		          event.contribution_type,
		          work.work_type,
		          teaching.teaching_type,
		          research_project.project_type,
		          service.activity_type,
		          award.award_type
		        )
		      ${where}
		      ORDER BY pi.portfolio_slug, (e.sort_date IS NULL) ASC,
		               e.sort_date DESC, e.title_cache COLLATE NOCASE ASC`,
		args: portfolioSlug ? [portfolioSlug] : []
	}), getPublicAdditionalLinks(), getPublicDocuments()]);
	const linksByEntry = groupPublicAdditionalLinks(publicLinks);
	const documentsByEntry = groupPublicDocuments(publicDocuments);

	return result.rows.map((row) => {
		const canonicalUrl = nullable(row.url);
		const links = (linksByEntry.get(`${row.entity_type}:${row.entity_id}`) ?? [])
			.filter((link) => link.url !== canonicalUrl)
			.map((link) => ({
				url: link.url,
				label_es: link.labelEs,
				label_en: link.labelEn,
				is_primary: link.isPrimary
			}));
		const usedUrls = new Set([canonicalUrl, ...links.map((link) => link.url)]);
		return {
			portfolio_slug: String(row.portfolio_slug),
			entity_type: String(row.entity_type),
			entity_id: Number(row.entity_id),
			title: String(row.title),
			sort_date: nullable(row.sort_date),
			subtype: nullable(row.subtype),
			subtype_label_es: nullable(row.subtype_label_es),
			subtype_label_en: nullable(row.subtype_label_en),
			detail: nullable(row.detail),
			url: canonicalUrl,
			links,
			documents: (documentsByEntry.get(`${row.entity_type}:${row.entity_id}`) ?? [])
				.filter((document) => !usedUrls.has(document.url))
				.map((document) => ({
					url: document.url,
					title: document.title,
					label_es: document.typeLabelEs,
					label_en: document.typeLabelEn
				})),
			featured: Number(row.featured) === 1,
			sort_order: Number(row.sort_order)
		};
	});
}
