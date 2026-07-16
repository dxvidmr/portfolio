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

CREATE TABLE portfolio_projects (
  slug TEXT PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  kind_es TEXT NOT NULL,
  kind_en TEXT NOT NULL,
  kicker_es TEXT NOT NULL,
  kicker_en TEXT NOT NULL,
  summary_es TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  status_es TEXT NOT NULL,
  status_en TEXT NOT NULL,
  period TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(tags_json) AND json_type(tags_json) = 'array'),
  links_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(links_json) AND json_type(links_json) = 'array'),
  show_home INTEGER NOT NULL DEFAULT 1 CHECK (show_home IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_portfolio_projects_home
  ON portfolio_projects(show_home, sort_order);

INSERT INTO portfolio_projects
  (slug, title_es, title_en, kind_es, kind_en, kicker_es, kicker_en, summary_es, summary_en, status_es, status_en, period, tags_json, links_json, show_home, sort_order)
VALUES
  ('todos-a-una', 'Todos a una', 'Todos a una', 'Tesis doctoral y proyecto digital', 'Doctoral research & digital project', 'recepción · modelado de datos · edición participativa', 'reception · data modelling · participatory edition', 'Una investigación sobre cómo Fuenteovejuna llegó a ser un clásico, desarrollada como modelo de datos, edición digital, archivo documental y plataforma de participación pública.', 'Research into how Fuenteovejuna became a classic, developed as a data model, digital edition, documentary archive, and platform for public participation.', 'Investigación doctoral en curso', 'Ongoing doctoral research', '2023—', '["historia de la recepción","XML-TEI","modelado de datos","humanidades públicas"]', '[{"label_es":"Visitar Todos a una","label_en":"Visit Todos a una","url":"https://todosauna.vercel.app/"}]', 1, 10),
  ('versologia-metadrama', 'Versología', 'Versología', 'Base de datos y herramientas de análisis', 'Database & analysis toolkit', 'METADRAMA · estilometría estrófica · modelado de datos', 'METADRAMA · stanzaic stylometry · data modelling', 'Una infraestructura editorial y analítica para describir, comparar y explorar la arquitectura métrica del teatro en verso.', 'An editorial and analytical infrastructure for describing, comparing, and exploring the metrical architecture of verse drama.', 'En desarrollo', 'In development', '2025—', '["SvelteKit","Supabase","estilometría estrófica","visualización"]', '[]', 0, 20),
  ('etso-plataforma-web', 'Nueva plataforma ETSO', 'New ETSO platform', 'Rediseño, arquitectura y desarrollo web', 'Redesign, architecture & web development', 'SvelteKit · SQLite · R2 · búsqueda textual', 'SvelteKit · SQLite · R2 · full-text search', 'Reconstrucción completa del portal de Estilometría Aplicada al Teatro del Siglo de Oro y de su sistema de actualización, búsqueda y publicación.', 'Complete rebuild of the Stylometry Applied to Spanish Golden Age Theatre portal and its update, search, and publication system.', 'Publicado', 'Published', '2026', '["SvelteKit","SQLite","Cloudflare R2","ETL"]', '[{"label_es":"Visitar ETSO","label_en":"Visit ETSO","url":"https://etso.es/"}]', 1, 30),
  ('redes-personajes-teatrales', 'Redes de personajes teatrales', 'Theatrical character networks', 'Investigación y transferencia pedagógica', 'Research & pedagogical transfer', 'TFM · redes · visualización · transferencia', 'MA thesis · networks · visualisation · knowledge transfer', 'Una línea sobre análisis de redes teatrales que reúne investigación metodológica sobre Lope, tutoriales abiertos y una aplicación pedagógica con dramaturgas de la Edad de Plata.', 'A line of work on theatrical network analysis spanning methodological research on Lope, open tutorials, and a pedagogical application with women playwrights of Spain’s Silver Age.', 'Línea desarrollada · resultados publicados', 'Developed line · published outputs', '2022—2025', '["grafos","Lope de Vega","Edad de Plata","Programming Historian","pedagogía"]', '[]', 1, 40),
  ('edicion-digital-corpus', 'Edición digital e infraestructuras textuales', 'Digital editions & textual infrastructures', 'Línea de trabajo', 'Line of work', 'XML-TEI · herramientas · corpus', 'XML-TEI · tools · corpora', 'Herramientas, ediciones y corpus para transformar documentos editoriales en textos publicables, analizables y reutilizables.', 'Tools, editions, and corpora that transform editorial documents into publishable, analysable, and reusable texts.', 'Línea activa', 'Active line of work', '2020—', '["XML-TEI","FeniX-ML","edición digital","corpus"]', '[]', 1, 50),
  ('documento-escena', 'Práctica escénica', 'Performance practice', 'Investigación y creación escénica', 'Performance research & stage creation', 'interpretación · investigación-creación · teatro clásico', 'acting · practice-based research · classical theatre', 'La escena como práctica y método de investigación: una trayectoria que reúne formación actoral, interpretación, montajes de teatro clásico y estudio de la técnica actoral del Siglo de Oro.', 'Performance as both practice and research method: a body of work bringing together actor training, performance, classical theatre productions, and the study of Golden Age acting technique.', 'Línea activa', 'Active line of work', '2018—', '["interpretación","investigación escénica","teatro clásico","METADRAMA"]', '[]', 1, 60);

CREATE TABLE portfolio_items (
  portfolio_slug TEXT NOT NULL REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
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
