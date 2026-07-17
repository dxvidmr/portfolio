-- 016: un único estado editorial gobierna toda la presencia pública.
--
-- published aparece en la web y tiene URL; draft y archived solo se gestionan
-- desde el dashboard. Versología permanece como borrador hasta su publicación.

UPDATE portfolio_projects
SET publication_status = 'draft', updated_at = datetime('now')
WHERE slug = 'versologia-metadrama';

DROP INDEX idx_portfolio_projects_home;

ALTER TABLE portfolio_projects DROP COLUMN show_home;

CREATE INDEX idx_portfolio_projects_publication
  ON portfolio_projects(publication_status, sort_order);
