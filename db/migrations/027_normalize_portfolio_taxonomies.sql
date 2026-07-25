-- 027: normaliza el tipo y las etiquetas del portfolio.
--
-- `kind` pasa a describir la estructura de la ficha mediante un vocabulario
-- controlado. Las etiquetas se traducen desde type_vocab y se relacionan con
-- cada ficha mediante una tabla N:M. Se eliminan el kicker redundante y el
-- antiguo array libre tags_json.

PRAGMA foreign_keys=OFF;

BEGIN;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('portfolio_project', 'portfolio_kind', 'Proyecto', 'Project', 10),
  ('portfolio_line', 'portfolio_kind', 'Línea de trabajo', 'Line of work', 20),
  ('portfolio_infrastructure', 'portfolio_kind', 'Infraestructura', 'Infrastructure', 30),
  ('portfolio_research', 'portfolio_tag', 'Investigación', 'Research', 10),
  ('portfolio_digital_editing', 'portfolio_tag', 'Edición digital', 'Digital editing', 20),
  ('portfolio_data_modelling', 'portfolio_tag', 'Modelado de datos', 'Data modelling', 30),
  ('portfolio_computational_analysis', 'portfolio_tag', 'Análisis computacional', 'Computational analysis', 40),
  ('portfolio_data_visualization', 'portfolio_tag', 'Visualización de datos', 'Data visualization', 50),
  ('portfolio_web_development', 'portfolio_tag', 'Desarrollo web', 'Web development', 60),
  ('portfolio_digital_corpora', 'portfolio_tag', 'Corpus digitales', 'Digital corpora', 70),
  ('portfolio_knowledge_transfer', 'portfolio_tag', 'Transferencia', 'Knowledge transfer', 80),
  ('portfolio_teaching', 'portfolio_tag', 'Docencia', 'Teaching', 90),
  ('portfolio_performance_practice', 'portfolio_tag', 'Práctica escénica', 'Performance practice', 100);

CREATE TABLE portfolio_projects_new (
  slug TEXT PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  kind_code TEXT NOT NULL REFERENCES type_vocab(code),
  summary_es TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  status_es TEXT NOT NULL,
  status_en TEXT NOT NULL,
  period TEXT NOT NULL,
  links_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(links_json) AND json_type(links_json) = 'array'),
  publication_status TEXT NOT NULL DEFAULT 'published'
    CHECK (publication_status IN ('draft', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO portfolio_projects_new (
  slug, title_es, title_en, kind_code, summary_es, summary_en,
  status_es, status_en, period, links_json, publication_status,
  sort_order, created_at, updated_at
)
SELECT
  slug,
  title_es,
  title_en,
  CASE
    WHEN slug IN ('redes-personajes-teatrales', 'edicion-digital-corpus', 'documento-escena')
      THEN 'portfolio_line'
    WHEN slug = 'versologia-metadrama'
      THEN 'portfolio_infrastructure'
    ELSE 'portfolio_project'
  END,
  summary_es,
  summary_en,
  status_es,
  status_en,
  period,
  links_json,
  publication_status,
  sort_order,
  created_at,
  updated_at
FROM portfolio_projects;

DROP TABLE portfolio_projects;
ALTER TABLE portfolio_projects_new RENAME TO portfolio_projects;

CREATE INDEX idx_portfolio_projects_publication
  ON portfolio_projects(publication_status, sort_order);

CREATE TABLE portfolio_project_tags (
  portfolio_slug TEXT NOT NULL
    REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
  tag_code TEXT NOT NULL
    REFERENCES type_vocab(code),
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (portfolio_slug, tag_code)
);

CREATE INDEX idx_portfolio_project_tags_slug
  ON portfolio_project_tags(portfolio_slug, sort_order);

INSERT INTO portfolio_project_tags (portfolio_slug, tag_code, sort_order) VALUES
  ('todos-a-una', 'portfolio_research', 10),
  ('todos-a-una', 'portfolio_digital_editing', 20),
  ('todos-a-una', 'portfolio_data_modelling', 30),
  ('todos-a-una', 'portfolio_knowledge_transfer', 40),

  ('documento-escena', 'portfolio_research', 10),
  ('documento-escena', 'portfolio_performance_practice', 20),

  ('versologia-metadrama', 'portfolio_research', 10),
  ('versologia-metadrama', 'portfolio_data_modelling', 20),
  ('versologia-metadrama', 'portfolio_computational_analysis', 30),
  ('versologia-metadrama', 'portfolio_data_visualization', 40),
  ('versologia-metadrama', 'portfolio_web_development', 50),

  ('etso-plataforma-web', 'portfolio_web_development', 10),
  ('etso-plataforma-web', 'portfolio_digital_corpora', 20),

  ('redes-personajes-teatrales', 'portfolio_research', 10),
  ('redes-personajes-teatrales', 'portfolio_computational_analysis', 20),
  ('redes-personajes-teatrales', 'portfolio_data_visualization', 30),
  ('redes-personajes-teatrales', 'portfolio_knowledge_transfer', 40),
  ('redes-personajes-teatrales', 'portfolio_teaching', 50),

  ('edicion-digital-corpus', 'portfolio_digital_editing', 10),
  ('edicion-digital-corpus', 'portfolio_web_development', 20),
  ('edicion-digital-corpus', 'portfolio_digital_corpora', 30);

COMMIT;

PRAGMA foreign_keys=ON;
