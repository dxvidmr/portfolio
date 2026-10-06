-- Correcciones y aportaciones confirmadas por el titular del CV. UTF-8.
-- Los IDs de origen se conservan al trasladar los registros; los exports no se tocan.
BEGIN;
INSERT INTO technical_works(id,title,work_type,modality,responsibility,contribution_es,date_start,date_end,
  recipient,context_name,context_funding_body,context_institution,context_responsibles,url,notes_private)
SELECT id,title,
  CASE id WHEN 7 THEN 'technical_web' ELSE 'technical_data' END,
  'technical_collaboration',
  CASE id WHEN 7 THEN 'Desarrollo web y colaboración en el marcado textual' ELSE 'Preparación de archivos para entrenamiento de modelos' END,
  CASE id WHEN 7 THEN 'Desarrollo de la web de la edición digital de La carpintería de armar en Fray Andrés de San Miguel y colaboración en el marcado textual. La creación de imágenes fue realizada por otros colaboradores.' ELSE description_short_es END,
  date_start,date_end,
  CASE id WHEN 7 THEN 'Francisco Mamani Fuentes' ELSE 'ETSO' END,
  title,funding_body,institution,principal_investigators_text,url,
  CASE id WHEN 7 THEN 'Contexto: beca Benson concedida a Francisco Mamani Fuentes. El importe de financiación del proyecto de origen registrado era ' || amount || ' ' || currency || '; no es una ayuda ni una retribución personal del desarrollador.' ELSE NULL END
FROM projects WHERE id IN (7,8) AND programme_code='external';

INSERT INTO entry_controls
SELECT 'technical_works',entity_id,is_public,show_home,home_order,featured_cv,cv_order,created_at,updated_at
FROM entry_controls WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now')
WHERE id IN (SELECT b.cv_id FROM cv_blocks b JOIN cv_block_entries e ON e.block_id=b.id
  WHERE e.entity_type='projects' AND e.entity_id IN (SELECT id FROM technical_works));
UPDATE cv_block_entries SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE portfolio_items SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE entity_tags SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE documents SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE links SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
UPDATE funding_relations SET entity_type='technical_works'
WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
DELETE FROM entry_controls WHERE entity_type='projects' AND entity_id IN (SELECT id FROM technical_works);
DELETE FROM projects WHERE id IN (SELECT id FROM technical_works);
DELETE FROM type_vocab WHERE code='external' AND NOT EXISTS(SELECT 1 FROM projects WHERE programme_code='external');
DELETE FROM type_vocab WHERE code='team_member' AND NOT EXISTS(SELECT 1 FROM projects WHERE role='team_member');

INSERT INTO technical_works(id,title,work_type,modality,responsibility,contribution_es,contribution_en,date_start,recipient,context_name,url)
SELECT 9,title_es,'technical_web','professional_commission','Desarrollo web y cambio de infraestructura',
  summary_es,summary_en,'2026','ETSO','Estilometría Aplicada al Teatro del Siglo de Oro (ETSO)','https://etso.es/'
FROM portfolio_projects WHERE slug='etso-plataforma-web';
INSERT INTO technical_works(id,title,work_type,modality,responsibility,contribution_es,contribution_en,date_start,project_id)
SELECT 10,title_es,'technical_web','technical_collaboration','Desarrollo de base de datos y herramientas de análisis',
  summary_es,summary_en,'2025',3 FROM portfolio_projects
WHERE slug='versologia-metadrama' AND EXISTS(SELECT 1 FROM projects WHERE id=3 AND acronym='METADRAMA');
INSERT INTO entry_controls(entity_type,entity_id,is_public)
SELECT 'technical_works',9,CASE publication_status WHEN 'published' THEN 1 ELSE 0 END FROM portfolio_projects
WHERE slug='etso-plataforma-web' AND EXISTS(SELECT 1 FROM technical_works WHERE id=9);
INSERT INTO entry_controls(entity_type,entity_id,is_public)
SELECT 'technical_works',10,0 WHERE EXISTS(SELECT 1 FROM technical_works WHERE id=10);
INSERT INTO portfolio_items(portfolio_slug,entity_type,entity_id,sort_order,featured)
SELECT 'etso-plataforma-web','technical_works',9,0,1 WHERE EXISTS(SELECT 1 FROM technical_works WHERE id=9);
INSERT INTO portfolio_items(portfolio_slug,entity_type,entity_id,sort_order,featured)
SELECT 'versologia-metadrama','technical_works',10,0,1 WHERE EXISTS(SELECT 1 FROM technical_works WHERE id=10);
UPDATE projects SET contribution_es='Desarrollo de Versología: base de datos y herramientas digitales para describir, visualizar y comparar la organización métrica del teatro en verso.'
WHERE id=3 AND acronym='METADRAMA' AND contribution_es IS NULL;

-- La entrega ARCHives/ARCHiving distingue pertenencia académica y experiencia técnica.
-- Desplaza apartados sin colisionar con UNIQUE(cv_id,sort_order).
UPDATE cv_blocks SET sort_order=sort_order+1000 WHERE cv_id=1 AND sort_order>=3
  AND EXISTS(SELECT 1 FROM cv_profiles WHERE id=1 AND name='ARCHives/ARCHiving');
UPDATE cv_blocks SET sort_order=sort_order-999 WHERE cv_id=1 AND sort_order>=1003
  AND EXISTS(SELECT 1 FROM cv_profiles WHERE id=1 AND name='ARCHives/ARCHiving');
INSERT INTO cv_blocks(cv_id,kind,title,body,sort_order)
SELECT 1,'entries','Experiencia técnica y profesional','',3
WHERE EXISTS(SELECT 1 FROM cv_profiles WHERE id=1 AND name='ARCHives/ARCHiving');
UPDATE cv_block_entries SET block_id=(SELECT id FROM cv_blocks WHERE cv_id=1 AND title='Experiencia técnica y profesional')
WHERE entity_type='technical_works' AND block_id IN(SELECT id FROM cv_blocks WHERE cv_id=1 AND title='Proyectos de investigación')
  AND EXISTS(SELECT 1 FROM cv_profiles WHERE id=1 AND name='ARCHives/ARCHiving');
INSERT INTO cv_block_entries(block_id,entity_type,entity_id,sort_order)
SELECT b.id,'technical_works',t.id,CASE t.id WHEN 9 THEN 8 ELSE 9 END
FROM cv_blocks b JOIN technical_works t ON t.id IN (9,10)
WHERE b.cv_id=1 AND b.title='Experiencia técnica y profesional';
UPDATE cv_blocks SET body=replace(body,
  'Participa en el proyecto de edición digital de La carpintería de armar en Fray Andrés de San Miguel',
  'Desarrolló la web de la edición digital de La carpintería de armar en Fray Andrés de San Miguel y colaboró en su marcado textual')
WHERE cv_id=1 AND title='Experiencia y aportación al proyecto';
COMMIT;
