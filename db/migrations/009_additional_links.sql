-- 009: enlaces complementarios tipados, ordenados y con visibilidad propia.
-- El campo `url` de cada entidad sigue siendo su destino canónico; esta tabla
-- solo contiene recursos adicionales. La tabla estaba vacía antes de migrar.

PRAGMA foreign_keys=OFF;

BEGIN;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('link_full_text',  'link_type', 'Texto completo',       'Full text',       10),
  ('link_repository', 'link_type', 'Repositorio o código', 'Repository or code', 20),
  ('link_dataset',    'link_type', 'Conjunto de datos',    'Dataset',         30),
  ('link_video',      'link_type', 'Vídeo',                'Video',           40),
  ('link_slides',     'link_type', 'Diapositivas',         'Slides',          50),
  ('link_media',      'link_type', 'Prensa o difusión',    'Media coverage',  60),
  ('link_other',      'link_type', 'Otro recurso',         'Other resource',  70);

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
    'publications', 'academic_events', 'teaching', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages'
  ))
);

-- Conversión defensiva por si una copia no auditada contuviera filas antiguas.
INSERT INTO links_new (
  id, entity_type, entity_id, link_type, label_es, url,
  is_primary, is_public, sort_order
)
SELECT
  id, entity_type, entity_id,
  CASE
    WHEN link_type IN (
      'link_full_text', 'link_repository', 'link_dataset', 'link_video',
      'link_slides', 'link_media', 'link_other'
    ) THEN link_type
    ELSE 'link_other'
  END,
  label, url,
  CASE WHEN is_primary = 1 THEN 1 ELSE 0 END,
  CASE WHEN is_public = 0 THEN 0 ELSE 1 END,
  COALESCE(sort_order, 0)
FROM links;

DROP TABLE links;
ALTER TABLE links_new RENAME TO links;

CREATE INDEX idx_links_entity
  ON links(entity_type, entity_id, sort_order, id);

CREATE UNIQUE INDEX idx_links_entity_url
  ON links(entity_type, entity_id, url);

CREATE UNIQUE INDEX idx_links_one_primary
  ON links(entity_type, entity_id)
  WHERE is_primary = 1;

COMMIT;

PRAGMA foreign_keys=ON;
