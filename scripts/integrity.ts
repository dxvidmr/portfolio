import 'dotenv/config';
import { createClient } from '@libsql/client';

// Batería de integridad (plan §7): comprobaciones de SOLO LECTURA contra la
// base de datos de las variables de entorno. Ejecutar: npm run integrity
// Sale con código 1 si alguna comprobación falla.

const db = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

let pass = 0;
let fail = 0;

async function expectZero(name: string, sql: string): Promise<void> {
	const res = await db.execute(sql);
	const n = Number(Object.values(res.rows[0])[0]);
	if (n === 0) {
		pass++;
		console.log(`OK   ${name}`);
	} else {
		fail++;
		console.log(`FAIL ${name}: ${n} filas`);
	}
}

// ── Índice transversal ────────────────────────────────────────────────────────

await expectZero(
	'entry_source sin duplicados (entity_type, entity_id)',
	`SELECT COUNT(*) FROM (
	   SELECT entity_type, entity_id FROM entry_source
	   GROUP BY entity_type, entity_id HAVING COUNT(*) > 1)`
);

await expectZero(
	'entries (vista) y entry_source con el mismo total',
	`SELECT ABS((SELECT COUNT(*) FROM entries) - (SELECT COUNT(*) FROM entry_source))`
);

await expectZero(
	'sin controles huérfanos (control sin fila fuente)',
	`SELECT COUNT(*) FROM entry_controls c
	 WHERE NOT EXISTS (
	   SELECT 1 FROM entry_source s
	   WHERE s.entity_type = c.entity_type AND s.entity_id = c.entity_id)`
);

await expectZero(
	'toda entrada con show_home = 1 es pública',
	`SELECT COUNT(*) FROM entry_controls WHERE show_home = 1 AND is_public = 0`
);

await expectZero(
	'toda entrada con featured_cv = 1 es pública',
	`SELECT COUNT(*) FROM entry_controls WHERE featured_cv = 1 AND is_public = 0`
);

// ── Relaciones polimórficas sin huérfanos ────────────────────────────────────

for (const table of ['portfolio_items', 'entity_tags', 'links']) {
	await expectZero(
		`${table} sin huérfanos contra entry_source`,
		`SELECT COUNT(*) FROM ${table} t
		 WHERE NOT EXISTS (
		   SELECT 1 FROM entry_source s
		   WHERE s.entity_type = t.entity_type AND s.entity_id = t.entity_id)`
	);
}

await expectZero(
	'portfolio_items sin fichas de portfolio huérfanas',
	`SELECT COUNT(*) FROM portfolio_items item
	 WHERE NOT EXISTS (
	   SELECT 1 FROM portfolio_projects project
	   WHERE project.slug = item.portfolio_slug)`
);

await expectZero(
	'portfolio_project_tags sin fichas de portfolio huérfanas',
	`SELECT COUNT(*) FROM portfolio_project_tags tag
	 WHERE NOT EXISTS (
	   SELECT 1 FROM portfolio_projects project
	   WHERE project.slug = tag.portfolio_slug)`
);

await expectZero(
	'Versología existe como borrador',
	`SELECT ABS(COUNT(*) - 1) FROM portfolio_projects
	 WHERE slug = 'versologia-metadrama' AND publication_status = 'draft'`
);

await expectZero(
	'documents (propietario entrada) sin huérfanos',
	`SELECT COUNT(*) FROM documents d
	 WHERE d.entity_type IS NOT NULL AND NOT EXISTS (
	   SELECT 1 FROM entry_source s
	   WHERE s.entity_type = d.entity_type AND s.entity_id = d.entity_id)`
);

await expectZero(
	'funding_relations sin huérfanos en ninguno de los dos extremos',
	`SELECT
	   (SELECT COUNT(*) FROM funding_relations r
	    WHERE NOT EXISTS (SELECT 1 FROM funding_awards f WHERE f.id = r.funding_award_id))
	 + (SELECT COUNT(*) FROM funding_relations r
	    WHERE NOT EXISTS (
	      SELECT 1 FROM entry_source s
	      WHERE s.entity_type = r.entity_type AND s.entity_id = r.entity_id))`
);

await expectZero(
	'research_stays sin la columna legado funding_text',
	`SELECT COUNT(*) FROM pragma_table_info('research_stays') WHERE name = 'funding_text'`
);

await expectZero(
	'la estancia de Oxford tiene exactamente dos ayudas públicas que la financian',
	`SELECT ABS(COUNT(*) - 2)
	 FROM funding_relations AS relation
	 JOIN research_stays AS stay
	   ON relation.entity_type = 'research_stays' AND relation.entity_id = stay.id
	 JOIN entries AS funding
	   ON funding.entity_type = 'funding_awards'
	  AND funding.entity_id = relation.funding_award_id
	  AND funding.public = 1
	 WHERE stay.institution = 'University of Oxford'
	   AND relation.relation_kind = 'supports'`
);

await expectZero(
	'las ayudas Oxford son AGAUR 3.000 EUR y Faculty 4.000 GBP',
	`SELECT ABS(COUNT(*) - 2)
	 FROM funding_relations AS relation
	 JOIN research_stays AS stay
	   ON relation.entity_type = 'research_stays' AND relation.entity_id = stay.id
	 JOIN funding_awards AS funding ON funding.id = relation.funding_award_id
	 WHERE stay.institution = 'University of Oxford'
	   AND relation.relation_kind = 'supports'
	   AND ((funding.awarding_body LIKE '%(AGAUR)' AND funding.amount = 3000 AND funding.currency = 'EUR')
	     OR (funding.awarding_body = 'Faculty of Medieval and Modern Languages, University of Oxford'
	         AND funding.amount = 4000 AND funding.currency = 'GBP'))`
);

// ── Vocabulario controlado: código + dominio correcto por tabla (§5.5) ──────

const vocabConsumers: Array<{ table: string; column: string; domain: string; nullable: boolean }> = [
	{ table: 'publications', column: 'publication_type', domain: 'publication_type', nullable: false },
	{ table: 'publications', column: 'my_role', domain: 'publication_role', nullable: true },
	{ table: 'publications', column: 'container_type', domain: 'publication_container_type', nullable: true },
	{ table: 'publications', column: 'conference_publication_format', domain: 'conference_publication_format', nullable: true },
	{ table: 'publications', column: 'review_status', domain: 'publication_review_status', nullable: true },
	{ table: 'talks', column: 'contribution_type', domain: 'contribution_type', nullable: false },
	{ table: 'talks', column: 'selection_mode', domain: 'contribution_selection', nullable: true },
	{ table: 'talks', column: 'session_format', domain: 'session_format', nullable: true },
	{ table: 'teaching', column: 'teaching_type', domain: 'teaching_type', nullable: false },
	{ table: 'service_activities', column: 'activity_type', domain: 'activity_type', nullable: false },
	{ table: 'funding_awards', column: 'award_type', domain: 'award_type', nullable: true },
	{ table: 'projects', column: 'programme_code', domain: 'project_programme', nullable: true },
	{ table: 'projects', column: 'nature', domain: 'project_nature', nullable: true },
	{ table: 'technical_works', column: 'work_type', domain: 'technical_work_type', nullable: true },
	{ table: 'technical_works', column: 'modality', domain: 'technical_modality', nullable: true },
	{ table: 'academic_works', column: 'work_type', domain: 'work_type', nullable: false },
	{ table: 'projects', column: 'role', domain: 'project_role', nullable: true },
	{ table: 'service_activities', column: 'role', domain: 'service_role', nullable: true },
	{ table: 'event_attendance', column: 'role', domain: 'attendance_role', nullable: false },
	{ table: 'events', column: 'modality', domain: 'event_modality', nullable: true },
	{ table: 'languages', column: 'language', domain: 'language', nullable: false },
	{ table: 'languages', column: 'level', domain: 'language_level', nullable: true },
	{ table: 'memberships', column: 'role', domain: 'membership_role', nullable: false },
	{ table: 'links', column: 'link_type', domain: 'link_type', nullable: false },
	{ table: 'documents', column: 'document_type', domain: 'document_type', nullable: false },
	{ table: 'portfolio_projects', column: 'kind_code', domain: 'portfolio_kind', nullable: false },
	{ table: 'portfolio_project_tags', column: 'tag_code', domain: 'portfolio_tag', nullable: false }
];

for (const consumer of vocabConsumers) {
	await expectZero(
		`${consumer.table}.${consumer.column} ∈ dominio ${consumer.domain}`,
		`SELECT COUNT(*) FROM ${consumer.table} t
		 WHERE ${consumer.nullable ? `t.${consumer.column} IS NOT NULL AND` : ''} NOT EXISTS (
		   SELECT 1 FROM type_vocab v
		   WHERE v.code = t.${consumer.column} AND v.domain = '${consumer.domain}')`
	);
}

// ── FKs de contenido ─────────────────────────────────────────────────────────

const fkChecks: Array<{ name: string; table: string; column: string; target: string }> = [
	{ name: 'publications.project_id → projects', table: 'publications', column: 'project_id', target: 'projects' },
	{ name: 'publications.event_id → talks', table: 'publications', column: 'event_id', target: 'talks' },
	{ name: 'talks.project_id → projects', table: 'talks', column: 'project_id', target: 'projects' },
	{ name: 'talks.canonical_event_id → events', table: 'talks', column: 'canonical_event_id', target: 'events' },
	{ name: 'teaching.project_id → projects', table: 'teaching', column: 'project_id', target: 'projects' },
	{ name: 'academic_works.education_id → education', table: 'academic_works', column: 'education_id', target: 'education' },
	{ name: 'service_activities.canonical_event_id → events', table: 'service_activities', column: 'canonical_event_id', target: 'events' },
	{ name: 'event_attendance.event_id → events', table: 'event_attendance', column: 'event_id', target: 'events' }
];

for (const check of fkChecks) {
	await expectZero(
		check.name,
		`SELECT COUNT(*) FROM ${check.table} t
		 WHERE t.${check.column} IS NOT NULL
		   AND NOT EXISTS (SELECT 1 FROM ${check.target} x WHERE x.id = t.${check.column})`
	);
}

// ── Eventos canónicos y asistencia privada (decisión 21) ────────────────────

await expectZero(
	'toda contribución tiene evento canónico',
	`SELECT COUNT(*) FROM talks WHERE canonical_event_id IS NULL`
);

await expectZero(
	'los intervalos de contribuciones no terminan antes de empezar',
	`SELECT COUNT(*) FROM talks
	 WHERE date_override IS NOT NULL
	   AND date_end_override IS NOT NULL
	   AND date_end_override <= date_override`
);

await expectZero(
	'las comunicaciones no duplican las fechas de su evento',
	`SELECT COUNT(*)
	 FROM talks AS talk
	 JOIN events AS event ON event.id = talk.canonical_event_id
	 WHERE (talk.date_override IS NOT NULL AND talk.date_override = event.date_start)
	    OR (talk.date_end_override IS NOT NULL AND talk.date_end_override = event.date_end)`
);

await expectZero(
	'los intervalos de servicio no terminan antes de empezar',
	`SELECT COUNT(*) FROM service_activities
	 WHERE date_start IS NOT NULL AND date_end IS NOT NULL AND date_end < date_start`
);

await expectZero(
	'toda asistencia entra en el índice transversal',
	`SELECT ABS(
	   (SELECT COUNT(*) FROM event_attendance)
	   - (SELECT COUNT(*) FROM entry_source WHERE entity_type = 'event_attendance')
	 )`
);

// ── Enlaces y documentos (decisiones 22 y Fase 5D) ───────────────────────────

await expectZero('trabajos técnicos con proyecto existente',
  `SELECT COUNT(*) FROM technical_works t WHERE t.project_id IS NOT NULL
   AND NOT EXISTS(SELECT 1 FROM projects p WHERE p.id=t.project_id)`);
await expectZero('contexto técnico vinculado sin duplicación manual',
  `SELECT COUNT(*) FROM technical_works WHERE project_id IS NOT NULL AND
   (context_name IS NOT NULL OR context_code IS NOT NULL OR context_programme IS NOT NULL
    OR context_funding_body IS NOT NULL OR context_institution IS NOT NULL OR context_responsibles IS NOT NULL)`);
await expectZero('categorías de equipo específicas de Generación de Conocimiento',
  `SELECT COUNT(*) FROM projects WHERE role IN ('research_team_member','working_team_member')
   AND COALESCE(programme_code,'')<>'generation_knowledge'`);
await expectZero('alias de convocatoria compatible con la web anterior',
  `SELECT COUNT(*) FROM projects WHERE project_type IS NOT programme_code`);
await expectZero('selecciones de CV sin referencias huérfanas',
  `SELECT COUNT(*) FROM cv_block_entries c WHERE NOT EXISTS(SELECT 1 FROM entry_source e
   WHERE e.entity_type=c.entity_type AND e.entity_id=c.entity_id)`);
await expectZero('periodos técnicos coherentes',
  `SELECT COUNT(*) FROM technical_works WHERE date_start IS NOT NULL AND date_end IS NOT NULL AND date_end<date_start`);

await expectZero(
	'como máximo un enlace destacado por entrada',
	`SELECT COUNT(*) FROM (
	   SELECT entity_type, entity_id FROM links WHERE is_primary = 1
	   GROUP BY entity_type, entity_id HAVING COUNT(*) > 1)`
);

await expectZero(
	'URLs de enlace únicas por entrada',
	`SELECT COUNT(*) FROM (
	   SELECT entity_type, entity_id, url FROM links
	   GROUP BY entity_type, entity_id, url HAVING COUNT(*) > 1)`
);

await expectZero(
	'ningún certificado es público',
	`SELECT COUNT(*) FROM documents
	 WHERE document_type = 'doc_certificate' AND is_public = 1`
);

await expectZero(
	'los documentos de asistencia son privados',
	`SELECT COUNT(*) FROM documents
	 WHERE entity_type = 'event_attendance' AND is_public = 1`
);

await expectZero(
	'documents con propietario completo',
	`SELECT COUNT(*) FROM documents
	 WHERE entity_type IS NULL OR entity_id IS NULL`
);

console.log(`\n${pass}/${pass + fail} comprobaciones correctas${fail ? ` — ${fail} FALLOS` : ''}`);
process.exit(fail ? 1 : 0);
