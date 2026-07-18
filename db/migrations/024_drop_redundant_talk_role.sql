PRAGMA foreign_keys=OFF;

BEGIN;

-- El tipo de comunicación y la vía de acceso ya expresan el papel académico.
-- La columna estaba vacía y no tenía consumidores públicos ni administrativos.
ALTER TABLE talks DROP COLUMN role;

COMMIT;

PRAGMA foreign_keys=ON;
