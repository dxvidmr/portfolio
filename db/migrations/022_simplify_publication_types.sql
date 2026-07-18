-- 022: los tipos de publicación describen la obra, no el contenedor editorial.
-- Revista, actas y libro de resúmenes viven en publication_container_type.

BEGIN;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('publication_article', 'publication_type', 'Artículo', 'Article', 10),
  ('publication_chapter', 'publication_type', 'Capítulo', 'Chapter', 20),
  ('publication_abstract', 'publication_type', 'Resumen', 'Abstract', 30),
  ('publication_review', 'publication_type', 'Reseña', 'Review', 40),
  ('publication_book', 'publication_type', 'Libro', 'Book', 50),
  ('publication_critical_edition', 'publication_type', 'Edición crítica', 'Critical edition', 60),
  ('publication_translation', 'publication_type', 'Traducción', 'Translation', 70),
  ('publication_reference_entry', 'publication_type', 'Entrada de obra de referencia', 'Reference work entry', 80),
  ('publication_front_matter', 'publication_type', 'Texto liminar', 'Front matter contribution', 90),
  ('publication_digital_edition', 'publication_type', 'Edición académica digital', 'Digital scholarly edition', 100),
  ('publication_preprint', 'publication_type', 'Preprint', 'Preprint', 110),
  ('publication_working_paper', 'publication_type', 'Documento de trabajo', 'Working paper', 120);

UPDATE publications SET publication_type = 'publication_article'
WHERE publication_type IN ('journal_article', 'conference_paper');
UPDATE publications SET publication_type = 'publication_chapter'
WHERE publication_type = 'book_chapter';
UPDATE publications SET publication_type = 'publication_abstract'
WHERE publication_type = 'conference_abstract';
UPDATE publications SET publication_type = 'publication_review'
WHERE publication_type = 'book_review';
UPDATE publications SET publication_type = 'publication_book'
WHERE publication_type IN ('book_monograph', 'publication_edited_volume');
UPDATE publications SET publication_type = 'publication_critical_edition'
WHERE publication_type = 'critical_edition';
UPDATE publications SET publication_type = 'publication_translation'
WHERE publication_type = 'translation';
UPDATE publications SET publication_type = 'publication_reference_entry'
WHERE publication_type = 'encyclopedia_entry';
UPDATE publications SET publication_type = 'publication_front_matter'
WHERE publication_type = 'book_part';
UPDATE publications SET publication_type = 'publication_digital_edition'
WHERE publication_type = 'digital_scholarly_edition';
UPDATE publications SET publication_type = 'publication_preprint'
WHERE publication_type = 'preprint';
UPDATE publications SET publication_type = 'publication_working_paper'
WHERE publication_type = 'working_paper';

DELETE FROM type_vocab
WHERE code IN (
  'journal_article', 'book_chapter', 'conference_paper', 'conference_abstract',
  'book_review', 'book_monograph', 'publication_edited_volume', 'critical_edition',
  'translation', 'encyclopedia_entry', 'book_part', 'digital_scholarly_edition',
  'preprint', 'working_paper'
);

COMMIT;
