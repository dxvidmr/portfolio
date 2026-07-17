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
		`SELECT talk.id, talk.title,
		        COALESCE(
		          substr(talk.date_start, 1, 4),
		          substr(event.date_start, 1, 4),
		          CAST(event.year AS TEXT),
		          ''
		        ) AS y
		 FROM talks AS talk
		 LEFT JOIN events AS event ON event.id = talk.canonical_event_id
		 ORDER BY (COALESCE(talk.date_start, event.date_start, CAST(event.year AS TEXT)) IS NULL) ASC,
		          COALESCE(talk.date_start, event.date_start, CAST(event.year AS TEXT)) DESC,
		          talk.title COLLATE NOCASE`
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

// Reglas editoriales que relacionan varios campos. Se aplican tras comprobar
// vocabulario y referencias, tanto en las altas independientes como en la
// pantalla unificada de eventos.
export function validateEntitySemantics(type: FormEntityType, parsed: ParsedForm): void {
	if (type === 'publications') {
		const publicationType = parsed.values.publication_type;
		const myRole = parsed.values.my_role;
		const authors = parsed.values.authors_text;
		const editors = parsed.values.editors_text;
		const containerType = parsed.values.container_type;
		const conferenceFormat = parsed.values.conference_publication_format;
		const conferenceContainers = [
			'container_conference_proceedings',
			'container_book_of_abstracts'
		];

		if (publicationType === 'publication_edited_volume') {
			if (myRole !== 'publication_editor' && myRole !== 'publication_coeditor') {
				parsed.errors.my_role = 'Un libro editado debe indicar edición o coedición';
			}
			if (editors == null || editors === '') {
				parsed.errors.editors_text = 'Indica las personas responsables de la edición';
			}
		}

		if (
			(myRole === 'publication_editor' || myRole === 'publication_coeditor') &&
			(editors == null || editors === '')
		) {
			parsed.errors.editors_text = 'Indica las personas responsables de la edición';
		}
		if (myRole === 'publication_author' && (authors == null || authors === '')) {
			parsed.errors.authors_text = 'Indica la autoría de la publicación';
		}
		if (conferenceFormat != null && !conferenceContainers.includes(String(containerType))) {
			parsed.errors.container_type =
				'El formato de congreso requiere actas o un libro de resúmenes como contenedor';
		}
	}

	if (type === 'talks') {
		const contributionType = parsed.values.contribution_type;
		const selectionMode = parsed.values.selection_mode;
		const sessionFormat = parsed.values.session_format;
		const sessionTitle = parsed.values.session_title;

		if (contributionType === 'contribution_lecture' && selectionMode !== 'selection_invited') {
			parsed.errors.selection_mode = 'Las ponencias son siempre por invitación';
		}
		if (sessionFormat === 'session_panel' && contributionType !== 'contribution_communication') {
			parsed.errors.session_format = 'Un panel reúne comunicaciones';
		}
		if (sessionTitle != null && sessionTitle !== '' && sessionFormat !== 'session_panel') {
			parsed.errors.session_format = 'Selecciona «Panel» para indicar el título de una sesión';
		}
	}
}

// Crear: fila de contenido + control privado en la misma transacción (§12).
export async function createEntity(
	type: FormEntityType,
	values: Record<string, FieldValue>
): Promise<number> {
	const cols = fieldNames(type);
	const tx = await db.transaction('write');
	try {
		const inserted = await tx.execute({
			sql: `INSERT INTO ${type} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
			args: cols.map((col) => values[col] ?? null)
		});
		const id = Number(inserted.lastInsertRowid);
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
