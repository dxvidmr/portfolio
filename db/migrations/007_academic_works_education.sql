-- 007: relación estructural entre TFM/TFG y la titulación en la que se realizaron.
-- El backfill solo acepta coincidencias exactas y únicas entre `program` y
-- `education.degree_title`; las tres filas actuales cumplen ambas condiciones.

BEGIN;

ALTER TABLE academic_works
  ADD COLUMN education_id INTEGER REFERENCES education(id);

UPDATE academic_works
SET education_id = (
  SELECT education.id
  FROM education
  WHERE education.degree_title = academic_works.program
)
WHERE program IS NOT NULL
  AND (
    SELECT COUNT(*)
    FROM education
    WHERE education.degree_title = academic_works.program
  ) = 1;

CREATE INDEX idx_academic_works_education
  ON academic_works(education_id);

COMMIT;
