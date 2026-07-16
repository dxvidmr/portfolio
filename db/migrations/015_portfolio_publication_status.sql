-- 015: ciclo editorial independiente de la aparición en portada.
--
-- draft: solo dashboard; published: URL pública; archived: conservado y retirado.
-- show_home sigue indicando si un proyecto publicado forma parte de la portada.

ALTER TABLE portfolio_projects
ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'published'
  CHECK (publication_status IN ('draft', 'published', 'archived'));

UPDATE portfolio_projects
SET show_home = 0
WHERE publication_status <> 'published';
