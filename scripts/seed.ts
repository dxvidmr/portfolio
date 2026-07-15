/**
 * Seed de la base `curriculum` (Turso / libSQL) a partir de db/cv-data.json.
 *
 * - Idempotente: vacía las tablas de contenido y `entries` antes de insertar,
 *   así que se puede re-ejecutar sin duplicar.
 * - Transaccional: todo o nada (rollback ante cualquier error).
 * - Resuelve project_ref -> project_id y event_ref -> event_id (FKs reales).
 * - Da de alta cada fila de contenido en `entries` (índice transversal de home/timeline),
 *   salvo `tags` (taxonomía) y las asociaciones polimórficas (documents/links/entity_tags),
 *   que se alimentan desde /admin, no desde el CV.
 *
 * Uso:  npm run seed
 */
import 'dotenv/config';
import { createClient, type Transaction } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error('❌ Faltan TURSO_DATABASE_URL / TURSO_AUTH_TOKEN en .env');
  process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(here, '..', 'db', 'cv-data.json'), 'utf8'));

const client = createClient({ url, authToken });

const asStr = (v: unknown): string | null => (v == null ? null : String(v));

// title_cache + sort_date de `entries` por tipo de entidad.
const entryMeta: Record<string, (r: any) => { title: string; sort: string | null }> = {
  projects:           (r) => ({ title: r.title, sort: r.date_start ?? null }),
  education:          (r) => ({ title: r.degree_title, sort: r.date_end ?? r.date_start ?? null }),
  research_stays:     (r) => ({ title: r.institution, sort: r.date_start ?? null }),
  courses:            (r) => ({ title: r.title, sort: r.date_start ?? null }),
  funding_awards:     (r) => ({ title: r.title, sort: asStr(r.year) }),
  publications:       (r) => ({ title: r.title, sort: asStr(r.year) }),
  academic_works:     (r) => ({ title: r.title, sort: asStr(r.year) }),
  academic_events:    (r) => ({ title: r.title, sort: r.date_start ?? asStr(r.year) }),
  teaching:           (r) => ({ title: r.title, sort: r.date_start ?? r.academic_year ?? null }),
  service_activities: (r) => ({ title: r.title, sort: r.date_start ?? asStr(r.year) }),
  memberships:        (r) => ({ title: r.organization, sort: r.date_start ?? null }),
  skills:             (r) => ({ title: r.category, sort: null }),
  languages:          (r) => ({ title: r.language, sort: null }),
};

// Columnas reales por tabla (excluye claves de trabajo: key/project_ref/event_ref).
const cols: Record<string, string[]> = {
  projects: ['title','acronym','project_code','project_type','role','institution','research_group','funding_body','principal_investigators_text','date_start','date_end','amount','currency','description_short_es','description_short_en','slug','url'],
  academic_events: ['title','event_title','contribution_type','authors_text','role','date_start','date_end','year','institution','city','country','modality','doi','project_id','url'],
  publications: ['title','publication_type','authors_text','editors_text','journal_title','book_title','publisher','year','volume','issue','pages','doi','isbn','issn','abstract','bibtex_override','project_id','event_id','url'],
  academic_works: ['title','work_type','institution','program','year','url'],
  education: ['degree_title','institution','department','country','thesis_directors_text','date_start','date_end','is_ongoing','url','notes_private'],
  research_stays: ['institution','faculty_or_dept','supervisor','city','country','date_start','date_end','funding_text','url','notes_private'],
  courses: ['title','institution','program_context','date_start','date_end','hours','url','notes_private'],
  funding_awards: ['title','award_type','awarding_body','amount','currency','year','related_context','project_id','url','notes_private'],
  teaching: ['teaching_type','title','institution','course_code','degree_program','ects','academic_year','hours','project_id','description','date_start','date_end','url'],
  service_activities: ['activity_type','title','role','venue_or_journal','related_entity','city','country','date_start','date_end','year','description','url'],
  memberships: ['organization','role','date_start','date_end','is_ongoing','notes_private'],
  skills: ['category','items_text','sort_order'],
  languages: ['language','level','is_native'],
  tags: ['slug','label_es','label_en'],
};

async function insertRow(tx: Transaction, table: string, row: any): Promise<number> {
  const c = cols[table];
  const sql = `INSERT INTO ${table} (${c.join(', ')}) VALUES (${c.map(() => '?').join(', ')})`;
  const args = c.map((k) => (row[k] === undefined ? null : row[k]));
  const res = await tx.execute({ sql, args });
  return Number(res.lastInsertRowid);
}

async function addEntry(tx: Transaction, entityType: string, id: number, row: any): Promise<void> {
  const m = entryMeta[entityType](row);
  await tx.execute({
    sql: 'INSERT INTO entries (entity_type, entity_id, title_cache, sort_date) VALUES (?, ?, ?, ?)',
    args: [entityType, id, m.title, m.sort],
  });
}

async function main() {
  const tx = await client.transaction('write');
  try {
    // 1) Limpieza (idempotencia)
    await tx.execute('DELETE FROM entries');
    for (const t of [
      'projects','education','research_stays','courses','funding_awards','publications',
      'academic_works','academic_events','teaching','service_activities','memberships',
      'skills','languages','tags','entity_tags','documents','links',
    ]) {
      await tx.execute(`DELETE FROM ${t}`);
    }

    // 2) Projects (primero, para resolver FKs)
    const projectId: Record<string, number> = {};
    for (const p of data.projects) {
      const id = await insertRow(tx, 'projects', p);
      projectId[p.key] = id;
      await addEntry(tx, 'projects', id, p);
    }

    // 3) Academic events (antes de publications, para resolver event_ref)
    const eventId: Record<string, number> = {};
    for (const e of data.academic_events) {
      const id = await insertRow(tx, 'academic_events', {
        ...e,
        project_id: e.project_ref ? projectId[e.project_ref] : null,
      });
      if (e.key) eventId[e.key] = id;
      await addEntry(tx, 'academic_events', id, e);
    }

    // 4) Publications (resuelve project_id y event_id)
    for (const p of data.publications) {
      const id = await insertRow(tx, 'publications', {
        ...p,
        project_id: p.project_ref ? projectId[p.project_ref] : null,
        event_id: p.event_ref ? eventId[p.event_ref] : null,
      });
      await addEntry(tx, 'publications', id, p);
    }

    // 5) Resto de tablas de contenido
    for (const w of data.academic_works) await addEntry(tx, 'academic_works', await insertRow(tx, 'academic_works', w), w);
    for (const r of data.education) await addEntry(tx, 'education', await insertRow(tx, 'education', r), r);
    for (const r of data.research_stays) await addEntry(tx, 'research_stays', await insertRow(tx, 'research_stays', r), r);
    for (const r of data.courses) await addEntry(tx, 'courses', await insertRow(tx, 'courses', r), r);
    for (const r of data.funding_awards) {
      const id = await insertRow(tx, 'funding_awards', { ...r, project_id: r.project_ref ? projectId[r.project_ref] : null });
      await addEntry(tx, 'funding_awards', id, r);
    }
    for (const r of data.teaching) {
      const id = await insertRow(tx, 'teaching', { ...r, project_id: r.project_ref ? projectId[r.project_ref] : null });
      await addEntry(tx, 'teaching', id, r);
    }
    for (const r of data.service_activities) await addEntry(tx, 'service_activities', await insertRow(tx, 'service_activities', r), r);
    for (const r of data.memberships) await addEntry(tx, 'memberships', await insertRow(tx, 'memberships', r), r);
    for (const r of data.skills) await addEntry(tx, 'skills', await insertRow(tx, 'skills', r), r);
    for (const r of data.languages) await addEntry(tx, 'languages', await insertRow(tx, 'languages', r), r);

    // 6) Tags (taxonomía; no van a `entries`)
    for (const r of data.tags) await insertRow(tx, 'tags', r);

    await tx.commit();
    console.log('✅ Seed completado (commit).');
  } catch (err) {
    await tx.rollback();
    console.error('❌ Seed falló, se hizo rollback. Nada quedó insertado.\n', err);
    process.exit(1);
  }
}

await main();

// Recuento final por tabla para verificación
const tablesToCount = [
  ...(data._meta.entity_types_a_entries as string[]), 'tags', 'entries',
];
console.log('\n— Recuento final —');
for (const t of tablesToCount) {
  const r = await client.execute(`SELECT count(*) AS n FROM ${t}`);
  console.log(String(t).padEnd(20), r.rows[0].n);
}
await client.close();
