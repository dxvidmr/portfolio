export const entityDefinitions = {
	projects: 'Proyectos',
	technical_works: 'Trabajos técnicos y profesionales',
	publications: 'Publicaciones',
	academic_works: 'Trabajos académicos',
	talks: 'Comunicaciones',
	event_attendance: 'Asistencias a eventos',
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
	| 'project_programme'
	| 'project_nature'
	| 'technical_work_type'
	| 'technical_modality'
	| 'work_type'
	| 'project_role'
	| 'service_role'
	| 'attendance_role'
	| 'event_modality'
	| 'language'
	| 'language_level'
	| 'membership_role'
	| 'skill_area';

export type FkEntity = 'projects' | 'talks' | 'education' | 'events' | 'skill_resources' | 'skill_evidence' | 'skill_portfolio';

export type FieldKind =
	| 'text'
	| 'textarea'
	| 'integer'
	| 'real'
	| 'date'
	| 'boolean'
	| 'url'
	| 'vocab'
	| 'choice'
	| 'fk'
	| 'fk_multi'
	| 'location';

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
	hidden?: boolean;
	choices?: Array<{ value: string; label: string }>;
	optionConditions?: Record<string, { field: string; values: string[] }>;
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
				fields: ['title', 'publication_type', 'my_role']
			},
			{
				id: 'publication-authorship',
				title: 'Autoría y edición',
				fields: ['authors_text', 'editors_text']
			},
			{
				id: 'publication-container',
				title: 'Publicación y contenedor',
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
				fields: ['doi', 'isbn', 'issn', 'url']
			},
			{
				id: 'publication-context',
				title: 'Contenido y relaciones',
				advancedLabel: 'Resumen y BibTeX',
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
			f('abstract', 'Resumen', 'textarea', { advanced: true }),
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
			f('url', 'Enlace principal', 'url', { wide: true })
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
				fields: ['title', 'contribution_type', 'authors_text']
			},
			{
				id: 'talk-event',
				title: 'Evento y acceso',
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
				fields: ['session_format', 'session_title']
			},
			{
				id: 'talk-relations',
				title: 'Relaciones e identificadores',
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
			f('url', 'Enlace principal', 'url', { wide: true })
		]
	},
	teaching: {
		groups: [
			{ id: 'teaching-main', title: 'Docencia', fields: ['teaching_type', 'title', 'institution'] },
			{
				id: 'teaching-details',
				title: 'Datos docentes',
				fields: ['course_code', 'degree_program', 'ects', 'hours', 'academic_year']
			},
			{
				id: 'teaching-context',
				title: 'Fechas y contexto',
				fields: ['date_start', 'date_end', 'project_id', 'description', 'url']
			}
		],
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
			f('description', 'Descripción', 'textarea', { advanced: true }),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('url', 'Enlace principal', 'url', { wide: true })
		]
	},
	projects: {
		groups: [
			{
				id: 'project-main',
				title: 'Proyecto',
				fields: ['title', 'acronym', 'project_code', 'nature', 'programme_code', 'role']
			},
			{
				id: 'project-team',
				title: 'Instituciones y equipo',
				fields: ['institution', 'research_group', 'principal_investigators_text']
			},
			{
				id: 'project-period',
				title: 'Periodo y financiación',
				fields: ['date_start', 'date_end', 'funding_body', 'amount', 'currency']
			},
			{
				id: 'project-public',
				title: 'Presentación',
				fields: ['description_short_es', 'description_short_en', 'contribution_es', 'contribution_en', 'url']
			}
		],
		fields: [
			f('title', 'Título', 'text', { required: true, wide: true }),
			f('acronym', 'Acrónimo', 'text'),
			f('project_code', 'Código del proyecto', 'text'),
			f('nature', 'Naturaleza del proyecto', 'vocab', { vocabDomain: 'project_nature', help: 'Finalidad del proyecto, independiente de su convocatoria.' }),
			f('programme_code', 'Programa o convocatoria', 'vocab', { vocabDomain: 'project_programme' }),
			f('role', 'Mi participación académica', 'vocab', { vocabDomain: 'project_role',
				help: 'Las categorías de equipo de investigación y equipo de trabajo son específicas de Generación de Conocimiento.',
				optionConditions: {
					research_team_member: { field: 'programme_code', values: ['generation_knowledge'] },
					working_team_member: { field: 'programme_code', values: ['generation_knowledge'] }
				} }),
			f('institution', 'Institución', 'text'),
			f('research_group', 'Grupo de investigación', 'text'),
			f('funding_body', 'Entidad financiadora', 'text'),
			f('principal_investigators_text', 'Investigadores principales', 'text', { wide: true }),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('amount', 'Importe', 'real'),
			f('currency', 'Moneda', 'text', { help: 'EUR, USD…' }),
			f('description_short_es', 'Descripción breve (ES)', 'textarea'),
			f('description_short_en', 'Descripción breve (EN)', 'textarea', { advanced: true }),
			f('contribution_es', 'Mi aportación (ES)', 'textarea', { help: 'Tu trabajo y resultados. Los CV heredan este texto salvo que elijas adaptarlo u ocultarlo.' }),
			f('contribution_en', 'Mi aportación (EN)', 'textarea', { advanced: true }),
			f('url', 'Enlace del proyecto', 'url', { wide: true })
		]
	},
	technical_works: {
		groups: [
			{ id: 'technical-main', title: 'Trabajo técnico o profesional', fields: ['title', 'work_type', 'modality', 'date_start', 'date_end', 'recipient'] },
			{ id: 'technical-context', title: 'Contexto del trabajo', description: 'Vincula los proyectos en los que participas académicamente. Un trabajo puede continuar en varias convocatorias. Para encargos externos, describe el contexto sin vincular proyectos.', fields: ['context_mode', 'project_ids', 'context_name', 'context_code', 'context_programme', 'context_funding_body', 'context_institution', 'context_responsibles'] },
			{ id: 'technical-contribution', title: 'Mi aportación y resultados', fields: ['contribution_es', 'contribution_en', 'url', 'notes_private'] }
		],
		fields: [
			f('title', 'Título del trabajo', 'text', { required: true, wide: true }),
			f('work_type', 'Tipo de trabajo', 'vocab', { vocabDomain: 'technical_work_type' }),
			f('modality', 'Modalidad de participación', 'vocab', { required: true, vocabDomain: 'technical_modality' }),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('recipient', 'Destinatario o entidad contratante', 'text', { help: 'Opcional, también para iniciativas propias.', wide: true }),
			f('context_mode', 'Relación con un proyecto', 'choice', { persist: false, choices: [
				{ value: 'external', label: 'Sin vinculación académica: contexto opcional' },
				{ value: 'project', label: 'Trabajo dentro de un proyecto en el que participo' }
			] }),
			f('project_id', 'Proyecto de compatibilidad', 'fk', { fkEntity: 'projects', hidden: true }),
			f('project_ids', 'Proyectos en los que participo', 'fk_multi', { fkEntity: 'projects', persist: false, wide: true, showWhen: { all: [{ field: 'context_mode', values: ['project'] }] }, help: 'Selecciona uno o varios. Sus datos se heredan de los registros originales, sin duplicarlos.' }),
			...([
				['context_name', 'Proyecto o iniciativa destinataria'], ['context_code', 'Código del proyecto de contexto'],
				['context_programme', 'Programa, convocatoria o beca de contexto'], ['context_funding_body', 'Financiación del contexto'],
				['context_institution', 'Institución del contexto'], ['context_responsibles', 'Responsables del contexto']
			] as const).map(([name, label]) => f(name, label, 'text', { wide: true, showWhen: { all: [{ field: 'context_mode', notValues: ['project'] }] } })),
			f('contribution_es', 'Mi aportación y resultados (ES)', 'textarea', { help: 'Texto base para la web y los CV. Cada CV puede abreviarlo, reemplazarlo u ocultarlo.' }),
			f('contribution_en', 'Mi aportación y resultados (EN)', 'textarea', { advanced: true }),
			f('url', 'Enlace principal', 'url', { wide: true }),
			f('notes_private', 'Notas privadas', 'textarea', { isPrivate: true, advanced: true })
		]
	},
	education: {
		groups: [
			{
				id: 'education-main',
				title: 'Formación',
				fields: ['degree_title', 'institution', 'department', 'country']
			},
			{
				id: 'education-period',
				title: 'Periodo y detalles',
				fields: ['date_start', 'date_end', 'thesis_directors_text', 'url', 'notes_private']
			}
		],
		fields: [
			f('degree_title', 'Titulación', 'text', { required: true, wide: true }),
			f('institution', 'Institución', 'text', { required: true }),
			f('department', 'Departamento', 'text'),
			f('country', 'País', 'text'),
			f('thesis_directors_text', 'Dirección de tesis', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date', {
				help: 'Déjala vacía si la formación continúa'
			}),
			f('url', 'Enlace principal', 'url', { wide: true }),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				advanced: true
			})
		]
	},
	research_stays: {
		groups: [
			{
				id: 'stay-main',
				title: 'Estancia',
				fields: ['institution', 'faculty_or_dept', 'supervisor']
			},
			{
				id: 'stay-place',
				title: 'Lugar y periodo',
				fields: ['location', 'date_start', 'date_end']
			},
			{ id: 'stay-more', title: 'Información adicional', fields: ['url', 'notes_private'] }
		],
		fields: [
			f('institution', 'Institución', 'text', { required: true, wide: true }),
			f('faculty_or_dept', 'Facultad o departamento', 'text'),
			f('supervisor', 'Supervisión', 'text'),
			f('location', 'Localización', 'location', { persist: false, wide: true }),
			f('city', 'Ciudad', 'text', { hidden: true }),
			f('country', 'País', 'text', { hidden: true }),
			f('country_code', 'Código de país', 'text', { hidden: true }),
			f('geoname_id', 'GeoName ID', 'integer', { hidden: true }),
			f('latitude', 'Latitud', 'real', { hidden: true }),
			f('longitude', 'Longitud', 'real', { hidden: true }),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('url', 'Enlace principal', 'url', { wide: true }),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				advanced: true
			})
		]
	},
	funding_awards: {
		groups: [
			{
				id: 'funding-main',
				title: 'Financiación o premio',
				fields: ['title', 'award_type', 'awarding_body', 'year']
			},
			{
				id: 'funding-details',
				title: 'Detalles',
				fields: ['amount', 'currency', 'related_context', 'url', 'notes_private']
			}
		],
		fields: [
			f('title', 'Título', 'text', { required: true, wide: true }),
			f('award_type', 'Tipo', 'vocab', { vocabDomain: 'award_type' }),
			f('awarding_body', 'Entidad concedente', 'text'),
			f('amount', 'Importe', 'real'),
			f('currency', 'Moneda', 'text'),
			f('year', 'Año', 'integer'),
			f('related_context', 'Contexto', 'text'),
			f('url', 'Enlace principal', 'url', { wide: true }),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				advanced: true
			})
		]
	},
	service_activities: {
		groups: [
			{
				id: 'service-main',
				title: 'Servicio',
				fields: ['activity_type', 'title', 'role', 'canonical_event_id']
			},
			{
				id: 'service-context',
				title: 'Contexto',
				fields: ['venue_or_journal', 'related_entity', 'location']
			},
			{
				id: 'service-period',
				title: 'Periodo e información adicional',
				fields: ['date_start', 'date_end', 'description', 'url']
			}
		],
		fields: [
			f('activity_type', 'Tipo de actividad', 'vocab', {
				required: true,
				vocabDomain: 'activity_type'
			}),
			f('title', 'Título', 'text', { required: true, wide: true }),
			f('canonical_event_id', 'Evento relacionado', 'fk', {
				fkEntity: 'events',
				help: 'Úsalo para organización o evaluación de un evento concreto'
			}),
			f('role', 'Mi rol', 'vocab', { vocabDomain: 'service_role' }),
			f('venue_or_journal', 'Revista o entidad', 'text', {
				showWhen: { all: [{ field: 'canonical_event_id', values: [''] }] }
			}),
			f('related_entity', 'Obra o recurso relacionado', 'text', {
				showWhen: { all: [{ field: 'canonical_event_id', values: [''] }] }
			}),
			f('location', 'Localización', 'location', {
				persist: false,
				wide: true,
				showWhen: { all: [{ field: 'canonical_event_id', values: [''] }] }
			}),
			f('city', 'Ciudad', 'text', { hidden: true }),
			f('country', 'País', 'text', { hidden: true }),
			f('country_code', 'Código de país', 'text', { hidden: true }),
			f('geoname_id', 'GeoName ID', 'integer', { hidden: true }),
			f('latitude', 'Latitud', 'real', { hidden: true }),
			f('longitude', 'Longitud', 'real', { hidden: true }),
			f('date_start', 'Fecha de inicio de la actividad', 'date'),
			f('date_end', 'Fecha de fin de la actividad', 'date', {
				help: 'Déjala vacía si la actividad continúa'
			}),
			f('description', 'Descripción', 'textarea', { advanced: true }),
			f('url', 'Enlace principal', 'url', { wide: true })
		]
	},
	event_attendance: {
		groups: [
			{
				id: 'attendance-event',
				title: 'Evento',
				description: 'La asistencia siempre depende de un evento creado previamente.',
				fields: ['event_id']
			},
			{
				id: 'attendance-role',
				title: 'Asistencia',
				fields: ['role', 'notes_private']
			}
		],
		fields: [
			f('event_id', 'Evento', 'fk', {
				required: true,
				fkEntity: 'events',
				help: 'Si el evento aún no existe, créalo primero desde Eventos.',
				wide: true
			}),
			f('role', 'Rol de asistencia', 'vocab', {
				required: true,
				vocabDomain: 'attendance_role',
				wide: true
			}),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				wide: true,
				advanced: true
			})
		]
	},
	academic_works: {
		groups: [
			{
				id: 'work-main',
				title: 'Trabajo académico',
				fields: ['title', 'work_type', 'institution', 'program']
			},
			{
				id: 'work-context',
				title: 'Contexto',
				fields: ['education_id', 'year', 'url']
			}
		],
		fields: [
			f('title', 'Título', 'text', { required: true, wide: true }),
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
			f('url', 'Enlace principal', 'url', { wide: true })
		]
	},
	courses: {
		groups: [
			{
				id: 'course-main',
				title: 'Curso',
				fields: ['title', 'institution', 'program_context']
			},
			{
				id: 'course-period',
				title: 'Periodo y detalles',
				fields: ['date_start', 'date_end', 'hours', 'url', 'notes_private']
			}
		],
		fields: [
			f('title', 'Título', 'text', { required: true, wide: true }),
			f('institution', 'Institución', 'text', { required: true }),
			f('program_context', 'Contexto del programa', 'text'),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date'),
			f('hours', 'Horas', 'integer'),
			f('url', 'Enlace principal', 'url', { wide: true }),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				advanced: true
			})
		]
	},
	memberships: {
		groups: [
			{
				id: 'membership-main',
				title: 'Asociación',
				fields: [
					'organization',
					'role',
					'role_details',
					'date_start',
					'date_end',
					'notes_private'
				]
			}
		],
		fields: [
			f('organization', 'Organización', 'text', { required: true }),
			f('role', 'Rol', 'vocab', { required: true, vocabDomain: 'membership_role' }),
			f('role_details', 'Responsabilidades o mandatos', 'textarea', {
				wide: true,
				help: 'Solo los matices que no formen parte del nombre del rol'
			}),
			f('date_start', 'Fecha de inicio', 'date'),
			f('date_end', 'Fecha de fin', 'date', {
				help: 'Déjala vacía si la pertenencia continúa'
			}),
			f('notes_private', 'Notas privadas', 'textarea', {
				isPrivate: true,
				advanced: true
			})
		]
	},
	skills: {
    groups: [
      {id:'skill-main',title:'Capacidad',fields:['name_es','name_en','area','description_es','description_en','sort_order']},
      {id:'skill-support',title:'Recursos y ejemplos',description:'Selecciona solo recursos representativos. Los ejemplos explican dónde se aplica esta capacidad.',fields:['resource_ids','evidence_ids','portfolio_ids']}
    ],
    fields: [
      f('name_es','Capacidad','text',{required:true}),
      f('name_en','Capacidad en inglés','text'),
      f('area','Área','vocab',{required:true,vocabDomain:'skill_area'}),
      f('description_es','Qué hago','textarea',{required:true}),
      f('description_en','Descripción en inglés','textarea'),
      f('sort_order','Orden general','integer',{advanced:true}),
      f('resource_ids','Métodos, estándares y herramientas','fk_multi',{fkEntity:'skill_resources',persist:false,help:'Gestiona el catálogo en /admin/competencias. No hace falta listar todas las herramientas que utilizas.'}),
      f('evidence_ids','Trabajos y méritos relacionados','fk_multi',{fkEntity:'skill_evidence',persist:false}),
      f('portfolio_ids','Ejemplos del portfolio','fk_multi',{fkEntity:'skill_portfolio',persist:false})
    ]
  },
  languages: {
		groups: [{ id: 'language-main', title: 'Idioma', fields: ['language', 'is_native', 'level'] }],
		fields: [
			f('language', 'Idioma', 'vocab', { required: true, vocabDomain: 'language' }),
			f('level', 'Nivel', 'vocab', {
				vocabDomain: 'language_level',
				showWhen: { all: [{ field: 'is_native', values: [''] }] }
			}),
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

export interface EntityCapabilities {
	canPublish: boolean;
	canShowHome: boolean;
	canUsePortfolio: boolean;
	canUseLinks: boolean;
}

export function getEntityCapabilities(type: EntityType): EntityCapabilities {
	const privateEventRole = type === 'event_attendance';
	return {
		canPublish: !privateEventRole,
		canShowHome: !privateEventRole,
		canUsePortfolio: !privateEventRole,
		canUseLinks: !privateEventRole
	};
}
