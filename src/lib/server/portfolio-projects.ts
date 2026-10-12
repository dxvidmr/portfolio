import { db } from '$lib/server/db';
import type {
	PortfolioProjectMetadata,
	PortfolioPublicationStatus,
	PortfolioSkill
} from '$lib/types/portfolio';

const text = (value: unknown) => String(value ?? '').trim();
const publicationStatus = (value: unknown): PortfolioPublicationStatus => {
	const status = String(value);
	return status === 'draft' || status === 'archived' ? status : 'published';
};

const metadataFromRow = (
	row: Record<string, unknown>,
	skills: PortfolioSkill[]
): PortfolioProjectMetadata => ({
	slug: text(row.slug),
	title: { es: text(row.title_es), en: text(row.title_en) },
	kind: {
		code: text(row.kind_code),
		es: text(row.kind_es),
		en: text(row.kind_en) || text(row.kind_es)
	},
	summary: { es: text(row.summary_es), en: text(row.summary_en) },
	status: { es: text(row.status_es), en: text(row.status_en) },
	period: text(row.period),
	researchLine: row.research_line
		? { code: text(row.research_line), es: text(row.line_es), en: text(row.line_en) || text(row.line_es) }
		: null,
	skills,
	links: (() => {
		try {
			const links = JSON.parse(String(row.links_json));
			return Array.isArray(links)
				? links.flatMap((link) =>
						typeof link === 'object' && link !== null && typeof link.url === 'string'
							? [{
									label: {
										es: text(link.label_es),
										en: text(link.label_en) || text(link.label_es)
									},
									url: link.url
								}]
							: []
					)
				: [];
		} catch {
			return [];
		}
	})(),
	publicationStatus: publicationStatus(row.publication_status),
	sortOrder: Number(row.sort_order)
});

export async function getPortfolioProjects(options: { publicOnly?: boolean } = {}): Promise<PortfolioProjectMetadata[]> {
	const [projects, skills] = await Promise.all([
		db.execute(`
			SELECT project.slug, project.title_es, project.title_en, project.kind_code,
			       kind.label_es AS kind_es, kind.label_en AS kind_en,
			       project.summary_es, project.summary_en, project.status_es,
			       project.status_en, project.period, project.links_json,
			       project.publication_status, project.sort_order,
			       project.research_line, line.label_es AS line_es, line.label_en AS line_en
			FROM portfolio_projects AS project
			JOIN type_vocab AS kind
			  ON kind.code = project.kind_code
			 AND kind.domain = 'portfolio_kind'
			LEFT JOIN type_vocab AS line
			  ON line.code = project.research_line
			 AND line.domain = 'research_line'
			${options.publicOnly ? "WHERE project.publication_status = 'published'" : ''}
			ORDER BY project.sort_order ASC, project.title_es COLLATE NOCASE ASC`),
		// En la web solo las competencias públicas; en el panel, todas.
		db.execute(`
			SELECT link.portfolio_slug, skill.id, skill.name_es, skill.name_en,
			       area.code AS area_code, area.label_es AS area_es, area.label_en AS area_en,
			       area.sort_order AS area_order
			FROM skill_portfolio_links AS link
			JOIN skills AS skill ON skill.id = link.skill_id
			LEFT JOIN type_vocab AS area ON area.code = skill.area
			${options.publicOnly ? "JOIN entries AS entry ON entry.entity_type = 'skills' AND entry.entity_id = skill.id AND entry.public = 1" : ''}
			ORDER BY link.portfolio_slug, area.sort_order, skill.sort_order, skill.name_es`)
	]);
	const skillsBySlug = new Map<string, PortfolioSkill[]>();
	for (const row of skills.rows) {
		const slug = text(row.portfolio_slug);
		skillsBySlug.set(slug, [
			...(skillsBySlug.get(slug) ?? []),
			{
				id: Number(row.id),
				es: text(row.name_es),
				en: text(row.name_en) || text(row.name_es),
				area: {
					code: text(row.area_code),
					es: text(row.area_es),
					en: text(row.area_en) || text(row.area_es),
					sortOrder: Number(row.area_order ?? 0)
				}
			}
		]);
	}
	return projects.rows.map((row) => metadataFromRow(row, skillsBySlug.get(text(row.slug)) ?? []));
}

export async function portfolioProjectExists(slug: string): Promise<boolean> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM portfolio_projects WHERE slug = ? LIMIT 1',
		args: [slug]
	});
	return result.rows.length > 0;
}
