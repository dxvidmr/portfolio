import { db } from '$lib/server/db';

export interface PublicDocument {
	entryType: string;
	entryId: number;
	url: string;
	title: string | null;
	typeLabelEs: string;
	typeLabelEn: string;
}

export async function getPublicDocuments(): Promise<PublicDocument[]> {
	const result = await db.execute(`
		SELECT document.entity_type, document.entity_id, document.url,
		       NULLIF(TRIM(document.title), '') AS title,
		       vocab.label_es, vocab.label_en
		FROM documents document
		JOIN entries entry
		  ON entry.entity_type = document.entity_type
		 AND entry.entity_id = document.entity_id
		 AND entry.public = 1
		JOIN type_vocab vocab
		  ON vocab.code = document.document_type AND vocab.domain = 'document_type'
		WHERE document.is_public = 1
		  AND document.is_certificate = 0
		  AND document.event_attendance_id IS NULL
		ORDER BY document.entity_type, document.entity_id, document.sort_order, document.id`);
	return result.rows.map((row) => ({
		entryType: String(row.entity_type),
		entryId: Number(row.entity_id),
		url: String(row.url),
		title: row.title == null ? null : String(row.title),
		typeLabelEs: String(row.label_es),
		typeLabelEn: String(row.label_en)
	}));
}

export function groupPublicDocuments(documents: PublicDocument[]): Map<string, PublicDocument[]> {
	const grouped = new Map<string, PublicDocument[]>();
	for (const document of documents) {
		const key = `${document.entryType}:${document.entryId}`;
		grouped.set(key, [...(grouped.get(key) ?? []), document]);
	}
	return grouped;
}
