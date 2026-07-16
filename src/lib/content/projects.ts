import type { Locale } from '$lib/paraglide/runtime';
import type { PortfolioProjectMetadata } from '$lib/types/portfolio';

type Bi<T> = { es: T; en: T };

export type ProjectSectionNavItem = {
	label: Bi<string>;
	href?: string;
	children?: Array<{ label: Bi<string>; href: string }>;
};

export type ProjectVisual =
	| 'generic'
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

export type ProjectNarrative = Pick<PortfolioProject, 'slug' | 'visual' | 'facts' | 'sectionNav'>;

export const projectNarratives: ProjectNarrative[] = [
	{
		slug: 'todos-a-una',
		visual: 'fuenteovejuna',
		facts: [
			{ es: 'Modelo relacional de transmisión y recepción', en: 'Relational model of transmission and reception' },
			{ es: 'Edición XML-TEI y colección documental', en: 'XML-TEI edition and documentary collection' },
			{ es: 'Tres vías de participación pública', en: 'Three channels for public participation' }
		]
	},
	{
		slug: 'versologia-metadrama',
		visual: 'versologia',
		facts: [
			{ es: 'Modelo métrico basado en secuencias', en: 'Sequence-based metrical model' },
			{ es: 'Dashboard editorial con control de publicación', en: 'Editorial dashboard with publication control' },
			{ es: 'Comparación de perfiles y recorridos métricos', en: 'Comparison of metrical profiles and trajectories' }
		]
	},
	{
		slug: 'etso-plataforma-web',
		visual: 'etso',
		facts: [
			{ es: 'Migración integral de Drupal y MySQL', en: 'Full migration from Drupal and MySQL' },
			{ es: 'Cerca de 3.000 obras y 38 millones de palabras', en: 'Nearly 3,000 plays and 38 million words' },
			{ es: 'Regeneración y publicación automatizadas', en: 'Automated regeneration and publication' }
		]
	},
	{
		slug: 'redes-personajes-teatrales',
		visual: 'networks',
		facts: [
			{ es: 'Ocho comedias urbanas de Lope · 1585—1634', en: 'Eight urban comedies by Lope · 1585—1634' },
			{ es: 'Redes dirigidas y ponderadas por interacción', en: 'Directed, interaction-weighted networks' },
			{ es: 'Tutoriales, taller y publicación pedagógica', en: 'Tutorials, workshop, and pedagogical publication' }
		]
	},
	{
		slug: 'edicion-digital-corpus',
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

export function findProjectNarrative(slug: string): ProjectNarrative | undefined {
	return projectNarratives.find((project) => project.slug === slug);
}

/** Combina el catálogo editable con una narrativa especial cuando existe. */
export function projectFromMetadata(metadata: PortfolioProjectMetadata): PortfolioProject {
	const narrative = findProjectNarrative(metadata.slug);
	return {
		slug: metadata.slug,
		title: metadata.title,
		kind: metadata.kind,
		kicker: metadata.kicker,
		summary: metadata.summary,
		status: metadata.status,
		year: metadata.period,
		tags: metadata.tags,
		links: metadata.links,
		visual: narrative?.visual ?? 'generic',
		facts: narrative?.facts,
		sectionNav: narrative?.sectionNav
	};
}
