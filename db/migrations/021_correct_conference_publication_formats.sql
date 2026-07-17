-- 021: corrección editorial de las publicaciones de DH 2023 y HDH 2025.
-- El título de un volumen no determina por sí solo el formato de cada texto.

BEGIN;

UPDATE type_vocab
SET label_es = 'Comunicación publicada en congreso',
    label_en = 'Conference paper'
WHERE code = 'conference_paper';

UPDATE publications
SET publication_type = 'conference_paper',
    conference_publication_format = 'conference_format_short_paper'
WHERE id = 6;

COMMIT;
