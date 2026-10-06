UPDATE type_vocab
SET label_es='Proyectos Propios de Investigación (UNIR)',
    label_en='Internal Research Projects (UNIR)'
WHERE domain='project_programme' AND code='unir_research';

UPDATE type_vocab
SET label_es='INCENTIVA (UNIR)', label_en='INCENTIVA (UNIR)'
WHERE domain='project_programme' AND code='unir_transfer';
