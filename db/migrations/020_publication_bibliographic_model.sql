-- 020: modelo bibliográfico de publicaciones, contenedores y contribuciones
-- de congreso. Los términos no son alternativas del mismo nivel:
-- - la publicación es un capítulo, artículo, resumen, edición, etc.;
-- - el contenedor puede ser actas, libro de resúmenes, revista o volumen;
-- - las publicaciones de congreso pueden especificar formato y evaluación.

BEGIN;

ALTER TABLE publications ADD COLUMN container_type TEXT REFERENCES type_vocab(code);
ALTER TABLE publications ADD COLUMN conference_publication_format TEXT REFERENCES type_vocab(code);
ALTER TABLE publications ADD COLUMN review_status TEXT REFERENCES type_vocab(code);

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('conference_paper', 'publication_type', 'Comunicación publicada en congreso', 'Conference paper', 30),
  ('book_monograph', 'publication_type', 'Libro de autoría', 'Authored book', 50),
  ('critical_edition', 'publication_type', 'Edición crítica', 'Critical edition', 70),
  ('translation', 'publication_type', 'Traducción', 'Translation', 80),
  ('encyclopedia_entry', 'publication_type', 'Entrada de diccionario o enciclopedia', 'Dictionary or encyclopedia entry', 90),
  ('book_part', 'publication_type', 'Prólogo, introducción o epílogo', 'Foreword, introduction or afterword', 100),
  ('digital_scholarly_edition', 'publication_type', 'Edición académica digital', 'Digital scholarly edition', 110),
  ('preprint', 'publication_type', 'Preprint', 'Preprint', 120),
  ('working_paper', 'publication_type', 'Documento de trabajo', 'Working paper', 130),
  ('container_journal_issue', 'publication_container_type', 'Número de revista', 'Journal issue', 10),
  ('container_edited_book', 'publication_container_type', 'Volumen colectivo', 'Edited volume', 20),
  ('container_conference_proceedings', 'publication_container_type', 'Actas de congreso', 'Conference proceedings', 30),
  ('container_book_of_abstracts', 'publication_container_type', 'Libro de resúmenes', 'Book of abstracts', 40),
  ('container_reference_work', 'publication_container_type', 'Obra de referencia', 'Reference work', 50),
  ('container_repository', 'publication_container_type', 'Repositorio o plataforma académica', 'Repository or scholarly platform', 60),
  ('conference_format_abstract', 'conference_publication_format', 'Resumen', 'Abstract', 10),
  ('conference_format_extended_abstract', 'conference_publication_format', 'Resumen extendido', 'Extended abstract', 20),
  ('conference_format_short_paper', 'conference_publication_format', 'Contribución breve (short paper)', 'Short paper', 30),
  ('conference_format_full_paper', 'conference_publication_format', 'Contribución completa (full paper)', 'Full paper', 40),
  ('review_peer', 'publication_review_status', 'Evaluación por pares', 'Peer reviewed', 10),
  ('review_editorial', 'publication_review_status', 'Evaluación editorial', 'Editorial review', 20),
  ('review_none', 'publication_review_status', 'Sin evaluación externa', 'No external review', 30);

-- Registros actuales: solo se completan datos inequívocos por el título del
-- contenedor y la extensión. La evaluación queda NULL si no está documentada.
UPDATE publications
SET container_type = 'container_journal_issue'
WHERE journal_title IS NOT NULL;

UPDATE publications
SET container_type = 'container_edited_book'
WHERE publication_type = 'book_chapter' AND book_title IS NOT NULL;

UPDATE publications
SET container_type = 'container_conference_proceedings',
    conference_publication_format = 'conference_format_full_paper'
WHERE id = 5 AND publication_type = 'book_chapter';

UPDATE publications
SET container_type = 'container_book_of_abstracts',
    conference_publication_format = 'conference_format_abstract'
WHERE id IN (6, 9) AND publication_type = 'conference_abstract';

COMMIT;
