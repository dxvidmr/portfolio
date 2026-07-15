import type { Locale } from '$lib/paraglide/runtime';

type Bi<T> = { es: T; en: T };

export type ProjectSectionNavItem = {
	label: Bi<string>;
	href?: string;
	children?: Array<{ label: Bi<string>; href: string }>;
};

export type ProjectVisual =
	| 'fuenteovejuna'
	| 'versologia'
	| 'etso'
	| 'networks'
	| 'editions'
	| 'stage';

export type PortfolioProject = {
	slug: string;
	title: Bi<string>;
	kind: Bi<string>;
	kicker: Bi<string>;
	summary: Bi<string>;
	year: string;
	status: Bi<string>;
	tags: string[];
	visual: ProjectVisual;
	facts?: Array<Bi<string>>;
	links?: Array<{ label: Bi<string>; url: string }>;
	sectionNav?: ProjectSectionNavItem[];
};

export const projects: PortfolioProject[] = [
	{
		slug: 'todos-a-una',
		title: { es: 'Todos a una', en: 'Todos a una' },
		kind: { es: 'Tesis doctoral y proyecto digital', en: 'Doctoral research & digital project' },
		kicker: {
			es: 'recepción · modelado de datos · edición participativa',
			en: 'reception · data modelling · participatory edition'
		},
		summary: {
			es: 'Una investigación sobre cómo Fuenteovejuna llegó a ser un clásico, desarrollada como modelo de datos, edición digital, archivo documental y plataforma de participación pública.',
			en: 'Research into how Fuenteovejuna became a classic, developed as a data model, digital edition, documentary archive, and platform for public participation.'
		},
		year: '2023—',
		status: { es: 'Investigación doctoral en curso', en: 'Ongoing doctoral research' },
		tags: ['historia de la recepción', 'XML-TEI', 'modelado de datos', 'humanidades públicas'],
		visual: 'fuenteovejuna',
		facts: [
			{ es: 'Modelo relacional de transmisión y recepción', en: 'Relational model of transmission and reception' },
			{ es: 'Edición XML-TEI y colección documental', en: 'XML-TEI edition and documentary collection' },
			{ es: 'Tres vías de participación pública', en: 'Three channels for public participation' }
		],
		links: [{ label: { es: 'Visitar Todos a una', en: 'Visit Todos a una' }, url: 'https://todosauna.vercel.app/' }]
	},
	{
		slug: 'versologia-metadrama',
		title: { es: 'Versología', en: 'Versología' },
		kind: { es: 'Base de datos y herramientas de análisis', en: 'Database & analysis toolkit' },
		kicker: {
			es: 'METADRAMA · estilometría estrófica · modelado de datos',
			en: 'METADRAMA · stanzaic stylometry · data modelling'
		},
		summary: {
			es: 'Una infraestructura editorial y analítica para describir, comparar y explorar la arquitectura métrica del teatro en verso.',
			en: 'An editorial and analytical infrastructure for describing, comparing, and exploring the metrical architecture of verse drama.'
		},
		year: '2025—',
		status: { es: 'En desarrollo', en: 'In development' },
		tags: ['SvelteKit', 'Supabase', 'estilometría estrófica', 'visualización'],
		visual: 'versologia',
		facts: [
			{ es: 'Modelo métrico basado en secuencias', en: 'Sequence-based metrical model' },
			{ es: 'Dashboard editorial con control de publicación', en: 'Editorial dashboard with publication control' },
			{ es: 'Comparación de perfiles y recorridos métricos', en: 'Comparison of metrical profiles and trajectories' }
		]
	},
	{
		slug: 'etso-plataforma-web',
		title: { es: 'Nueva plataforma ETSO', en: 'New ETSO platform' },
		kind: { es: 'Rediseño, arquitectura y desarrollo web', en: 'Redesign, architecture & web development' },
		kicker: {
			es: 'SvelteKit · SQLite · R2 · búsqueda textual',
			en: 'SvelteKit · SQLite · R2 · full-text search'
		},
		summary: {
			es: 'Reconstrucción completa del portal de Estilometría Aplicada al Teatro del Siglo de Oro y de su sistema de actualización, búsqueda y publicación.',
			en: 'Complete rebuild of the Stylometry Applied to Spanish Golden Age Theatre portal and its update, search, and publication system.'
		},
		year: '2026',
		status: { es: 'Publicado', en: 'Published' },
		tags: ['SvelteKit', 'SQLite', 'Cloudflare R2', 'ETL'],
		visual: 'etso',
		facts: [
			{ es: 'Migración integral de Drupal y MySQL', en: 'Full migration from Drupal and MySQL' },
			{ es: 'Cerca de 3.000 obras y 38 millones de palabras', en: 'Nearly 3,000 plays and 38 million words' },
			{ es: 'Regeneración y publicación automatizadas', en: 'Automated regeneration and publication' }
		],
		links: [{ label: { es: 'Visitar ETSO', en: 'Visit ETSO' }, url: 'https://etso.es/' }]
	},
	{
		slug: 'redes-personajes-teatrales',
		title: { es: 'Redes de personajes teatrales', en: 'Theatrical character networks' },
		kind: { es: 'Investigación y transferencia pedagógica', en: 'Research & pedagogical transfer' },
		kicker: {
			es: 'TFM · redes · visualización · transferencia',
			en: 'MA thesis · networks · visualisation · knowledge transfer'
		},
		summary: {
			es: 'Una línea sobre análisis de redes teatrales que reúne investigación metodológica sobre Lope, tutoriales abiertos y una aplicación pedagógica con dramaturgas de la Edad de Plata.',
			en: 'A line of work on theatrical network analysis spanning methodological research on Lope, open tutorials, and a pedagogical application with women playwrights of Spain’s Silver Age.'
		},
		year: '2022—2025',
		status: { es: 'Línea desarrollada · resultados publicados', en: 'Developed line · published outputs' },
		tags: ['grafos', 'Lope de Vega', 'Edad de Plata', 'Programming Historian', 'pedagogía'],
		visual: 'networks',
		facts: [
			{ es: 'Ocho comedias urbanas de Lope · 1585—1634', en: 'Eight urban comedies by Lope · 1585—1634' },
			{ es: 'Redes dirigidas y ponderadas por interacción', en: 'Directed, interaction-weighted networks' },
			{ es: 'Tutoriales, taller y publicación pedagógica', en: 'Tutorials, workshop, and pedagogical publication' }
		]
	},
	{
		slug: 'edicion-digital-corpus',
		title: { es: 'Edición digital e infraestructuras textuales', en: 'Digital editions & textual infrastructures' },
		kind: { es: 'Línea de trabajo', en: 'Line of work' },
		kicker: {
			es: 'XML-TEI · herramientas · corpus',
			en: 'XML-TEI · tools · corpora'
		},
		summary: {
			es: 'Herramientas, ediciones y corpus para transformar documentos editoriales en textos publicables, analizables y reutilizables.',
			en: 'Tools, editions, and corpora that transform editorial documents into publishable, analysable, and reusable texts.'
		},
		year: '2020—',
		status: { es: 'Línea activa', en: 'Active line of work' },
		tags: ['XML-TEI', 'FeniX-ML', 'edición digital', 'corpus'],
		visual: 'editions',
		facts: [
			{ es: 'FeniX-ML · conversión guiada Word a XML-TEI', en: 'FeniX-ML · guided Word to XML-TEI conversion' },
			{ es: 'Fray Andrés y Fuenteovejuna · edición web', en: 'Fray Andrés and Fuenteovejuna · web editions' },
			{ es: 'TBSO, BETTE y DraCor · corpus reutilizables', en: 'TBSO, BETTE, and DraCor · reusable corpora' }
		],
		sectionNav: [
			{ label: { es: 'Herramientas', en: 'Tools' }, href: '#herramientas' },
			{ label: { es: 'Ediciones web', en: 'Web editions' }, href: '#ediciones-web' },
			{ label: { es: 'Corpus digitales', en: 'Digital corpora' }, href: '#corpus-digitales' }
		]
	},
	{
		slug: 'documento-escena',
		title: { es: 'Práctica escénica', en: 'Performance practice' },
		kind: { es: 'Investigación y creación escénica', en: 'Performance research & stage creation' },
		kicker: {
			es: 'interpretación · investigación-creación · teatro clásico',
			en: 'acting · practice-based research · classical theatre'
		},
		summary: {
			es: 'La escena como práctica y método de investigación: una trayectoria que reúne formación actoral, interpretación, montajes de teatro clásico y estudio de la técnica actoral del Siglo de Oro.',
			en: 'Performance as both practice and research method: a body of work bringing together actor training, performance, classical theatre productions, and the study of Golden Age acting technique.'
		},
		year: '2018—',
		status: { es: 'Línea activa', en: 'Active line of work' },
		tags: ['interpretación', 'investigación escénica', 'teatro clásico', 'METADRAMA'],
		visual: 'stage',
		sectionNav: [
			{ label: { es: 'Investigación', en: 'Research' }, href: '#investigacion' },
			{
				label: { es: 'Práctica escénica', en: 'Performance practice' },
				children: [
					{ label: { es: 'Fuenteovejuna', en: 'Fuenteovejuna' }, href: '#fuenteovejuna' },
					{ label: { es: 'La cueva de Salamanca', en: 'La cueva de Salamanca' }, href: '#cueva-salamanca' },
					{ label: { es: 'Dido y Eneas', en: 'Dido and Aeneas' }, href: '#dido-eneas' }
				]
			}
		]
	}
];

export function projectText<T>(field: Bi<T>, locale: Locale): T {
	return field[locale];
}

export function findProject(slug: string): PortfolioProject | undefined {
	return projects.find((project) => project.slug === slug);
}
