// Tipos de mérito que pueden vincularse a una ficha del portfolio. Los proyectos se cuentan en el
// relato de la ficha, y la formación, los idiomas o las competencias no son resultados de una ficha
// (las competencias se vinculan aparte, como métodos).
export const PORTFOLIO_ENTRY_TYPES = [
	'publications',
	'talks',
	'technical_works',
	'teaching',
	'academic_works',
	'service_activities'
] as const;

export const canLinkToPortfolio = (entityType: string) =>
	(PORTFOLIO_ENTRY_TYPES as readonly string[]).includes(entityType);
