import { db } from '$lib/server/db';
import type { EntryKey } from './controls';

export interface LinkTypeOption {
	value: string;
	label: string;
}

export interface AdminLink {
	id: number;
	linkType: string;
	labelEs: string;
	labelEn: string;
	url: string;
	isPrimary: boolean;
	isPublic: boolean;
	sortOrder: number;
}

export interface LinkEditor {
	links: AdminLink[];
	types: LinkTypeOption[];
}

export interface LinkValues {
	linkType: string;
	labelEs: string;
	labelEn: string;
	url: string;
	isPrimary: boolean;
	isPublic: boolean;
}

export type LinkDirection = 'up' | 'down';

const nullable = (value: unknown) => (value == null ? '' : String(value));

async function entryExists(entry: EntryKey): Promise<boolean> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM entry_controls WHERE entity_type = ? AND entity_id = ?',
		args: [entry.entityType, entry.entityId]
	});
	return result.rows.length === 1;
}

async function validLinkType(linkType: string): Promise<boolean> {
	const result = await db.execute({
		sql: `SELECT 1 FROM type_vocab WHERE domain = 'link_type' AND code = ?`,
		args: [linkType]
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

export function parseLinkValues(formData: FormData): LinkValues | null {
	const linkType = String(formData.get('linkType') ?? '').trim().slice(0, 80);
	const labelEs = String(formData.get('labelEs') ?? '').trim().slice(0, 160);
	const labelEn = String(formData.get('labelEn') ?? '').trim().slice(0, 160);
	const url = String(formData.get('url') ?? '').trim().slice(0, 2000);
	if (!linkType || !validUrl(url)) return null;
	return {
		linkType,
		labelEs,
		labelEn,
		url,
		isPrimary: formData.get('isPrimary') === '1',
		isPublic: formData.get('isPublic') === '1'
	};
}

export function parseLinkId(formData: FormData): number | null {
	const id = Number(formData.get('linkId'));
	return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function parseLinkDirection(value: FormDataEntryValue | null): LinkDirection | null {
	return value === 'up' || value === 'down' ? value : null;
}

export async function getLinkEditor(entry: EntryKey): Promise<LinkEditor> {
	const [links, types] = await Promise.all([
		db.execute({
			sql: `SELECT id, link_type, label_es, label_en, url, is_primary, is_public, sort_order
			      FROM links
			      WHERE entity_type = ? AND entity_id = ?
			      ORDER BY is_primary DESC, sort_order, id`,
			args: [entry.entityType, entry.entityId]
		}),
		db.execute(`SELECT code, label_es FROM type_vocab
		            WHERE domain = 'link_type' ORDER BY sort_order, label_es`)
	]);
	return {
		links: links.rows.map((row) => ({
			id: Number(row.id),
			linkType: String(row.link_type),
			labelEs: nullable(row.label_es),
			labelEn: nullable(row.label_en),
			url: String(row.url),
			isPrimary: Number(row.is_primary) === 1,
			isPublic: Number(row.is_public) === 1,
			sortOrder: Number(row.sort_order)
		})),
		types: types.rows.map((row) => ({ value: String(row.code), label: String(row.label_es) }))
	};
}

async function validateMutation(entry: EntryKey, values: LinkValues): Promise<void> {
	const [owner, type] = await Promise.all([entryExists(entry), validLinkType(values.linkType)]);
	if (!owner) throw new Error('La entrada no existe');
	if (!type) throw new Error('El tipo de enlace no es válido');
}

export async function addLink(entry: EntryKey, values: LinkValues): Promise<void> {
	await validateMutation(entry, values);
	const order = await db.execute({
		sql: 'SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_order FROM links WHERE entity_type = ? AND entity_id = ?',
		args: [entry.entityType, entry.entityId]
	});
	const statements = [];
	if (values.isPrimary) {
		statements.push({
			sql: 'UPDATE links SET is_primary = 0, updated_at = datetime(\'now\') WHERE entity_type = ? AND entity_id = ?',
			args: [entry.entityType, entry.entityId]
		});
	}
	statements.push({
		sql: `INSERT INTO links
			(entity_type, entity_id, link_type, label_es, label_en, url,
			 is_primary, is_public, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		args: [
			entry.entityType,
			entry.entityId,
			values.linkType,
			values.labelEs || null,
			values.labelEn || null,
			values.url,
			values.isPrimary ? 1 : 0,
			values.isPublic ? 1 : 0,
			Number(order.rows[0].next_order)
		]
	});
	await db.batch(statements, 'write');
}

export async function updateLink(entry: EntryKey, id: number, values: LinkValues): Promise<void> {
	await validateMutation(entry, values);
	const statements = [];
	if (values.isPrimary) {
		statements.push({
			sql: 'UPDATE links SET is_primary = 0, updated_at = datetime(\'now\') WHERE entity_type = ? AND entity_id = ? AND id <> ?',
			args: [entry.entityType, entry.entityId, id]
		});
	}
	statements.push({
		sql: `UPDATE links SET link_type = ?, label_es = ?, label_en = ?, url = ?,
		       is_primary = ?, is_public = ?, updated_at = datetime('now')
		      WHERE id = ? AND entity_type = ? AND entity_id = ?`,
		args: [
			values.linkType,
			values.labelEs || null,
			values.labelEn || null,
			values.url,
			values.isPrimary ? 1 : 0,
			values.isPublic ? 1 : 0,
			id,
			entry.entityType,
			entry.entityId
		]
	});
	const results = await db.batch(statements, 'write');
	if (results.at(-1)?.rowsAffected !== 1) throw new Error('El enlace no existe');
}

export async function removeLink(entry: EntryKey, id: number): Promise<void> {
	const result = await db.execute({
		sql: 'DELETE FROM links WHERE id = ? AND entity_type = ? AND entity_id = ?',
		args: [id, entry.entityType, entry.entityId]
	});
	if (result.rowsAffected !== 1) throw new Error('El enlace no existe');
}

export async function moveLink(entry: EntryKey, id: number, direction: LinkDirection): Promise<void> {
	const result = await db.execute({
		sql: `SELECT id FROM links WHERE entity_type = ? AND entity_id = ?
		      ORDER BY is_primary DESC, sort_order, id`,
		args: [entry.entityType, entry.entityId]
	});
	const ids = result.rows.map((row) => Number(row.id));
	const current = ids.indexOf(id);
	if (current === -1) throw new Error('El enlace no existe');
	const target = direction === 'up' ? current - 1 : current + 1;
	if (target < 0 || target >= ids.length) return;
	[ids[current], ids[target]] = [ids[target], ids[current]];
	await db.batch(
		ids.map((linkId, index) => ({
			sql: `UPDATE links SET sort_order = ?, updated_at = datetime('now')
			      WHERE id = ? AND entity_type = ? AND entity_id = ?`,
			args: [(index + 1) * 10, linkId, entry.entityType, entry.entityId]
		})),
		'write'
	);
}
