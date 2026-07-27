-- 035: incorpora al CV el cargo editorial continuado en el Anuario Lope de Vega.

INSERT INTO service_activities (
  activity_type,
  title,
  role,
  venue_or_journal,
  date_start,
  date_end,
  url
) VALUES (
  'journal_editing',
  'Editor de la sección de reseñas',
  NULL,
  'Anuario Lope de Vega. Texto, literatura, cultura',
  '2024',
  NULL,
  'https://revistes.uab.cat/anuariolopedevega/about/editorialTeam'
);

INSERT INTO entry_controls (
  entity_type,
  entity_id,
  is_public,
  show_home,
  home_order,
  featured_cv,
  cv_order
) VALUES (
  'service_activities',
  last_insert_rowid(),
  1,
  0,
  0,
  0,
  0
);
