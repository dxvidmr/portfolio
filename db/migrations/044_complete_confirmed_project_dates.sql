-- PROLOPE: periodo publicado por el propio grupo.
-- https://prolope.uab.cat/project/la-integral-dramatica-de-lope-de-vega-textos-metodos-problemas-proyeccion/
UPDATE projects SET date_start='2022', date_end='2025'
WHERE id=2 AND project_code='PID2021-124737NB-I00' AND date_start IS NULL AND date_end IS NULL;

-- e-DrAMAS: periodo 2024-2025 confirmado por David el 2026-10-05.
UPDATE projects SET date_start='2024', date_end='2025'
WHERE id=4 AND project_code='H24-007-I' AND date_start IS NULL AND date_end IS NULL;
-- PROLOPE II y METADRAMA: inicio en 2025 confirmado por David el 2026-10-05.
-- Duraciones de 3 y 4 años, respectivamente, según el anexo I de concesión AEI PID2024:
-- https://www.aei.gob.es/sites/default/files/convocatory_info/2025-12/PID2024_RC_Anexo%20I.%20Relaci%C3%B3n%20ayudas%20concedidas_Datos%20Generales_0.xlsx
-- Los años finales se calculan a partir del año de inicio y la duración concedida.
-- La AEI registra PROLOPE II como PID2024-155554NB-I00; no se modifica aquí
-- la referencia discrepante PID2024-155584NB-I00 que consta en la base y en la UAB.
UPDATE projects SET date_start='2025', date_end='2028'
WHERE id=1 AND project_code='PID2024-155584NB-I00' AND date_start IS NULL AND date_end IS NULL;

UPDATE projects SET date_start='2025', date_end='2029'
WHERE id=3 AND project_code='PID2024-161619NA-I00' AND date_start IS NULL AND date_end IS NULL;

