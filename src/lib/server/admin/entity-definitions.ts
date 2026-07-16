export const entityDefinitions = {
	projects: 'Proyectos',
	publications: 'Publicaciones',
	academic_works: 'Trabajos académicos',
	talks: 'Contribuciones a eventos',
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

// ── Definiciones de formulario (plan §10): allowlist central de columnas ──────
// Los nombres de tabla y columna salen SIEMPRE de aquí, nunca del navegador.

export type VocabDomain =
	| 'publication_type'
	| 'contribution_type'
	| 'teaching_type'
	| 'activity_type'
	| 'award_type'
	| 'project_type'
	| 'work_type'
	| 'project_role'
	| 'service_role';

export type FkEntity = 'projects' | 'talks' | 'education' | 'events';

export type FieldKind =
	| 'text'
	| 'textarea'
	| 'integer'
	| 'real'
	| 'date'
	| 'boolean'
	| 'url'
	| 'vocab'
	| 'fk';

export interface FieldDef {
	name: string;
	label: string;
	kind: FieldKind;
	required?: boolean;
	vocabDomain?: VocabDomain;
	fkEntity?: FkEntity;
	help?: string;
	isPrivate?: boolean;
}

export interface EntityFormDef {
	fields: FieldDef[];
}

const f = (
	name: string,
	label: string,
	kind: FieldKind = 'text',
	extra: Partial<FieldDef> = {}
): FieldDef => ({ name, label, kind, ...extra });

export const entityForms = {
	publications: {
		fields: [
			f('title', 'Título', 'text', { required: true }),
			f('publication_type', 'Tipo de publicación', 'vocab', {
				required: true,
				vocabDomain: 'publication_type'
			}),
			f('authors_text', 'Autores', 'text', { required: true, help: 'Tal como deben citarse' }),
			f('editors_text', 'Editores', 'text'),
			f('journal_title', 'Revista', 'text'),
			f('book_title', 'Libro (para capítulos)', 'text'),
			f('publisher', 'Editorial', 'text'),
			f('year', 'Año', 'integer'),
			f('volume', 'Volumen', 'text'),
			f('issue', 'Número', 'text'),
			f('pages', 'Páginas', 'text'),
			f('doi', 'DOI', 'text'),
			f('isbn', 'ISBN', 'text'),
			f('issn', 'ISSN', 'text'),
			f('abstract', 'Resumen', 'textarea'),
			f('bibtex_override', 'BibTeX manual', 'textarea', { help: 'Solo si la cita automática no basta' }),
			f('event_id', 'Comunicación de origen', 'fk', {
				fkEntity: 'talks',
				help: 'Contribución a evento de la que deriva esta publicación'
			}),
			f('project_id', 'Proyecto de investigación', 'fk', { fkEntity: 'projects' }),
			f('url', 'URL', 'url')
		]
	},
	talks: {
		// Los datos del evento (nombre, fechas, lugar, modalidad) viven en la
		// ficha canónica `events`; las fechas de abajo pertenecen a la
		// contribución concreta y pueden diferir de la duración del evento.
		fields: [
			f('title', 'Título de la contribución', 'text', { required: true }),
			f('canonical_event_id', 'Evento', 'fk', {
				required: true,
				fkEntity: 'events',
				help: 'Nombre, fechas y lugar se toman de la ficha del evento'
			}),
			f('contribution_type', 'Tipo de contribución', 'vocab', {
				required: true,
				vocabDomain: 'contribution_type'
			}),
			f('authors_text', 'Autores', 'text', { required: true }),
			f('date_start', 'Fecha de la contribución', 'date', {
				help: 'Puede ser un día exacto aunque el evento dure varios días'
			}),
			f('date_end', 'Fin de la contribución', 'date', {
				help: 'Déjala vacía si tuvo lugar en un solo día'
			}),
			f('role', 'Rol', 'text', {
				help: 'Solo si tu papel no es el implícito del tipo (p. ej. conferencia invitada)'
			}),
			f('doi', 'DOI', 'text'),
			f('project_id', 'Proyecto de investigación', 'fk', { fkEntity: 'projects' }),
			f('url', 'URL', 'url')
		]
	},
	teaching: {
		fields: [
			f('teaching_type', 'Tipo de docencia', 'vocab', {
				required: true,
				vocabDomain: 'teaching_type'
			}),
			f('title', 'Título', 'text', { required: true }),
			f('institution', 'Institución', 'text', { required: true }),
			f('course_code', 'Código de asignatura', 'text'),
			f('degree_program', 'Titulación', 'text'),
			f('ects', 'ECTS', 'real'),
			f('academic_year', 'Curso académico', 'text', { help: 'Formato 2024-2025' }),
			f('hours', 'Horas', 'integer'),
			f('project_id', 'Proyecto de investigación', 'fk', { fkEntity: 'projects' }),
			f('description', 'Descripción', 'textarea'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('url', 'URL', 'url')
		]
	},
	projects: {
		fields: [
			f('title', 'Título', 'text', { required: true }),
			f('acronym', 'Acrónimo', 'text'),
			f('project_code', 'Código del proyecto', 'text'),
			f('project_type', 'Tipo de proyecto', 'vocab', { vocabDomain: 'project_type' }),
			f('role', 'Mi rol en el proyecto', 'vocab', { vocabDomain: 'project_role' }),
			f('institution', 'Institución', 'text'),
			f('research_group', 'Grupo de investigación', 'text'),
			f('funding_body', 'Entidad financiadora', 'text'),
			f('principal_investigators_text', 'Investigadores principales', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('amount', 'Importe', 'real'),
			f('currency', 'Moneda', 'text', { help: 'EUR, USD…' }),
			f('description_short_es', 'Descripción breve (ES)', 'textarea'),
			f('description_short_en', 'Descripción breve (EN)', 'textarea'),
			f('slug', 'Slug', 'text', { help: 'Identificador único en URL; sin espacios' }),
			f('url', 'URL', 'url')
		]
	},
	education: {
		fields: [
			f('degree_title', 'Titulación', 'text', { required: true }),
			f('institution', 'Institución', 'text', { required: true }),
			f('department', 'Departamento', 'text'),
			f('country', 'País', 'text'),
			f('thesis_directors_text', 'Dirección de tesis', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date', {
				help: 'Déjala vacía si la formación continúa'
			}),
			f('url', 'URL', 'url'),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true })
		]
	},
	research_stays: {
		fields: [
			f('institution', 'Institución', 'text', { required: true }),
			f('faculty_or_dept', 'Facultad o departamento', 'text'),
			f('supervisor', 'Supervisión', 'text'),
			f('city', 'Ciudad', 'text'),
			f('country', 'País', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('funding_text', 'Financiación', 'text'),
			f('url', 'URL', 'url'),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true })
		]
	},
	funding_awards: {
		fields: [
			f('title', 'Título', 'text', { required: true }),
			f('award_type', 'Tipo', 'vocab', { vocabDomain: 'award_type' }),
			f('awarding_body', 'Entidad concedente', 'text'),
			f('amount', 'Importe', 'real'),
			f('currency', 'Moneda', 'text'),
			f('year', 'Año', 'integer'),
			f('related_context', 'Contexto', 'text'),
			f('project_id', 'Proyecto de investigación', 'fk', { fkEntity: 'projects' }),
			f('url', 'URL', 'url'),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true })
		]
	},
	service_activities: {
		fields: [
			f('activity_type', 'Tipo de actividad', 'vocab', {
				required: true,
				vocabDomain: 'activity_type'
			}),
			f('title', 'Título', 'text', { required: true }),
			f('canonical_event_id', 'Evento relacionado', 'fk', {
				fkEntity: 'events',
				help: 'Úsalo para organización o evaluación de un evento concreto'
			}),
			f('role', 'Mi rol', 'vocab', { vocabDomain: 'service_role' }),
			f('venue_or_journal', 'Revista o entidad', 'text', {
				help: 'Para servicios sin evento: revista, editorial u organización para la que se hace el servicio'
			}),
			f('related_entity', 'Obra o recurso relacionado', 'text', {
				help: 'Volumen, artículo o recurso concreto al que se refiere el servicio (p. ej. una revisión)'
			}),
			f('city', 'Ciudad', 'text'),
			f('country', 'País', 'text'),
			f('date_start', 'Fecha de inicio de la actividad', 'date'),
			f('date_end', 'Fecha de fin de la actividad', 'date', {
				help: 'Déjala vacía si la actividad continúa'
			}),
			f('description', 'Descripción', 'textarea'),
			f('url', 'URL', 'url')
		]
	},
	academic_works: {
		fields: [
			f('title', 'Título', 'text', { required: true }),
			f('work_type', 'Tipo de trabajo', 'vocab', { required: true, vocabDomain: 'work_type' }),
			f('institution', 'Institución', 'text', { required: true }),
			f('program', 'Programa', 'text', {
				help: 'Texto tal como debe citarse; la relación real con Formación es el selector de abajo'
			}),
			f('education_id', 'Titulación relacionada', 'fk', {
				fkEntity: 'education',
				help: 'Titulación del apartado Formación en la que se realizó este trabajo'
			}),
			f('year', 'Año', 'integer'),
			f('url', 'URL', 'url')
		]
	},
	courses: {
		fields: [
			f('title', 'Título', 'text', { required: true }),
			f('institution', 'Institución', 'text', { required: true }),
			f('program_context', 'Contexto del programa', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('hours', 'Horas', 'integer'),
			f('url', 'URL', 'url'),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true })
		]
	},
	memberships: {
		fields: [
			f('organization', 'Organización', 'text', { required: true }),
			f('role', 'Rol', 'text', { help: 'Texto libre; admite matices y periodos' }),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date', {
				help: 'Déjala vacía si la pertenencia continúa'
			}),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true })
		]
	},
	skills: {
		fields: [
			f('category', 'Categoría', 'text', { required: true }),
			f('items_text', 'Elementos', 'textarea', { required: true }),
			f('sort_order', 'Orden en el CV', 'integer')
		]
	},
	languages: {
		fields: [
			f('language', 'Idioma', 'text', { required: true }),
			f('level', 'Nivel', 'text', { help: 'B2, C1, nativo…' }),
			f('is_native', 'Lengua materna', 'boolean')
		]
	}
} satisfies Partial<Record<EntityType, EntityFormDef>>;

export type FormEntityType = keyof typeof entityForms;

export const isFormEntityType = (value: string): value is FormEntityType =>
	Object.hasOwn(entityForms, value);

export const formEntityTypeOptions = (Object.keys(entityForms) as FormEntityType[]).map(
	(value) => ({ value, label: entityDefinitions[value] })
);
