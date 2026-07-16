-- 011: conservar los nombres históricos entity_type/entity_id en documents.
-- Evita romper el dashboard desplegado entre la migración de BD y el deploy
-- del código nuevo, sin cambiar el modelo de propietario alternativo.

BEGIN;

ALTER TABLE documents RENAME COLUMN entry_type TO entity_type;
ALTER TABLE documents RENAME COLUMN entry_id TO entity_id;

COMMIT;
