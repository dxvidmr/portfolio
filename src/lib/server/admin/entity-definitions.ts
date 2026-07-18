export const entityDefinitions = {
	projects: 'Proyectos',
	publications: 'Publicaciones',
	academic_works: 'Trabajos académicos',
	talks: 'Comunicaciones',
	teaching: 'Docencia',
	service_activities: 'Actividades de servicio',
	funding_awards: 'Financiación y premios',
	research_stays: 'Estancias de investigación',
	courses: 'Cursos',
	education: 'Formación',
	memberships: 'Asociaciones científicas',
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
	| 'publication_role'
	| 'publication_container_type'
	| 'conference_publication_format'
	| 'publication_review_status'
	| 'contribution_type'
	| 'contribution_selection'
	| 'session_format'
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
	showWhen?: {
		all?: Array<{ field: string; values?: string[]; notValues?: string[] }>;
		any?: Array<{ field: string; values?: string[]; notValues?: string[] }>;
	};
	wide?: boolean;
	advanced?: boolean;
	persist?: boolean;
}

export interface FieldGroupDef {
	id: string;
	title: string;
	description?: string;
	advancedLabel?: string;
	fields: string[];
}

export interface EntityFormDef {
	fields: FieldDef[];
	groups?: FieldGroupDef[];
}

const f = (
	name: string,
	label: string,
	kind: FieldKind = 'text',
	extra: Partial<FieldDef> = {}
): FieldDef => ({ name, label, kind, ...extra });

export const entityForms = {
	publications: {
		groups: [
			{
				id: 'publication-main',
				title: 'Datos principales',
				description: 'Identifica la publicación y tu responsabilidad bibliográfica.',
				fields: ['title', 'publication_type', 'my_role']
			},
			{
				id: 'publication-authorship',
				title: 'Autoría y edición',
				description: 'Registra las menciones de responsabilidad tal como deben aparecer en la cita.',
				fields: ['authors_text', 'editors_text']
			},
			{
				id: 'publication-container',
				title: 'Publicación y contenedor',
				description: 'Los campos se adaptan al tipo de publicación y al lugar donde se publicó.',
				fields: [
					'container_type',
					'journal_title',
					'book_title',
					'publisher',
					'year',
					'volume',
					'issue',
					'pages',
					'conference_publication_format',
					'review_status',
					'event_id'
				]
			},
			{
				id: 'publication-identifiers',
				title: 'Identificadores y acceso',
				description: 'Añade solo los identificadores que correspondan a esta publicación o a su contenedor.',
				fields: ['doi', 'isbn', 'issn', 'url']
			},
			{
				id: 'publication-context',
				title: 'Contenido y relaciones',
				description: 'Información complementaria para describir y conectar la publicación.',
				fields: ['project_id', 'abstract', 'bibtex_override']
			}
		],
		fields: [
			f('title', 'Título', 'text', { required: true, wide: true }),
			f('publication_type', 'Tipo de publicación', 'vocab', {
				required: true,
				vocabDomain: 'publication_type'
			}),
			f('my_role', 'Mi responsabilidad', 'vocab', {
				required: true,
				vocabDomain: 'publication_role'
			}),
			f('authors_text', 'Autores', 'text', {
				help: 'Tal como deben citarse; déjalo vacío si editas la obra',
				wide: true
			}),
			f('editors_text', 'Editores', 'text', {
				help: 'Tal como deben citarse; obligatorio si editas o coeditas la obra',
				wide: true,
				showWhen: {
					any: [
						{ field: 'my_role', values: ['publication_editor', 'publication_coeditor'] },
						{
							field: 'container_type',
							values: [
								'container_edited_book',
								'container_conference_proceedings',
								'container_book_of_abstracts',
								'container_reference_work'
							]
						}
					]
				}
			}),
			f('container_type', 'Tipo de contenedor', 'vocab', {
				vocabDomain: 'publication_container_type',
				help: 'Dónde aparece la publicación: revista, volumen colectivo, actas o libro de resúmenes'
			}),
			f('conference_publication_format', 'Subtipo de artículo en congreso', 'vocab', {
				vocabDomain: 'conference_publication_format',
				help: 'Solo si el artículo se publica expresamente como short paper o full paper',
				showWhen: {
					all: [
						{
							field: 'container_type',
							values: ['container_conference_proceedings', 'container_book_of_abstracts']
						},
						{ field: 'publication_type', values: ['publication_article'] }
					]
				}
			}),
			f('review_status', 'Evaluación editorial', 'vocab', {
				vocabDomain: 'publication_review_status',
				help: 'Solo si consta el proceso de evaluación; vacío significa que no se ha documentado',
				showWhen: {
					any: [
						{
							field: 'container_type',
							values: ['container_journal_issue', 'container_conference_proceedings', 'container_book_of_abstracts']
						}
					]
				}
			}),
			f('journal_title', 'Revista', 'text', {
				wide: true,
				showWhen: { all: [{ field: 'container_type', values: ['container_journal_issue'] }] }
			}),
			f('book_title', 'Título del contenedor', 'text', {
				wide: true,
				showWhen: {
					all: [
						{
							field: 'container_type',
							values: [
								'container_edited_book',
								'container_conference_proceedings',
								'container_book_of_abstracts',
								'container_reference_work'
							]
						}
					]
				}
			}),
			f('publisher', 'Editorial', 'text', {
				showWhen: {
					any: [
						{
							field: 'publication_type',
							values: [
								'publication_book',
								'publication_critical_edition',
								'publication_digital_edition',
								'publication_translation'
							]
						},
						{
							field: 'container_type',
							values: [
								'container_edited_book',
								'container_conference_proceedings',
								'container_book_of_abstracts',
								'container_reference_work'
							]
						}
					]
				}
			}),
			f('year', 'Año', 'integer'),
			f('volume', 'Volumen', 'text', {
				showWhen: { all: [{ field: 'container_type', values: ['container_journal_issue'] }] }
			}),
			f('issue', 'Número', 'text', {
				showWhen: { all: [{ field: 'container_type', values: ['container_journal_issue'] }] }
			}),
			f('pages', 'Páginas', 'text', {
				showWhen: {
					any: [
						{
							field: 'publication_type',
							values: [
								'publication_article',
								'publication_chapter',
								'publication_abstract',
								'publication_review',
								'publication_reference_entry',
								'publication_front_matter'
							]
						},
						{
							field: 'container_type',
							values: [
								'container_journal_issue',
								'container_edited_book',
								'container_conference_proceedings',
								'container_book_of_abstracts',
								'container_reference_work'
							]
						}
					]
				}
			}),
			f('doi', 'DOI', 'text'),
			f('isbn', 'ISBN', 'text', {
				showWhen: {
					any: [
						{
							field: 'publication_type',
							values: [
								'publication_book',
								'publication_critical_edition',
								'publication_digital_edition',
								'publication_translation'
							]
						},
						{
							field: 'container_type',
							values: [
								'container_edited_book',
								'container_conference_proceedings',
								'container_book_of_abstracts',
								'container_reference_work'
							]
						}
					]
				}
			}),
			f('issn', 'ISSN', 'text', {
				showWhen: { all: [{ field: 'container_type', values: ['container_journal_issue'] }] }
			}),
			f('abstract', 'Resumen', 'textarea'),
			f('bibtex_override', 'BibTeX manual', 'textarea', {
				help: 'Solo si la cita automática no basta',
				advanced: true
			}),
			f('event_id', 'Comunicación de origen', 'fk', {
				fkEntity: 'talks',
				help: 'Contribución a evento de la que deriva esta publicación',
				showWhen: {
					all: [
						{
							field: 'container_type',
							values: ['container_conference_proceedings', 'container_book_of_abstracts']
						}
					]
				}
			}),
			f('project_id', 'Proyecto de investigación', 'fk', { fkEntity: 'projects' }),
			f('url', 'URL', 'url', { wide: true })
		]
	},
	talks: {
		// Los datos del evento (nombre, fechas, lugar, modalidad) viven en la
		// ficha canónica `events`; las fechas de abajo pertenecen a la
		// comunicación concreta y pueden diferir de la duración del evento.
		groups: [
			{
				id: 'talk-main',
				title: 'Datos principales',
				description: 'Identifica la comunicación y su autoría.',
				fields: ['title', 'contribution_type', 'authors_text']
			},
			{
				id: 'talk-event',
				title: 'Evento y acceso',
				description: 'La fecha se hereda del evento. Precísala solo si la comunicación ocurrió en un día o intervalo más concreto.',
				advancedLabel: 'Fecha (avanzado)',
				fields: [
					'canonical_event_id',
					'selection_mode',
					'date_override',
					'date_range_enabled',
					'date_end_override'
				]
			},
			{
				id: 'talk-session',
				title: 'Sesión',
				description: 'Solo para comunicaciones integradas en una sesión colectiva.',
				fields: ['session_format', 'session_title']
			},
			{
				id: 'talk-relations',
				title: 'Relaciones e identificadores',
				description: 'Conecta la comunicación con un proyecto y añade sus destinos públicos.',
				fields: ['project_id', 'doi', 'url']
			}
		],
		fields: [
			f('title', 'Título de la comunicación', 'text', { required: true, wide: true }),
			f('canonical_event_id', 'Evento', 'fk', {
				required: true,
				fkEntity: 'events',
				help: 'Nombre, fechas y lugar se heredan de la ficha del evento.',
				wide: true
			}),
			f('contribution_type', 'Tipo de comunicación', 'vocab', {
				required: true,
				vocabDomain: 'contribution_type'
			}),
			f('authors_text', 'Autores', 'text', { required: true, wide: true }),
			f('selection_mode', 'Vía de acceso', 'vocab', {
				vocabDomain: 'contribution_selection',
				help: 'Invitación o convocatoria abierta (CfP); las ponencias son siempre invitadas',
				showWhen: { all: [{ field: 'contribution_type', notValues: ['contribution_lecture'] }] }
			}),
			f('session_format', 'Formato de sesión', 'vocab', {
				vocabDomain: 'session_format',
				help: 'Solo si la comunicación forma parte de un panel',
				showWhen: {
					all: [{ field: 'contribution_type', values: ['contribution_communication'] }]
				}
			}),
			f('session_title', 'Título de la sesión', 'text', {
				help: 'Identifica el panel si reúne varias comunicaciones',
				wide: true,
				showWhen: { all: [{ field: 'session_format', values: ['session_panel'] }] }
			}),
			f('date_override', 'Día de la comunicación', 'date', {
				help: 'Día concreto dentro del evento.',
				advanced: true
			}),
			f('date_range_enabled', '¿La comunicación duró más de un día?', 'boolean', {
				advanced: true,
				persist: false,
				showWhen: { all: [{ field: 'date_override', notValues: [''] }] }
			}),
			f('date_end_override', 'Último día', 'date', {
				help: 'Debe ser posterior al día inicial.',
				advanced: true,
				showWhen: { all: [{ field: 'date_range_enabled', values: ['1'] }] }
			}),
			f('doi', 'DOI', 'text'),
			f('project_id', 'Proyecto de investigación', 'fk', {
				fkEntity: 'projects',
				help: 'Relación opcional con el proyecto del que forma parte la comunicación',
				wide: true
			}),
			f('url', 'URL', 'url', { wide: true })
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
