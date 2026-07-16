import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { getPublicAdditionalLinks, groupPublicAdditionalLinks } from '$lib/server/public-links';
import { getPublicDocuments, groupPublicDocuments } from '$lib/server/public-documents';

// La visibilidad la gobierna la vista `entries` (entry_controls): el CV solo
// muestra filas con public = 1, igual que la portada.
const sections = [
	{
		key: 'publications',
		title: 'Publicaciones',
		sql: `SELECT p.id AS entity_id, p.title, p.publication_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             p.authors_text AS detail, p.year, p.url
		      FROM publications p
		      JOIN entries e ON e.entity_type = 'publications' AND e.entity_id = p.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = p.publication_type
		      ORDER BY p.year DESC, p.title ASC`
	},
	{
		key: 'talks',
		title: 'Eventos académicos',
		sql: `SELECT a.id AS entity_id, a.title, a.contribution_type AS type, tv.label_es AS type_label_es, tv.label_en AS type_label_en,
		             COALESCE(canonical.title, a.event_title) AS detail,
		             COALESCE(canonical.year, a.year) AS year,
		             COALESCE(a.url, canonical.url) AS url
		      FROM talks a
		      JOIN entries e ON e.entity_type = 'talks' AND e.entity_id = a.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = a.contribution_type
		      LEFT JOIN events canonical ON canonical.id = a.canonical_event_id
		      ORDER BY COALESCE(canonical.year, a.year) DESC,
		               COALESCE(canonical.date_start, a.date_start) DESC, a.title ASC`
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
		             substr(r.date_start, 1, 4) AS year, r.url
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
		             COALESCE(canonical.year, s.year) AS year,
		             COALESCE(s.url, canonical.url) AS url
		      FROM service_activities s
		      JOIN entries e ON e.entity_type = 'service_activities' AND e.entity_id = s.id AND e.public = 1
		      LEFT JOIN type_vocab tv ON tv.code = s.activity_type
		      LEFT JOIN events canonical ON canonical.id = s.canonical_event_id
		      ORDER BY COALESCE(canonical.year, s.year) DESC,
		               COALESCE(canonical.date_start, s.date_start) DESC, s.title ASC`
	}
] as const;

const normalize = (value: unknown) => (value == null ? null : String(value));

export const load: PageServerLoad = async () => {
	const [results, publicLinks, publicDocuments] = await Promise.all([
		Promise.all(
		sections.map(async (section) => {
			const res = await db.execute(section.sql);
			return {
				key: section.key,
				title: section.title,
				items: res.rows.map((row) => ({
					entity_id: Number(row.entity_id),
					title: String(row.title),
					type: normalize(row.type),
					type_label_es: normalize(row.type_label_es),
					type_label_en: normalize(row.type_label_en),
					detail: normalize(row.detail),
					year: normalize(row.year),
					url: normalize(row.url)
				}))
			};
		})
		),
		getPublicAdditionalLinks(),
		getPublicDocuments()
	]);
	const linksByEntry = groupPublicAdditionalLinks(publicLinks);
	const documentsByEntry = groupPublicDocuments(publicDocuments);
	const enrichedResults = results.map((section) => ({
		...section,
		items: section.items.map((item) => {
			const links = (linksByEntry.get(`${section.key}:${item.entity_id}`) ?? [])
				.filter((link) => link.url !== item.url)
				.map((link) => ({
					url: link.url,
					label_es: link.labelEs,
					label_en: link.labelEn,
					is_primary: link.isPrimary
				}));
			const usedUrls = new Set([item.url, ...links.map((link) => link.url)]);
			return {
				...item,
				links,
				documents: (documentsByEntry.get(`${section.key}:${item.entity_id}`) ?? [])
					.filter((document) => !usedUrls.has(document.url))
					.map((document) => ({
						url: document.url,
						title: document.title,
						label_es: document.typeLabelEs,
						label_en: document.typeLabelEn
					}))
			};
		})
	}));

	const years = Array.from(
		new Set(enrichedResults.flatMap((section) => section.items.map((item) => item.year).filter(Boolean)))
	).sort((a, b) => Number(b) - Number(a));

	return { sections: enrichedResults, years };
};
