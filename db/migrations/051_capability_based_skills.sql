-- Sustitución completa del catálogo experimental de competencias; sin equivalencias heredadas.
DELETE FROM cv_block_entries WHERE entity_type='skills';
DELETE FROM portfolio_items WHERE entity_type='skills';
DELETE FROM entity_tags WHERE entity_type='skills';
DELETE FROM entry_controls WHERE entity_type='skills';
DROP VIEW entries;
DROP VIEW entry_source;
DROP TABLE skills;
CREATE TABLE skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL,
  name_en TEXT,
  description_es TEXT NOT NULL,
  description_en TEXT,
  area TEXT NOT NULL REFERENCES type_vocab(code),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE skill_resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_es TEXT NOT NULL UNIQUE,
  name_en TEXT,
  nature TEXT NOT NULL CHECK(nature IN ('method','standard','language','tool','platform'))
);
CREATE TABLE skill_resource_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  resource_id INTEGER NOT NULL REFERENCES skill_resources(id) ON DELETE CASCADE,
  PRIMARY KEY(skill_id,resource_id)
);
CREATE TABLE skill_evidence_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  PRIMARY KEY(skill_id,entity_type,entity_id),
  FOREIGN KEY(entity_type,entity_id) REFERENCES entry_controls(entity_type,entity_id) ON DELETE CASCADE,
  CHECK(entity_type IN ('technical_works','publications','talks','teaching','courses','projects','academic_works'))
);
CREATE TABLE skill_portfolio_links (
  skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  portfolio_slug TEXT NOT NULL REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
  PRIMARY KEY(skill_id,portfolio_slug)
);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_text','skill_area','Edición digital y tratamiento textual','Digital editing and text processing',10);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_data','skill_area','Modelado y gestión de información','Data modelling and management',20);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_development','skill_area','Desarrollo y mantenimiento de recursos digitales','Digital resource development and maintenance',30);
INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES('skill_analysis','skill_area','Análisis y visualización','Analysis and visualization',40);
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(1,'Edición y publicación de textos digitales','Digital text editing and publication','Preparación y publicación web de ediciones digitales, con articulación entre texto, aparato crítico y metadatos.','Preparation and web publication of digital editions integrating text, critical apparatus and metadata.','skill_text',10);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',1,1);
INSERT INTO skill_evidence_links SELECT 1,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=7;
INSERT INTO skill_evidence_links SELECT 1,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=12;
INSERT INTO skill_portfolio_links SELECT 1,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(2,'Codificación textual con XML-TEI','Text encoding with XML-TEI','Marcado de textos y metadatos para su edición, intercambio y procesamiento.','Text and metadata encoding for editing, interchange and processing.','skill_text',20);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',2,1);
INSERT INTO skill_evidence_links SELECT 2,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=7;
INSERT INTO skill_evidence_links SELECT 2,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=11;
INSERT INTO skill_evidence_links SELECT 2,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=12;
INSERT INTO skill_portfolio_links SELECT 2,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(3,'Transformación y preparación de corpus','Corpus preparation and transformation','Conversión de documentos y preparación de archivos textuales para su publicación y tratamiento computacional.','Document conversion and preparation of text files for publication and computational processing.','skill_text',30);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',3,1);
INSERT INTO skill_evidence_links SELECT 3,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=8;
INSERT INTO skill_evidence_links SELECT 3,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=11;
INSERT INTO skill_portfolio_links SELECT 3,slug FROM portfolio_projects WHERE slug='etso-plataforma-web';
INSERT INTO skill_portfolio_links SELECT 3,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(4,'Modelado de datos humanísticos','Humanities data modelling','Diseño y revisión de modelos de datos para representar textos, estructuras métricas y documentación de investigación.','Design and revision of data models for texts, metrical structures and research documentation.','skill_data',40);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',4,1);
INSERT INTO skill_evidence_links SELECT 4,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=9;
INSERT INTO skill_evidence_links SELECT 4,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_portfolio_links SELECT 4,slug FROM portfolio_projects WHERE slug='todos-a-una';
INSERT INTO skill_portfolio_links SELECT 4,slug FROM portfolio_projects WHERE slug='versologia-metadrama';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(5,'Desarrollo y consulta de bases de datos','Database development and querying','Implementación de bases de datos y consultas para organizar y recuperar información de investigación.','Database implementation and querying to organize and retrieve research information.','skill_data',50);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',5,1);
INSERT INTO skill_evidence_links SELECT 5,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=9;
INSERT INTO skill_evidence_links SELECT 5,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_portfolio_links SELECT 5,slug FROM portfolio_projects WHERE slug='versologia-metadrama';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(6,'Migración e integración de datos','Data migration and integration','Adaptación del modelo y traslado de datos entre sistemas, como parte de la renovación de recursos digitales.','Data model adaptation and migration between systems as part of digital resource renewal.','skill_data',60);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',6,1);
INSERT INTO skill_evidence_links SELECT 6,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=9;
INSERT INTO skill_portfolio_links SELECT 6,slug FROM portfolio_projects WHERE slug='etso-plataforma-web';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(7,'Desarrollo de aplicaciones de investigación','Research application development','Creación de aplicaciones para editar, transformar y analizar materiales de investigación.','Application development for editing, transforming and analysing research materials.','skill_development',70);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',7,1);
INSERT INTO skill_evidence_links SELECT 7,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_evidence_links SELECT 7,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=11;
INSERT INTO skill_portfolio_links SELECT 7,slug FROM portfolio_projects WHERE slug='versologia-metadrama';
INSERT INTO skill_portfolio_links SELECT 7,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(8,'Desarrollo de interfaces web','Web interface development','Diseño e implementación de sitios e interfaces para consultar y publicar textos y datos.','Design and implementation of websites and interfaces for text and data consultation and publication.','skill_development',80);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',8,1);
INSERT INTO skill_evidence_links SELECT 8,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=7;
INSERT INTO skill_evidence_links SELECT 8,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=9;
INSERT INTO skill_evidence_links SELECT 8,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_evidence_links SELECT 8,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=12;
INSERT INTO skill_portfolio_links SELECT 8,slug FROM portfolio_projects WHERE slug='etso-plataforma-web';
INSERT INTO skill_portfolio_links SELECT 8,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(9,'Automatización de procesos textuales','Text workflow automation','Desarrollo de herramientas para convertir documentos y reducir tareas repetitivas en la preparación de ediciones digitales.','Tool development for document conversion and repetitive digital edition preparation tasks.','skill_development',90);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',9,1);
INSERT INTO skill_evidence_links SELECT 9,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=11;
INSERT INTO skill_portfolio_links SELECT 9,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(10,'Control de versiones y documentación técnica','Version control and technical documentation','Organización del código y documentación del uso de herramientas para facilitar su revisión y mantenimiento.','Code organization and tool usage documentation to support review and maintenance.','skill_development',100);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',10,1);
INSERT INTO skill_evidence_links SELECT 10,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=11;
INSERT INTO skill_portfolio_links SELECT 10,slug FROM portfolio_projects WHERE slug='edicion-digital-corpus';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(11,'Análisis y visualización de redes','Network analysis and visualization','Modelado, análisis y representación de redes de personajes teatrales.','Modelling, analysis and visualization of theatrical character networks.','skill_analysis',110);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',11,1);
INSERT INTO skill_portfolio_links SELECT 11,slug FROM portfolio_projects WHERE slug='redes-personajes-teatrales';
INSERT INTO skills(id,name_es,name_en,description_es,description_en,area,sort_order) VALUES(12,'Análisis de estructuras métricas','Metrical structure analysis','Desarrollo de herramientas para explorar y comparar la organización métrica de textos teatrales.','Tool development for exploring and comparing metrical organization in theatrical texts.','skill_analysis',120);
INSERT INTO entry_controls(entity_type,entity_id,is_public) VALUES('skills',12,1);
INSERT INTO skill_evidence_links SELECT 12,entity_type,entity_id FROM entry_controls WHERE entity_type='technical_works' AND entity_id=10;
INSERT INTO skill_portfolio_links SELECT 12,slug FROM portfolio_projects WHERE slug='versologia-metadrama';
INSERT INTO skill_resources(id,name_es,nature) VALUES(1,'XML-TEI','standard');
INSERT INTO skill_resources(id,name_es,nature) VALUES(2,'CETEIcean','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(3,'SQL','language');
INSERT INTO skill_resources(id,name_es,nature) VALUES(4,'SQLite','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(5,'PostgreSQL','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(6,'Svelte','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(7,'JavaScript','language');
INSERT INTO skill_resources(id,name_es,nature) VALUES(8,'HTML','standard');
INSERT INTO skill_resources(id,name_es,nature) VALUES(9,'CSS','language');
INSERT INTO skill_resources(id,name_es,nature) VALUES(10,'Git','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(11,'GitHub','platform');
INSERT INTO skill_resources(id,name_es,nature) VALUES(12,'Gephi','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(13,'Cytoscape','tool');
INSERT INTO skill_resources(id,name_es,nature) VALUES(14,'Transkribus','platform');
INSERT INTO skill_resource_links VALUES(1,1);
INSERT INTO skill_resource_links VALUES(1,2);
INSERT INTO skill_resource_links VALUES(2,1);
INSERT INTO skill_resource_links VALUES(3,1);
INSERT INTO skill_resource_links VALUES(3,14);
INSERT INTO skill_resource_links VALUES(4,3);
INSERT INTO skill_resource_links VALUES(5,3);
INSERT INTO skill_resource_links VALUES(5,4);
INSERT INTO skill_resource_links VALUES(5,5);
INSERT INTO skill_resource_links VALUES(6,3);
INSERT INTO skill_resource_links VALUES(7,6);
INSERT INTO skill_resource_links VALUES(7,7);
INSERT INTO skill_resource_links VALUES(8,6);
INSERT INTO skill_resource_links VALUES(8,7);
INSERT INTO skill_resource_links VALUES(8,8);
INSERT INTO skill_resource_links VALUES(8,9);
INSERT INTO skill_resource_links VALUES(10,10);
INSERT INTO skill_resource_links VALUES(10,11);
INSERT INTO skill_resource_links VALUES(11,12);
INSERT INTO skill_resource_links VALUES(11,13);
CREATE VIEW entry_source AS
SELECT 'projects' AS entity_type, id AS entity_id, title, date_start AS sort_date FROM projects
UNION ALL
SELECT 'technical_works', id, title, date_start FROM technical_works
UNION ALL
SELECT 'education', id, degree_title, COALESCE(date_end, date_start) FROM education
UNION ALL
SELECT 'research_stays', id, institution, date_start FROM research_stays
UNION ALL
SELECT 'courses', id, title, date_start FROM courses
UNION ALL
SELECT 'funding_awards', id, title, CAST(year AS TEXT) FROM funding_awards
UNION ALL
SELECT 'publications', id, title, CAST(year AS TEXT) FROM publications
UNION ALL
SELECT 'academic_works', id, title, CAST(year AS TEXT) FROM academic_works
UNION ALL
SELECT 'talks', talk.id, talk.title,
       COALESCE(
         talk.date_override,
         (SELECT event.date_start FROM events AS event WHERE event.id = talk.canonical_event_id)
       )
FROM talks AS talk
UNION ALL
SELECT 'teaching', id, title, COALESCE(date_start, academic_year) FROM teaching
UNION ALL
SELECT 'service_activities', service.id, service.title,
       COALESCE(
         service.date_start,
         (SELECT event.date_start FROM events AS event WHERE event.id = service.canonical_event_id)
       )
FROM service_activities AS service
UNION ALL
SELECT 'event_attendance', attendance.id, event.title, event.date_start
FROM event_attendance AS attendance
JOIN events AS event ON event.id = attendance.event_id
UNION ALL
SELECT 'memberships', id, organization, date_start FROM memberships
UNION ALL
SELECT 'skills', id, name_es, NULL FROM skills
UNION ALL
SELECT 'languages', language_entry.id,
       COALESCE(language_vocab.label_es, language_entry.language), NULL
FROM languages AS language_entry
LEFT JOIN type_vocab AS language_vocab
  ON language_vocab.code = language_entry.language
 AND language_vocab.domain = 'language';

CREATE VIEW entries AS
SELECT
  source.entity_type,
  source.entity_id,
  source.title AS title_cache,
  source.sort_date,
  COALESCE(control.is_public, 0) AS public,
  COALESCE(control.featured_cv, 0) AS featured,
  COALESCE(control.show_home, 0) AS show_home,
  COALESCE(control.home_order, 0) AS sort_order,
  control.updated_at
FROM entry_source AS source
LEFT JOIN entry_controls AS control
  ON control.entity_type = source.entity_type
 AND control.entity_id = source.entity_id;

ALTER TABLE cv_block_entries ADD COLUMN skill_options TEXT NOT NULL DEFAULT '{"resources":[],"evidence":[]}' CHECK(json_valid(skill_options));
UPDATE cv_profiles SET version=version+1,updated_at=datetime('now') WHERE id IN (SELECT cv_id FROM cv_blocks WHERE title LIKE '%Competencia%');
