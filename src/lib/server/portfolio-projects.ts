import { db } from '$lib/server/db';
import type {
	PortfolioProjectMetadata,
	PortfolioPublicationStatus,
	PortfolioTaxonomyTerm
} from '$lib/types/portfolio';

const text = (value: unknown) => String(value ?? '').trim();
const publicationStatus = (value: unknown): PortfolioPublicationStatus => {
	const status = String(value);
	return status === 'draft' || status === 'archived' ? status : 'published';
};

const metadataFromRow = (
	row: Record<string, unknown>,
	tags: PortfolioTaxonomyTerm[]
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
	tags,
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
	const [projects, tags] = await Promise.all([
		db.execute(`
			SELECT project.slug, project.title_es, project.title_en, project.kind_code,
			       kind.label_es AS kind_es, kind.label_en AS kind_en,
			       project.summary_es, project.summary_en, project.status_es,
			       project.status_en, project.period, project.links_json,
			       project.publication_status, project.sort_order
			FROM portfolio_projects AS project
			JOIN type_vocab AS kind
			  ON kind.code = project.kind_code
			 AND kind.domain = 'portfolio_kind'
			${options.publicOnly ? "WHERE project.publication_status = 'published'" : ''}
			ORDER BY project.sort_order ASC, project.title_es COLLATE NOCASE ASC`),
		db.execute(`
			SELECT relation.portfolio_slug, vocab.code,
			       vocab.label_es, vocab.label_en
			FROM portfolio_project_tags AS relation
			JOIN type_vocab AS vocab
			  ON vocab.code = relation.tag_code
			 AND vocab.domain = 'portfolio_tag'
			ORDER BY relation.portfolio_slug, relation.sort_order, vocab.sort_order`)
	]);
	const tagsBySlug = new Map<string, PortfolioTaxonomyTerm[]>();
	for (const row of tags.rows) {
		const slug = text(row.portfolio_slug);
		const values = tagsBySlug.get(slug) ?? [];
		values.push({
			code: text(row.code),
			es: text(row.label_es),
			en: text(row.label_en) || text(row.label_es)
		});
		tagsBySlug.set(slug, values);
	}
	return projects.rows.map((row) => metadataFromRow(row, tagsBySlug.get(text(row.slug)) ?? []));
}

export async function portfolioProjectExists(slug: string): Promise<boolean> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM portfolio_projects WHERE slug = ? LIMIT 1',
		args: [slug]
	});
	return result.rows.length > 0;
}
