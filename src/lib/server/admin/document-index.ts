import { db } from '$lib/server/db';
import {
	entityDefinitions,
	entityTypeOptions,
	isEntityType,
	type EntityType
} from './entity-definitions';

export interface AdminDocumentIndexItem {
	id: number;
	entityType: EntityType;
	entityId: number;
	typeLabel: string;
	entryTitle: string;
	sortDate: string | null;
	eventTitle: string | null;
	documentType: string;
	documentTypeLabel: string;
	title: string;
	url: string;
	driveFileId: string;
	issuedBy: string;
	issuedDate: string;
	notesPrivate: string;
	updatedAt: string;
}

export interface DocumentOwnerOption {
	value: string;
	label: string;
	meta: string;
}

const nullable = (value: unknown) => (value == null ? '' : String(value));

export async function getAdminDocumentIndex(): Promise<AdminDocumentIndexItem[]> {
	const result = await db.execute(`
		SELECT
			document.id,
			document.entity_type,
			document.entity_id,
			source.title AS entry_title,
			source.sort_date,
			document.document_type,
			vocab.label_es AS document_type_label,
			document.title,
			document.url,
			document.drive_file_id,
			document.issued_by,
			document.issued_date,
			document.notes_private,
			document.updated_at,
			CASE document.entity_type
				WHEN 'talks' THEN (
					SELECT event.title
					FROM talks AS talk
					JOIN events AS event ON event.id = talk.canonical_event_id
					WHERE talk.id = document.entity_id
				)
				WHEN 'service_activities' THEN (
					SELECT event.title
					FROM service_activities AS service
					JOIN events AS event ON event.id = service.canonical_event_id
					WHERE service.id = document.entity_id
				)
				WHEN 'event_attendance' THEN (
					SELECT event.title
					FROM event_attendance AS attendance
					JOIN events AS event ON event.id = attendance.event_id
					WHERE attendance.id = document.entity_id
				)
				ELSE NULL
			END AS event_title
		FROM documents AS document
		JOIN entry_source AS source
		  ON source.entity_type = document.entity_type
		 AND source.entity_id = document.entity_id
		JOIN type_vocab AS vocab
		  ON vocab.code = document.document_type
		 AND vocab.domain = 'document_type'
		ORDER BY (document.issued_date IS NULL) ASC,
		         document.issued_date DESC,
		         (source.sort_date IS NULL) ASC,
		         source.sort_date DESC,
		         source.title COLLATE NOCASE
	`);

	return result.rows.map((row) => {
		const entityType = String(row.entity_type);
		if (!isEntityType(entityType)) {
			throw new Error(`Tipo de documento inesperado: ${entityType}`);
		}
		return {
			id: Number(row.id),
			entityType,
			entityId: Number(row.entity_id),
			typeLabel: entityDefinitions[entityType],
			entryTitle: String(row.entry_title),
			sortDate: row.sort_date == null ? null : String(row.sort_date),
			eventTitle: row.event_title == null ? null : String(row.event_title),
			documentType: String(row.document_type),
			documentTypeLabel: String(row.document_type_label),
			title: nullable(row.title),
			url: String(row.url),
			driveFileId: nullable(row.drive_file_id),
			issuedBy: nullable(row.issued_by),
			issuedDate: nullable(row.issued_date),
			notesPrivate: nullable(row.notes_private),
			updatedAt: String(row.updated_at)
		};
	});
}

export async function getDocumentOwnerOptions(): Promise<DocumentOwnerOption[]> {
	const result = await db.execute(`
		SELECT entity_type, entity_id, title, sort_date
		FROM entry_source
		ORDER BY (sort_date IS NULL) ASC, sort_date DESC, title COLLATE NOCASE
	`);
	return result.rows.flatMap((row) => {
		const entityType = String(row.entity_type);
		if (!isEntityType(entityType)) return [];
		const entityId = Number(row.entity_id);
		return [{
			value: `${entityType}:${entityId}`,
			label: `${row.title} — ${entityDefinitions[entityType]} #${entityId}`,
			meta: row.sort_date == null ? entityDefinitions[entityType] : `${entityDefinitions[entityType]} · ${row.sort_date}`
		}];
	});
}

export async function getDocumentTypeOptions() {
	const result = await db.execute(`
		SELECT code, label_es
		FROM type_vocab
		WHERE domain = 'document_type'
		ORDER BY sort_order, label_es
	`);
	return result.rows.map((row) => ({ value: String(row.code), label: String(row.label_es) }));
}

export { entityTypeOptions };
