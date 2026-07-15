CREATE TABLE IF NOT EXISTS portfolio_items (
  portfolio_slug TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  PRIMARY KEY (portfolio_slug, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug
  ON portfolio_items(portfolio_slug, sort_order);
