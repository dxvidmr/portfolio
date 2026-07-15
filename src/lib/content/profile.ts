import type { Locale } from '$lib/paraglide/runtime';

type Bi<T> = { es: T; en: T };

// Cabecera / contacto del sitio. No vive en la base (decisión de modelado):
// es contenido de configuración, no una entrada del CV.
export const profile = {
	name: 'David Merino Recalde',
	initials: 'DMR',
	role: {
		es: 'Investigador Predoctoral en Formación · PROLOPE · Universitat Autònoma de Barcelona',
		en: 'Predoctoral Researcher · PROLOPE · Universitat Autònoma de Barcelona'
	} as Bi<string>,
	location: { es: 'Barcelona, España', en: 'Barcelona, Spain' } as Bi<string>,
	timezone: { label: 'BARCELONA GMT+1', tz: 'Europe/Madrid' },
	areas: {
		es: ['Teatro, escena y recepción', 'Archivos y edición digital', 'Modelado de datos', 'Métodos digitales a gran escala'],
		en: ['Theatre, performance & reception', 'Archives & digital editing', 'Data modelling', 'Large-scale digital methods']
	} as Bi<string[]>,
	contact: {
		mail: 'david.merino@uab.cat',
		mailAlt: 'dmerinorecalde@gmail.com',
		web: 'https://dxvidmr.github.io',
		github: 'https://github.com/dxvidmr'
	},
	education: {
		es: [
			{
				period: 'desde 2023',
				degree: 'Doctorado en Filología Española',
				institution: 'Universitat Autònoma de Barcelona · PROLOPE',
				detail: 'Contrato predoctoral FI–Joan Oró (AGAUR).',
				code: 'FIL'
			},
			{
				period: '2020–2022',
				degree: 'Máster en Formación e Investigación Literaria y Teatral',
				institution: 'Universidad Nacional de Educación a Distancia',
				detail: 'Investigación literaria y teatral.',
				code: 'LIT'
			},
			{
				period: '2019–2020',
				degree: 'Máster en Humanidades Digitales',
				institution: 'Universidad Nacional de Educación a Distancia',
				detail: 'Métodos computacionales aplicados a las humanidades.',
				code: 'HD'
			},
			{
				period: '2014–2019',
				degree: 'Grado en Arte Dramático',
				institution: 'Escuela Superior de Arte Dramático del Principado de Asturias',
				detail: 'Formación escénica e interpretación.',
				code: 'ESC'
			}
		],
		en: [
			{
				period: 'since 2023',
				degree: 'PhD in Spanish Philology',
				institution: 'Universitat Autònoma de Barcelona · PROLOPE',
				detail: 'FI–Joan Oró predoctoral fellowship (AGAUR).',
				code: 'PHL'
			},
			{
				period: '2020–2022',
				degree: 'MA in Literary and Theatre Research',
				institution: 'Universidad Nacional de Educación a Distancia',
				detail: 'Literary and theatre research.',
				code: 'LIT'
			},
			{
				period: '2019–2020',
				degree: 'MA in Digital Humanities',
				institution: 'Universidad Nacional de Educación a Distancia',
				detail: 'Computational methods applied to the humanities.',
				code: 'DH'
			},
			{
				period: '2014–2019',
				degree: 'BA in Drama',
				institution: 'Escuela Superior de Arte Dramático del Principado de Asturias',
				detail: 'Stage and acting training.',
				code: 'STG'
			}
		]
	},
	profiles: [
		{ id: 'orcid', code: 'ID', label: 'ORCID', handle: '0000-0003-2740-7831', url: 'https://orcid.org/0000-0003-2740-7831' },
		{
			id: 'scholar',
			code: 'GS',
			label: 'Google Scholar',
			handle: 'HS7G8eYAAAAJ',
			url: 'https://scholar.google.es/citations?hl=es&user=HS7G8eYAAAAJ'
		},
		{ id: 'zotero', code: 'ZT', label: 'Zotero', handle: 'dxvidmr', url: 'https://www.zotero.org/dxvidmr/' },
		{ id: 'github', code: 'GH', label: 'GitHub', handle: '@dxvidmr', url: 'https://github.com/dxvidmr' },
		{
			id: 'bluesky',
			code: 'BS',
			label: 'Bluesky',
			handle: '@dxvidmr.bsky.social',
			url: 'https://bsky.app/profile/dxvidmr.bsky.social'
		},
		{ id: 'x', code: 'X', label: 'X', handle: '@dxvidmr', url: 'https://x.com/dxvidmr' },
		{
			id: 'instagram',
			code: 'IG',
			label: 'Instagram',
			handle: '@davidmerinorecalde',
			url: 'https://www.instagram.com/davidmerinorecalde'
		}
	]
};

export const t = <T>(field: Bi<T>, locale: Locale): T => field[locale];
