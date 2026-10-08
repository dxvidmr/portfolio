import { isFutureDate, meritPeriod } from '$lib/content/periods';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import type { Client, Transaction } from '@libsql/client';
import { cvEntityLabels, type CvEntityType, type CvEntry, type CvProfile, type CvSnapshot, type CvPresentation } from '$lib/types/cv';
import { profile } from '$lib/content/profile';
import { parseCv } from './cv-validation';
import { getSkillDetails } from '$lib/server/skills';
import { technicalContext } from '$lib/server/technical-context';

type Reader = Pick<Client | Transaction, 'execute' | 'batch'>;
const value = (v: unknown) => v == null ? '' : String(v);
const join = (...parts: unknown[]) => parts.map(value).filter(Boolean).join(' · ');
const displayDate = (v: unknown) => value(v).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3/$2/$1');
const range = (a: unknown, b: unknown) => !b || a === b ? displayDate(a) : [displayDate(a), displayDate(b)].filter(Boolean).join(' - ');
const safeUrl = (v: unknown) => {
  const url = value(v).trim();
  if (/\s/.test(url)) return '';
  try { const u = new URL(url); return ['http:', 'https:'].includes(u.protocol) ? url : ''; } catch { return ''; }
};

// Formatting is shared by the selector, preview and frozen export. No private notes,
// certificates or document attachments enter this catalogue. Amounts are included
// only for personal funding awards, explicitly requested for the CV.
export async function getCvCatalog(reader: Reader = db, language: 'es' | 'en' = 'es'): Promise<CvEntry[]> {
  const types = Object.keys(cvEntityLabels) as CvEntityType[];
  const queries = ['SELECT code,label_es,label_en FROM type_vocab',
    'SELECT id,title,date_start,date_end,institution,city,url FROM events',
    'SELECT entity_type,entity_id,is_public FROM entry_controls', ...types.map(type => `SELECT * FROM ${type}`),
    'SELECT technical_work_id,project_id FROM technical_work_projects'];
  const sets = reader === db ? await db.batch(queries,'read') : await reader.batch(queries);
  const vocab = sets[0].rows;
  const labels = new Map(vocab.map(r => [value(r.code), value(language === 'en' ? r.label_en : r.label_es)]));
  const label = (v: unknown) => labels.get(value(v)) || '';
  const events = new Map(sets[1].rows.map(r => [Number(r.id), r]));
  const controls = new Map(sets[2].rows.map(r => [`${r.entity_type}:${r.entity_id}`, Number(r.is_public) === 1]));
  const projects = new Map(sets[types.indexOf('projects')+3].rows.map(r => [Number(r.id),r]));
  const technicalProjects = sets[types.length+3].rows;
  const skillDetails = await getSkillDetails(reader,language);
  const result: CvEntry[] = [];
  for (const [index,type] of types.entries()) {
    const rows = sets[index+3].rows;
    for (const r of rows) {
      let title = value(r.title || r.degree_title || r.organization || r.name_es || label(r.language) || r.language || r.institution);
      let detail = join(r.institution);
      let date = range(r.date_start, r.date_end) || value(r.year || r.academic_year);
      let sortDate = value(r.date_start || r.date_end || r.year || r.academic_year);
      let url = safeUrl(r.url);
      let presentation: CvPresentation | undefined;
      let contribution = '';
      if (type === 'publications') {
        presentation = { kind: 'publication', authors: value(r.authors_text), editors: value(r.editors_text), publicationType: label(r.publication_type),
          container: value(r.journal_title || r.book_title), publisher: value(r.publisher), volume: value(r.volume), issue: value(r.issue), pages: value(r.pages) };
        detail = join(r.authors_text, label(r.publication_type), r.journal_title || r.book_title, r.publisher,
          r.volume ? `vol. ${r.volume}` : '', r.issue ? `n.º ${r.issue}` : '', r.pages ? `pp. ${r.pages}` : '');
        url ||= safeUrl(r.doi ? `https://doi.org/${value(r.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}` : '');
      } else if (type === 'talks') {
        const event = events.get(Number(r.canonical_event_id));
        presentation = { kind: 'talk', authors: value(r.authors_text), contributionType: label(r.contribution_type), selectionMode: label(r.selection_mode),
          event: value(event?.title), institution: value(event?.institution), city: value(event?.city), sessionFormat: label(r.session_format), sessionTitle: value(r.session_title) };
        sortDate = value(r.date_override || event?.date_start);
        date = range(r.date_override || event?.date_start, r.date_end_override || (r.date_override ? null : event?.date_end));
        detail = join(r.authors_text, label(r.contribution_type), label(r.selection_mode), event?.title === title ? '' : event?.title, event?.institution, event?.city, label(r.session_format), r.session_title);
        url ||= safeUrl(event?.url);
      } else if (type === 'projects') {
        date = meritPeriod(value(r.date_start),value(r.date_end),language);
        presentation = { kind: 'project', role: label(r.role), institution: value(r.institution), code: value(r.project_code), principalInvestigators: value(r.principal_investigators_text),
          programme: label(r.programme_code), nature: label(r.nature),
          description: value(language === 'en' ? r.description_short_en || r.description_short_es : r.description_short_es) };
        contribution = value(language === 'en' ? r.contribution_en || r.contribution_es : r.contribution_es);
        detail = join(label(r.role), r.institution, r.project_code, r.principal_investigators_text ? `IP: ${r.principal_investigators_text}` : '', language === 'en' ? r.description_short_en || r.description_short_es : r.description_short_es);
      } else if (type === 'technical_works') {
        date = meritPeriod(value(r.date_start),value(r.date_end),language);
        const project = projects.get(Number(r.project_id));
        presentation = { kind: 'technical', workType: label(r.work_type), modality: label(r.modality), recipient: value(r.recipient),
          ...technicalContext(r,project,label(project?.programme_code)),
          projects: technicalProjects.filter(link=>Number(link.technical_work_id)===Number(r.id))
            .map(link=>projects.get(Number(link.project_id))).filter(p=>p!=null)
            .sort((a,b)=>value(a.date_start).localeCompare(value(b.date_start)))
            .map(p=>({title:value(p.title),code:value(p.project_code),programme:label(p.programme_code),institution:value(p.institution),fundingBody:value(p.funding_body),responsibles:value(p.principal_investigators_text)})) };
        contribution = value(language === 'en' ? r.contribution_en || r.contribution_es : r.contribution_es);
        detail = join(presentation.workType,presentation.modality,presentation.recipient,presentation.contextName);
      } else if (type === 'education') {
        detail = join(r.institution, r.department);
        const expected = isFutureDate(value(r.date_end));
        const ongoing = Boolean(r.date_start && (!r.date_end || expected));
        const year = value(r.date_end || r.date_start).match(/^\d{4}/)?.[0] || '';
        presentation = { kind: 'education', year, dateBasis: r.date_end ? 'end' : 'start', ongoing, expected };
        sortDate = value(r.date_end || r.date_start);
        date = year ? `${r.date_end ? (language === 'en' ? 'Completed' : 'Finalización') : (language === 'en' ? 'Started' : 'Inicio')}: ${year}${expected ? (language === 'en' ? ' · expected' : ' · prevista') : ongoing ? (language === 'en' ? ' · ongoing' : ' · en curso') : ''}` : '';
      } else if (type === 'research_stays') detail = join(r.faculty_or_dept, r.supervisor, r.city);
      else if (type === 'skills') {
        title=value(language==='en' ? r.name_en || r.name_es : r.name_es);
        contribution=value(language==='en' ? r.description_en || r.description_es : r.description_es);
        detail=label(r.area);
        const extra=skillDetails.get(Number(r.id));
        presentation={kind:'skill',area:detail,resources:extra?.resources ?? [],evidence:extra?.evidence ?? []};
      }
      else if (type === 'languages') { title = label(r.language) || value(r.language); detail = Number(r.is_native) ? (language === 'en' ? 'Native' : 'Lengua materna') : label(r.level); }
      else if (type === 'funding_awards') {
        presentation = { kind: 'funding', awardType: label(r.award_type), awardingBody: value(r.awarding_body), context: value(r.related_context),
          amount: r.amount == null ? null : Number(r.amount), currency: value(r.currency) };
        detail = join(presentation.awardType,presentation.awardingBody,presentation.context);
      }
      else if (type === 'courses') detail = join(r.institution, r.program_context, r.hours ? `${r.hours} h` : '');
      else if (type === 'teaching') detail = join(label(r.teaching_type), r.institution, r.degree_program, r.hours ? `${r.hours} h` : '');
      else if (type === 'memberships') detail = join(label(r.role), r.role_details);
      else if (type === 'academic_works') detail = join(r.institution, r.program, label(r.work_type));
      else if (type === 'service_activities') {
        detail = join(label(r.activity_type), label(r.role), r.venue_or_journal);
        if (r.activity_type === 'journal_editing' && r.venue_or_journal) {
          presentation = { kind: 'responsibility', organization: value(r.venue_or_journal), role: title };
        } else if (r.activity_type === 'event_organization') {
          const event=events.get(Number(r.canonical_event_id));
          presentation = { kind: 'eventOrganization', role: label(r.role), venue: value(r.venue_or_journal || event?.institution),
            dates: range(event?.date_start || r.date_start,event?.date_end || r.date_end) };
        }
      }
      if (['memberships','service_activities','teaching'].includes(type)) date=meritPeriod(value(r.date_start),value(r.date_end),language);
      const key = `${type}:${r.id}`;
      result.push({ key, entityType: type, entityId: Number(r.id), title, detail, date, sortDate, url, isPublic: controls.get(key) || false, ...(presentation ? { presentation } : {}), contribution });
    }
  }
  return result;
}

export async function listCvs() {
  return (await db.execute(`SELECT p.*, (SELECT COUNT(*) FROM cv_blocks b WHERE b.cv_id=p.id) block_count,
    (SELECT COUNT(*) FROM cv_exports x WHERE x.cv_id=p.id) export_count FROM cv_profiles p ORDER BY p.updated_at DESC,p.id DESC`)).rows;
}
export async function getCv(id: number, reader: Reader = db): Promise<CvProfile> {
  const queries = [
    {sql:'SELECT * FROM cv_profiles WHERE id=?',args:[id]},
    {sql:'SELECT * FROM cv_blocks WHERE cv_id=? ORDER BY sort_order',args:[id]},
    {sql:'SELECT e.* FROM cv_block_entries e JOIN cv_blocks b ON b.id=e.block_id WHERE b.cv_id=? ORDER BY e.sort_order',args:[id]}
  ];
  const sets = reader === db ? await db.batch(queries,'read') : await reader.batch(queries);
  const row = sets[0].rows[0];
  if (!row) error(404, 'CV no encontrado.');
  const blocks = sets[1].rows;
  const entries = sets[2].rows;
  return { id, version: Number(row.version), name: value(row.name), title: value(row.title), personName: value(row.person_name), affiliation: value(row.affiliation), website: value(row.website), position: value(row.position), email: value(row.email), language: row.language as 'es' | 'en',
    blocks: blocks.map(b => ({ key: String(b.id), kind: b.kind as 'text' | 'entries', title: value(b.title), body: value(b.body), entryScope: b.entry_scope as 'merits'|'skills', skillsDisplay: b.skills_display as 'names'|'descriptions',
      entries: entries.filter(e => e.block_id === b.id).map(e => ({ key: String(e.id), entityType: e.entity_type as CvEntityType, entityId: Number(e.entity_id), commentary: value(e.commentary),
        skillOptions: JSON.parse(value(e.skill_options)), contributionMode: e.contribution_mode as 'inherit' | 'custom' | 'hidden', contributionText: value(e.contribution_text) })) })) };
}
async function writeBlocks(tx: Transaction, cv: Omit<CvProfile, 'id'>, id: number) {
  if (!cv.blocks.length) return;
  const blocks = await tx.batch(cv.blocks.map((b,i) => ({
    sql:'INSERT INTO cv_blocks(cv_id,kind,title,body,sort_order,skills_display,entry_scope) VALUES (?,?,?,?,?,?,?)',args:[id,b.kind,b.title,b.body,i,b.skillsDisplay ?? 'names',b.entryScope ?? 'merits']
  })));
  const entries = cv.blocks.flatMap((b,i) => b.entries.map((e,j) => ({
    sql:'INSERT INTO cv_block_entries(block_id,entity_type,entity_id,commentary,sort_order,contribution_mode,contribution_text,skill_options) VALUES (?,?,?,?,?,?,?,?)',
    args:[Number(blocks[i].lastInsertRowid),e.entityType,e.entityId,e.commentary,j,e.contributionMode ?? 'inherit',e.contributionText ?? '',JSON.stringify(e.skillOptions ?? {resources:[],evidence:[]})]
  })));
  if (entries.length) await tx.batch(entries);
}
export async function createCv(name: string, sourceId?: number) {
  if (!name.trim() || name.length > 200) throw new Error('Indica un nombre interno (máximo 200 caracteres).');
  const tx = await db.transaction('write');
  try {
    const source = sourceId ? await getCv(sourceId, tx) : null;
    const inserted = await tx.execute({ sql: 'INSERT INTO cv_profiles(name,title,person_name,affiliation,website,language,position,email) VALUES (?,?,?,?,?,?,?,?)', args: [name.trim(), source?.title || 'Currículum', source?.personName || profile.name, source?.affiliation ?? profile.role.es.institution, source?.website ?? 'https://davidmerinorecalde.com', source?.language || 'es', source?.position ?? profile.role.es.title, source?.email ?? profile.contact.mail] });
    const id = Number(inserted.lastInsertRowid);
    if (source) await writeBlocks(tx, source, id);
    await tx.commit(); return id;
  } catch (e) { await tx.rollback(); throw e; } finally { tx.close(); }
}
export async function saveCv(id: number, input: unknown) {
  const cv = parseCv(input);
  const tx = await db.transaction('write');
  try {
    const previous = await getCv(id, tx);
    const current = new Set((await getCvCatalog(tx)).map(e => e.key));
    const old = new Set(previous.blocks.flatMap(b => b.entries.map(e => `${e.entityType}:${e.entityId}`)));
    for (const b of cv.blocks) for (const e of b.entries) {
      const key = `${e.entityType}:${e.entityId}`;
      if (!current.has(key) && !old.has(key)) throw new Error('Un mérito añadido ya no existe. Recarga el catálogo.');
    }
    const updated = await tx.execute({ sql: `UPDATE cv_profiles SET name=?,title=?,person_name=?,affiliation=?,website=?,position=?,email=?,language=?,version=version+1,updated_at=datetime('now') WHERE id=? AND version=?`, args: [cv.name, cv.title, cv.personName, cv.affiliation, cv.website, cv.position, cv.email, cv.language, id, cv.version] });
    if (!updated.rowsAffected) error(409, 'Este CV ha cambiado en otra sesión. Recarga antes de guardar.');
    await tx.execute({ sql: 'DELETE FROM cv_blocks WHERE cv_id=?', args: [id] });
    await writeBlocks(tx, cv, id);
    await tx.commit();
  } catch (e) { await tx.rollback(); throw e; } finally { tx.close(); }
}
export function snapshotCv(cv: CvProfile, catalog: CvEntry[]) {
  const map = new Map(catalog.map(e => [e.key, e]));
  const missing: string[] = [];
  const snapshot: CvSnapshot = { name: cv.name, title: cv.title, personName: cv.personName, affiliation: cv.affiliation, website: cv.website, position: cv.position, email: cv.email, language: cv.language, generatedAt: new Date().toISOString(), profileVersion: cv.version,
    blocks: cv.blocks.map(b => ({ ...b, entries: b.entries.flatMap(e => {
      const row = map.get(`${e.entityType}:${e.entityId}`);
      if (!row) { missing.push(`${e.entityType}:${e.entityId}`); return []; }
      const presentation=row.presentation?.kind==='skill' ? {...row.presentation,
        resources:row.presentation.resources.filter(r=>e.skillOptions?.resources.includes(r.key)),
        evidence:row.presentation.evidence.filter(r=>e.skillOptions?.evidence.includes(r.key))} : row.presentation;
      return [{ ...row,presentation, commentary: e.commentary,
        contribution: e.contributionMode === 'hidden' ? '' : e.contributionMode === 'custom' ? e.contributionText ?? '' : row.contribution }];
    }) })) };
  return { snapshot, missing };
}
export async function previewCv(id: number) {
  const tx = await db.transaction('read');
  try {
    const cv = await getCv(id, tx);
    const result = snapshotCv(cv, await getCvCatalog(tx, cv.language));
    await tx.commit(); return result;
  } finally { tx.close(); }
}
export async function exportCv(id: number, version: number) {
  const tx = await db.transaction('write');
  try {
    const cv = await getCv(id, tx);
    if (version !== cv.version) error(409, 'El CV ha cambiado. Recarga la vista previa antes de exportar.');
    const { snapshot, missing } = snapshotCv(cv, await getCvCatalog(tx, cv.language));
    if (missing.length) throw new Error('Hay méritos que ya no existen. Retíralos del CV antes de exportar.');
    const inserted = await tx.execute({ sql: 'INSERT INTO cv_exports(cv_id,profile_version,snapshot_json) VALUES (?,?,?)', args: [id, cv.version, JSON.stringify(snapshot)] });
    await tx.commit(); return Number(inserted.lastInsertRowid);
  } catch (e) { await tx.rollback(); throw e; } finally { tx.close(); }
}
export async function getCvExports(id: number) {
  return (await db.execute({ sql: 'SELECT id,profile_version,created_at FROM cv_exports WHERE cv_id=? ORDER BY id DESC', args: [id] })).rows;
}
export async function getCvExport(id: number, exportId: number) {
  const row = (await db.execute({ sql: 'SELECT snapshot_json,created_at FROM cv_exports WHERE cv_id=? AND id=?', args: [id, exportId] })).rows[0];
  if (!row) error(404, 'Versión exportada no encontrada.');
  return { snapshot: JSON.parse(value(row.snapshot_json)) as CvSnapshot, createdAt: value(row.created_at) };
}
export async function deleteCv(id: number, version: number) {
  const result = await db.execute({ sql: 'DELETE FROM cv_profiles WHERE id=? AND version=?', args: [id, version] });
  if (!result.rowsAffected) error(409, 'El CV ha cambiado. Recarga antes de eliminar.');
}
