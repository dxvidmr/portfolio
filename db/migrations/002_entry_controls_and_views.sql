-- 002: controles editoriales + índice transversal automático (plan §5-6).
-- Paso B: entry_controls con backfill desde entries.
-- Paso C: vista fuente entry_source (mapa validado contra datos reales el 2026-07-15, 0 discrepancias).
-- Paso D: entries pasa a ser vista compatible; la tabla manual queda como entries_legacy.
-- Rollback: DROP VIEW entries; ALTER TABLE entries_legacy RENAME TO entries; (entry_controls puede quedarse).

BEGIN;

CREATE TABLE entry_controls (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0
    CHECK (is_public IN (0, 1)),
  show_home INTEGER NOT NULL DEFAULT 0
    CHECK (show_home IN (0, 1)),
  home_order INTEGER NOT NULL DEFAULT 0,
  featured_cv INTEGER NOT NULL DEFAULT 0
    CHECK (featured_cv IN (0, 1)),
  cv_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (entity_type, entity_id),
  CHECK (show_home = 0 OR is_public = 1),
  CHECK (featured_cv = 0 OR is_public = 1)
);

CREATE INDEX idx_entry_controls_home
  ON entry_controls(is_public, show_home, home_order);

CREATE INDEX idx_entry_controls_cv
  ON entry_controls(is_public, featured_cv, cv_order);

-- Copia de los controles actuales (88 filas, todas public = 1 según auditoría Fase 0).
INSERT INTO entry_controls (entity_type, entity_id, is_public, show_home, home_order, featured_cv)
SELECT entity_type, entity_id, public, show_home, sort_order, featured
FROM entries;

-- Filas base sin entrada en el índice: públicas de facto (el CV consultaba las tablas
-- base sin filtro). Auditadas el 2026-07-15: courses #7 y academic_events #20.
-- Se escribe genérico por tipo para cubrir cualquier alta manual posterior a la auditoría.
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'projects', id, 1 FROM projects
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'projects');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'education', id, 1 FROM education
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'education');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'research_stays', id, 1 FROM research_stays
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'research_stays');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'courses', id, 1 FROM courses
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'courses');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'funding_awards', id, 1 FROM funding_awards
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'funding_awards');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'publications', id, 1 FROM publications
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'publications');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'academic_works', id, 1 FROM academic_works
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'academic_works');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'academic_events', id, 1 FROM academic_events
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'academic_events');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'teaching', id, 1 FROM teaching
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'teaching');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'service_activities', id, 1 FROM service_activities
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'service_activities');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'memberships', id, 1 FROM memberships
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'memberships');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'skills', id, 1 FROM skills
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'skills');
INSERT INTO entry_controls (entity_type, entity_id, is_public)
SELECT 'languages', id, 1 FROM languages
WHERE id NOT IN (SELECT entity_id FROM entry_controls WHERE entity_type = 'languages');

-- Normalización de home_order: reproduce el orden visual vigente auditado el 2026-07-15
-- (cinco filas empataban a 0 y desempataban por fecha; ahora el orden es explícito).
UPDATE entry_controls SET home_order = 10 WHERE entity_type = 'academic_events' AND entity_id = 2;
UPDATE entry_controls SET home_order = 20 WHERE entity_type = 'academic_events' AND entity_id = 3;
UPDATE entry_controls SET home_order = 30 WHERE entity_type = 'publications'    AND entity_id = 2;
UPDATE entry_controls SET home_order = 40 WHERE entity_type = 'teaching'        AND entity_id = 1;
UPDATE entry_controls SET home_order = 50 WHERE entity_type = 'academic_events' AND entity_id = 11;
UPDATE entry_controls SET home_order = 60 WHERE entity_type = 'research_stays'  AND entity_id = 1;
UPDATE entry_controls SET home_order = 70 WHERE entity_type = 'academic_events' AND entity_id = 1;
UPDATE entry_controls SET home_order = 80 WHERE entity_type = 'publications'    AND entity_id = 1;

-- Vista fuente: título y fecha transversales declarados una vez por tipo.
-- Formatos de sort_date presentes: YYYY-MM-DD, YYYY-MM, YYYY, YYYY-YYYY (curso académico).
-- El orden lexicográfico descendente es determinista con estos formatos (plan §5.2).
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
SELECT 'academic_events', id, title, COALESCE(date_start, CAST(year AS TEXT)) FROM academic_events
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

-- Sustitución compatible: la tabla manual queda de reserva y entries pasa a ser vista.
ALTER TABLE entries RENAME TO entries_legacy;

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

COMMIT;
