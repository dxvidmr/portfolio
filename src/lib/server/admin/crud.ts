import { db } from '$lib/server/db';
import {
	entityForms,
	type FieldDef,
	type FkEntity,
	type FormEntityType
} from './entity-definitions';
import type { FieldValue, ParsedForm } from './validation';

// Operaciones CRUD (plan §12). El nombre de tabla coincide con el tipo de
// entidad y procede siempre de la allowlist (FormEntityType), nunca del
// navegador. Valores solo por argumentos parametrizados.

export interface SelectOption {
	value: string;
	label: string;
}

const fieldNames = (type: FormEntityType): string[] =>
	entityForms[type].fields.map((field) => field.name);

// Opciones de selectores: vocabulario filtrado por dominio y lookups FK.
export async function getFieldOptions(
	type: FormEntityType
): Promise<Record<string, SelectOption[]>> {
	const options: Record<string, SelectOption[]> = {};

	for (const field of entityForms[type].fields as FieldDef[]) {
		if (field.kind === 'vocab' && field.vocabDomain) {
			const res = await db.execute({
				sql: 'SELECT code, label_es FROM type_vocab WHERE domain = ? ORDER BY sort_order, label_es',
				args: [field.vocabDomain]
			});
			options[field.name] = res.rows.map((row) => ({
				value: String(row.code),
				label: String(row.label_es)
			}));
		} else if (field.kind === 'fk' && field.fkEntity) {
			options[field.name] = await getFkOptions(field.fkEntity);
		}
	}

	return options;
}

async function getFkOptions(entity: FkEntity): Promise<SelectOption[]> {
	if (entity === 'projects') {
		const res = await db.execute(
			`SELECT id, title, COALESCE(acronym, '') AS acronym FROM projects
			 ORDER BY title COLLATE NOCASE`
		);
		return res.rows.map((row) => ({
			value: String(row.id),
			label: row.acronym ? `${row.acronym} — ${row.title}` : String(row.title)
		}));
	}
	if (entity === 'education') {
		const res = await db.execute(
			`SELECT id, degree_title, institution,
			        COALESCE(date_end, date_start, '') AS y
			 FROM education
			 ORDER BY (date_end IS NULL AND date_start IS NULL) ASC,
			          COALESCE(date_end, date_start) DESC, degree_title COLLATE NOCASE`
		);
		return res.rows.map((row) => ({
			value: String(row.id),
			label: `${row.degree_title} — ${row.institution}${row.y ? ` (${row.y})` : ''}`
		}));
	}
	if (entity === 'events') {
		const res = await db.execute(
			`SELECT id, title, COALESCE(CAST(year AS TEXT), substr(date_start, 1, 4), '') AS y
			 FROM events
			 ORDER BY (year IS NULL AND date_start IS NULL) ASC,
			          COALESCE(CAST(year AS TEXT), date_start) DESC, title COLLATE NOCASE`
		);
		return res.rows.map((row) => ({
			value: String(row.id),
			label: row.y ? `${row.y} — ${row.title}` : String(row.title)
		}));
	}
	const res = await db.execute(
		`SELECT id, title, COALESCE(substr(date_start, 1, 4), CAST(year AS TEXT), '') AS y
		 FROM talks
		 ORDER BY (date_start IS NULL) ASC, date_start DESC, title COLLATE NOCASE`
	);
	return res.rows.map((row) => ({
		value: String(row.id),
		label: row.y ? `${row.y} — ${row.title}` : String(row.title)
	}));
}

// Revalidación contra BD de vocabulario (código + dominio) y referencias FK.
export async function validateReferences(
	type: FormEntityType,
	parsed: ParsedForm
): Promise<void> {
	for (const field of entityForms[type].fields as FieldDef[]) {
		const value = parsed.values[field.name];
		if (value == null || parsed.errors[field.name]) continue;

		if (field.kind === 'vocab' && field.vocabDomain) {
			const res = await db.execute({
				sql: 'SELECT 1 FROM type_vocab WHERE code = ? AND domain = ?',
				args: [value, field.vocabDomain]
			});
			if (res.rows.length === 0) {
				parsed.errors[field.name] = 'Tipo no reconocido en el vocabulario';
			}
		} else if (field.kind === 'fk' && field.fkEntity) {
			const tableByFk: Record<FkEntity, string> = {
				projects: 'projects',
				talks: 'talks',
				education: 'education',
				events: 'events'
			};
			const table = tableByFk[field.fkEntity];
			const res = await db.execute({
				sql: `SELECT 1 FROM ${table} WHERE id = ?`,
				args: [value]
			});
			if (res.rows.length === 0) {
				parsed.errors[field.name] = 'La referencia seleccionada no existe';
			}
		}
	}
}

// Crear: fila de contenido + control privado en la misma transacción (§12).
export async function createEntity(
	type: FormEntityType,
	values: Record<string, FieldValue>
): Promise<number> {
	const cols = fieldNames(type);
	// El formulario de talks ya no pide los datos del evento: `event_title`
	// (NOT NULL) se hidrata en el propio INSERT desde la ficha canónica y el
	// resto de columnas-copia las rellena la sincronización posterior.
	const insertCols =
		type === 'talks' ? [...cols, 'event_title'] : cols;
	const placeholders =
		type === 'talks'
			? [...cols.map(() => '?'), "COALESCE((SELECT title FROM events WHERE id = ?), '')"]
			: cols.map(() => '?');
	const insertArgs =
		type === 'talks'
			? [...cols.map((col) => values[col] ?? null), values.canonical_event_id ?? null]
			: cols.map((col) => values[col] ?? null);
	const tx = await db.transaction('write');
	try {
		const inserted = await tx.execute({
			sql: `INSERT INTO ${type} (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`,
			args: insertArgs
		});
		const id = Number(inserted.lastInsertRowid);
		if (type === 'talks') {
			await tx.execute({
				sql: `UPDATE talks SET
					event_title = (SELECT title FROM events WHERE id = canonical_event_id),
					date_start = (SELECT date_start FROM events WHERE id = canonical_event_id),
					date_end = (SELECT date_end FROM events WHERE id = canonical_event_id),
					year = (SELECT year FROM events WHERE id = canonical_event_id),
					institution = (SELECT institution FROM events WHERE id = canonical_event_id),
					city = (SELECT city FROM events WHERE id = canonical_event_id),
					country = (SELECT country FROM events WHERE id = canonical_event_id),
					modality = (SELECT modality FROM events WHERE id = canonical_event_id)
				WHERE id = ? AND canonical_event_id IS NOT NULL`,
				args: [id]
			});
		}
		await tx.execute({
			sql: 'INSERT INTO entry_controls (entity_type, entity_id, is_public) VALUES (?, ?, 0)',
			args: [type, id]
		});
		await tx.commit();
		return id;
	} finally {
		tx.close();
	}
}

// Editar: solo columnas de la allowlist; toca updated_at del control (o crea
// el control como privado si la fila aún no lo tenía).
export async function updateEntity(
	type: FormEntityType,
	id: number,
	values: Record<string, FieldValue>
): Promise<void> {
	const cols = fieldNames(type);
	const statements = [
			{
				sql: `UPDATE ${type} SET ${cols.map((col) => `${col} = ?`).join(', ')} WHERE id = ?`,
				args: [...cols.map((col) => values[col] ?? null), id]
			},
			{
				sql: `INSERT INTO entry_controls (entity_type, entity_id, is_public, updated_at)
				      VALUES (?, ?, 0, datetime('now'))
				      ON CONFLICT (entity_type, entity_id) DO UPDATE SET updated_at = datetime('now')`,
				args: [type, id]
			}
		];
	if (type === 'talks') {
		statements.push({
			sql: `UPDATE talks SET
				event_title = (SELECT title FROM events WHERE id = canonical_event_id),
				date_start = (SELECT date_start FROM events WHERE id = canonical_event_id),
				date_end = (SELECT date_end FROM events WHERE id = canonical_event_id),
				year = (SELECT year FROM events WHERE id = canonical_event_id),
				institution = (SELECT institution FROM events WHERE id = canonical_event_id),
				city = (SELECT city FROM events WHERE id = canonical_event_id),
				country = (SELECT country FROM events WHERE id = canonical_event_id),
				modality = (SELECT modality FROM events WHERE id = canonical_event_id)
			WHERE id = ? AND canonical_event_id IS NOT NULL`,
			args: [id]
		});
	}
	await db.batch(statements, 'write');
}

// Eliminar (§12): relaciones → control → fila, en un batch transaccional.
// Caso especial: referencias project_id / event_id se ponen a NULL antes.
export async function deleteEntity(type: FormEntityType, id: number): Promise<void> {
	const stmts: Array<{ sql: string; args: Array<string | number> }> = [];

	if (type === 'projects') {
		for (const table of ['publications', 'talks', 'teaching', 'funding_awards']) {
			stmts.push({ sql: `UPDATE ${table} SET project_id = NULL WHERE project_id = ?`, args: [id] });
		}
	}
	if (type === 'talks') {
		stmts.push({ sql: 'UPDATE publications SET event_id = NULL WHERE event_id = ?', args: [id] });
	}
	if (type === 'education') {
		stmts.push({ sql: 'UPDATE academic_works SET education_id = NULL WHERE education_id = ?', args: [id] });
	}
	if (type === 'funding_awards') {
		stmts.push({ sql: 'DELETE FROM funding_relations WHERE funding_award_id = ?', args: [id] });
	}
	stmts.push({
		sql: 'DELETE FROM funding_relations WHERE entity_type = ? AND entity_id = ?',
		args: [type, id]
	});

	stmts.push({
		sql: 'DELETE FROM documents WHERE entity_type = ? AND entity_id = ?',
		args: [type, id]
	});
	for (const table of ['links', 'entity_tags', 'portfolio_items', 'entry_controls']) {
		stmts.push({
			sql: `DELETE FROM ${table} WHERE entity_type = ? AND entity_id = ?`,
			args: [type, id]
		});
	}
	stmts.push({ sql: `DELETE FROM ${type} WHERE id = ?`, args: [id] });

	await db.batch(stmts, 'write');
}

// Valores actuales de una fila, como strings listos para el formulario.
export async function getEntityFormValues(
	type: FormEntityType,
	id: number
): Promise<Record<string, string> | null> {
	const cols = fieldNames(type);
	const res = await db.execute({
		sql: `SELECT ${cols.join(', ')} FROM ${type} WHERE id = ?`,
		args: [id]
	});
	const row = res.rows[0];
	if (!row) return null;

	const values: Record<string, string> = {};
	for (const field of entityForms[type].fields as FieldDef[]) {
		const value = row[field.name];
		if (value == null) values[field.name] = '';
		else if (field.kind === 'boolean') values[field.name] = Number(value) === 1 ? '1' : '';
		else values[field.name] = String(value);
	}
	return values;
}

export async function getControlState(
	type: FormEntityType,
	id: number
): Promise<{ isPublic: boolean; showHome: boolean }> {
	const res = await db.execute({
		sql: 'SELECT is_public, show_home FROM entry_controls WHERE entity_type = ? AND entity_id = ?',
		args: [type, id]
	});
	const row = res.rows[0];
	return {
		isPublic: Number(row?.is_public ?? 0) === 1,
		showHome: Number(row?.show_home ?? 0) === 1
	};
}
