import { db } from '$lib/server/db';
import type { PortfolioRelatedItem } from '$lib/types/portfolio';

const nullable = (value: unknown) => (value == null ? null : String(value));

export async function getPortfolioItems(portfolioSlug?: string): Promise<PortfolioRelatedItem[]> {
	const where = portfolioSlug ? 'WHERE pi.portfolio_slug = ? AND e.public = 1' : 'WHERE e.public = 1';
	const result = await db.execute({
		sql: `SELECT pi.portfolio_slug, pi.entity_type, pi.entity_id,
		             pi.featured, pi.sort_order, e.title_cache AS title, e.sort_date,
		             COALESCE(
		               pub.publication_type,
		               event.contribution_type,
		               work.work_type,
		               teaching.teaching_type,
		               research_project.project_type,
		               service.activity_type
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
		               WHEN pi.entity_type = 'academic_events' THEN
		                 event.event_title ||
		                   CASE
		                     WHEN NULLIF(TRIM(event.institution), '') IS NOT NULL
		                       AND INSTR(LOWER(event.event_title), LOWER(event.institution)) = 0
		                       THEN ' · ' || event.institution
		                     ELSE ''
		                   END ||
		                   CASE
		                     WHEN NULLIF(TRIM(event.city), '') IS NOT NULL
		                       AND INSTR(LOWER(event.event_title), LOWER(event.city)) = 0
		                       THEN ' · ' || event.city
		                     ELSE ''
		                   END ||
		                   CASE
		                     WHEN NULLIF(TRIM(event.country), '') IS NOT NULL
		                       AND INSTR(LOWER(event.event_title), LOWER(event.country)) = 0
		                       THEN ' · ' || event.country
		                     ELSE ''
		                   END
		               ELSE COALESCE(
		                 work.institution,
		                 teaching.institution,
		                 research_project.research_group,
		                 research_project.institution,
		                 service.venue_or_journal
		               )
		             END AS detail,
		             COALESCE(
		               pub.url,
		               event.url,
		               work.url,
		               teaching.url,
		               research_project.url,
		               service.url
		             ) AS url
		      FROM portfolio_items pi
		      JOIN entries e
		        ON e.entity_type = pi.entity_type AND e.entity_id = pi.entity_id
		      LEFT JOIN publications pub
		        ON pi.entity_type = 'publications' AND pub.id = pi.entity_id
		      LEFT JOIN academic_events event
		        ON pi.entity_type = 'academic_events' AND event.id = pi.entity_id
		      LEFT JOIN academic_works work
		        ON pi.entity_type = 'academic_works' AND work.id = pi.entity_id
		      LEFT JOIN teaching
		        ON pi.entity_type = 'teaching' AND teaching.id = pi.entity_id
		      LEFT JOIN projects research_project
		        ON pi.entity_type = 'projects' AND research_project.id = pi.entity_id
		      LEFT JOIN service_activities service
		        ON pi.entity_type = 'service_activities' AND service.id = pi.entity_id
		      LEFT JOIN type_vocab tv
		        ON tv.code = COALESCE(
		          pub.publication_type,
		          event.contribution_type,
		          work.work_type,
		          teaching.teaching_type,
		          research_project.project_type,
		          service.activity_type
		        )
		      ${where}
		      ORDER BY pi.portfolio_slug, pi.featured DESC, pi.sort_order ASC, e.sort_date DESC`,
		args: portfolioSlug ? [portfolioSlug] : []
	});

	return result.rows.map((row) => ({
		portfolio_slug: String(row.portfolio_slug),
		entity_type: String(row.entity_type),
		entity_id: Number(row.entity_id),
		title: String(row.title),
		sort_date: nullable(row.sort_date),
		subtype: nullable(row.subtype),
		subtype_label_es: nullable(row.subtype_label_es),
		subtype_label_en: nullable(row.subtype_label_en),
		detail: nullable(row.detail),
		url: nullable(row.url),
		featured: Number(row.featured) === 1,
		sort_order: Number(row.sort_order)
	}));
}
