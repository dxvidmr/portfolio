import type { EntryMetadata } from '$lib/types/entry-metadata';

export type PortfolioRelatedItem = {
	portfolio_slug: string;
	entity_type: string;
	entity_id: number;
	title: string;
	sort_date: string | null;
	subtype: string | null;
	subtype_label_es: string | null;
	subtype_label_en: string | null;
	detail: string | null;
	metadata: EntryMetadata | null;
	url: string | null;
	links: Array<{
		url: string;
		label_es: string;
		label_en: string;
		is_primary: boolean;
	}>;
	featured: boolean;
	sort_order: number;
};

export type PortfolioPublicationStatus = 'draft' | 'published' | 'archived';

export type PortfolioProjectMetadata = {
	slug: string;
	title: { es: string; en: string };
	kind: { es: string; en: string };
	kicker: { es: string; en: string };
	summary: { es: string; en: string };
	status: { es: string; en: string };
	period: string;
	tags: string[];
	links: Array<{ label: { es: string; en: string }; url: string }>;
	publicationStatus: PortfolioPublicationStatus;
	sortOrder: number;
};
