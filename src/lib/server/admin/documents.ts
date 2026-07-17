import { db } from '$lib/server/db';
import type { EntryKey } from './controls';
import { isValidPartialDate } from './date-validation';

export type DocumentOwner =
	| { kind: 'entry'; entry: EntryKey }
	| { kind: 'attendance'; attendanceId: number };

export interface AdminDocument {
	id: number;
	documentType: string;
	title: string;
	driveFileId: string;
	url: string;
	isPublic: boolean;
	isCertificate: boolean;
	issuedBy: string;
	issuedDate: string;
	notesPrivate: string;
	sortOrder: number;
}

export interface DocumentEditor {
	ownerKind: DocumentOwner['kind'];
	documents: AdminDocument[];
	types: Array<{ value: string; label: string }>;
}

export interface DocumentValues {
	documentType: string;
	title: string;
	driveFileId: string;
	url: string;
	isPublic: boolean;
	isCertificate: boolean;
	issuedBy: string;
	issuedDate: string;
	notesPrivate: string;
}

export type DocumentDirection = 'up' | 'down';

const nullable = (value: unknown) => (value == null ? '' : String(value));

function ownerWhere(owner: DocumentOwner): { sql: string; args: Array<string | number> } {
	return owner.kind === 'entry'
		? {
				sql: 'entity_type = ? AND entity_id = ? AND event_attendance_id IS NULL',
				args: [owner.entry.entityType, owner.entry.entityId]
			}
		: { sql: 'event_attendance_id = ? AND entity_type IS NULL AND entity_id IS NULL', args: [owner.attendanceId] };
}

async function ownerExists(owner: DocumentOwner): Promise<boolean> {
	const result = owner.kind === 'entry'
		? await db.execute({
				sql: 'SELECT 1 FROM entry_controls WHERE entity_type = ? AND entity_id = ?',
				args: [owner.entry.entityType, owner.entry.entityId]
			})
		: await db.execute({ sql: 'SELECT 1 FROM event_attendance WHERE id = ?', args: [owner.attendanceId] });
	return result.rows.length === 1;
}

async function validDocumentType(documentType: string): Promise<boolean> {
	const result = await db.execute({
		sql: `SELECT 1 FROM type_vocab WHERE domain = 'document_type' AND code = ?`,
		args: [documentType]
	});
	return result.rows.length === 1;
}

function validUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

function driveIdFromUrl(url: string): string {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.endsWith('google.com')) return '';
		return parsed.pathname.match(/\/d\/([^/]+)/)?.[1] ?? parsed.searchParams.get('id') ?? '';
	} catch {
		return '';
	}
}

export function parseDocumentValues(formData: FormData, ownerKind: DocumentOwner['kind']): DocumentValues | null {
	const documentType = String(formData.get('documentType') ?? '').trim().slice(0, 80);
	const title = String(formData.get('title') ?? '').trim().slice(0, 300);
	const url = String(formData.get('url') ?? '').trim().slice(0, 2000);
	let driveFileId = String(formData.get('driveFileId') ?? '').trim().slice(0, 300);
	const issuedBy = String(formData.get('issuedBy') ?? '').trim().slice(0, 300);
	const issuedDate = String(formData.get('issuedDate') ?? '').trim().slice(0, 10);
	const notesPrivate = String(formData.get('notesPrivate') ?? '').trim().slice(0, 5000);
	if (!documentType || !validUrl(url) || (issuedDate && !isValidPartialDate(issuedDate))) return null;
	if (!driveFileId) driveFileId = driveIdFromUrl(url).slice(0, 300);
	const requestedCertificate = formData.get('isCertificate') === '1';
	const isCertificate = ownerKind === 'attendance' || requestedCertificate;
	return {
		documentType: ownerKind === 'attendance' ? 'doc_certificate' : documentType,
		title,
		driveFileId,
		url,
		isPublic: false,
		isCertificate,
		issuedBy,
		issuedDate,
		notesPrivate
	};
}

export function parseDocumentId(formData: FormData): number | null {
	const id = Number(formData.get('documentId'));
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parseDocumentDirection(value: FormDataEntryValue | null): DocumentDirection | null {
	return value === 'up' || value === 'down' ? value : null;
}

export async function getDocumentEditor(owner: DocumentOwner): Promise<DocumentEditor> {
	const where = ownerWhere(owner);
	const [documents, types] = await Promise.all([
		db.execute({
			sql: `SELECT id, document_type, title, drive_file_id, url, is_public,
			             is_certificate, issued_by, issued_date, notes_private, sort_order
			      FROM documents WHERE ${where.sql} ORDER BY sort_order, id`,
			args: where.args
		}),
		db.execute(`SELECT code, label_es FROM type_vocab
		            WHERE domain = 'document_type' ORDER BY sort_order, label_es`)
	]);
	return {
		ownerKind: owner.kind,
		documents: documents.rows.map((row) => ({
			id: Number(row.id),
			documentType: String(row.document_type),
			title: nullable(row.title),
			driveFileId: nullable(row.drive_file_id),
			url: String(row.url),
			isPublic: Number(row.is_public) === 1,
			isCertificate: Number(row.is_certificate) === 1,
			issuedBy: nullable(row.issued_by),
			issuedDate: nullable(row.issued_date),
			notesPrivate: nullable(row.notes_private),
			sortOrder: Number(row.sort_order)
		})),
		types: types.rows.map((row) => ({ value: String(row.code), label: String(row.label_es) }))
	};
}

async function validateMutation(owner: DocumentOwner, values: DocumentValues): Promise<void> {
	const [exists, type] = await Promise.all([ownerExists(owner), validDocumentType(values.documentType)]);
	if (!exists) throw new Error('El propietario del documento no existe');
	if (!type) throw new Error('El tipo de documento no es válido');
	if (owner.kind === 'attendance' && (!values.isCertificate || values.isPublic)) {
		throw new Error('Los documentos de asistencia deben ser certificados privados');
	}
}

export async function addDocument(owner: DocumentOwner, values: DocumentValues): Promise<void> {
	await validateMutation(owner, values);
	const where = ownerWhere(owner);
	const order = await db.execute({
		sql: `SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_order FROM documents WHERE ${where.sql}`,
		args: where.args
	});
	const ownerColumns = owner.kind === 'entry'
		? [owner.entry.entityType, owner.entry.entityId, null]
		: [null, null, owner.attendanceId];
	await db.execute({
		sql: `INSERT INTO documents
			(entity_type, entity_id, event_attendance_id, document_type, title,
			 drive_file_id, url, is_public, is_certificate, issued_by, issued_date,
			 notes_private, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			...ownerColumns,
			values.documentType,
			values.title || null,
			values.driveFileId || null,
			values.url,
			values.isPublic ? 1 : 0,
			values.isCertificate ? 1 : 0,
			values.issuedBy || null,
			values.issuedDate || null,
			values.notesPrivate || null,
			Number(order.rows[0].next_order)
		]
	});
}

export async function updateDocument(owner: DocumentOwner, id: number, values: DocumentValues): Promise<void> {
	await validateMutation(owner, values);
	const where = ownerWhere(owner);
	const result = await db.execute({
		sql: `UPDATE documents SET document_type = ?, title = ?, drive_file_id = ?,
		       url = ?, is_public = ?, is_certificate = ?, issued_by = ?,
		       issued_date = ?, notes_private = ?, updated_at = datetime('now')
		      WHERE id = ? AND ${where.sql}`,
		args: [
			values.documentType,
			values.title || null,
			values.driveFileId || null,
			values.url,
			values.isPublic ? 1 : 0,
			values.isCertificate ? 1 : 0,
			values.issuedBy || null,
			values.issuedDate || null,
			values.notesPrivate || null,
			id,
			...where.args
		]
	});
	if (result.rowsAffected !== 1) throw new Error('El documento no existe');
}

export async function removeDocument(owner: DocumentOwner, id: number): Promise<void> {
	const where = ownerWhere(owner);
	const result = await db.execute({
		sql: `DELETE FROM documents WHERE id = ? AND ${where.sql}`,
		args: [id, ...where.args]
	});
	if (result.rowsAffected !== 1) throw new Error('El documento no existe');
}

export async function moveDocument(owner: DocumentOwner, id: number, direction: DocumentDirection): Promise<void> {
	const where = ownerWhere(owner);
	const result = await db.execute({
		sql: `SELECT id FROM documents WHERE ${where.sql} ORDER BY sort_order, id`,
		args: where.args
	});
	const ids = result.rows.map((row) => Number(row.id));
	const current = ids.indexOf(id);
	if (current === -1) throw new Error('El documento no existe');
	const target = direction === 'up' ? current - 1 : current + 1;
	if (target < 0 || target >= ids.length) return;
	[ids[current], ids[target]] = [ids[target], ids[current]];
	await db.batch(ids.map((documentId, index) => ({
		sql: `UPDATE documents SET sort_order = ?, updated_at = datetime('now')
		      WHERE id = ? AND ${where.sql}`,
		args: [(index + 1) * 10, documentId, ...where.args]
	})), 'write');
}
