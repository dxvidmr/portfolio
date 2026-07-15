-- 005: roles como vocabulario controlado (extensión de la decisión 16).
-- Solo donde hay datos y semántica clara: projects.role (dominio project_role)
-- y service_activities.role (dominio service_role). academic_events.role (vacío)
-- y memberships.role (valor descriptivo largo) permanecen como texto libre.
-- Los valores de service_activities eran texto libre en español: se convierten
-- a códigos ANTES de reconstruir con FK. projects ya usaba códigos.
-- Rollback: restaurar el respaldo previo (backups/).

PRAGMA foreign_keys=OFF;

BEGIN;

DROP VIEW entries;
DROP VIEW entry_source;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('principal_investigator', 'project_role', 'Investigador principal',        'Principal investigator',   10),
  ('team_member',            'project_role', 'Miembro del equipo',            'Team member',              20),
  ('collaborator',           'project_role', 'Colaborador',                   'Collaborator',             30),
  ('organizing_committee',   'service_role', 'Comité organizador',            'Organising committee',     10),
  ('technical_committee',    'service_role', 'Comité técnico',                'Technical committee',      20),
  ('seminar_codirector',     'service_role', 'Codirector del seminario',      'Seminar co-director',      30),
  ('editor',                 'service_role', 'Editor',                        'Editor',                   40),
  ('contributions_reviewer', 'service_role', 'Evaluador de contribuciones',   'Contributions reviewer',   50),
  ('open_peer_review',       'service_role', 'Revisión por pares abiertos',   'Open peer review',         60);

-- Conversión de los valores libres auditados el 2026-07-15 a códigos.
UPDATE service_activities SET role = 'organizing_committee'   WHERE role = 'Comité organizador';
UPDATE service_activities SET role = 'technical_committee'    WHERE role = 'Comité técnico';
UPDATE service_activities SET role = 'seminar_codirector'     WHERE role = 'Codirector del seminario';
UPDATE service_activities SET role = 'editor'                 WHERE role = 'Editor';
UPDATE service_activities SET role = 'contributions_reviewer' WHERE role = 'Evaluador de contribuciones';
UPDATE service_activities SET role = 'open_peer_review'       WHERE role = 'Revisión por pares abiertos';

-- ── projects: role pasa a FK ──────────────────────────────────────────────────
CREATE TABLE projects_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  acronym TEXT,
  project_code TEXT,
  project_type TEXT REFERENCES type_vocab(code),
  role TEXT REFERENCES type_vocab(code),
  institution TEXT,
  research_group TEXT,
  funding_body TEXT,
  principal_investigators_text TEXT,
  date_start TEXT,
  date_end TEXT,
  amount REAL,
  currency TEXT,
  description_short_es TEXT,
  description_short_en TEXT,
  slug TEXT UNIQUE,
  url TEXT,
  public INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  show_home INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);
INSERT INTO projects_new
  (id, title, acronym, project_code, project_type, role, institution, research_group,
   funding_body, principal_investigators_text, date_start, date_end, amount, currency,
   description_short_es, description_short_en, slug, url, public, featured, show_home, sort_order)
SELECT
   id, title, acronym, project_code, project_type, role, institution, research_group,
   funding_body, principal_investigators_text, date_start, date_end, amount, currency,
   description_short_es, description_short_en, slug, url, public, featured, show_home, sort_order
FROM projects;
DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

-- ── service_activities: role pasa a FK ────────────────────────────────────────
CREATE TABLE service_activities_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT NOT NULL,
  role TEXT REFERENCES type_vocab(code),
  venue_or_journal TEXT,
  related_entity TEXT,
  city TEXT,
  country TEXT,
  date_start TEXT,
  date_end TEXT,
  year INTEGER,
  description TEXT,
  url TEXT
);
INSERT INTO service_activities_new
  (id, activity_type, title, role, venue_or_journal, related_entity, city, country,
   date_start, date_end, year, description, url)
SELECT
   id, activity_type, title, role, venue_or_journal, related_entity, city, country,
   date_start, date_end, year, description, url
FROM service_activities;
DROP TABLE service_activities;
ALTER TABLE service_activities_new RENAME TO service_activities;

-- ── vistas (idénticas a 002/004) ──────────────────────────────────────────────
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

PRAGMA foreign_keys=ON;
