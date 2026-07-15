import { db } from '$lib/server/db';
import { getPortfolioItems } from '$lib/server/portfolio-items';

const rowToEntry = (row: Record<string, unknown>) => ({
	entity_type: String(row.entity_type),
	entity_id: Number(row.entity_id),
	title: String(row.title_cache),
	sort_date: row.sort_date == null ? null : String(row.sort_date)
});

export async function getHomeData() {
	const [recentRes, homeRes, portfolioItems] = await Promise.all([
		db.execute(
			`SELECT entity_type, entity_id, title_cache, sort_date
			 FROM entries
			 WHERE public = 1
			 ORDER BY (sort_date IS NULL) ASC, sort_date DESC
			 LIMIT 8`
		),
		db.execute(
			`SELECT entity_type, entity_id, title_cache, sort_date
			 FROM entries
			 WHERE public = 1
			   AND show_home = 1
			 ORDER BY sort_order ASC, (sort_date IS NULL) ASC, sort_date DESC
			 LIMIT 5`
		),
		getPortfolioItems()
	]);

	const entries = recentRes.rows.map((row) => rowToEntry(row));
	const recentActivity = homeRes.rows.length > 0
		? homeRes.rows.map((row) => rowToEntry(row))
		: entries.slice(0, 4);

	return { entries, recentActivity, portfolioItems };
}
