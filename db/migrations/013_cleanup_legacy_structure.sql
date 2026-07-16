-- 013: limpieza de estructuras heredadas tras el periodo estable de la Fase 5G.
--
-- - elimina entries_legacy y los controles editoriales duplicados de projects;
-- - elimina is_ongoing: un date_end NULL representa un intervalo abierto;
-- - elimina la vista puente academic_events;
-- - separa las fechas propias de contribuciones y servicios de la duración del
--   evento canónico; ya no se sincronizan ni se consideran copias;
-- - retira de talks las copias de título, año, institución, lugar y modalidad;
-- - normaliza los años sueltos de talks/service_activities como date_start=YYYY.
--
-- «Noviembre HD»: el evento duró del 1 al 30 de noviembre de 2020, la
-- comunicación tuvo lugar el día 20 y el servicio abarcó el evento completo.

PRAGMA foreign_keys=OFF;

BEGIN;

DROP VIEW academic_events;
DROP VIEW entries;
DROP VIEW entry_source;
DROP TABLE entries_legacy;

-- Formación: date_end NULL expresa que continúa, sin bandera duplicada.
CREATE TABLE education_new (
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

INSERT INTO education_new (
  id, degree_title, institution, department, country, thesis_directors_text,
  date_start, date_end, url, notes_private
)
SELECT
  id, degree_title, institution, department, country, thesis_directors_text,
  date_start, date_end, url, notes_private
FROM education;

DROP TABLE education;
ALTER TABLE education_new RENAME TO education;

-- Asociaciones: misma semántica de intervalo abierto.
CREATE TABLE memberships_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  role TEXT,
  date_start TEXT,
  date_end TEXT,
  notes_private TEXT
);

INSERT INTO memberships_new (
  id, organization, role, date_start, date_end, notes_private
)
SELECT id, organization, role, date_start, date_end, notes_private
FROM memberships;

DROP TABLE memberships;
ALTER TABLE memberships_new RENAME TO memberships;

-- Proyectos: la visibilidad y la curación viven exclusivamente en
-- entry_controls; portfolio_items.featured conserva su significado contextual.
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
  slug TEXT UNIQUE,
  url TEXT
);

INSERT INTO projects_new (
  id, title, acronym, project_code, project_type, role, institution,
  research_group, funding_body, principal_investigators_text, date_start,
  date_end, amount, currency, description_short_es, description_short_en,
  slug, url
)
SELECT
  id, title, acronym, project_code, project_type, role, institution,
  research_group, funding_body, principal_investigators_text, date_start,
  date_end, amount, currency, description_short_es, description_short_en,
  slug, url
FROM projects;

DROP TABLE projects;
ALTER TABLE projects_new RENAME TO projects;

-- Contribuciones: date_start/date_end son fechas propias del rol. El título,
-- lugar, duración y URL del evento se consultan mediante canonical_event_id.
CREATE TABLE talks_new (
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

INSERT INTO talks_new (
  id, title, contribution_type, authors_text, role, date_start, date_end, doi,
  project_id, url, canonical_event_id
)
SELECT
  id, title, contribution_type, authors_text, role,
  COALESCE(date_start, CAST(year AS TEXT)), date_end, doi,
  project_id, url, canonical_event_id
FROM talks;

DROP TABLE talks;
ALTER TABLE talks_new RENAME TO talks;

CREATE INDEX idx_talks_date ON talks(date_start);
CREATE INDEX idx_talks_project ON talks(project_id);
CREATE INDEX idx_talks_canonical ON talks(canonical_event_id);

-- Servicio: las fechas pertenecen a la actividad, no son copias del evento.
-- Un año suelto se conserva en el formato parcial canónico YYYY.
CREATE TABLE service_activities_new (
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

INSERT INTO service_activities_new (
  id, activity_type, title, role, venue_or_journal, related_entity, city,
  country, date_start, date_end, description, url, canonical_event_id
)
SELECT
  id, activity_type, title, role, venue_or_journal, related_entity, city,
  country, COALESCE(date_start, CAST(year AS TEXT)), date_end, description, url,
  canonical_event_id
FROM service_activities;

DROP TABLE service_activities;
ALTER TABLE service_activities_new RENAME TO service_activities;

CREATE INDEX idx_service_activities_date ON service_activities(date_start);
CREATE INDEX idx_service_activities_canonical
  ON service_activities(canonical_event_id);

-- Corrección editorial confirmada por el autor: duración completa del evento.
UPDATE events
SET
  date_start = (SELECT date_start FROM service_activities WHERE id = 5),
  date_end = (SELECT date_end FROM service_activities WHERE id = 5),
  year = 2020,
  updated_at = datetime('now')
WHERE id = 18
  AND title = 'Noviembre HD'
  AND EXISTS (
    SELECT 1 FROM service_activities
    WHERE id = 5 AND canonical_event_id = events.id
  );

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
