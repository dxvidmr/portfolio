-- Normaliza la financiación de la estancia de Oxford:
-- dos ayudas públicas relacionadas y ninguna copia textual en research_stays.

INSERT INTO funding_awards
  (title, award_type, awarding_body, amount, currency, year, related_context)
SELECT
  'Ayuda AGAUR para la estancia de investigación en la University of Oxford',
  'scholarship',
  'Agència de Gestió d''Ajuts Universitaris i de Recerca (AGAUR)',
  3000,
  'EUR',
  2026,
  'Estancia de investigación en la University of Oxford (enero-abril 2026)'
WHERE NOT EXISTS (
  SELECT 1
  FROM funding_awards
  WHERE title = 'Ayuda AGAUR para la estancia de investigación en la University of Oxford'
);

INSERT INTO entry_controls
  (entity_type, entity_id, is_public, show_home, home_order, featured_cv, cv_order)
SELECT 'funding_awards', id, 1, 0, 0, 0, 0
FROM funding_awards
WHERE title = 'Ayuda AGAUR para la estancia de investigación en la University of Oxford'
ON CONFLICT (entity_type, entity_id) DO UPDATE SET
  is_public = 1,
  updated_at = datetime('now');

INSERT INTO funding_relations
  (funding_award_id, entity_type, entity_id, relation_kind)
SELECT funding.id, 'research_stays', stay.id, 'supports'
FROM funding_awards AS funding
JOIN research_stays AS stay ON stay.institution = 'University of Oxford'
WHERE funding.title = 'Ayuda AGAUR para la estancia de investigación en la University of Oxford'
ON CONFLICT (funding_award_id, entity_type, entity_id) DO UPDATE SET
  relation_kind = 'supports';

-- Garantiza también la relación de la ayuda concedida por la propia Faculty.
INSERT INTO funding_relations
  (funding_award_id, entity_type, entity_id, relation_kind)
SELECT funding.id, 'research_stays', stay.id, 'supports'
FROM funding_awards AS funding
JOIN research_stays AS stay ON stay.institution = 'University of Oxford'
WHERE funding.awarding_body = 'Faculty of Medieval and Modern Languages, University of Oxford'
ON CONFLICT (funding_award_id, entity_type, entity_id) DO UPDATE SET
  relation_kind = 'supports';

UPDATE research_stays SET funding_text = NULL WHERE funding_text IS NOT NULL;
ALTER TABLE research_stays DROP COLUMN funding_text;
