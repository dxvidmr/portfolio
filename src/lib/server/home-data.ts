import { db } from '$lib/server/db';
import { getPortfolioItems } from '$lib/server/portfolio-items';
import { getPortfolioProjects } from '$lib/server/portfolio-projects';
import { getPublicAdditionalLinks, groupPublicAdditionalLinks } from '$lib/server/public-links';
import { entryMetadataFromRow, publicEntryMetadataSql } from '$lib/server/public-entry-metadata';

const nullable = (value: unknown) => (value == null ? null : String(value));
const metadata = publicEntryMetadataSql('e');

export async function getHomeData() {
	const [recentRes, homeRes, portfolioItems, portfolioProjects, publicLinks] = await Promise.all([
		db.execute(
			`SELECT e.entity_type, e.entity_id, e.title_cache AS title, e.sort_date,
			        ${metadata.select}
			 FROM entries e
			 ${metadata.joins}
			 WHERE e.public = 1
			 ORDER BY (e.sort_date IS NULL) ASC, e.sort_date DESC
			 LIMIT 8`
		),
		db.execute(
			`SELECT e.entity_type, e.entity_id, e.title_cache AS title, e.sort_date,
			        ${metadata.select}
			 FROM entries e
			 ${metadata.joins}
			 WHERE e.public = 1
			   AND e.show_home = 1
			 ORDER BY e.sort_order ASC, (e.sort_date IS NULL) ASC, e.sort_date DESC`
		),
		getPortfolioItems(),
		getPortfolioProjects({ publicOnly: true }),
		getPublicAdditionalLinks()
	]);

	const linksByEntry = groupPublicAdditionalLinks(publicLinks);
	const rowToEntry = (row: Record<string, unknown>) => {
		const entityKey = `${row.entity_type}:${row.entity_id}`;
		const canonicalUrl = nullable(row.url);
		const additionalLinks = (linksByEntry.get(entityKey) ?? []).filter(
			(link) => link.url !== canonicalUrl
		);
		const targetUrl =
			canonicalUrl ??
			additionalLinks.find((link) => link.isPrimary)?.url ??
			additionalLinks[0]?.url ??
			null;

		return {
			entity_type: String(row.entity_type),
			entity_id: Number(row.entity_id),
			title: String(row.title),
			sort_date: nullable(row.sort_date),
			subtype: nullable(row.subtype),
			subtype_label_es: nullable(row.subtype_label_es),
			subtype_label_en: nullable(row.subtype_label_en),
			detail: nullable(row.detail),
			metadata: entryMetadataFromRow(row),
			target_url: targetUrl
		};
	};
	const entries = recentRes.rows.map((row) => rowToEntry(row));
	const recentActivity = homeRes.rows.length > 0
		? homeRes.rows.map((row) => rowToEntry(row))
		: entries.slice(0, 4);

	return { entries, recentActivity, portfolioItems, portfolioProjects };
}
