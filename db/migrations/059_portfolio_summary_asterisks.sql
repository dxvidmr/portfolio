-- Descripciones del portfolio con el mismo formato que los títulos: *cursiva* con asteriscos.
UPDATE portfolio_projects
   SET summary_es = replace(replace(summary_es, '<i>', '*'), '</i>', '*'),
       summary_en = replace(replace(summary_en, '<i>', '*'), '</i>', '*')
 WHERE summary_es LIKE '%<i>%' OR summary_en LIKE '%<i>%';
