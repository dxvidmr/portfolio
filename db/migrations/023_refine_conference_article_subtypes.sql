-- 023: short/full paper son subtipos de artículo en contexto congresual.
-- Un resumen no requiere subtipo adicional.

BEGIN;

UPDATE publications
SET conference_publication_format = NULL
WHERE publication_type <> 'publication_article';

DELETE FROM type_vocab
WHERE code IN ('conference_format_abstract', 'conference_format_extended_abstract');

COMMIT;
