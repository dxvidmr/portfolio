-- Independent header fields and precise project participation categories.
BEGIN;
ALTER TABLE cv_profiles ADD COLUMN position TEXT NOT NULL DEFAULT '';
ALTER TABLE cv_profiles ADD COLUMN email TEXT NOT NULL DEFAULT '';
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
  ('working_team_member','project_role','Miembro del equipo de trabajo','Working team member',21),
  ('researcher','project_role','Investigador','Researcher',25);
-- Corrections confirmed by the researcher; external collaborations keep their role.
UPDATE projects SET role='working_team_member' WHERE role='team_member'
  AND project_code IN ('PID2024-155584NB-I00','PID2021-124737NB-I00','PID2024-161619NA-I00');
UPDATE projects SET role='researcher' WHERE role='team_member'
  AND institution='Universidad Internacional de La Rioja'
  AND title IN ('e-DrAMAS: Difusión de Humanidades Digitales y dramaturgas españolas e hispanoamericanas en niveles preuniversitarios','HDATEATROUNIR','HDATEATROUNIR (continuación)');
UPDATE cv_profiles SET position='Investigador predoctoral FI–Joan Oró',email='david.merino@uab.cat',
  version=version+1,updated_at=datetime('now') WHERE id=1 AND name='ARCHives/ARCHiving';
UPDATE cv_blocks SET title='Congresos y seminarios' WHERE cv_id=1
  AND title='Contribuciones seleccionadas: fuentes, archivos y métodos digitales';
COMMIT;
