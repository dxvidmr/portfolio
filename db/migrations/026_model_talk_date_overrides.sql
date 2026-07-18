BEGIN;

-- Un solo día se expresa solo con el inicio; nunca se repite como final.
UPDATE talks
SET date_end = NULL
WHERE date_start IS NOT NULL AND date_end = date_start;

ALTER TABLE talks RENAME COLUMN date_start TO date_override;
ALTER TABLE talks RENAME COLUMN date_end TO date_end_override;

DROP INDEX IF EXISTS idx_talks_date;
CREATE INDEX idx_talks_date_override ON talks(date_override);

CREATE TRIGGER talks_date_override_insert_check
BEFORE INSERT ON talks
WHEN NEW.date_end_override IS NOT NULL
 AND (NEW.date_override IS NULL OR NEW.date_end_override <= NEW.date_override)
BEGIN
  SELECT RAISE(ABORT, 'talk date end must be later than its start');
END;

CREATE TRIGGER talks_date_override_update_check
BEFORE UPDATE OF date_override, date_end_override ON talks
WHEN NEW.date_end_override IS NOT NULL
 AND (NEW.date_override IS NULL OR NEW.date_end_override <= NEW.date_override)
BEGIN
  SELECT RAISE(ABORT, 'talk date end must be later than its start');
END;

COMMIT;
