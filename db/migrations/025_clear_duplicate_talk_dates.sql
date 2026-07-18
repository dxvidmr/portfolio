BEGIN;

-- Las fechas de la comunicación son anulaciones opcionales de las del evento.
-- Si coinciden exactamente, no aportan información y deben heredarse.
UPDATE talks
SET date_start = NULL
WHERE date_start IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM events
    WHERE events.id = talks.canonical_event_id
      AND events.date_start = talks.date_start
  );

UPDATE talks
SET date_end = NULL
WHERE date_end IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM events
    WHERE events.id = talks.canonical_event_id
      AND events.date_end = talks.date_end
  );

COMMIT;
