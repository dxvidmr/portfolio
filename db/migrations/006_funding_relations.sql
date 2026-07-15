-- 006: relaciones muchos-a-muchos entre financiación/premios y entradas del CV.
-- `entry_controls` actúa como registro transversal y permite una FK compuesta
-- real para el extremo polimórfico de la relación.

BEGIN;

CREATE TABLE funding_relations (
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
    'projects', 'education', 'research_stays', 'courses', 'publications',
    'academic_works', 'academic_events', 'teaching', 'service_activities'
  ))
);

CREATE INDEX idx_funding_relations_entity
  ON funding_relations(entity_type, entity_id);

COMMIT;
