export type PortfolioRelatedItem = {
	portfolio_slug: string;
	entity_type: string;
	entity_id: number;
	title: string;
	sort_date: string | null;
	subtype: string | null;
	detail: string | null;
	url: string | null;
	featured: boolean;
	sort_order: number;
};
