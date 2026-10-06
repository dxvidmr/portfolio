INSERT INTO type_vocab(code,domain,label_es,label_en,sort_order) VALUES
 ('technical_project_work','technical_modality','Trabajo técnico en proyecto de investigación','Technical work within a research project',25);

UPDATE technical_works SET
 title='Desarrollo web de la edición digital de La carpintería de armar',
 contribution_es='Desarrollo completo de la web de la edición digital de La carpintería de armar en Fray Andrés de San Miguel y colaboración en el marcado textual. El sitio combina transcripción, modernización, anotación y materiales visuales para consultar el manuscrito.'
WHERE id=7;
UPDATE technical_works SET title='Preparación de archivos para entrenar un modelo de transcripción'
WHERE id=8;
UPDATE technical_works SET title='Renovación de la plataforma digital de ETSO',
 contribution_es='Revisión del modelo de datos, migración de la base de datos y desarrollo de una nueva web, con modernización del diseño y de las herramientas de consulta del corpus teatral de ETSO.',
 contribution_en='Revision of the data model, database migration and development of a new website, modernising the design and tools for accessing the ETSO theatrical corpus.'
WHERE id=9;
UPDATE technical_works SET title='Desarrollo de Versología: base de datos y herramientas de análisis métrico',
 modality='technical_project_work',
 contribution_es='Responsable del desarrollo de Versología y de la coordinación de su base de datos. La plataforma permite describir, visualizar y comparar la organización métrica del teatro en verso y su relación con la estructura dramática.',
 contribution_en='Responsible for developing Versología and coordinating its database. The platform supports description, visualisation and comparison of the metrical organisation of verse drama and its relationship to dramatic structure.'
WHERE id=10;

-- Preserva funciones que pudieran haberse añadido a otras entradas antes de quitar el campo.
UPDATE technical_works SET contribution_es=CASE
 WHEN trim(coalesce(contribution_es,''))='' THEN responsibility
 ELSE contribution_es || char(10) || char(10) || responsibility END
WHERE id NOT IN (7,8,9,10) AND trim(coalesce(responsibility,''))<>''
 AND instr(lower(coalesce(contribution_es,'')),lower(responsibility))=0;
ALTER TABLE technical_works DROP COLUMN responsibility;
