ALTER TABLE cv_blocks ADD COLUMN skills_display TEXT NOT NULL DEFAULT 'names' CHECK(skills_display IN ('names','descriptions'));
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now') WHERE id IN (SELECT DISTINCT cv_id FROM cv_blocks b JOIN cv_block_entries e ON e.block_id=b.id WHERE e.entity_type='skills');
