-- Inicio y continuidad confirmados por David el 2026-10-05.
-- Funciones de feniX-ML: DigitalEditionsStory.svelte, portfolio editorial.
CREATE TABLE technical_work_projects (
 technical_work_id INTEGER NOT NULL REFERENCES technical_works(id) ON DELETE CASCADE,
 project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
 PRIMARY KEY(technical_work_id,project_id)
);
CREATE INDEX idx_technical_work_projects_project ON technical_work_projects(project_id);
INSERT INTO technical_work_projects SELECT id,project_id FROM technical_works WHERE project_id IS NOT NULL;
-- project_id se mantiene como referencia de compatibilidad para lectores anteriores.
INSERT INTO technical_works(id,title,work_type,modality,contribution_es,contribution_en,date_start,recipient,project_id,url,notes_private) VALUES
 (11,'Creación de feniX-ML: conversión de ediciones DOCX a XML-TEI','technical_web','technical_project_work',
 'Creación y desarrollo de una aplicación de escritorio para convertir ediciones críticas preparadas en DOCX a XML-TEI. Integra texto, notas, aparato crítico y metadatos, con validación, generación del teiHeader y revisión del resultado en HTML. Trabajo iniciado en febrero de 2025 en PROLOPE I y continuado en PROLOPE II.',
 'Creation and development of a desktop application for converting critical editions prepared in DOCX to XML-TEI. It integrates text, notes, critical apparatus and metadata, with validation, teiHeader generation and HTML preview. Work began in February 2025 within PROLOPE I and continues within PROLOPE II.',
 '2025-02','Grupo PROLOPE',1,'https://github.com/prolopeuab/feniX-ML',
 'Inicio en PROLOPE I (registro 2; PID2021-124737NB-I00); continuidad en PROLOPE II (registro 1). Fecha confirmada por David. Documentación: https://prolopeuab.github.io/feniX-ML/'),
 (12,'Trabajo técnico para la Biblioteca Digital PROLOPE','technical_edition','technical_project_work',
 'Trabajo técnico para la preparación y publicación de ediciones críticas digitales del teatro de Lope de Vega, dentro de la Biblioteca Digital PROLOPE. Iniciado en febrero de 2025 en PROLOPE I y continuado en PROLOPE II.',
 'Technical work preparing and publishing digital critical editions of Lope de Vega’s plays within the PROLOPE Digital Library. Begun in February 2025 within PROLOPE I and continued within PROLOPE II.',
 '2025-02','Grupo PROLOPE',1,'https://davidmerinorecalde.com/es/portfolio/edicion-digital-corpus',
 'Inicio en PROLOPE I (registro 2; PID2021-124737NB-I00); continuidad en PROLOPE II (registro 1). Descripción general pendiente de ampliar con las tareas concretas; enlace al portfolio, no a una biblioteca publicada.');
INSERT INTO technical_work_projects VALUES(11,2),(11,1),(12,2),(12,1);

INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES
 ('technical_works',11,1),('technical_works',12,1);
INSERT INTO portfolio_items(portfolio_slug,entity_type,entity_id,sort_order,featured) VALUES
 ('edicion-digital-corpus','technical_works',11,60,0),
 ('edicion-digital-corpus','technical_works',12,70,0);
INSERT INTO cv_block_entries(block_id,entity_type,entity_id,sort_order)
SELECT b.id,'technical_works',11,coalesce((SELECT max(e.sort_order)+1 FROM cv_block_entries e WHERE e.block_id=b.id),0)
FROM cv_blocks b WHERE b.cv_id=1 AND b.kind='entries' AND b.title='Experiencia técnica y profesional';
INSERT INTO cv_block_entries(block_id,entity_type,entity_id,sort_order)
SELECT b.id,'technical_works',12,coalesce((SELECT max(e.sort_order)+1 FROM cv_block_entries e WHERE e.block_id=b.id),0)
FROM cv_blocks b WHERE b.cv_id=1 AND b.kind='entries' AND b.title='Experiencia técnica y profesional';
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now') WHERE id=1;
