-- 014: catálogo editable de proyectos del portfolio.
--
-- Los metadatos y controles viven en la base de datos. Las narrativas complejas
-- siguen siendo ampliaciones opcionales en código, enlazadas mediante el slug.

PRAGMA foreign_keys=OFF;

BEGIN;

CREATE TABLE portfolio_projects (
  slug TEXT PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  kind_es TEXT NOT NULL,
  kind_en TEXT NOT NULL,
  kicker_es TEXT NOT NULL,
  kicker_en TEXT NOT NULL,
  summary_es TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  status_es TEXT NOT NULL,
  status_en TEXT NOT NULL,
  period TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(tags_json) AND json_type(tags_json) = 'array'),
  links_json TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(links_json) AND json_type(links_json) = 'array'),
  show_home INTEGER NOT NULL DEFAULT 1 CHECK (show_home IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_portfolio_projects_home
  ON portfolio_projects(show_home, sort_order);

INSERT INTO portfolio_projects
  (slug, title_es, title_en, kind_es, kind_en, kicker_es, kicker_en, summary_es, summary_en, status_es, status_en, period, tags_json, links_json, show_home, sort_order)
VALUES
  ('todos-a-una', 'Todos a una', 'Todos a una', 'Tesis doctoral y proyecto digital', 'Doctoral research & digital project', 'recepción · modelado de datos · edición participativa', 'reception · data modelling · participatory edition', 'Una investigación sobre cómo Fuenteovejuna llegó a ser un clásico, desarrollada como modelo de datos, edición digital, archivo documental y plataforma de participación pública.', 'Research into how Fuenteovejuna became a classic, developed as a data model, digital edition, documentary archive, and platform for public participation.', 'Investigación doctoral en curso', 'Ongoing doctoral research', '2023—', '["historia de la recepción","XML-TEI","modelado de datos","humanidades públicas"]', '[{"label_es":"Visitar Todos a una","label_en":"Visit Todos a una","url":"https://todosauna.vercel.app/"}]', 1, 10),
  ('versologia-metadrama', 'Versología', 'Versología', 'Base de datos y herramientas de análisis', 'Database & analysis toolkit', 'METADRAMA · estilometría estrófica · modelado de datos', 'METADRAMA · stanzaic stylometry · data modelling', 'Una infraestructura editorial y analítica para describir, comparar y explorar la arquitectura métrica del teatro en verso.', 'An editorial and analytical infrastructure for describing, comparing, and exploring the metrical architecture of verse drama.', 'En desarrollo', 'In development', '2025—', '["SvelteKit","Supabase","estilometría estrófica","visualización"]', '[]', 0, 20),
  ('etso-plataforma-web', 'Nueva plataforma ETSO', 'New ETSO platform', 'Rediseño, arquitectura y desarrollo web', 'Redesign, architecture & web development', 'SvelteKit · SQLite · R2 · búsqueda textual', 'SvelteKit · SQLite · R2 · full-text search', 'Reconstrucción completa del portal de Estilometría Aplicada al Teatro del Siglo de Oro y de su sistema de actualización, búsqueda y publicación.', 'Complete rebuild of the Stylometry Applied to Spanish Golden Age Theatre portal and its update, search, and publication system.', 'Publicado', 'Published', '2026', '["SvelteKit","SQLite","Cloudflare R2","ETL"]', '[{"label_es":"Visitar ETSO","label_en":"Visit ETSO","url":"https://etso.es/"}]', 1, 30),
  ('redes-personajes-teatrales', 'Redes de personajes teatrales', 'Theatrical character networks', 'Investigación y transferencia pedagógica', 'Research & pedagogical transfer', 'TFM · redes · visualización · transferencia', 'MA thesis · networks · visualisation · knowledge transfer', 'Una línea sobre análisis de redes teatrales que reúne investigación metodológica sobre Lope, tutoriales abiertos y una aplicación pedagógica con dramaturgas de la Edad de Plata.', 'A line of work on theatrical network analysis spanning methodological research on Lope, open tutorials, and a pedagogical application with women playwrights of Spain’s Silver Age.', 'Línea desarrollada · resultados publicados', 'Developed line · published outputs', '2022—2025', '["grafos","Lope de Vega","Edad de Plata","Programming Historian","pedagogía"]', '[]', 1, 40),
  ('edicion-digital-corpus', 'Edición digital e infraestructuras textuales', 'Digital editions & textual infrastructures', 'Línea de trabajo', 'Line of work', 'XML-TEI · herramientas · corpus', 'XML-TEI · tools · corpora', 'Herramientas, ediciones y corpus para transformar documentos editoriales en textos publicables, analizables y reutilizables.', 'Tools, editions, and corpora that transform editorial documents into publishable, analysable, and reusable texts.', 'Línea activa', 'Active line of work', '2020—', '["XML-TEI","FeniX-ML","edición digital","corpus"]', '[]', 1, 50),
  ('documento-escena', 'Práctica escénica', 'Performance practice', 'Investigación y creación escénica', 'Performance research & stage creation', 'interpretación · investigación-creación · teatro clásico', 'acting · practice-based research · classical theatre', 'La escena como práctica y método de investigación: una trayectoria que reúne formación actoral, interpretación, montajes de teatro clásico y estudio de la técnica actoral del Siglo de Oro.', 'Performance as both practice and research method: a body of work bringing together actor training, performance, classical theatre productions, and the study of Golden Age acting technique.', 'Línea activa', 'Active line of work', '2018—', '["interpretación","investigación escénica","teatro clásico","METADRAMA"]', '[]', 1, 60);

ALTER TABLE portfolio_items RENAME TO portfolio_items_legacy;

CREATE TABLE portfolio_items (
  portfolio_slug TEXT NOT NULL REFERENCES portfolio_projects(slug) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  PRIMARY KEY (portfolio_slug, entity_type, entity_id)
);

INSERT INTO portfolio_items (portfolio_slug, entity_type, entity_id, sort_order, featured)
SELECT legacy.portfolio_slug, legacy.entity_type, legacy.entity_id, legacy.sort_order, legacy.featured
FROM portfolio_items_legacy AS legacy
JOIN portfolio_projects AS project ON project.slug = legacy.portfolio_slug;

DROP TABLE portfolio_items_legacy;

CREATE INDEX idx_portfolio_items_slug
  ON portfolio_items(portfolio_slug, sort_order);

COMMIT;

PRAGMA foreign_keys=ON;
