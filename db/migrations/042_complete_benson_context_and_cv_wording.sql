-- Completa el contexto confirmado sin registrar la beca como mérito personal. UTF-8.
BEGIN;
UPDATE technical_works SET context_programme='Beca Benson'
WHERE id=7 AND context_programme IS NULL AND notes_private LIKE 'Contexto: beca Benson concedida a Francisco Mamani Fuentes.%';
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now')
WHERE id=1 AND EXISTS(SELECT 1 FROM cv_blocks WHERE cv_id=1
  AND body LIKE '%y colaboró en su marcado textual y ha presentado%');
UPDATE cv_blocks SET body=replace(body,
  'y colaboró en su marcado textual y ha presentado',
  'y colaboró en su marcado textual. También ha presentado')
WHERE cv_id=1 AND title='Experiencia y aportación al proyecto';
COMMIT;
