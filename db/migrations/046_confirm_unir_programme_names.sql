-- HDATEATROUNIR: Financiación de Proyectos Propios UNIR (2020) y
-- Financiación de Proyectos Propios de Investigación UNIR (2022).
-- https://www.unir.net/wp-content/uploads/2020/06/Resolucion_Proyectos-2020_signed.pdf
-- https://www.unir.net/wp-content/uploads/2022/03/Convocatoria-Ordinaria-Proyectos_2022.pdf
UPDATE type_vocab
SET label_es='UNIR — Proyectos Propios de Investigación',
    label_en='UNIR — Internal Research Projects'
WHERE domain='project_programme' AND code='unir_research';

-- e-DrAMAS: programa INCENTIVA, identificado en la web de IPARFEM.
-- https://escritorasfranquismo.com/el-proyecto
-- https://www.unir.net/universidad-online/vicerrectorados/vicerrectorado-transferencia/convocatorias-vicerrectorado-transferencia/
UPDATE type_vocab
SET label_es='UNIR — INCENTIVA', label_en='UNIR — INCENTIVA'
WHERE domain='project_programme' AND code='unir_transfer';
