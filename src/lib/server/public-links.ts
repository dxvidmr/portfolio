import { db } from '$lib/server/db';

export interface PublicAdditionalLink {
	entityType: string;
	entityId: number;
	url: string;
	labelEs: string;
	labelEn: string;
	isPrimary: boolean;
}

export async function getPublicAdditionalLinks(): Promise<PublicAdditionalLink[]> {
	const result = await db.execute(`
		SELECT link.entity_type, link.entity_id, link.url, link.is_primary,
		       COALESCE(NULLIF(TRIM(link.label_es), ''), vocab.label_es) AS label_es,
		       COALESCE(NULLIF(TRIM(link.label_en), ''), vocab.label_en) AS label_en
		FROM links link
		JOIN entries entry
		  ON entry.entity_type = link.entity_type
		 AND entry.entity_id = link.entity_id
		 AND entry.public = 1
		JOIN type_vocab vocab
		  ON vocab.code = link.link_type AND vocab.domain = 'link_type'
		WHERE link.is_public = 1
		ORDER BY link.entity_type, link.entity_id, link.is_primary DESC,
		         link.sort_order, link.id`);
	return result.rows.map((row) => ({
		entityType: String(row.entity_type),
		entityId: Number(row.entity_id),
		url: String(row.url),
		labelEs: String(row.label_es),
		labelEn: String(row.label_en),
		isPrimary: Number(row.is_primary) === 1
	}));
}

export function groupPublicAdditionalLinks(
	links: PublicAdditionalLink[]
): Map<string, PublicAdditionalLink[]> {
	const grouped = new Map<string, PublicAdditionalLink[]>();
	for (const link of links) {
		const key = `${link.entityType}:${link.entityId}`;
		grouped.set(key, [...(grouped.get(key) ?? []), link]);
	}
	return grouped;
}
