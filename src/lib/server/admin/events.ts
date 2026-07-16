import { db } from '$lib/server/db';
import type { EntryKey } from './controls';
import { isValidPartialDate } from './date-validation';
import { entityForms, type FieldDef } from './entity-definitions';
import type { FieldValue } from './validation';

export interface CanonicalEventSummary {
	id: number;
	title: string;
	sortDate: string | null;
	year: number | null;
	place: string | null;
	contributionCount: number;
	serviceCount: number;
	hasAttendance: boolean;
}

export interface CanonicalEventValues {
	title: string;
	date_start: string;
	date_end: string;
	year: string;
	institution: string;
	city: string;
	country: string;
	modality: string;
	url: string;
	notes_private: string;
}

export interface EventActivity {
	entityType: 'talks' | 'service_activities';
	entityId: number;
	title: string;
	typeCode: string;
	typeLabel: string;
	isPublic: boolean;
}

export interface EventAttendance {
	id: number;
	roleType: 'attendee';
	roleLabel: string;
	notesPrivate: string | null;
}

export interface CanonicalEventDetail {
	id: number;
	values: CanonicalEventValues;
	contributions: EventActivity[];
	serviceActivities: EventActivity[];
	attendance: EventAttendance | null;
}

export interface ParsedEventForm {
	values: CanonicalEventValues;
	errors: Record<string, string>;
}

const text = (value: FormDataEntryValue | null, max: number) =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';
const nullable = (value: unknown) => (value == null ? null : String(value));

function validDate(value: string): boolean {
	return value === '' || isValidPartialDate(value);
}

function validUrl(value: string): boolean {
	if (!value) return true;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

export function parseCanonicalEventForm(formData: FormData): ParsedEventForm {
	const values: CanonicalEventValues = {
		title: text(formData.get('title'), 500),
		date_start: text(formData.get('date_start'), 10),
		date_end: text(formData.get('date_end'), 10),
		year: text(formData.get('year'), 4),
		institution: text(formData.get('institution'), 300),
		city: text(formData.get('city'), 160),
		country: text(formData.get('country'), 160),
		modality: text(formData.get('modality'), 100),
		url: text(formData.get('url'), 2000),
		notes_private: text(formData.get('notes_private'), 5000)
	};
	const errors: Record<string, string> = {};
	if (!values.title) errors.title = 'El nombre del evento es obligatorio';
	if (!validDate(values.date_start)) errors.date_start = 'Usa AAAA, AAAA-MM o AAAA-MM-DD';
	if (!validDate(values.date_end)) errors.date_end = 'Usa AAAA, AAAA-MM o AAAA-MM-DD';
	if (values.year && (!/^\d{4}$/.test(values.year) || Number(values.year) < 1000)) {
		errors.year = 'Introduce un año de cuatro cifras';
	}
	if (!validUrl(values.url)) errors.url = 'La URL debe empezar por http:// o https://';
	return { values, errors };
}

export async function getCanonicalEvents(): Promise<CanonicalEventSummary[]> {
	const result = await db.execute(`
		SELECT event.id, event.title, event.date_start, event.year,
		       COALESCE(event.city, event.institution, event.country) AS place,
		       (SELECT COUNT(*) FROM talks contribution
		        WHERE contribution.canonical_event_id = event.id) AS contribution_count,
		       (SELECT COUNT(*) FROM service_activities service
		        WHERE service.canonical_event_id = event.id) AS service_count,
		       EXISTS(SELECT 1 FROM event_attendance attendance
		              WHERE attendance.event_id = event.id) AS has_attendance
		FROM events event
		ORDER BY (COALESCE(event.date_start, CAST(event.year AS TEXT)) IS NULL) ASC,
		         COALESCE(event.date_start, CAST(event.year AS TEXT)) DESC,
		         event.title COLLATE NOCASE ASC`);
	return result.rows.map((row) => ({
		id: Number(row.id),
		title: String(row.title),
		sortDate: nullable(row.date_start) ?? nullable(row.year),
		year: row.year == null ? null : Number(row.year),
		place: nullable(row.place),
		contributionCount: Number(row.contribution_count),
		serviceCount: Number(row.service_count),
		hasAttendance: Number(row.has_attendance) === 1
	}));
}

function eventValues(row: Record<string, unknown>): CanonicalEventValues {
	return {
		title: String(row.title),
		date_start: nullable(row.date_start) ?? '',
		date_end: nullable(row.date_end) ?? '',
		year: nullable(row.year) ?? '',
		institution: nullable(row.institution) ?? '',
		city: nullable(row.city) ?? '',
		country: nullable(row.country) ?? '',
		modality: nullable(row.modality) ?? '',
		url: nullable(row.url) ?? '',
		notes_private: nullable(row.notes_private) ?? ''
	};
}

function activityRows(
	rows: Array<Record<string, unknown>>,
	entityType: EventActivity['entityType']
): EventActivity[] {
	return rows.map((row) => ({
		entityType,
		entityId: Number(row.id),
		title: String(row.title),
		typeCode: String(row.type_code),
		typeLabel: nullable(row.type_label) ?? String(row.type_code).replaceAll('_', ' '),
		isPublic: Number(row.is_public) === 1
	}));
}

export async function getCanonicalEvent(id: number): Promise<CanonicalEventDetail | null> {
	const [event, contributions, services, attendance] = await Promise.all([
		db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [id] }),
		db.execute({
			sql: `SELECT contribution.id, contribution.title,
			             contribution.contribution_type AS type_code,
			             vocab.label_es AS type_label,
			             COALESCE(control.is_public, 0) AS is_public
			      FROM talks contribution
			      LEFT JOIN type_vocab vocab ON vocab.code = contribution.contribution_type
			      LEFT JOIN entry_controls control
			        ON control.entity_type = 'talks' AND control.entity_id = contribution.id
			      WHERE contribution.canonical_event_id = ?
			      ORDER BY contribution.title COLLATE NOCASE`,
			args: [id]
		}),
		db.execute({
			sql: `SELECT service.id, service.title, service.activity_type AS type_code,
			             vocab.label_es AS type_label,
			             COALESCE(control.is_public, 0) AS is_public
			      FROM service_activities service
			      LEFT JOIN type_vocab vocab ON vocab.code = service.activity_type
			      LEFT JOIN entry_controls control
			        ON control.entity_type = 'service_activities' AND control.entity_id = service.id
			      WHERE service.canonical_event_id = ?
			      ORDER BY service.title COLLATE NOCASE`,
			args: [id]
		}),
		db.execute({
			sql: `SELECT id, role_type, role_label, notes_private
			      FROM event_attendance WHERE event_id = ?`,
			args: [id]
		})
	]);
	if (event.rows.length === 0) return null;
	const attendanceRow = attendance.rows[0];
	return {
		id,
		values: eventValues(event.rows[0] as unknown as Record<string, unknown>),
		contributions: activityRows(
			contributions.rows as unknown as Array<Record<string, unknown>>,
			'talks'
		),
		serviceActivities: activityRows(
			services.rows as unknown as Array<Record<string, unknown>>,
			'service_activities'
		),
		attendance: attendanceRow
			? {
					id: Number(attendanceRow.id),
					roleType: 'attendee',
					roleLabel: String(attendanceRow.role_label),
					notesPrivate: nullable(attendanceRow.notes_private)
				}
			: null
	};
}

const dbValues = (values: CanonicalEventValues) => [
	values.title,
	values.date_start || null,
	values.date_end || null,
	values.year ? Number(values.year) : null,
	values.institution || null,
	values.city || null,
	values.country || null,
	values.modality || null,
	values.url || null,
	values.notes_private || null
];

export async function createCanonicalEvent(values: CanonicalEventValues): Promise<number> {
	const result = await db.execute({
		sql: `INSERT INTO events
				(title, date_start, date_end, year, institution, city, country,
				 modality, url, notes_private)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		args: dbValues(values)
	});
	return Number(result.lastInsertRowid);
}

// ── Alta unificada (decisión 23): evento + roles en una sola transacción ─────

export interface UnifiedRoles {
	talk?: Record<string, FieldValue>;
	service?: Record<string, FieldValue>;
	attendance?: { roleLabel: string; notesPrivate: string };
}

// Campos propios de cada rol en el alta unificada: los del formulario del tipo
// sin el selector de evento (implícito) y sin los campos que solo tienen sentido en
// servicios ajenos a eventos (revista/entidad y obra relacionada, propios de
// revisiones de artículos o volúmenes).
const SERVICE_EVENT_OMITTED = new Set([
	'city',
	'country',
	'venue_or_journal',
	'related_entity'
]);

export const unifiedTalkFields: FieldDef[] = entityForms.talks.fields.filter(
	(field) => field.name !== 'canonical_event_id'
);

export const unifiedServiceFields: FieldDef[] = entityForms.service_activities.fields.filter(
	(field) => field.name !== 'canonical_event_id' && !SERVICE_EVENT_OMITTED.has(field.name)
);

export async function createEventWithRoles(
	eventValues: CanonicalEventValues,
	roles: UnifiedRoles
): Promise<number> {
	const tx = await db.transaction('write');
	try {
		const insertedEvent = await tx.execute({
			sql: `INSERT INTO events
					(title, date_start, date_end, year, institution, city, country,
					 modality, url, notes_private)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			args: dbValues(eventValues)
		});
		const eventId = Number(insertedEvent.lastInsertRowid);

		if (roles.talk) {
			const cols = unifiedTalkFields.map((field) => field.name);
			const allCols = [...cols, 'canonical_event_id'];
			const inserted = await tx.execute({
				sql: `INSERT INTO talks (${allCols.join(', ')}) VALUES (${allCols.map(() => '?').join(', ')})`,
				args: [
					...cols.map((col) => roles.talk?.[col] ?? null),
					eventId
				]
			});
			await tx.execute({
				sql: 'INSERT INTO entry_controls (entity_type, entity_id, is_public) VALUES (?, ?, 0)',
				args: ['talks', Number(inserted.lastInsertRowid)]
			});
		}

		if (roles.service) {
			const cols = unifiedServiceFields.map((field) => field.name);
			const allCols = [...cols, 'canonical_event_id'];
			const inserted = await tx.execute({
				sql: `INSERT INTO service_activities (${allCols.join(', ')}) VALUES (${allCols.map(() => '?').join(', ')})`,
				args: [
					...cols.map((col) => roles.service?.[col] ?? null),
					eventId
				]
			});
			await tx.execute({
				sql: 'INSERT INTO entry_controls (entity_type, entity_id, is_public) VALUES (?, ?, 0)',
				args: ['service_activities', Number(inserted.lastInsertRowid)]
			});
		}

		if (roles.attendance) {
			await tx.execute({
				sql: `INSERT INTO event_attendance (event_id, role_type, role_label, notes_private)
					VALUES (?, 'attendee', ?, ?)`,
				args: [
					eventId,
					roles.attendance.roleLabel.trim() || 'Oyente/asistente',
					roles.attendance.notesPrivate.trim() || null
				]
			});
		}

		await tx.commit();
		return eventId;
	} finally {
		tx.close();
	}
}

export async function updateCanonicalEvent(id: number, values: CanonicalEventValues): Promise<void> {
	const result = await db.execute({
		sql: `UPDATE events SET
			title = ?, date_start = ?, date_end = ?, year = ?, institution = ?,
			city = ?, country = ?, modality = ?, url = ?, notes_private = ?,
			updated_at = datetime('now')
		WHERE id = ?`,
		args: [...dbValues(values), id]
	});
	if (result.rowsAffected === 0) throw new Error('El evento no existe');
}

export async function saveEventAttendance(
	eventId: number,
	roleLabel: string,
	notesPrivate: string
): Promise<void> {
	await db.execute({
		sql: `INSERT INTO event_attendance
				(event_id, role_type, role_label, notes_private, updated_at)
			VALUES (?, 'attendee', ?, ?, datetime('now'))
			ON CONFLICT (event_id) DO UPDATE SET
				role_label = excluded.role_label,
				notes_private = excluded.notes_private,
				updated_at = datetime('now')`,
		args: [eventId, roleLabel.trim() || 'Oyente/asistente', notesPrivate.trim() || null]
	});
}

export async function removeEventAttendance(eventId: number): Promise<void> {
	await db.execute({ sql: 'DELETE FROM event_attendance WHERE event_id = ?', args: [eventId] });
}

export async function deleteCanonicalEvent(id: number): Promise<void> {
	const usage = await db.execute({
		sql: `SELECT
			(SELECT COUNT(*) FROM talks WHERE canonical_event_id = ?) +
			(SELECT COUNT(*) FROM service_activities WHERE canonical_event_id = ?) +
			(SELECT COUNT(*) FROM event_attendance WHERE event_id = ?) AS total`,
		args: [id, id, id]
	});
	if (Number(usage.rows[0].total) > 0) {
		throw new Error('Desvincula primero las contribuciones, servicios y asistencias');
	}
	await db.execute({ sql: 'DELETE FROM events WHERE id = ?', args: [id] });
}

export async function getCanonicalEventForEntry(entry: EntryKey): Promise<{ id: number; title: string } | null> {
	if (entry.entityType !== 'talks' && entry.entityType !== 'service_activities') return null;
	const result = await db.execute({
		sql: `SELECT event.id, event.title
		      FROM ${entry.entityType} source
		      JOIN events event ON event.id = source.canonical_event_id
		      WHERE source.id = ?`,
		args: [entry.entityId]
	});
	return result.rows[0]
		? { id: Number(result.rows[0].id), title: String(result.rows[0].title) }
		: null;
}

export async function getCanonicalEventDefaults(
	eventId: number,
	entityType: 'talks' | 'service_activities'
): Promise<Record<string, string>> {
	const result = await db.execute({ sql: 'SELECT * FROM events WHERE id = ?', args: [eventId] });
	if (result.rows.length === 0) return {};
	const row = result.rows[0];
	// El formulario de talks ya no pide datos del evento: basta preseleccionarlo.
	if (entityType === 'talks') return { canonical_event_id: String(eventId) };
	return {
		canonical_event_id: String(eventId),
		date_start: nullable(row.date_start) ?? '',
		date_end: nullable(row.date_end) ?? '',
		year: nullable(row.year) ?? '',
		city: nullable(row.city) ?? '',
		country: nullable(row.country) ?? '',
		url: nullable(row.url) ?? '',
		title: String(row.title),
		venue_or_journal: nullable(row.institution) ?? ''
	};
}
