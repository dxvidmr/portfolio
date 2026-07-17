import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPublicAdditionalLinks, groupPublicAdditionalLinks } from '$lib/server/public-links';
import { entryMetadataFromRow, publicFundingMetadataSql } from '$lib/server/public-entry-metadata';

// La visibilidad la gobierna la vista `entries` (entry_controls): el CV solo
// muestra filas con public = 1, igual que la portada.
const sections = [
	{
		key: 'publications',
		title: 'Publicaciones',
		sql: `SELECT p.id AS entity_id, p.title, p.publication_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             p.authors_text AS detail, p.year, p.doi, p.url,
		             p.authors_text AS metadata_authors, p.editors_text AS metadata_editors,
		             p.my_role AS metadata_my_role, p.publication_type AS metadata_publication_type,
		             container_type.label_es AS metadata_container_type_label_es, container_type.label_en AS metadata_container_type_label_en,
		             conference_format.label_es AS metadata_conference_format_label_es, conference_format.label_en AS metadata_conference_format_label_en,
		             review_status.label_es AS metadata_review_status_label_es, review_status.label_en AS metadata_review_status_label_en,
		             p.journal_title AS metadata_journal_title, p.book_title AS metadata_book_title,
		             p.publisher AS metadata_publisher, p.volume AS metadata_volume,
		             p.issue AS metadata_issue, p.pages AS metadata_pages
		      FROM publications p
		      JOIN entries e ON e.entity_type = 'publications' AND e.entity_id = p.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = p.publication_type
		      LEFT JOIN type_vocab container_type ON container_type.code = p.container_type
		      LEFT JOIN type_vocab conference_format ON conference_format.code = p.conference_publication_format
		      LEFT JOIN type_vocab review_status ON review_status.code = p.review_status
		      ORDER BY p.year DESC, p.title ASC`
	},
	{
		key: 'talks',
		title: 'Eventos académicos',
		sql: `SELECT a.id AS entity_id, a.title, a.contribution_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             canonical.title AS detail,
		             substr(COALESCE(a.date_start, canonical.date_start, CAST(canonical.year AS TEXT)), 1, 4) AS year,
		             a.doi, COALESCE(a.url, canonical.url) AS url,
		             a.authors_text AS metadata_authors, canonical.title AS metadata_event_title,
		             canonical.institution AS metadata_institution, canonical.city AS metadata_city,
		             canonical.country AS metadata_country,
		             selection.label_es AS metadata_selection_label_es, selection.label_en AS metadata_selection_label_en,
		             session.label_es AS metadata_session_label_es, session.label_en AS metadata_session_label_en,
		             a.session_title AS metadata_session_title
		      FROM talks a
		      JOIN entries e ON e.entity_type = 'talks' AND e.entity_id = a.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = a.contribution_type
		      LEFT JOIN type_vocab selection ON selection.code = a.selection_mode
		      LEFT JOIN type_vocab session ON session.code = a.session_format
		      LEFT JOIN events canonical ON canonical.id = a.canonical_event_id
		      ORDER BY COALESCE(a.date_start, canonical.date_start, CAST(canonical.year AS TEXT)) DESC,
		               a.title ASC`
	},
	{
		key: 'teaching',
		title: 'Docencia',
		sql: `SELECT t.id AS entity_id, t.title, t.teaching_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             t.institution AS detail,
		             COALESCE(substr(t.date_start, 1, 4), substr(t.academic_year, 1, 4)) AS year, t.url
		      FROM teaching t
		      JOIN entries e ON e.entity_type = 'teaching' AND e.entity_id = t.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = t.teaching_type
		      ORDER BY year DESC, t.title ASC`
	},
	{
		key: 'projects',
		title: 'Proyectos de investigación',
		sql: `SELECT p.id AS entity_id, p.title, p.project_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             p.institution AS detail, substr(p.date_start, 1, 4) AS year, p.url
		      FROM projects p
		      JOIN entries e ON e.entity_type = 'projects' AND e.entity_id = p.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = p.project_type
		      ORDER BY year DESC, p.title ASC`
	},
	{
		key: 'education',
		title: 'Formación',
		sql: `SELECT ed.id AS entity_id, ed.degree_title AS title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             ed.institution AS detail,
		             COALESCE(substr(ed.date_end, 1, 4), substr(ed.date_start, 1, 4)) AS year, ed.url
		      FROM education ed
		      JOIN entries e ON e.entity_type = 'education' AND e.entity_id = ed.id AND e.public = 1
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'research_stays',
		title: 'Estancias',
		sql: `SELECT r.id AS entity_id, r.institution AS title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             r.faculty_or_dept AS detail,
		             substr(r.date_start, 1, 4) AS year, r.url,
		             ${publicFundingMetadataSql('r')} AS metadata_funding
		      FROM research_stays r
		      JOIN entries e ON e.entity_type = 'research_stays' AND e.entity_id = r.id AND e.public = 1
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'funding_awards',
		title: 'Financiación y premios',
		sql: `SELECT f.id AS entity_id, f.title, f.award_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             f.awarding_body AS detail, f.year, f.url
		      FROM funding_awards f
		      JOIN entries e ON e.entity_type = 'funding_awards' AND e.entity_id = f.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = f.award_type
		      ORDER BY f.year DESC, f.title ASC`
	},
	{
		key: 'service_activities',
		title: 'Servicio académico',
		sql: `SELECT s.id AS entity_id, s.title, s.activity_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             COALESCE(canonical.title, s.venue_or_journal) AS detail,
		             substr(COALESCE(s.date_start, canonical.date_start, CAST(canonical.year AS TEXT)), 1, 4) AS year,
		             COALESCE(s.url, canonical.url) AS url
		      FROM service_activities s
		      JOIN entries e ON e.entity_type = 'service_activities' AND e.entity_id = s.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = s.activity_type
		      LEFT JOIN events canonical ON canonical.id = s.canonical_event_id
			      ORDER BY COALESCE(s.date_start, canonical.date_start, CAST(canonical.year AS TEXT)) DESC,
			               s.title ASC`
	},
	{
		key: 'academic_works',
		title: 'Trabajos académicos',
		sql: `SELECT w.id AS entity_id, w.title, w.work_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             TRIM(w.institution || CASE WHEN NULLIF(TRIM(w.program), '') IS NOT NULL THEN ', ' || w.program ELSE '' END) AS detail,
		             w.year, w.url
		      FROM academic_works w
		      JOIN entries e ON e.entity_type = 'academic_works' AND e.entity_id = w.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = w.work_type
		      ORDER BY w.year DESC, w.title ASC`
	},
	{
		key: 'courses',
		title: 'Cursos y formación complementaria',
		sql: `SELECT c.id AS entity_id, c.title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             TRIM(c.institution || CASE WHEN NULLIF(TRIM(c.program_context), '') IS NOT NULL THEN ', ' || c.program_context ELSE '' END) AS detail,
		             COALESCE(substr(c.date_end, 1, 4), substr(c.date_start, 1, 4)) AS year, c.url
		      FROM courses c
		      JOIN entries e ON e.entity_type = 'courses' AND e.entity_id = c.id AND e.public = 1
		      ORDER BY year DESC, c.title ASC`
	},
	{
		key: 'memberships',
		title: 'Asociaciones científicas',
		sql: `SELECT m.id AS entity_id, m.organization AS title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             m.role AS detail, substr(m.date_start, 1, 4) AS year, NULL AS url
		      FROM memberships m
		      JOIN entries e ON e.entity_type = 'memberships' AND e.entity_id = m.id AND e.public = 1
		      ORDER BY year DESC, m.organization ASC`
	},
	{
		key: 'skills',
		title: 'Competencias',
		sql: `SELECT s.id AS entity_id, s.category AS title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             s.items_text AS detail, NULL AS year, NULL AS url
		      FROM skills s
		      JOIN entries e ON e.entity_type = 'skills' AND e.entity_id = s.id AND e.public = 1
		      ORDER BY s.sort_order, s.category ASC`
	},
	{
		key: 'languages',
		title: 'Idiomas',
		sql: `SELECT l.id AS entity_id, l.language AS title, NULL AS type, NULL AS type_label_es, NULL AS type_label_en,
		             l.level AS detail, NULL AS year, NULL AS url, l.is_native
		      FROM languages l
		      JOIN entries e ON e.entity_type = 'languages' AND e.entity_id = l.id AND e.public = 1
		      ORDER BY l.is_native DESC, l.language ASC`
	}
] as const;

const normalize = (value: unknown) => (value == null ? null : String(value));
const normalizeDoi = (value: unknown) => {
	const raw = normalize(value)?.trim();
	if (!raw) return null;
	const doi = raw
		.replace(/^doi:\s*/i, '')
		.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
		.trim();
	return doi || null;
};

export const load: PageServerLoad = async () => {
	const [results, publicLinks] = await Promise.all([
		Promise.all(
		sections.map(async (section) => {
			const res = await db.execute(section.sql);
			return {
				key: section.key,
				title: section.title,
				items: res.rows.map((row) => {
					const doi = normalizeDoi(row.doi);
					return {
						entity_id: Number(row.entity_id),
						title: String(row.title),
						type: normalize(row.type),
						type_label_es: normalize(row.type_label_es),
						type_label_en: normalize(row.type_label_en),
						detail: normalize(row.detail),
						is_native: Number(row.is_native) === 1,
						hide_year: section.key === 'skills' || section.key === 'languages',
						metadata: entryMetadataFromRow({ ...row, entity_type: section.key }),
						year: normalize(row.year),
						doi,
						doi_url: doi ? `https://doi.org/${doi}` : null,
						url: normalize(row.url)
					};
				})
			};
		})
		),
		getPublicAdditionalLinks()
	]);
	const linksByEntry = groupPublicAdditionalLinks(publicLinks);
	const enrichedResults = results.map((section) => ({
		...section,
		items: section.items.map((item) => {
			const canonicalUrls = new Set([item.url, item.doi_url].filter(Boolean));
			const links = (linksByEntry.get(`${section.key}:${item.entity_id}`) ?? [])
				.filter((link) => !canonicalUrls.has(link.url))
				.map((link) => ({
					url: link.url,
					label_es: link.labelEs,
					label_en: link.labelEn,
					is_primary: link.isPrimary
				}));
			const targetUrl =
				item.url ??
				item.doi_url ??
				links.find((link) => link.is_primary)?.url ??
				links[0]?.url ??
				null;
			return {
				...item,
				links,
				target_url: targetUrl
			};
		})
	}));

	const years = Array.from(
		new Set(enrichedResults.flatMap((section) => section.items.map((item) => item.year).filter(Boolean)))
	).sort((a, b) => Number(b) - Number(a));

	return { sections: enrichedResults, years };
};
