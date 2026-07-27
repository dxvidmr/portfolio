-- 030: asistencia como entrada transversal y propiedad uniforme de documentos.
-- Cada asistencia conserva su tabla y su privacidad obligatoria, pero participa
-- en entry_source/entry_controls igual que cualquier otra entrada. Los
-- certificados se identifican únicamente por document_type = 'doc_certificate'.

PRAGMA foreign_keys=OFF;

BEGIN;

INSERT INTO entry_controls (
  entity_type, entity_id, is_public, show_home, home_order,
  featured_cv, cv_order, created_at, updated_at
)
SELECT
  'event_attendance', attendance.id, 0, 0, 0, 0, 0,
  attendance.created_at, attendance.updated_at
FROM event_attendance AS attendance
WHERE true
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
  is_public = 0,
  show_home = 0,
  home_order = 0,
  featured_cv = 0,
  cv_order = 0;

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
    'publications', 'talks', 'teaching', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages', 'event_attendance'
  )),
  CHECK (document_type <> 'doc_certificate' OR is_public = 0)
);

INSERT INTO documents_new (
  id, entity_type, entity_id, document_type, title, drive_file_id, url,
  is_public, issued_by, issued_date, notes_private, sort_order,
  created_at, updated_at
)
SELECT
  id,
  CASE
    WHEN event_attendance_id IS NOT NULL THEN 'event_attendance'
    ELSE entity_type
  END,
  COALESCE(event_attendance_id, entity_id),
  CASE WHEN is_certificate = 1 THEN 'doc_certificate' ELSE document_type END,
  title,
  drive_file_id,
  url,
  CASE
    WHEN is_certificate = 1 OR document_type = 'doc_certificate' THEN 0
    ELSE is_public
  END,
  issued_by,
  issued_date,
  notes_private,
  sort_order,
  created_at,
  updated_at
FROM documents;

DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;

CREATE INDEX idx_documents_entry
  ON documents(entity_type, entity_id, sort_order, id);

CREATE UNIQUE INDEX idx_documents_entry_url
  ON documents(entity_type, entity_id, url);

DROP VIEW entries;
DROP VIEW entry_source;

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
         talk.date_override,
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
SELECT 'event_attendance', attendance.id, event.title,
       COALESCE(event.date_start, CAST(event.year AS TEXT))
FROM event_attendance AS attendance
JOIN events AS event ON event.id = attendance.event_id
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

COMMIT;

PRAGMA foreign_keys=ON;
