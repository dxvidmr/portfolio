-- CV variants are private editorial documents, independent of web visibility.
BEGIN;
CREATE TABLE cv_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Currículum investigador',
  person_name TEXT NOT NULL DEFAULT 'David Merino Recalde',
  contact TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'es' CHECK(language IN ('es','en')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE cv_blocks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cv_id INTEGER NOT NULL REFERENCES cv_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('text','entries')),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL,
  UNIQUE(cv_id,sort_order)
);
CREATE TABLE cv_block_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  block_id INTEGER NOT NULL REFERENCES cv_blocks(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK(entity_type IN (
    'projects','publications','talks','teaching','research_stays','education',
    'funding_awards','academic_works','courses','memberships','skills','languages','service_activities'
  )),
  entity_id INTEGER NOT NULL CHECK(entity_id > 0),
  commentary TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL,
  UNIQUE(block_id,sort_order),
  UNIQUE(block_id,entity_type,entity_id)
);
-- No FK to polymorphic source rows: deleted selections stay visible as warnings.
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
COMMIT;
