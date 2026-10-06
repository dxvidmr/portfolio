-- Capacidades respaldadas por las comunicaciones y el portfolio existentes.
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES
(13,'Análisis bibliométrico','Bibliometric analysis','Análisis de la producción y evolución de investigaciones a partir de registros bibliográficos, como en el estudio de la revista Anales.','Analysis of research production and evolution using bibliographic records, as in the study of the journal Anales.','skill_analysis',130),
(14,'Visualización de datos','Data visualization','Representación de redes y estructuras métricas mediante visualizaciones para su exploración e interpretación.','Representation of networks and metrical structures through visualizations for exploration and interpretation.','skill_analysis',140);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',13,1),('skills',14,1);
INSERT INTO skill_evidence_links SELECT 13,e.entity_type,e.entity_id FROM entries e WHERE e.entity_type='talks' AND e.title_cache LIKE '%bibliom%';
INSERT INTO skill_evidence_links SELECT 14,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_portfolio_links SELECT 14,slug FROM portfolio_projects WHERE slug IN ('redes-personajes-teatrales','versologia-metadrama');
INSERT INTO skill_resource_links(skill_id,resource_id) VALUES(14,12),(14,13);
INSERT OR IGNORE INTO skill_evidence_links SELECT 2,e.entity_type,e.entity_id FROM entries e WHERE e.entity_type='teaching' AND e.title_cache LIKE '%XML-TEI%';
INSERT OR IGNORE INTO skill_evidence_links SELECT 11,e.entity_type,e.entity_id FROM entries e WHERE e.entity_type IN ('publications','talks','teaching') AND (e.title_cache LIKE '%redes sociales%' OR e.title_cache LIKE '%escena al grafo%');
