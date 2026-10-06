-- La versión publicada anterior todavía lee projects.project_type.
-- Alias de lectura; la convocatoria se edita únicamente en programme_code. UTF-8.
BEGIN;
ALTER TABLE projects ADD COLUMN project_type TEXT;
UPDATE projects SET project_type=programme_code;
CREATE TRIGGER projects_programme_compat_insert AFTER INSERT ON projects
WHEN NEW.project_type IS NOT NEW.programme_code
BEGIN UPDATE projects SET project_type=NEW.programme_code WHERE id=NEW.id; END;
CREATE TRIGGER projects_programme_compat_update AFTER UPDATE OF programme_code ON projects
WHEN NEW.project_type IS NOT NEW.programme_code
BEGIN UPDATE projects SET project_type=NEW.programme_code WHERE id=NEW.id; END;
COMMIT;
