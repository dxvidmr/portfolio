-- 010: documentos con propietario real y certificados de asistencia privados.
-- Un documento pertenece a una entrada transversal o a un registro de
-- asistencia, nunca a ambos. Los certificados no pueden ser públicos.

PRAGMA foreign_keys=OFF;

BEGIN;

INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES
  ('doc_full_text',   'document_type', 'Documento o texto completo', 'Document or full text', 10),
  ('doc_certificate', 'document_type', 'Certificado',                 'Certificate',           20),
  ('doc_diploma',     'document_type', 'Título o diploma',            'Degree or diploma',      30),
  ('doc_report',      'document_type', 'Informe',                     'Report',                 40),
  ('doc_material',    'document_type', 'Material complementario',    'Supplementary material', 50),
  ('doc_other',       'document_type', 'Otro documento',              'Other document',         60);

CREATE TABLE documents_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_type TEXT,
  entry_id INTEGER,
  event_attendance_id INTEGER,
  document_type TEXT NOT NULL REFERENCES type_vocab(code),
  title TEXT,
  drive_file_id TEXT,
  url TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
  is_certificate INTEGER NOT NULL DEFAULT 0 CHECK (is_certificate IN (0, 1)),
  issued_by TEXT,
  issued_date TEXT,
  notes_private TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (entry_type, entry_id)
    REFERENCES entry_controls(entity_type, entity_id) ON DELETE CASCADE,
  FOREIGN KEY (event_attendance_id)
    REFERENCES event_attendance(id) ON DELETE CASCADE,
  CHECK (
    (entry_type IS NOT NULL AND entry_id IS NOT NULL AND event_attendance_id IS NULL)
    OR
    (entry_type IS NULL AND entry_id IS NULL AND event_attendance_id IS NOT NULL)
  ),
  CHECK (entry_type IS NULL OR entry_type IN (
    'publications', 'academic_events', 'teaching', 'projects', 'education',
    'research_stays', 'funding_awards', 'service_activities', 'academic_works',
    'courses', 'memberships', 'skills', 'languages'
  )),
  CHECK (NOT (is_certificate = 1 AND is_public = 1)),
  CHECK (event_attendance_id IS NULL OR (is_certificate = 1 AND is_public = 0))
);

-- Conversión defensiva: la auditoría previa confirmó 0 filas.
INSERT INTO documents_new (
  id, entry_type, entry_id, document_type, title, drive_file_id, url,
  is_public, is_certificate, issued_by, issued_date, notes_private
)
SELECT
  id, entity_type, entity_id,
  CASE
    WHEN document_type IN (
      'doc_full_text', 'doc_certificate', 'doc_diploma',
      'doc_report', 'doc_material', 'doc_other'
    ) THEN document_type
    ELSE CASE WHEN is_certificate = 1 THEN 'doc_certificate' ELSE 'doc_other' END
  END,
  title, drive_file_id, url,
  CASE WHEN is_certificate = 1 THEN 0 WHEN is_public = 1 THEN 1 ELSE 0 END,
  CASE WHEN is_certificate = 1 THEN 1 ELSE 0 END,
  issued_by, issued_date, notes_private
FROM documents;

DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;

CREATE INDEX idx_documents_entry
  ON documents(entry_type, entry_id, sort_order, id)
  WHERE entry_type IS NOT NULL;

CREATE INDEX idx_documents_attendance
  ON documents(event_attendance_id, sort_order, id)
  WHERE event_attendance_id IS NOT NULL;

CREATE UNIQUE INDEX idx_documents_entry_url
  ON documents(entry_type, entry_id, url)
  WHERE entry_type IS NOT NULL;

CREATE UNIQUE INDEX idx_documents_attendance_url
  ON documents(event_attendance_id, url)
  WHERE event_attendance_id IS NOT NULL;

COMMIT;

PRAGMA foreign_keys=ON;
