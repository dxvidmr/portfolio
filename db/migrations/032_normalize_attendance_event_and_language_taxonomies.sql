-- 032: normaliza roles de asistencia, modalidades de evento e idiomas.
-- Depende de 031_simplify_forms_and_geocode_locations.sql.

PRAGMA foreign_keys=OFF;

BEGIN;

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
  ('language_c2', 'language_level', 'C2', 'C2', 60);

DROP VIEW entries;
DROP VIEW entry_source;

CREATE TABLE events_new (
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

INSERT INTO events_new (
  id, title, date_start, date_end, institution, city, country, country_code,
  geoname_id, latitude, longitude, modality, url, notes_private, created_at, updated_at
)
SELECT
  id, title, date_start, date_end, institution, city, country, country_code,
  geoname_id, latitude, longitude,
  CASE modality
    WHEN 'Presencial' THEN 'event_in_person'
    WHEN 'En línea' THEN 'event_online'
    WHEN 'Híbrida' THEN 'event_hybrid'
    ELSE modality
  END,
  url, notes_private, created_at, updated_at
FROM events;

DROP TABLE events;
ALTER TABLE events_new RENAME TO events;

CREATE INDEX idx_events_date
  ON events(date_start DESC, title);

CREATE TABLE event_attendance_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'attendance_attendee' REFERENCES type_vocab(code),
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id)
);

INSERT INTO event_attendance_new (
  id, event_id, role, notes_private, created_at, updated_at
)
SELECT
  id, event_id,
  CASE role_label
    WHEN 'Oyente' THEN 'attendance_listener'
    WHEN 'Participante' THEN 'attendance_participant'
    ELSE 'attendance_attendee'
  END,
  notes_private, created_at, updated_at
FROM event_attendance;

DROP TABLE event_attendance;
ALTER TABLE event_attendance_new RENAME TO event_attendance;

CREATE INDEX idx_event_attendance_event
  ON event_attendance(event_id);

CREATE TRIGGER event_attendance_control_cleanup
AFTER DELETE ON event_attendance
BEGIN
  DELETE FROM entry_controls
  WHERE entity_type = 'event_attendance' AND entity_id = OLD.id;
END;

CREATE TABLE languages_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL REFERENCES type_vocab(code),
  level TEXT REFERENCES type_vocab(code),
  is_native INTEGER DEFAULT 0
);

INSERT INTO languages_new (id, language, level, is_native)
SELECT
  id,
  CASE language
    WHEN 'Castellano' THEN 'language_spanish'
    WHEN 'Inglés' THEN 'language_english'
    ELSE language
  END,
  CASE level
    WHEN 'A1' THEN 'language_a1'
    WHEN 'A2' THEN 'language_a2'
    WHEN 'B1' THEN 'language_b1'
    WHEN 'B2' THEN 'language_b2'
    WHEN 'C1' THEN 'language_c1'
    WHEN 'C2' THEN 'language_c2'
    ELSE level
  END,
  is_native
FROM languages;

DROP TABLE languages;
ALTER TABLE languages_new RENAME TO languages;

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

COMMIT;

PRAGMA foreign_keys=ON;
