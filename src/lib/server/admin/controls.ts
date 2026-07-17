import { db } from '$lib/server/db';
import { isEntityType, type EntityType } from './entity-definitions';

export type ControlName = 'public' | 'home';

export interface EntryKey {
	entityType: EntityType;
	entityId: number;
}

export interface EntryControlState {
	isPublic: boolean;
	showHome: boolean;
	homeOrder: number;
	updatedAt: string | null;
}

export function parseEntryKey(formData: FormData): EntryKey | null {
	const entityType = String(formData.get('entityType') ?? '');
	const entityId = Number(formData.get('entityId'));
	if (!isEntityType(entityType) || !Number.isSafeInteger(entityId) || entityId <= 0) return null;
	return { entityType, entityId };
}

export function parseControlName(value: FormDataEntryValue | null): ControlName | null {
	return value === 'public' || value === 'home' ? value : null;
}

export function parseEnabled(value: FormDataEntryValue | null): boolean | null {
	if (value === '1') return true;
	if (value === '0') return false;
	return null;
}

async function assertEntryExists({ entityType, entityId }: EntryKey): Promise<void> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM entry_source WHERE entity_type = ? AND entity_id = ? LIMIT 1',
		args: [entityType, entityId]
	});
	if (result.rows.length === 0) throw new Error('La entrada no existe');
}

export async function updateEntryControl(
	key: EntryKey,
	control: ControlName,
	enabled: boolean
): Promise<EntryControlState> {
	await assertEntryExists(key);
	const { entityType, entityId } = key;

	if (control === 'public') {
		await db.execute({
			sql: `INSERT INTO entry_controls
					(entity_type, entity_id, is_public, show_home, home_order, featured_cv, cv_order, updated_at)
				VALUES (?, ?, ?, 0, 0, 0, 0, datetime('now'))
				ON CONFLICT (entity_type, entity_id) DO UPDATE SET
					is_public = excluded.is_public,
					show_home = CASE WHEN excluded.is_public = 0 THEN 0 ELSE entry_controls.show_home END,
					home_order = CASE WHEN excluded.is_public = 0 THEN 0 ELSE entry_controls.home_order END,
					featured_cv = CASE WHEN excluded.is_public = 0 THEN 0 ELSE entry_controls.featured_cv END,
					cv_order = CASE WHEN excluded.is_public = 0 THEN 0 ELSE entry_controls.cv_order END,
					updated_at = datetime('now')`,
			args: [entityType, entityId, enabled ? 1 : 0]
		});
	} else if (!enabled) {
		await db.execute({
			sql: `UPDATE entry_controls
				SET show_home = 0,
					home_order = 0,
					updated_at = datetime('now')
				WHERE entity_type = ? AND entity_id = ?`,
			args: [entityType, entityId]
		});
	} else {
		await db.execute({
			sql: `INSERT INTO entry_controls
					(entity_type, entity_id, is_public, show_home, home_order, updated_at)
				SELECT ?, ?, 1, 1,
					COALESCE(MAX(home_order), 0) + 10,
					datetime('now')
				FROM entry_controls
				WHERE show_home = 1
				ON CONFLICT (entity_type, entity_id) DO UPDATE SET
					is_public = 1,
					show_home = 1,
					home_order = CASE
						WHEN entry_controls.show_home = 0 OR entry_controls.home_order = 0
						THEN excluded.home_order
						ELSE entry_controls.home_order
					END,
					updated_at = datetime('now')`,
			args: [entityType, entityId]
		});
	}

	const saved = await db.execute({
		sql: `SELECT is_public, show_home, home_order, updated_at
			FROM entry_controls
			WHERE entity_type = ? AND entity_id = ?`,
		args: [entityType, entityId]
	});
	const row = saved.rows[0];
	return {
		isPublic: Number(row?.is_public ?? 0) === 1,
		showHome: Number(row?.show_home ?? 0) === 1,
		homeOrder: Number(row?.home_order ?? 0),
		updatedAt: row?.updated_at == null ? null : String(row.updated_at)
	};
}

export function parseHomeOrder(value: FormDataEntryValue | null): EntryKey[] | null {
	if (typeof value !== 'string' || value.length > 20_000) return null;

	try {
		const parsed: unknown = JSON.parse(value);
		if (!Array.isArray(parsed) || parsed.length > 200) return null;

		const order: EntryKey[] = [];
		const seen = new Set<string>();
		for (const item of parsed) {
			if (typeof item !== 'object' || item == null) return null;
			const record = item as Record<string, unknown>;
			const entityType = String(record.entityType ?? '');
			const entityId = Number(record.entityId);
			if (!isEntityType(entityType) || !Number.isSafeInteger(entityId) || entityId <= 0) return null;

			const key = `${entityType}:${entityId}`;
			if (seen.has(key)) return null;
			seen.add(key);
			order.push({ entityType, entityId });
		}
		return order;
	} catch {
		return null;
	}
}

export async function saveHomeOrder(order: EntryKey[]): Promise<void> {
	const result = await db.execute(`
		SELECT entity_type, entity_id
		FROM entry_controls
		WHERE show_home = 1
		ORDER BY entity_type ASC, entity_id ASC`);

	const currentKeys = result.rows
		.map((row) => `${String(row.entity_type)}:${Number(row.entity_id)}`)
		.sort();
	const submittedKeys = order.map((entry) => `${entry.entityType}:${entry.entityId}`).sort();
	if (
		currentKeys.length !== submittedKeys.length ||
		currentKeys.some((key, index) => key !== submittedKeys[index])
	) {
		throw new Error('La selección de actividad cambió; recarga antes de guardar el orden');
	}

	if (order.length === 0) return;
	await db.batch(
		order.map((entry, index) => ({
			sql: `UPDATE entry_controls
				SET home_order = ?, updated_at = datetime('now')
				WHERE entity_type = ? AND entity_id = ? AND show_home = 1`,
			args: [(index + 1) * 10, entry.entityType, entry.entityId]
		})),
		'write'
	);
}
