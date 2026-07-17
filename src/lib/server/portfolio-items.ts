import { db } from '$lib/server/db';
import type { PortfolioRelatedItem } from '$lib/types/portfolio';
import { getPublicAdditionalLinks, groupPublicAdditionalLinks } from '$lib/server/public-links';
import { entryMetadataFromRow, publicEntryMetadataSql } from '$lib/server/public-entry-metadata';

const nullable = (value: unknown) => (value == null ? null : String(value));

export async function getPortfolioItems(portfolioSlug?: string): Promise<PortfolioRelatedItem[]> {
	const metadata = publicEntryMetadataSql('pi');
	const where = portfolioSlug
		? "WHERE pi.portfolio_slug = ? AND e.public = 1 AND portfolio_project.publication_status = 'published'"
		: "WHERE e.public = 1 AND portfolio_project.publication_status = 'published'";
	const [result, publicLinks] = await Promise.all([db.execute({
			sql: `SELECT pi.portfolio_slug, pi.entity_type, pi.entity_id,
			             pi.featured, pi.sort_order, e.title_cache AS title, e.sort_date,
			             ${metadata.select}
		      FROM portfolio_items pi
		      JOIN portfolio_projects portfolio_project
		        ON portfolio_project.slug = pi.portfolio_slug
		      JOIN entries e
		        ON e.entity_type = pi.entity_type AND e.entity_id = pi.entity_id
		      ${metadata.joins}
		      ${where}
		      ORDER BY pi.portfolio_slug, (e.sort_date IS NULL) ASC,
		               e.sort_date DESC, e.title_cache COLLATE NOCASE ASC`,
		args: portfolioSlug ? [portfolioSlug] : []
	}), getPublicAdditionalLinks()]);
	const linksByEntry = groupPublicAdditionalLinks(publicLinks);

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
			metadata: entryMetadataFromRow(row),
			url: canonicalUrl,
			links,
			featured: Number(row.featured) === 1,
			sort_order: Number(row.sort_order)
		};
	});
}
