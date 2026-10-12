import type { Locale } from '$lib/paraglide/runtime';
import type { PortfolioProjectMetadata, PortfolioSkill, PortfolioTaxonomyTerm } from '$lib/types/portfolio';

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
	kind: Bi<string> & { code: string };
	summary: Bi<string>;
	year: string;
	status: Bi<string>;
	researchLine: PortfolioTaxonomyTerm | null;
	skills: PortfolioSkill[];
	visual: ProjectVisual;
	links?: Array<{ label: Bi<string>; url: string }>;
	sectionNav?: ProjectSectionNavItem[];
};

export type ProjectNarrative = Pick<PortfolioProject, 'slug' | 'visual' | 'sectionNav'>;

export const projectNarratives: ProjectNarrative[] = [
	{
		slug: 'todos-a-una',
		visual: 'fuenteovejuna'
	},
	{
		slug: 'versologia-metadrama',
		visual: 'versologia'
	},
	{
		slug: 'etso-plataforma-web',
		visual: 'etso'
	},
	{
		slug: 'redes-personajes-teatrales',
		visual: 'networks'
	},
	{
		slug: 'edicion-digital-corpus',
		visual: 'editions',
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
			{ label: { es: 'Enfoque', en: 'Approach' }, href: '#investigacion' },
			{
				label: { es: 'Montajes', en: 'Productions' },
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
		summary: metadata.summary,
		status: metadata.status,
		year: metadata.period,
		researchLine: metadata.researchLine,
		skills: metadata.skills,
		links: metadata.links,
		visual: narrative?.visual ?? 'generic',
		sectionNav: narrative?.sectionNav
	};
}
