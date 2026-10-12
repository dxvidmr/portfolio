-- Líneas de investigación editables (Taxonomías) en lugar de los temas del portfolio y de las
-- etiquetas de méritos, que no se usaban. Los métodos de cada ficha pasan a ser sus competencias.

-- 1. Líneas de investigación: el «qué» de cada ficha y las pastillas de «Sobre mí».
INSERT OR IGNORE INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
  ('research_line_theatre','research_line','Teatro clásico: escena y recepción','Classical theatre: performance & reception',10),
  ('research_line_archives','research_line','Archivos, corpus y edición digital','Archives, corpora & digital editing',20),
  ('research_line_data','research_line','Modelado y análisis de datos','Data modelling & analysis',30),
  ('research_line_infrastructure','research_line','Infraestructuras digitales sostenibles','Sustainable digital infrastructures',40);

ALTER TABLE portfolio_projects ADD COLUMN research_line TEXT REFERENCES type_vocab(code);

UPDATE portfolio_projects SET research_line = 'research_line_theatre' WHERE slug IN ('todos-a-una', 'documento-escena');
UPDATE portfolio_projects SET research_line = 'research_line_archives' WHERE slug = 'edicion-digital-corpus';
UPDATE portfolio_projects SET research_line = 'research_line_data' WHERE slug IN ('redes-personajes-teatrales', 'versologia-metadrama');
UPDATE portfolio_projects SET research_line = 'research_line_infrastructure' WHERE slug = 'etso-plataforma-web';

-- 2. Fuera los temas del portfolio: sus métodos ya son competencias vinculadas a cada ficha.
DROP TABLE IF EXISTS portfolio_project_tags;
DELETE FROM type_vocab WHERE domain = 'portfolio_tag';

-- 3. Fuera las etiquetas de méritos: ningún mérito las usaba.
DROP TABLE IF EXISTS entity_tags;
DROP TABLE IF EXISTS tags;

-- 4. Evidencias de «Organización y descripción de colecciones digitales» (Todos a una).
INSERT OR IGNORE INTO skill_evidence_links(skill_id, entity_type, entity_id) VALUES
  (15, 'talks', 6),
  (15, 'talks', 3);
