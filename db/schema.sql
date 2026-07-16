-- Portfolio académico bilingüe — fotografía del esquema tras la migración 013.
-- Codificación: UTF-8.
--
-- Turso es la fuente de verdad. Este archivo describe la estructura final para
-- pruebas y bases nuevas; las bases existentes deben avanzar con las migraciones.
-- Los códigos y traducciones de type_vocab son datos editoriales y se cargan
-- mediante las migraciones/fixtures, no se duplican en esta fotografía.

CREATE TABLE type_vocab (
  code TEXT PRIMARY KEY,
  domain TEXT NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_type_vocab_domain
  ON type_vocab(domain, sort_order);

CREATE TABLE entry_controls (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
  show_home INTEGER NOT NULL DEFAULT 0 CHECK (show_home IN (0, 1)),
  home_order INTEGER NOT NULL DEFAULT 0,
  featured_cv INTEGER NOT NULL DEFAULT 0 CHECK (featured_cv IN (0, 1)),
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

CREATE TABLE education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  degree_title TEXT NOT NULL,
  institution TEXT NOT NULL,
  department TEXT,
  country TEXT,
  thesis_directors_text TEXT,
  date_start TEXT,
  date_end TEXT,
  url TEXT,
  notes_private TEXT
);

CREATE TABLE research_stays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  institution TEXT NOT NULL,
  faculty_or_dept TEXT,
  supervisor TEXT,
  city TEXT,
  country TEXT,
  date_start TEXT,
  date_end TEXT,
  funding_text TEXT,
  url TEXT,
  notes_private TEXT
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  program_context TEXT,
  date_start TEXT,
  date_end TEXT,
  hours INTEGER,
  url TEXT,
  notes_private TEXT
);

CREATE TABLE projects (
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
  url TEXT
);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date_start TEXT,
  date_end TEXT,
  year INTEGER,
  institution TEXT,
  city TEXT,
  country TEXT,
  modality TEXT,
  url TEXT,
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_date
  ON events(year DESC, date_start DESC, title);

CREATE TABLE talks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  contribution_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT NOT NULL,
  role TEXT,
  date_start TEXT,
  date_end TEXT,
  doi TEXT,
  project_id INTEGER REFERENCES projects(id),
  url TEXT,
  canonical_event_id INTEGER NOT NULL REFERENCES events(id)
);

CREATE INDEX idx_talks_date ON talks(date_start);
CREATE INDEX idx_talks_project ON talks(project_id);
CREATE INDEX idx_talks_canonical ON talks(canonical_event_id);

CREATE TABLE publications (
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
  event_id INTEGER REFERENCES talks(id),
  url TEXT
);

CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_project ON publications(project_id);
CREATE INDEX idx_publications_event ON publications(event_id);

CREATE TABLE academic_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  work_type TEXT NOT NULL REFERENCES type_vocab(code),
  institution TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  url TEXT,
  education_id INTEGER REFERENCES education(id)
);

CREATE INDEX idx_academic_works_education
  ON academic_works(education_id);

CREATE TABLE teaching (
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

CREATE TABLE service_activities (
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
  description TEXT,
  url TEXT,
  canonical_event_id INTEGER REFERENCES events(id)
);

CREATE INDEX idx_service_activities_date
  ON service_activities(date_start);

CREATE INDEX idx_service_activities_canonical
  ON service_activities(canonical_event_id);

CREATE TABLE funding_awards (
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

CREATE TABLE memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  role TEXT,
  date_start TEXT,
  date_end TEXT,
  notes_private TEXT
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  items_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL,
  level TEXT,
  is_native INTEGER DEFAULT 0
);

CREATE TABLE event_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL DEFAULT 'attendee' CHECK (role_type = 'attendee'),
  role_label TEXT NOT NULL DEFAULT 'Oyente/asistente',
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id)
);

CREATE INDEX idx_event_attendance_event
  ON event_attendance(event_id);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL
);

CREATE TABLE entity_tags (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL REFERENCES tags(id),
  PRIMARY KEY (entity_type, entity_id, tag_id)
);

CREATE INDEX idx_entity_tags_entity
  ON entity_tags(entity_type, entity_id);

CREATE TABLE portfolio_items (
  portfolio_slug TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  PRIMARY KEY (portfolio_slug, entity_type, entity_id)
);

CREATE INDEX idx_portfolio_items_slug
  ON portfolio_items(portfolio_slug, sort_order);

CREATE TABLE funding_relations (
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

CREATE INDEX idx_funding_relations_entity
  ON funding_relations(entity_type, entity_id);

CREATE TABLE links (
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

CREATE INDEX idx_links_entity
  ON links(entity_type, entity_id, sort_order, id);

CREATE UNIQUE INDEX idx_links_entity_url
  ON links(entity_type, entity_id, url);

CREATE UNIQUE INDEX idx_links_one_primary
  ON links(entity_type, entity_id)
  WHERE is_primary = 1;

CREATE TABLE documents (
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
SELECT 'talks', talk.id, talk.title,
       COALESCE(
         talk.date_start,
         (SELECT event.date_start FROM events AS event WHERE event.id = talk.canonical_event_id),
         CAST((SELECT event.year FROM events AS event WHERE event.id = talk.canonical_event_id) AS TEXT)
       )
FROM talks AS talk
UNION ALL
SELECT 'teaching', id, title, COALESCE(date_start, academic_year) FROM teaching
UNION ALL
SELECT 'service_activities', service.id, service.title,
       COALESCE(
         service.date_start,
         (SELECT event.date_start FROM events AS event WHERE event.id = service.canonical_event_id),
         CAST((SELECT event.year FROM events AS event WHERE event.id = service.canonical_event_id) AS TEXT)
       )
FROM service_activities AS service
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
