import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

const sections = [
	{
		key: 'publications',
		title: 'Publicaciones',
		sql: `SELECT title, publication_type AS type, authors_text AS detail, year, url
		      FROM publications
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'academic_events',
		title: 'Eventos académicos',
		sql: `SELECT title, contribution_type AS type, event_title AS detail, year, url
		      FROM academic_events
		      ORDER BY year DESC, date_start DESC, title ASC`
	},
	{
		key: 'teaching',
		title: 'Docencia',
		sql: `SELECT title, teaching_type AS type, institution AS detail,
		             COALESCE(substr(date_start, 1, 4), substr(academic_year, 1, 4)) AS year, url
		      FROM teaching
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'projects',
		title: 'Proyectos de investigación',
		sql: `SELECT title, project_type AS type, institution AS detail, substr(date_start, 1, 4) AS year, url
		      FROM projects
		      WHERE public = 1
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'education',
		title: 'Formación',
		sql: `SELECT degree_title AS title, 'education' AS type, institution AS detail,
		             COALESCE(substr(date_end, 1, 4), substr(date_start, 1, 4)) AS year, url
		      FROM education
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'research_stays',
		title: 'Estancias',
		sql: `SELECT institution AS title, 'research_stay' AS type, faculty_or_dept AS detail,
		             substr(date_start, 1, 4) AS year, url
		      FROM research_stays
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'funding_awards',
		title: 'Financiación y premios',
		sql: `SELECT title, award_type AS type, awarding_body AS detail, year, url
		      FROM funding_awards
		      ORDER BY year DESC, title ASC`
	},
	{
		key: 'service_activities',
		title: 'Servicio académico',
		sql: `SELECT title, activity_type AS type, venue_or_journal AS detail, year, url
		      FROM service_activities
		      ORDER BY year DESC, title ASC`
	}
] as const;

const normalize = (value: unknown) => (value == null ? null : String(value));

export const load: PageServerLoad = async () => {
	const results = await Promise.all(
		sections.map(async (section) => {
			const res = await db.execute(section.sql);
			return {
				key: section.key,
				title: section.title,
				items: res.rows.map((row) => ({
					title: String(row.title),
					type: normalize(row.type),
					detail: normalize(row.detail),
					year: normalize(row.year),
					url: normalize(row.url)
				}))
			};
		})
	);

	const years = Array.from(
		new Set(results.flatMap((section) => section.items.map((item) => item.year).filter(Boolean)))
	).sort((a, b) => Number(b) - Number(a));

	return { sections: results, years };
};
