-- 033: separa el rol controlado en asociaciones de sus responsabilidades
-- y mandatos descriptivos. Depende de 032.

PRAGMA foreign_keys=OFF;

BEGIN;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('membership_member', 'membership_role', 'Miembro', 'Member', 10),
  ('membership_board_member', 'membership_role', 'Vocal de la Junta Directiva', 'Board member', 20);

DROP VIEW entries;
DROP VIEW entry_source;

CREATE TABLE memberships_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization TEXT NOT NULL,
  role TEXT NOT NULL REFERENCES type_vocab(code),
  role_details TEXT,
  date_start TEXT,
  date_end TEXT,
  notes_private TEXT
);

INSERT INTO memberships_new (
  id, organization, role, role_details, date_start, date_end, notes_private
)
SELECT
  id,
  organization,
  CASE
    WHEN role LIKE 'Vocal en la Junta Directiva%' THEN 'membership_board_member'
    ELSE 'membership_member'
  END,
  CASE
    WHEN role LIKE 'Vocal en la Junta Directiva,%'
      THEN UPPER(SUBSTR(TRIM(SUBSTR(role, LENGTH('Vocal en la Junta Directiva,') + 1)), 1, 1))
        || SUBSTR(TRIM(SUBSTR(role, LENGTH('Vocal en la Junta Directiva,') + 1)), 2)
    WHEN role IS NOT NULL AND role <> 'Miembro'
      THEN role
    ELSE NULL
  END,
  date_start,
  date_end,
  notes_private
FROM memberships;

DROP TABLE memberships;
ALTER TABLE memberships_new RENAME TO memberships;

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
