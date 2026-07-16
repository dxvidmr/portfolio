-- 012: renombra `academic_events` a `talks` (decisión 24). El nombre antiguo
-- convivía mal con la entidad canónica `events`; `talks` es el genérico
-- académico para comunicaciones/ponencias. La tabla conserva por ahora las
-- columnas-copia del evento (se retirarán en la limpieza de Fase 6).
--
-- ATENCIÓN AL DESPLIEGUE: esta migración NO es compatible con el código
-- desplegado anterior. Aplicarla inmediatamente antes del deploy del código
-- renombrado. La vista puente `academic_events` (solo lectura) hace que el
-- código antiguo degrade a secciones vacías en vez de fallar con 500 durante
-- la ventana; se eliminará en la limpieza posterior junto a `entries_legacy`.

PRAGMA foreign_keys=OFF;

BEGIN;

-- 1. Vistas fuera: se recrean al final con el tipo nuevo.
DROP VIEW entries;
DROP VIEW entry_source;

-- 2. Renombrado de la tabla base. ALTER ... RENAME reescribe las FK entrantes
--    (publications.event_id) hacia el nombre nuevo; se verifica en el ensayo.
ALTER TABLE academic_events RENAME TO talks;

-- Índices con nombre heredado que además se confundían con la tabla `events`.
DROP INDEX idx_events_year;
DROP INDEX idx_events_project;
CREATE INDEX idx_talks_year ON talks(year);
CREATE INDEX idx_talks_project ON talks(project_id);

-- 3. entity_type en datos (tablas sin CHECK de allowlist).
--    `entries_legacy` queda congelada como instantánea histórica (se retira
--    en la migración 003 pendiente).
UPDATE entry_controls SET entity_type = 'talks' WHERE entity_type = 'academic_events';
UPDATE portfolio_items SET entity_type = 'talks' WHERE entity_type = 'academic_events';
UPDATE entity_tags SET entity_type = 'talks' WHERE entity_type = 'academic_events';

-- 4. Tablas con CHECK de allowlist: SQLite no permite editar un CHECK, así
--    que se reconstruyen. `funding_relations` conserva sus filas; `links` y
--    `documents` tenían 0 filas al redactar esto (la copia es defensiva).

CREATE TABLE funding_relations_new (
  funding_award_id INTEGER NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  relation_kind TEXT NOT NULL DEFAULT 'supports'
    CHECK (relation_kind IN ('supports', 'recognizes', 'related')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (funding_award_id, entity_type, entity_id),
  FOREIGN KEY (funding_award_id)
    REFERENCES funding_awards(id) ON DELETE CASCADE,
  FOREIGN KEY (entity_type, entity_id)
    REFERENCES entry_controls(entity_type, entity_id) ON DELETE CASCADE,
  CHECK (entity_type IN (
    'projects', 'education', 'research_stays', 'courses', 'publications',
    'academic_works', 'talks', 'teaching', 'service_activities'
  ))
);

INSERT INTO funding_relations_new
SELECT funding_award_id,
       CASE WHEN entity_type = 'academic_events' THEN 'talks' ELSE entity_type END,
       entity_id, relation_kind, created_at
FROM funding_relations;

DROP TABLE funding_relations;
ALTER TABLE funding_relations_new RENAME TO funding_relations;

CREATE INDEX idx_funding_relations_entity
  ON funding_relations(entity_type, entity_id);

CREATE TABLE links_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  link_type TEXT NOT NULL REFERENCES type_vocab(code),
  label_es TEXT,
  label_en TEXT,
  url TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  is_public INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entity_type, entity_id)
    REFERENCES entry_controls(entity_type, entity_id) ON DELETE CASCADE,
  CHECK (entity_type IN (
    'publications', 'talks', 'teaching', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages'
  ))
);

INSERT INTO links_new
SELECT id,
       CASE WHEN entity_type = 'academic_events' THEN 'talks' ELSE entity_type END,
       entity_id, link_type, label_es, label_en, url, is_primary, is_public,
       sort_order, created_at, updated_at
FROM links;

DROP TABLE links;
ALTER TABLE links_new RENAME TO links;

CREATE INDEX idx_links_entity
  ON links(entity_type, entity_id, sort_order, id);

CREATE UNIQUE INDEX idx_links_entity_url
  ON links(entity_type, entity_id, url);

CREATE UNIQUE INDEX idx_links_one_primary
  ON links(entity_type, entity_id)
  WHERE is_primary = 1;

CREATE TABLE documents_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT,
  entity_id INTEGER,
  event_attendance_id INTEGER,
  document_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT,
  drive_file_id TEXT,
  url TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
  is_certificate INTEGER NOT NULL DEFAULT 0 CHECK (is_certificate IN (0, 1)),
  issued_by TEXT,
  issued_date TEXT,
  notes_private TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entity_type, entity_id)
    REFERENCES entry_controls(entity_type, entity_id) ON DELETE CASCADE,
  FOREIGN KEY (event_attendance_id)
    REFERENCES event_attendance(id) ON DELETE CASCADE,
  CHECK (
    (entity_type IS NOT NULL AND entity_id IS NOT NULL AND event_attendance_id IS NULL)
    OR
    (entity_type IS NULL AND entity_id IS NULL AND event_attendance_id IS NOT NULL)
  ),
  CHECK (entity_type IS NULL OR entity_type IN (
    'publications', 'talks', 'teaching', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages'
  )),
  CHECK (NOT (is_certificate = 1 AND is_public = 1)),
  CHECK (event_attendance_id IS NULL OR (is_certificate = 1 AND is_public = 0))
);

INSERT INTO documents_new
SELECT id,
       CASE WHEN entity_type = 'academic_events' THEN 'talks' ELSE entity_type END,
       entity_id, event_attendance_id, document_type, title, drive_file_id,
       url, is_public, is_certificate, issued_by, issued_date, notes_private,
       sort_order, created_at, updated_at
FROM documents;

DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;

CREATE INDEX idx_documents_entry
  ON documents(entity_type, entity_id, sort_order, id)
  WHERE entity_type IS NOT NULL;

CREATE INDEX idx_documents_attendance
  ON documents(event_attendance_id, sort_order, id)
  WHERE event_attendance_id IS NOT NULL;

CREATE UNIQUE INDEX idx_documents_entry_url
  ON documents(entity_type, entity_id, url)
  WHERE entity_type IS NOT NULL;

CREATE UNIQUE INDEX idx_documents_attendance_url
  ON documents(event_attendance_id, url)
  WHERE event_attendance_id IS NOT NULL;

-- 5. Vistas recreadas con el tipo nuevo (misma interfaz que en la 002/004).
CREATE VIEW entry_source AS
SELECT 'projects' AS entity_type, id AS entity_id, title, date_start AS sort_date FROM projects
UNION ALL
SELECT 'education', id, degree_title, COALESCE(date_end, date_start) FROM education
UNION ALL
SELECT 'research_stays', id, institution, date_start FROM research_stays
UNION ALL
SELECT 'courses', id, title, date_start FROM courses
UNION ALL
SELECT 'funding_awards', id, title, CAST(year AS TEXT) FROM funding_awards
UNION ALL
SELECT 'publications', id, title, CAST(year AS TEXT) FROM publications
UNION ALL
SELECT 'academic_works', id, title, CAST(year AS TEXT) FROM academic_works
UNION ALL
SELECT 'talks', id, title, COALESCE(date_start, CAST(year AS TEXT)) FROM talks
UNION ALL
SELECT 'teaching', id, title, COALESCE(date_start, academic_year) FROM teaching
UNION ALL
SELECT 'service_activities', id, title, COALESCE(date_start, CAST(year AS TEXT)) FROM service_activities
UNION ALL
SELECT 'memberships', id, organization, date_start FROM memberships
UNION ALL
SELECT 'skills', id, category, NULL FROM skills
UNION ALL
SELECT 'languages', id, language, NULL FROM languages;

CREATE VIEW entries AS
SELECT
  source.entity_type,
  source.entity_id,
  source.title AS title_cache,
  source.sort_date,
  COALESCE(control.is_public, 0) AS public,
  COALESCE(control.featured_cv, 0) AS featured,
  COALESCE(control.show_home, 0) AS show_home,
  COALESCE(control.home_order, 0) AS sort_order,
  control.updated_at
FROM entry_source AS source
LEFT JOIN entry_controls AS control
  ON control.entity_type = source.entity_type
 AND control.entity_id = source.entity_id;

-- 6. Vista puente temporal para la ventana de despliegue: el código antiguo
--    que consulta `academic_events` no revienta (aunque sus JOIN con `entries`
--    por entity_type = 'academic_events' devuelvan vacío). Solo lectura; las
--    escrituras del dashboard antiguo fallarían durante la ventana, asumido.
CREATE VIEW academic_events AS SELECT * FROM talks;

COMMIT;

PRAGMA foreign_keys=ON;
