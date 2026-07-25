-- 028: actualiza las descripciones bilingües de las fichas del portfolio.

UPDATE portfolio_projects
SET
  summary_es = 'Una investigación sobre cómo <i>Fuenteovejuna</i> llegó a ser un clásico, articulada a través de un modelo de datos, una edición digital, un archivo documental y una plataforma de divulgación y participación pública.',
  summary_en = 'Research into how <i>Fuenteovejuna</i> became a classic, articulated through a data model, a digital edition, a documentary archive, and a platform for public engagement and participation.'
WHERE slug = 'todos-a-una';

UPDATE portfolio_projects
SET
  summary_es = 'Desarrollo de una base de datos y herramientas digitales para describir, visualizar y comparar la organización métrica del teatro en verso y su relación con la estructura dramática.',
  summary_en = 'Development of a database and digital tools for describing, visualising, and comparing the metrical organisation of verse drama and its relationship to dramatic structure.'
WHERE slug = 'versologia-metadrama';

UPDATE portfolio_projects
SET
  summary_es = 'Rediseño y reconstrucción técnica del portal web y la base de datos de ETSO para facilitar la consulta, la búsqueda y la actualización del corpus más grande de teatro del Siglo de Oro.',
  summary_en = 'Redesign and technical reconstruction of the ETSO website and database to facilitate access to, searching, and updating the largest corpus of Spanish Golden Age theatre.'
WHERE slug = 'etso-plataforma-web';

UPDATE portfolio_projects
SET
  summary_es = 'Investigación, creación de recursos abiertos y aplicaciones docentes alrededor del análisis de redes sociales aplicado al teatro y sus personajes.',
  summary_en = 'Research, open-resource development, and teaching applications of social network analysis to theatre and its characters.'
WHERE slug = 'redes-personajes-teatrales';

UPDATE portfolio_projects
SET
  summary_es = 'Desarrollo de herramientas, ediciones y corpus que conectan la edición filológica con la publicación web sostenible, el análisis computacional y la reutilización de textos y datos.',
  summary_en = 'Development of tools, editions, and corpora connecting scholarly editing with sustainable web publishing, computational analysis, and the reuse of texts and data.'
WHERE slug = 'edicion-digital-corpus';

UPDATE portfolio_projects
SET
  summary_es = 'Interpretación y creación escénica como investigación, concebidas como formas de conocimiento en sí mismas, con especial atención al teatro clásico.',
  summary_en = 'Acting and stage creation as research, conceived as forms of knowledge in themselves, with particular attention to classical theatre.'
WHERE slug = 'documento-escena';
