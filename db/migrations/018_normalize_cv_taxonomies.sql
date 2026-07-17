-- 018: normaliza las taxonomías del CV.
--
-- Decisiones editoriales:
-- - tipo y rol de servicio no duplican la misma responsabilidad;
-- - una publicación editada es una publicación, no un servicio duplicado;
-- - las contribuciones separan formato, vía de acceso y sesión de panel.
-- Las vías históricas no documentadas quedan NULL para completarlas en el
-- dashboard: no se infieren convocatorias ni invitaciones.

PRAGMA foreign_keys=OFF;

BEGIN;

DROP VIEW entries;
DROP VIEW entry_source;

-- Nuevos códigos controlados. Los códigos son globales en type_vocab.
INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('publication_edited_volume', 'publication_type', 'Libro editado o coeditado', 'Edited or co-edited book', 60),
  ('publication_author', 'publication_role', 'Autor', 'Author', 10),
  ('publication_editor', 'publication_role', 'Editor', 'Editor', 20),
  ('publication_coeditor', 'publication_role', 'Coeditor', 'Co-editor', 30),
  ('publication_translator', 'publication_role', 'Traductor', 'Translator', 40),
  ('contribution_communication', 'contribution_type', 'Comunicación', 'Conference presentation', 10),
  ('contribution_lecture', 'contribution_type', 'Ponencia', 'Invited lecture', 20),
  ('contribution_poster', 'contribution_type', 'Póster', 'Poster', 30),
  ('contribution_project_presentation', 'contribution_type', 'Presentación de proyecto', 'Project presentation', 40),
  ('contribution_roundtable', 'contribution_type', 'Intervención en mesa de discusión', 'Roundtable discussion', 50),
  ('selection_invited', 'contribution_selection', 'Invitación', 'Invitation', 10),
  ('selection_cfp', 'contribution_selection', 'Convocatoria abierta (CfP)', 'Open call (CfP)', 20),
  ('session_panel', 'session_format', 'Panel', 'Panel session', 10);

-- Ajustes de precisión en etiquetas ya existentes.
UPDATE type_vocab SET label_es = 'Proyecto competitivo de I+D+i nacional', label_en = 'National competitive R&D project'
 WHERE code = 'national_rd';
UPDATE type_vocab SET label_es = 'Proyecto de transferencia de conocimiento', label_en = 'Knowledge transfer project'
 WHERE code = 'transfer';
UPDATE type_vocab SET label_es = 'Proyecto institucional de investigación', label_en = 'Institutional research project'
 WHERE code = 'internal';
UPDATE type_vocab SET label_es = 'Colaboración de investigación externa', label_en = 'External research collaboration'
 WHERE code = 'external';
UPDATE type_vocab SET label_es = 'Colaborador externo', label_en = 'External collaborator'
 WHERE code = 'collaborator';
UPDATE type_vocab SET label_es = 'Contrato predoctoral', label_en = 'Predoctoral contract', sort_order = 10
 WHERE code = 'predoctoral_contract';
UPDATE type_vocab SET label_es = 'Beca o ayuda', label_en = 'Scholarship or grant'
 WHERE code = 'scholarship';
UPDATE type_vocab SET label_es = 'Asignatura universitaria', label_en = 'University course'
 WHERE code = 'degree_course';
UPDATE type_vocab SET label_es = 'Taller formativo', label_en = 'Training workshop'
 WHERE code = 'workshop';
UPDATE type_vocab SET label_es = 'Evaluación de edición crítica', label_en = 'Critical edition assessment'
 WHERE code = 'critical_edition_review';
UPDATE type_vocab SET label_es = 'Evaluación de propuestas de congreso', label_en = 'Conference submission review'
 WHERE code = 'conference_review';
UPDATE type_vocab SET label_es = 'Resumen publicado de congreso', label_en = 'Published conference abstract'
 WHERE code = 'conference_abstract';
UPDATE type_vocab SET label_es = 'Reseña de libro', label_en = 'Book review'
 WHERE code = 'book_review';

-- Una publicación puede ser obra editada sin inventar un autor. La responsabilidad
-- propia declara el papel de David, mientras que autores y editores describen la
-- responsabilidad bibliográfica completa de la obra.
CREATE TABLE publications_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  publication_type TEXT NOT NULL REFERENCES type_vocab(code),
  authors_text TEXT,
  editors_text TEXT,
  my_role TEXT REFERENCES type_vocab(code),
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

INSERT INTO publications_new (
  id, title, publication_type, authors_text, editors_text, my_role,
  journal_title, book_title, publisher, year, volume, issue, pages, doi, isbn,
  issn, abstract, bibtex_override, project_id, event_id, url
)
SELECT
  id, title, publication_type, authors_text, editors_text, 'publication_author',
  journal_title, book_title, publisher, year, volume, issue, pages, doi, isbn,
  issn, abstract, bibtex_override, project_id, event_id, url
FROM publications;

DROP TABLE publications;
ALTER TABLE publications_new RENAME TO publications;
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_project ON publications(project_id);
CREATE INDEX idx_publications_event ON publications(event_id);

-- Contribuciones: el formato, la vía de acceso y la sesión no son sinónimos.
ALTER TABLE talks ADD COLUMN selection_mode TEXT REFERENCES type_vocab(code);
ALTER TABLE talks ADD COLUMN session_format TEXT REFERENCES type_vocab(code);
ALTER TABLE talks ADD COLUMN session_title TEXT;

UPDATE talks SET contribution_type = 'contribution_communication'
 WHERE contribution_type = 'conference_paper';
UPDATE talks SET contribution_type = 'contribution_lecture', selection_mode = 'selection_invited'
 WHERE contribution_type = 'invited_lecture';
UPDATE talks SET contribution_type = 'contribution_poster'
 WHERE contribution_type = 'poster';
UPDATE talks SET contribution_type = 'contribution_project_presentation'
 WHERE contribution_type = 'showcase';
UPDATE talks SET contribution_type = 'contribution_roundtable', selection_mode = 'selection_invited'
 WHERE contribution_type = 'invited_panel' AND id = 11;
UPDATE talks SET contribution_type = 'contribution_communication', session_format = 'session_panel'
 WHERE contribution_type = 'panel' AND id = 18;
UPDATE talks SET contribution_type = 'contribution_lecture', selection_mode = 'selection_invited'
 WHERE contribution_type = 'seminar' AND id IN (5, 9);
UPDATE talks SET contribution_type = 'contribution_communication', selection_mode = 'selection_invited'
 WHERE contribution_type = 'seminar' AND id = 13;

DELETE FROM type_vocab
 WHERE code IN ('conference_paper', 'invited_lecture', 'poster', 'panel', 'invited_panel', 'seminar', 'showcase');

-- En servicio, el rol solo se conserva cuando distingue una responsabilidad de
-- organización. Revisión y edición son la actividad, no un segundo tipo de la
-- misma información.
UPDATE service_activities
SET role = NULL
WHERE role IN ('contributions_reviewer', 'editor', 'open_peer_review');

DELETE FROM type_vocab
 WHERE code IN ('contributions_reviewer', 'editor', 'open_peer_review');

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

COMMIT;

PRAGMA foreign_keys=ON;
