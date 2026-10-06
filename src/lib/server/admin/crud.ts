import { db } from '$lib/server/db';
import {
	entityForms, entityDefinitions, type EntityType,
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
	meta?: string;
}

const fieldNames = (type: FormEntityType): string[] =>
	entityForms[type].fields.filter((field) => field.persist !== false).map((field) => field.name);

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
		} else if ((field.kind === 'fk' || field.kind === 'fk_multi') && field.fkEntity) {
			options[field.name] = await getFkOptions(field.fkEntity);
		}
	}

	return options;
}

async function getFkOptions(entity: FkEntity): Promise<SelectOption[]> {
	if (entity === 'skill_resources') {
    return (await db.execute('SELECT id,name_es,nature FROM skill_resources ORDER BY name_es')).rows.map(r=>({value:String(r.id),label:String(r.name_es),meta:({method:'Método',standard:'Estándar',language:'Lenguaje',tool:'Herramienta',platform:'Plataforma'} as Record<string,string>)[String(r.nature)]}));
  }
  if (entity === 'skill_evidence') {
    return (await db.execute("SELECT c.rowid AS id,e.title_cache,e.entity_type FROM entries e JOIN entry_controls c ON c.entity_type=e.entity_type AND c.entity_id=e.entity_id WHERE e.entity_type IN ('technical_works','publications','talks','teaching','courses','projects','academic_works') ORDER BY e.title_cache")).rows.map(r=>({value:String(r.id),label:String(r.title_cache),meta:entityDefinitions[r.entity_type as EntityType]}));
  }
  if (entity === 'skill_portfolio') {
    return (await db.execute('SELECT rowid AS id,title_es FROM portfolio_projects ORDER BY sort_order')).rows.map(r=>({value:String(r.id),label:String(r.title_es)}));
  }
  if (entity === 'projects') {
		const res = await db.execute(
			`SELECT p.id, p.title, COALESCE(p.acronym, '') AS acronym,
			        p.project_code, p.institution, p.funding_body, p.principal_investigators_text,
			        programme.label_es AS programme
			 FROM projects p LEFT JOIN type_vocab programme ON programme.code=p.programme_code
			 ORDER BY title COLLATE NOCASE`
		);
		return res.rows.map((row) => ({
			value: String(row.id),
			label: row.acronym ? `${row.acronym} — ${row.title}` : String(row.title),
			meta: [row.project_code,row.institution,row.programme,row.funding_body,
				row.principal_investigators_text ? `IP: ${row.principal_investigators_text}` : ''].filter(Boolean).join(' · ')
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
			`SELECT id, title, date_start, date_end,
			        COALESCE(substr(date_start, 1, 4), '') AS y
			 FROM events
			 ORDER BY date_start DESC, title COLLATE NOCASE`
		);
		return res.rows.map((row) => {
			const start = row.date_start ? String(row.date_start) : '';
			const end = row.date_end ? String(row.date_end) : '';
			const date = start ? (end && end !== start ? `${start} — ${end}` : start) : String(row.y ?? '');
			return {
				value: String(row.id),
				label: row.y ? `${row.y} — ${row.title}` : String(row.title),
				meta: date ? `Fecha del evento: ${date}` : 'Evento sin fecha registrada'
			};
		});
	}
	const res = await db.execute(
		`SELECT talk.id, talk.title,
		        COALESCE(
		          substr(talk.date_override, 1, 4),
		          substr(event.date_start, 1, 4),
		          ''
		        ) AS y
		 FROM talks AS talk
		 LEFT JOIN events AS event ON event.id = talk.canonical_event_id
		 ORDER BY COALESCE(talk.date_override, event.date_start) DESC,
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
	parsed: ParsedForm,
	entityId?: number
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
		} else if ((field.kind === 'fk' || field.kind === 'fk_multi') && field.fkEntity) {
			const tableByFk: Record<FkEntity, string> = {
				projects: 'projects',
				talks: 'talks',
				education: 'education',
				events: 'events', skill_resources: 'skill_resources', skill_evidence: 'entry_controls', skill_portfolio: 'portfolio_projects'
			};
			const table = tableByFk[field.fkEntity];
			const ids = field.kind === 'fk_multi' ? String(value).split(',').map(Number) : [value];
			const res = await db.execute({
				sql: `SELECT rowid FROM ${table} WHERE ${field.fkEntity === 'skill_evidence' ? "entity_type IN ('technical_works','publications','talks','teaching','courses','projects','academic_works') AND" : ''} rowid IN (${ids.map(()=>'?').join(',')})`,
				args: ids
			});
			if (res.rows.length !== ids.length) {
				parsed.errors[field.name] = 'La referencia seleccionada no existe';
			}
		}
	}

	if (type === 'event_attendance' && !parsed.errors.event_id) {
		const eventId = parsed.values.event_id;
		if (eventId != null) {
			const existing = await db.execute({
				sql: `SELECT id FROM event_attendance
				      WHERE event_id = ? AND (? IS NULL OR id <> ?)`,
				args: [eventId, entityId ?? null, entityId ?? null]
			});
			if (existing.rows.length > 0) {
				parsed.errors.event_id = 'Este evento ya tiene una entrada de asistencia';
			}
		}
	}
}

// Reglas editoriales que relacionan varios campos. Se aplican tras comprobar
// vocabulario y referencias, tanto en las altas independientes como en la
// pantalla unificada de eventos.
export function validateEntitySemantics(type: FormEntityType, parsed: ParsedForm): void {
	if (type === 'projects' && ['research_team_member','working_team_member'].includes(String(parsed.values.role))
		&& parsed.values.programme_code !== 'generation_knowledge') {
		parsed.errors.role = 'Estas categorías de equipo son específicas de Generación de Conocimiento';
	}
	if (type === 'technical_works') {
		if (parsed.values.date_start && parsed.values.date_end && String(parsed.values.date_end) < String(parsed.values.date_start))
			parsed.errors.date_end = 'La fecha de fin no puede preceder a la de inicio';
		if (parsed.values.context_mode === 'project') {
			if (!parsed.values.project_ids) parsed.errors.project_ids = 'Selecciona los proyectos en los que participas';
			parsed.values.project_id = parsed.values.project_ids ? Number(String(parsed.values.project_ids).split(',')[0]) : null;
			for (const name of ['context_name','context_code','context_programme','context_funding_body','context_institution','context_responsibles']) {
				parsed.values[name] = null;
				delete parsed.errors[name];
			}
		} else { parsed.values.project_id = null; parsed.values.project_ids = null; delete parsed.errors.project_id; delete parsed.errors.project_ids; }
	}
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
				'El subtipo de artículo requiere actas o un libro de resúmenes como contenedor';
		}
		if (conferenceFormat != null && publicationType !== 'publication_article') {
			parsed.errors.conference_publication_format =
				'Los subtipos short paper y full paper solo se aplican a publicaciones de tipo «Artículo»';
		}
	}

	if (type === 'talks') {
		const contributionType = parsed.values.contribution_type;
		const selectionMode = parsed.values.selection_mode;
		const sessionFormat = parsed.values.session_format;
		const sessionTitle = parsed.values.session_title;
		const dateOverride = parsed.values.date_override;
		const dateEndOverride = parsed.values.date_end_override;

		if (contributionType === 'contribution_lecture') {
			parsed.values.selection_mode = 'selection_invited';
			delete parsed.errors.selection_mode;
		} else if (selectionMode == null || selectionMode === '') {
			parsed.errors.selection_mode = 'Indica si fue por invitación o mediante convocatoria abierta';
		}
		if (sessionFormat === 'session_panel' && contributionType !== 'contribution_communication') {
			parsed.errors.session_format = 'Un panel reúne comunicaciones';
		}
		if (sessionTitle != null && sessionTitle !== '' && sessionFormat !== 'session_panel') {
			parsed.errors.session_format = 'Selecciona «Panel» para indicar el título de una sesión';
		}
		if (dateEndOverride != null && dateEndOverride !== '') {
			if (dateOverride == null || dateOverride === '') {
				parsed.errors.date_end_override = 'Indica primero el día de la comunicación';
			} else if (String(dateEndOverride) <= String(dateOverride)) {
				parsed.errors.date_end_override = 'El último día debe ser posterior; no repitas el día inicial';
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
	const tx = await db.transaction('write');
	try {
		const insertValues = { ...values };
		if (type === 'skills' && insertValues.sort_order == null) {
			const order = await tx.execute(
				'SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_order FROM skills'
			);
			insertValues.sort_order = Number(order.rows[0]?.next_order ?? 10);
		}
		const inserted = await tx.execute({
			sql: `INSERT INTO ${type} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
			args: cols.map((col) => insertValues[col] ?? null)
		});
		const id = Number(inserted.lastInsertRowid);
		if (type === 'skills') for (const statement of skillStatements(id,insertValues)) await tx.execute(statement);
		if (type === 'technical_works') {
			for (const statement of technicalProjectStatements(id,insertValues)) await tx.execute(statement);
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
	if (type === 'skills') statements.push(...skillStatements(id,values));
	if (type === 'technical_works') statements.push(...technicalProjectStatements(id,values));
	await db.batch(statements, 'write');
}

function skillStatements(id: number, values: Record<string,FieldValue>) {
  const ids = (field:string)=>String(values[field] || '').split(',').filter(Boolean).map(Number);
  return [
    {sql:'DELETE FROM skill_resource_links WHERE skill_id=?',args:[id]},
    {sql:'DELETE FROM skill_evidence_links WHERE skill_id=?',args:[id]},
    {sql:'DELETE FROM skill_portfolio_links WHERE skill_id=?',args:[id]},
    ...ids('resource_ids').map(r=>({sql:'INSERT INTO skill_resource_links VALUES(?,?)',args:[id,r]})),
    ...ids('evidence_ids').map(r=>({sql:'INSERT INTO skill_evidence_links SELECT ?,entity_type,entity_id FROM entry_controls WHERE rowid=?',args:[id,r]})),
    ...ids('portfolio_ids').map(r=>({sql:'INSERT INTO skill_portfolio_links SELECT ?,slug FROM portfolio_projects WHERE rowid=?',args:[id,r]}))
  ];
}
function technicalProjectStatements(id: number, values: Record<string, FieldValue>) {
	const ids = String(values.project_ids || '').split(',').filter(Boolean).map(Number);
	return [
		{sql:'DELETE FROM technical_work_projects WHERE technical_work_id=?',args:[id]},
		...ids.map(projectId=>({sql:'INSERT INTO technical_work_projects(technical_work_id,project_id) VALUES(?,?)',args:[id,projectId]}))
	];
}

// Eliminar (§12): relaciones → control → fila, en un batch transaccional.
// Caso especial: referencias project_id / event_id se ponen a NULL antes.
export async function deleteEntity(type: FormEntityType, id: number): Promise<void> {
	const stmts: Array<{ sql: string; args: Array<string | number> }> = [];

	if (type === 'projects') {
		// La relación se mantiene: evita borrar el contexto vivo del trabajo.
		const linked = await db.execute({ sql: 'SELECT 1 FROM technical_work_projects WHERE project_id=? LIMIT 1', args: [id] });
		if (linked.rows.length) throw new Error('Este proyecto tiene trabajos técnicos vinculados. Desvincúlalos o traslada su contexto antes de eliminarlo.');
		for (const table of ['publications', 'talks', 'teaching']) {
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
	if (type === 'skills') {
    const sets=await db.batch([
      {sql:'SELECT resource_id AS id FROM skill_resource_links WHERE skill_id=?',args:[id]},
      {sql:'SELECT c.rowid AS id FROM skill_evidence_links l JOIN entry_controls c ON c.entity_type=l.entity_type AND c.entity_id=l.entity_id WHERE l.skill_id=?',args:[id]},
      {sql:'SELECT p.rowid AS id FROM skill_portfolio_links l JOIN portfolio_projects p ON p.slug=l.portfolio_slug WHERE l.skill_id=?',args:[id]}
    ],'read');
    ['resource_ids','evidence_ids','portfolio_ids'].forEach((name,i)=>values[name]=sets[i].rows.map(r=>String(r.id)).join(','));
  }
  if (type === 'talks') values.date_range_enabled = values.date_end_override ? '1' : '';
	if (type === 'technical_works') {
		const links = await db.execute({sql:'SELECT project_id FROM technical_work_projects WHERE technical_work_id=? ORDER BY project_id',args:[id]});
		values.project_ids = links.rows.map(row=>String(row.project_id)).join(',');
		values.context_mode = values.project_ids ? 'project' : 'external';
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
