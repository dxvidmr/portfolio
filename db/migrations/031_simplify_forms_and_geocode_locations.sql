-- 031: elimina duplicidades confirmadas y prepara localizaciones para mapas.
-- La fecha inicial del evento es canónica y admite precisión parcial:
-- AAAA, AAAA-MM o AAAA-MM-DD.

PRAGMA foreign_keys=OFF;

BEGIN;

DROP VIEW entries;
DROP VIEW entry_source;

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
  url TEXT
);

INSERT INTO projects_new (
  id, title, acronym, project_code, project_type, role, institution,
  research_group, funding_body, principal_investigators_text, date_start,
  date_end, amount, currency, description_short_es, description_short_en, url
)
SELECT
  id, title, acronym, project_code, project_type, role, institution,
  research_group, funding_body, principal_investigators_text, date_start,
  date_end, amount, currency, description_short_es, description_short_en, url
FROM projects;

DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

CREATE TABLE funding_awards_new (
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

INSERT INTO funding_awards_new (
  id, title, award_type, awarding_body, amount, currency, year,
  related_context, url, notes_private
)
SELECT
  id, title, award_type, awarding_body, amount, currency, year,
  related_context, url, notes_private
FROM funding_awards;

DROP TABLE funding_awards;
ALTER TABLE funding_awards_new RENAME TO funding_awards;

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
  modality TEXT,
  url TEXT,
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO events_new (
  id, title, date_start, date_end, institution, city, country,
  modality, url, notes_private, created_at, updated_at
)
SELECT
  id, title, COALESCE(date_start, CAST(year AS TEXT)), date_end, institution,
  city, country, modality, url, notes_private, created_at, updated_at
FROM events;

DROP TABLE events;
ALTER TABLE events_new RENAME TO events;

CREATE INDEX idx_events_date
  ON events(date_start DESC, title);

ALTER TABLE research_stays ADD COLUMN country_code TEXT;
ALTER TABLE research_stays ADD COLUMN geoname_id INTEGER;
ALTER TABLE research_stays ADD COLUMN latitude REAL;
ALTER TABLE research_stays ADD COLUMN longitude REAL;

ALTER TABLE service_activities ADD COLUMN country_code TEXT;
ALTER TABLE service_activities ADD COLUMN geoname_id INTEGER;
ALTER TABLE service_activities ADD COLUMN latitude REAL;
ALTER TABLE service_activities ADD COLUMN longitude REAL;

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
