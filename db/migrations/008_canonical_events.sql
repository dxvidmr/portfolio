-- 008: identidad canónica de eventos y registro privado de asistencia.
-- Las contribuciones y actividades de servicio conservan sus tablas y apuntan
-- al evento común. `event_attendance` nunca forma parte de `entry_source` ni de
-- ninguna consulta pública.

BEGIN;

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

CREATE TABLE event_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL DEFAULT 'attendee'
    CHECK (role_type = 'attendee'),
  role_label TEXT NOT NULL DEFAULT 'Oyente/asistente',
  notes_private TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (event_id)
);

CREATE INDEX idx_event_attendance_event
  ON event_attendance(event_id);

ALTER TABLE academic_events
  ADD COLUMN canonical_event_id INTEGER REFERENCES events(id);

ALTER TABLE service_activities
  ADD COLUMN canonical_event_id INTEGER REFERENCES events(id);

-- Las 21 contribuciones actuales pertenecen a 21 eventos distintos. Mantener
-- sus IDs en el backfill facilita una correspondencia auditable, sin imponer
-- esa igualdad a las altas futuras.
INSERT INTO events (
  id, title, date_start, date_end, year, institution, city, country,
  modality, url
)
SELECT
  id, event_title, date_start, date_end, year, institution, city, country,
  modality, url
FROM academic_events
ORDER BY id;

UPDATE academic_events SET canonical_event_id = id;

-- Eventos presentes únicamente en actividades de organización/evaluación.
INSERT INTO events (id, title, date_start, date_end, year, institution, city, country, url)
SELECT 22, title, date_start, date_end, year, venue_or_journal, city, country, url
FROM service_activities WHERE id = 1;

INSERT INTO events (id, title, date_start, date_end, year, institution, city, country, url)
SELECT 23, title, date_start, date_end, year, venue_or_journal, city, country, url
FROM service_activities WHERE id = 8;

INSERT INTO events (id, title, date_start, date_end, year, institution, city, country, url)
SELECT 24, title, date_start, date_end, year, venue_or_journal, city, country, url
FROM service_activities WHERE id = 9;

INSERT INTO events (id, title, date_start, date_end, year, institution, city, country, url)
SELECT 25, title, date_start, date_end, year, venue_or_journal, city, country, url
FROM service_activities WHERE id = 10;

INSERT INTO events (id, title, date_start, date_end, year, institution, city, country, url)
SELECT 26, title, date_start, date_end, year, venue_or_journal, city, country, url
FROM service_activities WHERE id = 12;

UPDATE service_activities
SET canonical_event_id = CASE id
  WHEN 1 THEN 22
  WHEN 2 THEN 7
  WHEN 3 THEN 13
  WHEN 4 THEN 14
  WHEN 5 THEN 18
  WHEN 8 THEN 23
  WHEN 9 THEN 24
  WHEN 10 THEN 25
  WHEN 11 THEN 15
  WHEN 12 THEN 26
END
WHERE id IN (1, 2, 3, 4, 5, 8, 9, 10, 11, 12);

-- Completar metadatos canónicos vacíos con la actividad de servicio asociada.
UPDATE events
SET
  date_start = COALESCE(date_start, (
    SELECT date_start FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  date_end = COALESCE(date_end, (
    SELECT date_end FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  year = COALESCE(year, (
    SELECT year FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  institution = COALESCE(institution, (
    SELECT venue_or_journal FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  city = COALESCE(city, (
    SELECT city FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  country = COALESCE(country, (
    SELECT country FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  )),
  url = COALESCE(url, (
    SELECT url FROM service_activities WHERE canonical_event_id = events.id LIMIT 1
  ))
WHERE EXISTS (
  SELECT 1 FROM service_activities WHERE canonical_event_id = events.id
);

CREATE INDEX idx_academic_events_canonical
  ON academic_events(canonical_event_id);

CREATE INDEX idx_service_activities_canonical
  ON service_activities(canonical_event_id);

COMMIT;
