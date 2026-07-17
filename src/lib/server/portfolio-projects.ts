import { db } from '$lib/server/db';
import type { PortfolioProjectMetadata, PortfolioPublicationStatus } from '$lib/types/portfolio';

const text = (value: unknown) => String(value ?? '').trim();
const publicationStatus = (value: unknown): PortfolioPublicationStatus => {
	const status = String(value);
	return status === 'draft' || status === 'archived' ? status : 'published';
};

function tagsFromJson(value: unknown): string[] {
	try {
		const tags = JSON.parse(String(value));
		return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
	} catch {
		return [];
	}
}

const metadataFromRow = (row: Record<string, unknown>): PortfolioProjectMetadata => ({
	slug: text(row.slug),
	title: { es: text(row.title_es), en: text(row.title_en) },
	kind: { es: text(row.kind_es), en: text(row.kind_en) },
	kicker: { es: text(row.kicker_es), en: text(row.kicker_en) },
	summary: { es: text(row.summary_es), en: text(row.summary_en) },
	status: { es: text(row.status_es), en: text(row.status_en) },
	period: text(row.period),
	tags: tagsFromJson(row.tags_json),
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
	const result = await db.execute(`
		SELECT slug, title_es, title_en, kind_es, kind_en, kicker_es, kicker_en,
		       summary_es, summary_en, status_es, status_en, period, tags_json,
		       links_json, publication_status, sort_order
		FROM portfolio_projects
		${options.publicOnly ? "WHERE publication_status = 'published'" : ''}
		ORDER BY sort_order ASC, title_es COLLATE NOCASE ASC`);
	return result.rows.map((row) => metadataFromRow(row));
}

export async function portfolioProjectExists(slug: string): Promise<boolean> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM portfolio_projects WHERE slug = ? LIMIT 1',
		args: [slug]
	});
	return result.rows.length > 0;
}
