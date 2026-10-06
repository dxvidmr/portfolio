-- Trabajos técnicos y profesionales, separados de la pertenencia académica.
-- UTF-8. No modifica instantáneas de CV ya exportadas.
BEGIN;
ALTER TABLE projects RENAME COLUMN project_type TO programme_code;
ALTER TABLE projects ADD COLUMN nature TEXT REFERENCES type_vocab(code);
ALTER TABLE projects ADD COLUMN contribution_es TEXT;
ALTER TABLE projects ADD COLUMN contribution_en TEXT;
UPDATE type_vocab SET domain='project_programme' WHERE domain='project_type';
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
 ('generation_knowledge','project_programme','Generación de Conocimiento','Knowledge Generation',10),
 ('unir_transfer','project_programme','UNIR — convocatoria de transferencia','UNIR — knowledge transfer call',20),
 ('unir_research','project_programme','UNIR — proyectos propios de investigación','UNIR — internal research projects',30),
 ('nature_research','project_nature','Investigación','Research',10),
 ('nature_transfer','project_nature','Transferencia de conocimiento','Knowledge transfer',20),
 ('nature_creation','project_nature','Creación','Creative practice',30),
 ('technical_web','technical_work_type','Desarrollo web y software','Web and software development',10),
 ('technical_edition','technical_work_type','Edición digital y marcado textual','Digital editing and text encoding',20),
 ('technical_data','technical_work_type','Modelado, tratamiento y curación de datos','Data modelling, processing and curation',30),
 ('technical_analysis','technical_work_type','Análisis y visualización','Analysis and visualisation',40),
 ('technical_advice','technical_work_type','Asesoramiento técnico y metodológico','Technical and methodological advice',50),
 ('technical_preservation','technical_work_type','Digitalización y preservación','Digitisation and preservation',60),
 ('professional_commission','technical_modality','Encargo profesional','Professional commission',10),
 ('technical_collaboration','technical_modality','Colaboración técnica','Technical collaboration',20),
 ('own_initiative','technical_modality','Iniciativa propia','Own initiative',30);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
 ('research_team_member','project_role','Miembro del equipo de investigación','Research team member',20);
UPDATE projects SET nature=CASE programme_code WHEN 'transfer' THEN 'nature_transfer' WHEN 'national_rd' THEN 'nature_research' WHEN 'internal' THEN 'nature_research' ELSE NULL END;
UPDATE projects SET programme_code=CASE programme_code WHEN 'national_rd' THEN 'generation_knowledge' WHEN 'transfer' THEN 'unir_transfer' WHEN 'internal' THEN 'unir_research' ELSE programme_code END;
DELETE FROM type_vocab WHERE code IN ('national_rd','transfer','internal');
UPDATE type_vocab SET label_es='Investigador participante',label_en='Participating researcher' WHERE code='researcher' AND domain='project_role';
UPDATE type_vocab SET label_es='Colaborador',label_en='Collaborator' WHERE code='collaborator' AND domain='project_role';
CREATE TABLE technical_works (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  work_type TEXT REFERENCES type_vocab(code),
  modality TEXT REFERENCES type_vocab(code),
  responsibility TEXT,
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
CREATE TABLE cv_block_entries_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id INTEGER NOT NULL REFERENCES cv_blocks(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK(entity_type IN (
    'technical_works', 'projects','publications','talks','teaching','research_stays','education',
    'funding_awards','academic_works','courses','memberships','skills','languages','service_activities'
  )),
  entity_id INTEGER NOT NULL CHECK(entity_id > 0),
  contribution_mode TEXT NOT NULL DEFAULT 'inherit' CHECK(contribution_mode IN ('inherit','custom','hidden')),
  contribution_text TEXT NOT NULL DEFAULT '',
  commentary TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL,
  UNIQUE(block_id,sort_order),
  UNIQUE(block_id,entity_type,entity_id)
);
INSERT INTO cv_block_entries_new(id,block_id,entity_type,entity_id,commentary,sort_order) SELECT id,block_id,entity_type,entity_id,commentary,sort_order FROM cv_block_entries;
DROP TABLE cv_block_entries;
ALTER TABLE cv_block_entries_new RENAME TO cv_block_entries;
CREATE INDEX idx_cv_entries_block ON cv_block_entries(block_id,sort_order);
CREATE TABLE documents_new (
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
INSERT INTO documents_new(id,entity_type,entity_id,document_type,title,drive_file_id,url,is_public,issued_by,issued_date,notes_private,sort_order,created_at,updated_at) SELECT id,entity_type,entity_id,document_type,title,drive_file_id,url,is_public,issued_by,issued_date,notes_private,sort_order,created_at,updated_at FROM documents;
DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;
CREATE INDEX idx_documents_entry
  ON documents(entity_type, entity_id, sort_order, id);
CREATE UNIQUE INDEX idx_documents_entry_url
  ON documents(entity_type, entity_id, url);
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
    'publications', 'talks', 'teaching', 'technical_works', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages'
  ))
);
INSERT INTO links_new(id,entity_type,entity_id,link_type,label_es,label_en,url,is_primary,is_public,sort_order,created_at,updated_at) SELECT id,entity_type,entity_id,link_type,label_es,label_en,url,is_primary,is_public,sort_order,created_at,updated_at FROM links;
DROP TABLE links;
ALTER TABLE links_new RENAME TO links;
CREATE INDEX idx_links_entity
  ON links(entity_type, entity_id, sort_order, id);
CREATE UNIQUE INDEX idx_links_entity_url
  ON links(entity_type, entity_id, url);
CREATE UNIQUE INDEX idx_links_one_primary
  ON links(entity_type, entity_id)
  WHERE is_primary = 1;
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
    'technical_works', 'projects', 'education', 'research_stays', 'courses', 'publications',
    'academic_works', 'talks', 'teaching', 'service_activities'
  ))
);
INSERT INTO funding_relations_new(funding_award_id,entity_type,entity_id,relation_kind,created_at) SELECT funding_award_id,entity_type,entity_id,relation_kind,created_at FROM funding_relations;
DROP TABLE funding_relations;
ALTER TABLE funding_relations_new RENAME TO funding_relations;
CREATE INDEX idx_funding_relations_entity
  ON funding_relations(entity_type, entity_id);
DROP VIEW entries;
DROP VIEW entry_source;
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
SELECT 'skills', id, category, NULL FROM skills
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
CREATE TRIGGER projects_programme_role_insert
BEFORE INSERT ON projects
WHEN NEW.role IN ('research_team_member','working_team_member') AND COALESCE(NEW.programme_code,'') <> 'generation_knowledge'
BEGIN SELECT RAISE(ABORT,'Las categorías de equipo requieren Generación de Conocimiento'); END;
CREATE TRIGGER projects_programme_role_update
BEFORE UPDATE OF role,programme_code ON projects
WHEN NEW.role IN ('research_team_member','working_team_member') AND COALESCE(NEW.programme_code,'') <> 'generation_knowledge'
BEGIN SELECT RAISE(ABORT,'Las categorías de equipo requieren Generación de Conocimiento'); END;
COMMIT;
