-- Portfolio académico bilingüe — esquema Turso (libSQL)
-- Aplicar con: turso db shell curriculum < db/schema.sql
--
-- Notas de diseño:
--  * Una tabla por tipo de entrada del CV (formularios 1:1 en /admin).
--  * Flags de curación (public/featured/show_home/sort_order) viven SOLO en `entries`
--    (índice transversal), salvo `projects` que los lleva propios por decisión de diseño.
--  * `documents`, `links`, `entity_tags` son asociaciones polimórficas (entity_type + entity_id),
--    sin FK real en SQLite, punto de escritura único = el autor vía dashboard.
--  * `project_id` SÍ es FK real a projects(id) donde aplica (filtrado por proyecto es requisito).
--  * Etiquetas de tipo = código estable en BD, traducción en i18n del frontend.

CREATE TABLE education (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  degree_title TEXT NOT NULL,
  institution TEXT NOT NULL,
  department TEXT,
  country TEXT,
  thesis_directors_text TEXT,
  date_start TEXT,
  date_end TEXT,
  is_ongoing INTEGER DEFAULT 0,
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

CREATE TABLE funding_awards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  award_type TEXT,
  awarding_body TEXT,
  amount REAL,
  currency TEXT,
  year INTEGER,
  related_context TEXT,
  project_id INTEGER REFERENCES projects(id),
  url TEXT,
  notes_private TEXT
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  acronym TEXT,
  project_code TEXT,
  project_type TEXT,
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

CREATE TABLE publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  publication_type TEXT NOT NULL,
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

-- Trabajos académicos (TFM/TFG): sección propia del CV, distinta de `publications`
-- porque no tienen el mismo estatus editorial (no revisados por pares como artículo/capítulo).
CREATE TABLE academic_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  work_type TEXT NOT NULL CHECK (work_type IN ('masters_thesis','bachelor_thesis')),
  institution TEXT NOT NULL,
  program TEXT,
  year INTEGER,
  url TEXT
);

CREATE TABLE academic_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_title TEXT NOT NULL,
  contribution_type TEXT NOT NULL,
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

CREATE TABLE teaching (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  teaching_type TEXT NOT NULL CHECK (teaching_type IN ('degree_course','workshop')),
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
  activity_type TEXT NOT NULL CHECK (activity_type IN
    ('event_organization','critical_edition_review','conference_review','peer_review','book_editing')),
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

CREATE TABLE memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  role TEXT,
  date_start TEXT,
  date_end TEXT,
  is_ongoing INTEGER DEFAULT 0,
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

-- Curación editorial: relaciona cualquier entrada del CV con una ficha del
-- portfolio. `portfolio_slug` corresponde al slug definido en projects.ts.
CREATE TABLE portfolio_items (
  portfolio_slug TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  PRIMARY KEY (portfolio_slug, entity_type, entity_id)
);

CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT,
  drive_file_id TEXT,
  url TEXT NOT NULL,
  is_public INTEGER DEFAULT 0,
  is_certificate INTEGER DEFAULT 0,
  issued_by TEXT,
  issued_date TEXT,
  notes_private TEXT
);

CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  link_type TEXT NOT NULL,
  label TEXT,
  url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  is_public INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE entries (
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  title_cache TEXT NOT NULL,
  sort_date TEXT,
  public INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0,
  show_home INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_project ON publications(project_id);
CREATE INDEX idx_publications_event ON publications(event_id);
CREATE INDEX idx_events_year ON academic_events(year);
CREATE INDEX idx_events_project ON academic_events(project_id);
CREATE INDEX idx_entries_flags ON entries(public, featured, show_home, sort_order);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_links_entity ON links(entity_type, entity_id);
CREATE INDEX idx_entity_tags_entity ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_portfolio_items_slug ON portfolio_items(portfolio_slug, sort_order);
