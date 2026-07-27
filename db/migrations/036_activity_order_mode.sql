-- 036: la actividad reciente se ordena por fecha salvo elección editorial explícita.

BEGIN;

CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO site_settings (key, value)
VALUES ('activity_order_mode', 'date');

COMMIT;
