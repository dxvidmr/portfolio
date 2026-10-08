-- Portfolio académico bilingüe — fotografía del esquema hasta la migración 043.
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

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO site_settings (key, value)
VALUES ('activity_order_mode', 'date');

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
  country_code TEXT,
  geoname_id INTEGER,
  latitude REAL,
  longitude REAL,
  date_start TEXT,
  date_end TEXT,
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
  programme_code TEXT REFERENCES type_vocab(code),
  project_type TEXT, -- Compatibilidad de lectura; la convocatoria se escribe en programme_code.
  nature TEXT REFERENCES type_vocab(code),
  contribution_es TEXT,
  contribution_en TEXT,
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
  url TEXT
);

CREATE TABLE technical_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  work_type TEXT REFERENCES type_vocab(code),
  modality TEXT REFERENCES type_vocab(code),
  contribution_es TEXT,
  contribution_en TEXT,
  date_start TEXT,
  date_end TEXT,
  recipient TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE RESTRICT,
  context_name TEXT,
  context_code TEXT,
  context_programme TEXT,
  context_funding_body TEXT,
  context_institution TEXT,
  context_responsibles TEXT,
  url TEXT,
  notes_private TEXT,
  CHECK (project_id IS NULL OR (
    context_name IS NULL AND context_code IS NULL AND context_programme IS NULL
    AND context_funding_body IS NULL AND context_institution IS NULL
    AND context_responsibles IS NULL
  ))
);
CREATE INDEX idx_technical_works_project ON technical_works(project_id);
CREATE TABLE technical_work_projects (
  technical_work_id INTEGER NOT NULL REFERENCES technical_works(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  PRIMARY KEY(technical_work_id,project_id)
);
CREATE INDEX idx_technical_work_projects_project ON technical_work_projects(project_id);

CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  date_start TEXT NOT NULL,
  date_end TEXT,
  institution TEXT,
  city TEXT,
  country TEXT,
  country_code TEXT,
  geoname_id INTEGER,
  latitude REAL,
  longitude REAL,
  modality TEXT REFERENCES type_vocab(code),
  url TEXT,
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_events_date
  ON events(date_start DESC, title);

CREATE TABLE talks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  contribution_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT NOT NULL,
  selection_mode TEXT REFERENCES type_vocab(code),
  session_format TEXT REFERENCES type_vocab(code),
  session_title TEXT,
  date_override TEXT,
  date_end_override TEXT,
  doi TEXT,
  project_id INTEGER REFERENCES projects(id),
  url TEXT,
  canonical_event_id INTEGER NOT NULL REFERENCES events(id),
  CHECK (date_end_override IS NULL OR (
    date_override IS NOT NULL AND date_end_override > date_override
  ))
);

CREATE INDEX idx_talks_date_override ON talks(date_override);
CREATE INDEX idx_talks_project ON talks(project_id);
CREATE INDEX idx_talks_canonical ON talks(canonical_event_id);

CREATE TABLE publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  publication_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT,
  editors_text TEXT,
  my_role TEXT REFERENCES type_vocab(code),
  container_type TEXT REFERENCES type_vocab(code),
  conference_publication_format TEXT REFERENCES type_vocab(code),
  review_status TEXT REFERENCES type_vocab(code),
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
  country_code TEXT,
  geoname_id INTEGER,
  latitude REAL,
  longitude REAL,
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
  url TEXT,
  notes_private TEXT
);

CREATE TABLE memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES type_vocab(code),
  role_details TEXT,
  date_start TEXT,
  date_end TEXT,
  notes_private TEXT
);

CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL,
  name_en TEXT,
  description_es TEXT NOT NULL,
  description_en TEXT,
  area TEXT NOT NULL REFERENCES type_vocab(code),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL REFERENCES type_vocab(code),
  level TEXT REFERENCES type_vocab(code),
  is_native INTEGER DEFAULT 0
);

CREATE TABLE event_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'attendance_attendee' REFERENCES type_vocab(code),
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id)
);

CREATE INDEX idx_event_attendance_event
  ON event_attendance(event_id);

CREATE TRIGGER event_attendance_control_private_insert
BEFORE INSERT ON entry_controls
WHEN NEW.entity_type = 'event_attendance'
 AND (
   NEW.is_public <> 0 OR NEW.show_home <> 0 OR NEW.home_order <> 0
   OR NEW.featured_cv <> 0 OR NEW.cv_order <> 0
 )
BEGIN
  SELECT RAISE(ABORT, 'event attendance must remain private');
END;

CREATE TRIGGER event_attendance_control_private_update
BEFORE UPDATE ON entry_controls
WHEN NEW.entity_type = 'event_attendance'
 AND (
   NEW.is_public <> 0 OR NEW.show_home <> 0 OR NEW.home_order <> 0
   OR NEW.featured_cv <> 0 OR NEW.cv_order <> 0
 )
BEGIN
  SELECT RAISE(ABORT, 'event attendance must remain private');
END;

CREATE TRIGGER event_attendance_control_cleanup
AFTER DELETE ON event_attendance
BEGIN
  DELETE FROM entry_controls
  WHERE entity_type = 'event_attendance' AND entity_id = OLD.id;
END;

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

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('attendance_attendee', 'attendance_role', 'Oyente/asistente', 'Attendee', 10),
  ('attendance_listener', 'attendance_role', 'Oyente', 'Auditor', 20),
  ('attendance_participant', 'attendance_role', 'Participante', 'Participant', 30),
  ('event_in_person', 'event_modality', 'Presencial', 'In person', 10),
  ('event_online', 'event_modality', 'En línea', 'Online', 20),
  ('event_hybrid', 'event_modality', 'Híbrida', 'Hybrid', 30),
  ('language_spanish', 'language', 'Castellano', 'Spanish', 10),
  ('language_english', 'language', 'Inglés', 'English', 20),
  ('language_a1', 'language_level', 'A1', 'A1', 10),
  ('language_a2', 'language_level', 'A2', 'A2', 20),
  ('language_b1', 'language_level', 'B1', 'B1', 30),
  ('language_b2', 'language_level', 'B2', 'B2', 40),
  ('language_c1', 'language_level', 'C1', 'C1', 50),
  ('language_c2', 'language_level', 'C2', 'C2', 60),
  ('membership_member', 'membership_role', 'Miembro', 'Member', 10),
  ('membership_board_member', 'membership_role', 'Vocal de la Junta Directiva', 'Board member', 20),
  ('portfolio_project', 'portfolio_kind', 'Proyecto', 'Project', 10),
  ('portfolio_line', 'portfolio_kind', 'Línea de trabajo', 'Line of work', 20),
  ('portfolio_infrastructure', 'portfolio_kind', 'Infraestructura', 'Infrastructure', 30),
  ('portfolio_research', 'portfolio_tag', 'Investigación', 'Research', 10),
  ('portfolio_digital_editing', 'portfolio_tag', 'Edición digital', 'Digital editing', 20),
  ('portfolio_data_modelling', 'portfolio_tag', 'Modelado de datos', 'Data modelling', 30),
  ('portfolio_computational_analysis', 'portfolio_tag', 'Análisis computacional', 'Computational analysis', 40),
  ('portfolio_data_visualization', 'portfolio_tag', 'Visualización de datos', 'Data visualization', 50),
  ('portfolio_web_development', 'portfolio_tag', 'Desarrollo web', 'Web development', 60),
  ('portfolio_digital_corpora', 'portfolio_tag', 'Corpus digitales', 'Digital corpora', 70),
  ('portfolio_knowledge_transfer', 'portfolio_tag', 'Transferencia', 'Knowledge transfer', 80),
  ('portfolio_teaching', 'portfolio_tag', 'Docencia', 'Teaching', 90),
  ('portfolio_performance_practice', 'portfolio_tag', 'Práctica escénica', 'Performance practice', 100);

CREATE TABLE portfolio_projects (
  slug TEXT PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  kind_code TEXT NOT NULL REFERENCES type_vocab(code),
  summary_es TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  status_es TEXT NOT NULL,
  status_en TEXT NOT NULL,
  period TEXT NOT NULL,
  links_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(links_json) AND json_type(links_json) = 'array'),
  publication_status TEXT NOT NULL DEFAULT 'published'
    CHECK (publication_status IN ('draft', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_portfolio_projects_publication
  ON portfolio_projects(publication_status, sort_order);

INSERT INTO portfolio_projects
  (slug, title_es, title_en, kind_code, summary_es, summary_en, status_es, status_en, period, links_json, publication_status, sort_order)
VALUES
  ('todos-a-una', 'Todos a una', 'Todos a una', 'portfolio_project', 'Una investigación sobre cómo <i>Fuenteovejuna</i> llegó a ser un clásico, articulada a través de un modelo de datos, una edición digital, un archivo documental y una plataforma de divulgación y participación pública.', 'Research into how <i>Fuenteovejuna</i> became a classic, articulated through a data model, a digital edition, a documentary archive, and a platform for public engagement and participation.', 'Investigación doctoral en curso', 'Ongoing doctoral research', '2023—', '[{"label_es":"Visitar Todos a una","label_en":"Visit Todos a una","url":"https://todosauna.vercel.app/"}]', 'published', 10),
  ('versologia-metadrama', 'Versología', 'Versología', 'portfolio_infrastructure', 'Desarrollo de una base de datos y herramientas digitales para describir, visualizar y comparar la organización métrica del teatro en verso y su relación con la estructura dramática.', 'Development of a database and digital tools for describing, visualising, and comparing the metrical organisation of verse drama and its relationship to dramatic structure.', 'En desarrollo', 'In development', '2025—', '[]', 'draft', 20),
  ('etso-plataforma-web', 'Nueva plataforma ETSO', 'New ETSO platform', 'portfolio_project', 'Rediseño y reconstrucción técnica del portal web y la base de datos de ETSO para facilitar la consulta, la búsqueda y la actualización del corpus más grande de teatro del Siglo de Oro.', 'Redesign and technical reconstruction of the ETSO website and database to facilitate access to, searching, and updating the largest corpus of Spanish Golden Age theatre.', 'Publicado', 'Published', '2026', '[{"label_es":"Visitar ETSO","label_en":"Visit ETSO","url":"https://etso.es/"}]', 'published', 30),
  ('redes-personajes-teatrales', 'Redes de personajes teatrales', 'Theatrical character networks', 'portfolio_line', 'Investigación, creación de recursos abiertos y aplicaciones docentes alrededor del análisis de redes sociales aplicado al teatro y sus personajes.', 'Research, open-resource development, and teaching applications of social network analysis to theatre and its characters.', 'Línea desarrollada · resultados publicados', 'Developed line · published outputs', '2022—2025', '[]', 'published', 40),
  ('edicion-digital-corpus', 'Edición digital e infraestructuras textuales', 'Digital editions & textual infrastructures', 'portfolio_line', 'Desarrollo de herramientas, ediciones y corpus que conectan la edición filológica con la publicación web sostenible, el análisis computacional y la reutilización de textos y datos.', 'Development of tools, editions, and corpora connecting scholarly editing with sustainable web publishing, computational analysis, and the reuse of texts and data.', 'Línea activa', 'Active line of work', '2020—', '[]', 'published', 50),
  ('documento-escena', 'Práctica escénica', 'Performance practice', 'portfolio_line', 'Interpretación y creación escénica desde la <i>practice-based research</i> —investigación basada en la práctica—, con especial atención al teatro clásico.', '<i>Practice-based research</i> through acting and stage creation, with particular attention to classical theatre.', 'Línea activa', 'Active line of work', '2018—', '[]', 'published', 60);

CREATE TABLE portfolio_project_tags (
  portfolio_slug TEXT NOT NULL REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
  tag_code TEXT NOT NULL REFERENCES type_vocab(code),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (portfolio_slug, tag_code)
);

CREATE INDEX idx_portfolio_project_tags_slug
  ON portfolio_project_tags(portfolio_slug, sort_order);

INSERT INTO portfolio_project_tags (portfolio_slug, tag_code, sort_order) VALUES
  ('todos-a-una', 'portfolio_research', 10),
  ('todos-a-una', 'portfolio_digital_editing', 20),
  ('todos-a-una', 'portfolio_data_modelling', 30),
  ('todos-a-una', 'portfolio_knowledge_transfer', 40),
  ('documento-escena', 'portfolio_research', 10),
  ('documento-escena', 'portfolio_performance_practice', 20),
  ('versologia-metadrama', 'portfolio_research', 10),
  ('versologia-metadrama', 'portfolio_data_modelling', 20),
  ('versologia-metadrama', 'portfolio_computational_analysis', 30),
  ('versologia-metadrama', 'portfolio_data_visualization', 40),
  ('versologia-metadrama', 'portfolio_web_development', 50),
  ('etso-plataforma-web', 'portfolio_web_development', 10),
  ('etso-plataforma-web', 'portfolio_digital_corpora', 20),
  ('redes-personajes-teatrales', 'portfolio_research', 10),
  ('redes-personajes-teatrales', 'portfolio_computational_analysis', 20),
  ('redes-personajes-teatrales', 'portfolio_data_visualization', 30),
  ('redes-personajes-teatrales', 'portfolio_knowledge_transfer', 40),
  ('redes-personajes-teatrales', 'portfolio_teaching', 50),
  ('edicion-digital-corpus', 'portfolio_digital_editing', 10),
  ('edicion-digital-corpus', 'portfolio_web_development', 20),
  ('edicion-digital-corpus', 'portfolio_digital_corpora', 30);

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
    'technical_works', 'projects', 'education', 'research_stays', 'courses', 'publications',
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
    'publications', 'talks', 'teaching', 'technical_works', 'projects', 'education',
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
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  document_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT,
  drive_file_id TEXT,
  url TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
  issued_by TEXT,
  issued_date TEXT,
  notes_private TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entity_type, entity_id)
    REFERENCES entry_controls(entity_type, entity_id) ON DELETE CASCADE,
  CHECK (entity_type IN (
    'publications', 'talks', 'teaching', 'technical_works', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages', 'event_attendance'
  )),
  CHECK (document_type <> 'doc_certificate' OR is_public = 0)
);

CREATE INDEX idx_documents_entry
  ON documents(entity_type, entity_id, sort_order, id);

CREATE UNIQUE INDEX idx_documents_entry_url
  ON documents(entity_type, entity_id, url);

CREATE VIEW entry_source AS
SELECT 'projects' AS entity_type, id AS entity_id, title, date_start AS sort_date FROM projects
UNION ALL
SELECT 'technical_works', id, title, date_start FROM technical_works
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
         talk.date_override,
         (SELECT event.date_start FROM events AS event WHERE event.id = talk.canonical_event_id)
       )
FROM talks AS talk
UNION ALL
SELECT 'teaching', id, title, COALESCE(date_start, academic_year) FROM teaching
UNION ALL
SELECT 'service_activities', service.id, service.title,
       COALESCE(
         service.date_start,
         (SELECT event.date_start FROM events AS event WHERE event.id = service.canonical_event_id)
       )
FROM service_activities AS service
UNION ALL
SELECT 'event_attendance', attendance.id, event.title, event.date_start
FROM event_attendance AS attendance
JOIN events AS event ON event.id = attendance.event_id
UNION ALL
SELECT 'memberships', id, organization, date_start FROM memberships
UNION ALL
SELECT 'skills', id, name_es, NULL FROM skills
UNION ALL
SELECT 'languages', language_entry.id,
       COALESCE(language_vocab.label_es, language_entry.language), NULL
FROM languages AS language_entry
LEFT JOIN type_vocab AS language_vocab
  ON language_vocab.code = language_entry.language
 AND language_vocab.domain = 'language';

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

-- Modelo editorial 040–042: reglas de participación y CV privados.
CREATE TRIGGER projects_programme_compat_insert AFTER INSERT ON projects
WHEN NEW.project_type IS NOT NEW.programme_code
BEGIN UPDATE projects SET project_type=NEW.programme_code WHERE id=NEW.id; END;
CREATE TRIGGER projects_programme_compat_update AFTER UPDATE OF programme_code ON projects
WHEN NEW.project_type IS NOT NEW.programme_code
BEGIN UPDATE projects SET project_type=NEW.programme_code WHERE id=NEW.id; END;
CREATE TRIGGER projects_programme_role_insert BEFORE INSERT ON projects
WHEN NEW.role IN ('research_team_member','working_team_member')
  AND COALESCE(NEW.programme_code,'') <> 'generation_knowledge'
BEGIN SELECT RAISE(ABORT,'Las categorías de equipo requieren Generación de Conocimiento'); END;
CREATE TRIGGER projects_programme_role_update BEFORE UPDATE OF role,programme_code ON projects
WHEN NEW.role IN ('research_team_member','working_team_member')
  AND COALESCE(NEW.programme_code,'') <> 'generation_knowledge'
BEGIN SELECT RAISE(ABORT,'Las categorías de equipo requieren Generación de Conocimiento'); END;

CREATE TABLE cv_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Currículum investigador',
  person_name TEXT NOT NULL DEFAULT 'David Merino Recalde',
  affiliation TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'es' CHECK(language IN ('es','en')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  position TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT ''
);
CREATE TABLE cv_blocks (
  skills_display TEXT NOT NULL DEFAULT 'names' CHECK(skills_display IN ('names','descriptions')),
  entry_scope TEXT NOT NULL DEFAULT 'merits' CHECK(entry_scope IN ('merits','skills')),
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cv_id INTEGER NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('text','entries')),
  title TEXT NOT NULL DEFAULT '', body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL, UNIQUE(cv_id,sort_order)
);
CREATE TABLE cv_block_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id INTEGER NOT NULL REFERENCES cv_blocks(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK(entity_type IN (
    'technical_works','projects','publications','talks','teaching','research_stays','education',
    'funding_awards','academic_works','courses','memberships','skills','languages','service_activities'
  )),
  entity_id INTEGER NOT NULL CHECK(entity_id > 0),
  contribution_mode TEXT NOT NULL DEFAULT 'inherit' CHECK(contribution_mode IN ('inherit','custom','hidden')),
  contribution_text TEXT NOT NULL DEFAULT '', skill_options TEXT NOT NULL DEFAULT '{"resources":[],"evidence":[]}' CHECK(json_valid(skill_options)), commentary TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL, UNIQUE(block_id,sort_order), UNIQUE(block_id,entity_type,entity_id)
);
CREATE TABLE cv_exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cv_id INTEGER NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
  profile_version INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cv_blocks_cv ON cv_blocks(cv_id,sort_order);
CREATE INDEX idx_cv_entries_block ON cv_block_entries(block_id,sort_order);
CREATE INDEX idx_cv_exports_cv ON cv_exports(cv_id,id DESC);

CREATE TABLE skill_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL UNIQUE,
  name_en TEXT,
  nature TEXT NOT NULL CHECK(nature IN ('method','standard','language','tool','platform'))
);
CREATE TABLE skill_resource_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES skill_resources(id) ON DELETE CASCADE,
  PRIMARY KEY(skill_id,resource_id)
);
CREATE TABLE skill_evidence_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  PRIMARY KEY(skill_id,entity_type,entity_id),
  FOREIGN KEY(entity_type,entity_id) REFERENCES entry_controls(entity_type,entity_id) ON DELETE CASCADE,
  CHECK(entity_type IN ('technical_works','publications','talks','teaching','courses','projects','academic_works'))
);
CREATE TABLE skill_portfolio_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  portfolio_slug TEXT NOT NULL REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
  PRIMARY KEY(skill_id,portfolio_slug)
);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_text','skill_area','Edición digital y tratamiento textual','Digital editing and text processing',10);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_data','skill_area','Modelado y gestión de información','Data modelling and management',20);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_development','skill_area','Desarrollo y mantenimiento de recursos digitales','Digital resource development and maintenance',30);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_analysis','skill_area','Análisis y visualización','Analysis and visualization',40);
