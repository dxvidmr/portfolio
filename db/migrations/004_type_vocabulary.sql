-- 004: vocabulario controlado de tipos (plan §5.5, decisión 16).
-- Los campos *_type dejan de ser TEXT libre: FK contra type_vocab, con las
-- traducciones es/en en BD. Los CHECK de tipos quedan sustituidos por la FK.
-- SQLite no permite añadir FK con ALTER TABLE: se reconstruyen las 7 tablas.
-- Las vistas se sueltan al inicio y se recrean al final (el RENAME con vistas
-- colgantes falla al reanalizarlas).
-- Rollback: restaurar el respaldo previo (backups/) — la reconstrucción no es
-- reversible por sentencias sueltas.

PRAGMA foreign_keys=OFF;

BEGIN;

DROP VIEW entries;
DROP VIEW entry_source;

CREATE TABLE type_vocab (
  code TEXT PRIMARY KEY,
  domain TEXT NOT NULL,          -- 'publication_type', 'contribution_type', ...
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_type_vocab_domain ON type_vocab(domain, sort_order);

-- Semilla: entitySubtypeLabels de labels.ts + los tres award_type sin
-- traducción previa (redactadas nuevas: revisables desde /admin/taxonomias).
INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('national_rd',             'project_type',      'Proyecto I+D+i nacional',      'National R&D project',       10),
  ('transfer',                'project_type',      'Proyecto de transferencia',    'Knowledge transfer project', 20),
  ('internal',                'project_type',      'Proyecto de investigación',    'Research project',           30),
  ('external',                'project_type',      'Colaboración externa',         'External collaboration',     40),
  ('journal_article',         'publication_type',  'Artículo en revista',          'Journal article',            10),
  ('book_chapter',            'publication_type',  'Capítulo de libro',            'Book chapter',               20),
  ('conference_proceedings',  'publication_type',  'Contribución en actas',        'Conference proceedings',     30),
  ('conference_abstract',     'publication_type',  'Resumen de congreso',          'Conference abstract',        40),
  ('book_review',             'publication_type',  'Reseña',                       'Book review',                50),
  ('masters_thesis',          'work_type',         'Trabajo de Fin de Máster',     'Master''s thesis',           10),
  ('bachelor_thesis',         'work_type',         'Trabajo de Fin de Grado',      'Bachelor''s thesis',         20),
  ('conference_paper',        'contribution_type', 'Comunicación',                 'Conference paper',           10),
  ('invited_lecture',         'contribution_type', 'Conferencia invitada',         'Invited lecture',            20),
  ('poster',                  'contribution_type', 'Póster',                       'Poster',                     30),
  ('panel',                   'contribution_type', 'Panel o mesa',                 'Panel',                      40),
  ('seminar',                 'contribution_type', 'Seminario',                    'Seminar',                    50),
  ('showcase',                'contribution_type', 'Presentación de proyecto',     'Project showcase',           60),
  ('degree_course',           'teaching_type',     'Docencia universitaria',       'University teaching',        10),
  ('workshop',                'teaching_type',     'Taller',                       'Workshop',                   20),
  ('event_organization',      'activity_type',     'Organización de evento',       'Event organisation',         10),
  ('critical_edition_review', 'activity_type',     'Revisión de edición crítica',  'Critical edition review',    20),
  ('conference_review',       'activity_type',     'Evaluación de congreso',       'Conference review',          30),
  ('peer_review',             'activity_type',     'Revisión por pares',           'Peer review',                40),
  ('book_editing',            'activity_type',     'Edición de libro',             'Book editing',               50),
  ('predoctoral_contract',    'award_type',        'Contrato predoctoral',         'Predoctoral contract',       10),
  ('scholarship',             'award_type',        'Beca',                         'Scholarship',                20),
  ('prize',                   'award_type',        'Premio',                       'Award',                      30);

-- ── publications ──────────────────────────────────────────────────────────────
CREATE TABLE publications_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  publication_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT NOT NULL,
  editors_text TEXT,
  journal_title TEXT,
  book_title TEXT,
  publisher TEXT,
  year INTEGER,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  isbn TEXT,
  issn TEXT,
  abstract TEXT,
  bibtex_override TEXT,
  project_id INTEGER REFERENCES projects(id),
  event_id INTEGER REFERENCES academic_events(id),
  url TEXT
);
INSERT INTO publications_new
  (id, title, publication_type, authors_text, editors_text, journal_title, book_title,
   publisher, year, volume, issue, pages, doi, isbn, issn, abstract, bibtex_override,
   project_id, event_id, url)
SELECT
   id, title, publication_type, authors_text, editors_text, journal_title, book_title,
   publisher, year, volume, issue, pages, doi, isbn, issn, abstract, bibtex_override,
   project_id, event_id, url
FROM publications;
DROP TABLE publications;
ALTER TABLE publications_new RENAME TO publications;
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_project ON publications(project_id);
CREATE INDEX idx_publications_event ON publications(event_id);

-- ── academic_events ───────────────────────────────────────────────────────────
CREATE TABLE academic_events_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_title TEXT NOT NULL,
  contribution_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT NOT NULL,
  role TEXT,
  date_start TEXT,
  date_end TEXT,
  year INTEGER,
  institution TEXT,
  city TEXT,
  country TEXT,
  modality TEXT,
  doi TEXT,
  project_id INTEGER REFERENCES projects(id),
  url TEXT
);
INSERT INTO academic_events_new
  (id, title, event_title, contribution_type, authors_text, role, date_start, date_end,
   year, institution, city, country, modality, doi, project_id, url)
SELECT
   id, title, event_title, contribution_type, authors_text, role, date_start, date_end,
   year, institution, city, country, modality, doi, project_id, url
FROM academic_events;
DROP TABLE academic_events;
ALTER TABLE academic_events_new RENAME TO academic_events;
CREATE INDEX idx_events_year ON academic_events(year);
CREATE INDEX idx_events_project ON academic_events(project_id);

-- ── academic_works (pierde su CHECK: lo sustituye la FK) ─────────────────────
CREATE TABLE academic_works_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  work_type TEXT NOT NULL REFERENCES type_vocab(code),
  institution TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  url TEXT
);
INSERT INTO academic_works_new (id, title, work_type, institution, program, year, url)
SELECT id, title, work_type, institution, program, year, url FROM academic_works;
DROP TABLE academic_works;
ALTER TABLE academic_works_new RENAME TO academic_works;

-- ── teaching (pierde su CHECK) ────────────────────────────────────────────────
CREATE TABLE teaching_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teaching_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  course_code TEXT,
  degree_program TEXT,
  ects REAL,
  academic_year TEXT,
  hours INTEGER,
  project_id INTEGER REFERENCES projects(id),
  description TEXT,
  date_start TEXT,
  date_end TEXT,
  url TEXT
);
INSERT INTO teaching_new
  (id, teaching_type, title, institution, course_code, degree_program, ects,
   academic_year, hours, project_id, description, date_start, date_end, url)
SELECT
   id, teaching_type, title, institution, course_code, degree_program, ects,
   academic_year, hours, project_id, description, date_start, date_end, url
FROM teaching;
DROP TABLE teaching;
ALTER TABLE teaching_new RENAME TO teaching;

-- ── service_activities (pierde su CHECK) ──────────────────────────────────────
CREATE TABLE service_activities_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT NOT NULL,
  role TEXT,
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

-- ── funding_awards (award_type anulable: la FK admite NULL) ───────────────────
CREATE TABLE funding_awards_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  award_type TEXT REFERENCES type_vocab(code),
  awarding_body TEXT,
  amount REAL,
  currency TEXT,
  year INTEGER,
  related_context TEXT,
  project_id INTEGER REFERENCES projects(id),
  url TEXT,
  notes_private TEXT
);
INSERT INTO funding_awards_new
  (id, title, award_type, awarding_body, amount, currency, year, related_context,
   project_id, url, notes_private)
SELECT
   id, title, award_type, awarding_body, amount, currency, year, related_context,
   project_id, url, notes_private
FROM funding_awards;
DROP TABLE funding_awards;
ALTER TABLE funding_awards_new RENAME TO funding_awards;

-- ── projects (project_type anulable; conserva sus controles duplicados hasta
--    la Fase 6, ver plan §18) ───────────────────────────────────────────────────
CREATE TABLE projects_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  acronym TEXT,
  project_code TEXT,
  project_type TEXT REFERENCES type_vocab(code),
  role TEXT,
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

-- ── vistas (idénticas a la migración 002) ─────────────────────────────────────
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
