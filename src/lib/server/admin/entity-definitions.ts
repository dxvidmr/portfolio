export const entityDefinitions = {
	projects: 'Proyectos',
	publications: 'Publicaciones',
	academic_works: 'Trabajos académicos',
	academic_events: 'Eventos académicos',
	teaching: 'Docencia',
	service_activities: 'Actividades de servicio',
	funding_awards: 'Financiación y premios',
	research_stays: 'Estancias de investigación',
	courses: 'Cursos',
	education: 'Formación',
	memberships: 'Asociaciones',
	skills: 'Competencias',
	languages: 'Idiomas'
} as const;

export type EntityType = keyof typeof entityDefinitions;

export const entityTypes = Object.keys(entityDefinitions) as EntityType[];

export const isEntityType = (value: string): value is EntityType =>
	Object.hasOwn(entityDefinitions, value);

export const entityTypeOptions = entityTypes.map((value) => ({
	value,
	label: entityDefinitions[value]
}));

