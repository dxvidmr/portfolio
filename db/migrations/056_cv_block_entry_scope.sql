ALTER TABLE cv_blocks ADD COLUMN entry_scope TEXT NOT NULL DEFAULT 'merits' CHECK(entry_scope IN ('merits','skills'));
UPDATE cv_blocks SET entry_scope='skills'
WHERE kind='entries'
  AND EXISTS(SELECT 1 FROM cv_block_entries e WHERE e.block_id=cv_blocks.id AND e.entity_type='skills')
  AND NOT EXISTS(SELECT 1 FROM cv_block_entries e WHERE e.block_id=cv_blocks.id AND e.entity_type<>'skills');
