import { db } from '$lib/server/db';
import { getPortfolioItems } from '$lib/server/portfolio-items';

const rowToEntry = (row: Record<string, unknown>) => ({
	entity_type: String(row.entity_type),
	entity_id: Number(row.entity_id),
	title: String(row.title_cache),
	sort_date: row.sort_date == null ? null : String(row.sort_date)
});

export async function getHomeData() {
	const [recentRes, highlightRes, portfolioItems] = await Promise.all([
		db.execute(
			`SELECT entity_type, entity_id, title_cache, sort_date
			 FROM entries
			 WHERE public = 1
			 ORDER BY (sort_date IS NULL) ASC, sort_date DESC
			 LIMIT 16`
		),
		db.execute(
			`SELECT entity_type, entity_id, title_cache, sort_date
			 FROM entries
			 WHERE public = 1
			   AND (featured = 1 OR show_home = 1)
			   AND entity_type IN ('publications', 'academic_events', 'teaching', 'service_activities')
			 ORDER BY sort_order ASC, (sort_date IS NULL) ASC, sort_date DESC
			 LIMIT 12`
		),
		getPortfolioItems()
	]);

	const entries = recentRes.rows.map((row) => rowToEntry(row));
	const highlights = highlightRes.rows.length > 0
		? highlightRes.rows.map((row) => rowToEntry(row))
		: entries.slice(0, 8);

	return { entries, highlights, portfolioItems };
}
