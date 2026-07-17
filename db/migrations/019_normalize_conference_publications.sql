-- 019: precisa las publicaciones derivadas de contribuciones a congresos.
--
-- Un capítulo extenso incluido en un volumen de actas se registra como capítulo
-- de libro; su relación con la comunicación de origen vive en publications.event_id.
-- Los libros de resúmenes conservan una categoría propia: no son proceedings.

BEGIN;

-- «Estructuras de personajes…» es un capítulo de 21 páginas en un volumen
-- colectivo. La palabra «actas» del título del volumen no cambia su naturaleza
-- bibliográfica ni borra la comunicación de la que deriva.
UPDATE publications
SET publication_type = 'book_chapter'
WHERE id = 5 AND publication_type = 'conference_proceedings';

-- Ya no hay publicaciones que requieran la categoría residual de actas.
DELETE FROM type_vocab WHERE code = 'conference_proceedings';

-- Esta categoría solo se usa para registros efectivamente publicados en libros
-- de resúmenes, no para contribuciones extensas en volúmenes colectivos.
UPDATE type_vocab
SET label_es = 'Resumen publicado en libro de resúmenes',
    label_en = 'Published abstract in a book of abstracts'
WHERE code = 'conference_abstract';

COMMIT;
