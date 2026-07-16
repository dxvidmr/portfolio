<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import EditorialCaseLinks from './EditorialCaseLinks.svelte';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal({ threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.04em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const storySectionClass =
		'tw:grid tw:scroll-mt-[110px] tw:gap-[clamp(44px,7vw,90px)]';
	const sectionCopyClass =
		'tw:grid tw:grid-cols-[minmax(280px,.7fr)_minmax(0,1.3fr)] tw:items-end tw:gap-[clamp(32px,7vw,100px)] tw:max-[900px]:grid-cols-1';
	const labelClass =
		'meta tw:col-span-full tw:mt-0 tw:mb-[-8px] tw:text-accent-strong tw:max-[900px]:col-auto';
	const sectionHeadingClass = `${headingClass} tw:col-start-1 tw:text-[clamp(2.35rem,5vw,5.4rem)] tw:leading-[0.93] tw:max-[900px]:col-auto`;
	const sectionBodyClass = `${bodyClass} tw:col-start-2 tw:m-0 tw:max-w-[72ch] tw:max-[900px]:col-auto`;
	const caseCopyClass =
		'tw:grid tw:grid-cols-[minmax(220px,.38fr)_minmax(0,.62fr)] tw:items-start tw:gap-[clamp(24px,5vw,70px)] tw:border-t tw:border-rule tw:pt-[18px] tw:max-[900px]:grid-cols-1';
	const caseHeadingClass = `${headingClass} tw:text-[clamp(1.55rem,2.8vw,3rem)] tw:leading-[0.96]`;
	const caseBodyClass = `${bodyClass} tw:m-0 tw:max-w-[66ch]`;
	const figureGridClass =
		'tw:grid tw:grid-cols-12 tw:items-start tw:gap-[clamp(22px,3vw,40px)] tw:max-[900px]:block';

	const copy = $derived(locale === 'es' ? {
		label: 'XML-TEI · herramientas · corpus',
		toolsLabel: 'Desarrollo de herramientas',
		toolsTitle: 'FeniX-ML: conversión de Word a XML-TEI',
		toolsBody: 'FeniX-ML es una aplicación de escritorio para convertir ediciones críticas preparadas en DOCX en XML-TEI. El flujo carga texto, notas, aparato crítico y metadatos; valida los archivos; genera el teiHeader; exporta el XML y permite revisar el resultado en una vista HTML local.',
		toolsNote: 'La herramienta está pensada para proyectos editoriales que ya trabajan en Word y necesitan producir TEI sin convertir cada edición manualmente.',
		toolsLinks: [
			{ label: 'Repositorio', href: 'https://github.com/prolopeuab/feniX-ML' },
			{ label: 'Documentación', href: 'https://prolopeuab.github.io/feniX-ML/' }
		],
		toolsFigures: [
			{
				src: '/images/projects/edicion-digital/fenix-app.webp',
				alt: 'Interfaz principal de FeniX-ML con selección de archivos y botones de validación',
				caption: 'Interfaz de carga y validación de archivos DOCX: texto, notas, aparato crítico y metadatos.'
			},
			{
				src: '/images/projects/edicion-digital/fenix-xml.webp',
				alt: 'Vista del XML generado por FeniX-ML',
				caption: 'Vista del XML generado para revisión técnica antes de la publicación.'
			},
			{
				src: '/images/projects/edicion-digital/fenix-html.webp',
				alt: 'Vista HTML de una edición generada con FeniX-ML',
				caption: 'Previsualización HTML local del texto convertido mediante CETEIcean.'
			}
		],
		editionsLabel: 'Publicación web de ediciones',
		editionsTitle: 'Ediciones digitales con lectura, archivo y contexto',
		editionsBody: 'La publicación web no es solo transformar TEI en HTML. En cada proyecto cambia el modelo: una edición puede necesitar lectura paralela, anotación, facsímiles, navegación documental, vocabulario técnico o conexiones con una base de datos.',
		frayTitle: 'Fray Andrés de San Miguel',
		frayBody: 'Desarrollo web completo de la edición digital de la sección de carpintería de armar del manuscrito. El sitio combina transcripción, modernización, anotación y materiales visuales para hacer legible un texto técnico especializado.',
		frayLinks: [
			{ label: 'Visitar edición', href: 'https://frayandresdesanmiguel.fmamanif.com/proyecto/' },
			{ label: 'Repositorio', href: 'https://github.com/fmamanif/Fray-Andres-de-San-Miguel' }
		],
		fuenteTitle: 'Fuenteovejuna',
		fuenteBody: 'Edición digital de Fuenteovejuna con navegación por actos, lectura anotada, control de visualización y acceso a fragmentos concretos del texto. La interfaz combina lectura limpia, notas y herramientas de orientación dentro de la obra.',
		fuenteLinks: [
			{ label: 'Visitar edición', href: 'https://todosauna.vercel.app/lectura' }
		],
		frayFigures: [
			{
				src: '/images/projects/edicion-digital/fray-portada.webp',
				alt: 'Portada de la edición digital de Fray Andrés de San Miguel',
				caption: 'Portada de la edición digital, con acceso directo a la lectura del tratado.'
			},
			{
				src: '/images/projects/edicion-digital/fray-galeria.webp',
				alt: 'Galería de páginas del manuscrito de Fray Andrés de San Miguel',
				caption: 'Galería de imágenes del manuscrito y acceso a los materiales de lectura.'
			},
			{
				src: '/images/projects/edicion-digital/fray-lectura.webp',
				alt: 'Página de lectura de la edición digital de Fray Andrés de San Miguel',
				caption: 'Lectura con facsímil, transcripción y navegación entre páginas.'
			}
		],
		fuenteFigures: [
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-portada.webp',
				alt: 'Portada de la edición digital de Fuenteovejuna con lista de personajes',
				caption: 'Inicio de la edición con lista de personajes y navegación por actos.'
			},
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-lectura.webp',
				alt: 'Vista de lectura de la edición digital de Fuenteovejuna con panel de opciones',
				caption: 'Lectura del texto con opciones de visualización para ajustar la experiencia.'
			},
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-notas.webp',
				alt: 'Vista de lectura de Fuenteovejuna con panel de notas',
				caption: 'Panel de notas vinculado al lugar exacto de lectura.'
			}
		],
		corpusLabel: 'Corpus de textos digitales',
		corpusTitle: 'Textos preparados para análisis y reutilización',
		corpusBody: 'La tercera parte de esta línea se centra en corpus: textos normalizados para estilometría, codificación XML-TEI y publicación en infraestructuras que permiten consultar, descargar y analizar teatro digitalmente.',
		tbsoTitle: 'Teatro breve del Siglo de Oro',
		tbsoBody: 'Repositorio personal con textos normalizados para Stylo, minería textual y atribución de autoría. Algunos textos incorporan también codificación XML-TEI.',
		tbsoLinks: [{ label: 'Repositorio', href: 'https://github.com/dxvidmr/repositorioTBSO' }],
		tbsoFigures: [
			{
				src: '/images/projects/edicion-digital/tbso-repositorio.webp',
				alt: 'Repositorio de teatro breve del Siglo de Oro en GitHub',
				caption: 'Repositorio con textos preparados para análisis cuantitativo, estilometría y edición XML-TEI.'
			}
		],
		dracorTitle: 'BETTE / Spanish Drama Corpus',
		dracorBody: 'Colaboración en el marcado XML-TEI de teatro de la Edad de Plata dentro de HDATEATROUNIR, con circulación posterior en ecosistemas de corpus dramáticos.',
		dracorLinks: [
			{ label: 'DraCor', href: 'https://dracor.org/span' },
			{ label: 'BETTE', href: 'https://github.com/HDAUNIR/BETTE' }
		],
		dracorFigures: [
			{
				src: '/images/projects/edicion-digital/dracor-corpus.webp',
				alt: 'Listado del Spanish Drama Corpus en DraCor',
				caption: 'Vista del Spanish Drama Corpus como corpus consultable y filtrable.'
			},
			{
				src: '/images/projects/edicion-digital/dracor-ficha.webp',
				alt: 'Ficha de una obra del Spanish Drama Corpus con red de personajes',
				caption: 'Ficha de obra con metadatos, descargas, red de personajes y herramientas de análisis.'
			}
		]
	} : {
		label: 'XML-TEI · tools · corpora',
		toolsLabel: 'Tool development',
		toolsTitle: 'FeniX-ML: Word to XML-TEI conversion',
		toolsBody: 'FeniX-ML is a desktop application for converting critical editions prepared in DOCX into XML-TEI. The workflow loads text, notes, critical apparatus, and metadata; validates the files; generates the teiHeader; exports XML; and allows local HTML review.',
		toolsNote: 'The tool is designed for editorial projects that already work in Word and need to produce TEI without manually converting every edition.',
		toolsLinks: [
			{ label: 'Repository', href: 'https://github.com/prolopeuab/feniX-ML' },
			{ label: 'Documentation', href: 'https://prolopeuab.github.io/feniX-ML/' }
		],
		toolsFigures: [
			{
				src: '/images/projects/edicion-digital/fenix-app.webp',
				alt: 'FeniX-ML main interface with file selection and validation buttons',
				caption: 'File loading and validation interface: text, notes, critical apparatus, and metadata.'
			},
			{
				src: '/images/projects/edicion-digital/fenix-xml.webp',
				alt: 'XML output generated by FeniX-ML',
				caption: 'Generated XML view for technical review before publication.'
			},
			{
				src: '/images/projects/edicion-digital/fenix-html.webp',
				alt: 'HTML preview of an edition generated with FeniX-ML',
				caption: 'Local HTML preview of the converted text using CETEIcean.'
			}
		],
		editionsLabel: 'Web publication of editions',
		editionsTitle: 'Digital editions with reading, archive, and context',
		editionsBody: 'Web publication is not just transforming TEI into HTML. Each project requires a different model: parallel reading, annotation, facsimiles, documentary navigation, technical vocabulary, or database connections.',
		frayTitle: 'Fray Andrés de San Miguel',
		frayBody: 'Complete web development for the digital edition of the roof-carpentry section of the manuscript. The site combines transcription, modernization, annotation, and visual material to make a specialized technical text readable.',
		frayLinks: [
			{ label: 'Visit edition', href: 'https://frayandresdesanmiguel.fmamanif.com/proyecto/' },
			{ label: 'Repository', href: 'https://github.com/fmamanif/Fray-Andres-de-San-Miguel' }
		],
		fuenteTitle: 'Fuenteovejuna',
		fuenteBody: 'Digital edition of Fuenteovejuna with act navigation, annotated reading, display controls, and access to specific passages. The interface combines clean reading, notes, and orientation tools within the play.',
		fuenteLinks: [
			{ label: 'Visit edition', href: 'https://todosauna.vercel.app/lectura' }
		],
		frayFigures: [
			{
				src: '/images/projects/edicion-digital/fray-portada.webp',
				alt: 'Homepage of the digital edition of Fray Andrés de San Miguel',
				caption: 'Homepage of the digital edition, with direct access to the treatise.'
			},
			{
				src: '/images/projects/edicion-digital/fray-galeria.webp',
				alt: 'Gallery of manuscript pages from Fray Andrés de San Miguel',
				caption: 'Gallery of manuscript images and access to reading materials.'
			},
			{
				src: '/images/projects/edicion-digital/fray-lectura.webp',
				alt: 'Reading page of the digital edition of Fray Andrés de San Miguel',
				caption: 'Reading view with facsimile, transcription, and page navigation.'
			}
		],
		fuenteFigures: [
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-portada.webp',
				alt: 'Homepage of the digital edition of Fuenteovejuna with dramatis personae',
				caption: 'Opening of the edition with dramatis personae and act navigation.'
			},
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-lectura.webp',
				alt: 'Reading view of the digital edition of Fuenteovejuna with options panel',
				caption: 'Text reading with display options to adjust the reading experience.'
			},
			{
				src: '/images/projects/edicion-digital/fuenteovejuna-notas.webp',
				alt: 'Fuenteovejuna reading view with notes panel',
				caption: 'Notes panel linked to the exact reading position.'
			}
		],
		corpusLabel: 'Digital text corpora',
		corpusTitle: 'Texts prepared for analysis and reuse',
		corpusBody: 'The third part of this line focuses on corpora: texts normalized for stylometry, XML-TEI encoding, and publication in infrastructures that make drama searchable, downloadable, and analyzable.',
		tbsoTitle: 'Golden Age short theatre',
		tbsoBody: 'Personal repository with normalized texts for Stylo, text mining, and authorship attribution. Some texts also include XML-TEI encoding.',
		tbsoLinks: [{ label: 'Repository', href: 'https://github.com/dxvidmr/repositorioTBSO' }],
		tbsoFigures: [
			{
				src: '/images/projects/edicion-digital/tbso-repositorio.webp',
				alt: 'Golden Age short theatre repository on GitHub',
				caption: 'Repository with texts prepared for quantitative analysis, stylometry, and XML-TEI edition.'
			}
		],
		dracorTitle: 'BETTE / Spanish Drama Corpus',
		dracorBody: 'Collaboration on XML-TEI encoding of Silver Age theatre within HDATEATROUNIR, later circulating through drama corpus ecosystems.',
		dracorLinks: [
			{ label: 'DraCor', href: 'https://dracor.org/span' },
			{ label: 'BETTE', href: 'https://github.com/HDAUNIR/BETTE' }
		],
		dracorFigures: [
			{
				src: '/images/projects/edicion-digital/dracor-corpus.webp',
				alt: 'Spanish Drama Corpus list in DraCor',
				caption: 'Spanish Drama Corpus as a searchable and filterable corpus.'
			},
			{
				src: '/images/projects/edicion-digital/dracor-ficha.webp',
				alt: 'Spanish Drama Corpus play page with character network',
				caption: 'Play page with metadata, downloads, character network, and analysis tools.'
			}
		]
	});

</script>

<section
	class="tw:grid tw:gap-[clamp(90px,13vw,190px)] tw:border-t tw:border-rule tw:py-[clamp(76px,11vw,150px)]"
>
	<article id="herramientas" class={storySectionClass} use:reveal>
		<div class={sectionCopyClass}>
			<p class={labelClass}>{copy.toolsLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.toolsTitle}</h3>
			<p class={sectionBodyClass}>{copy.toolsBody}</p>
			<div>
				<p
					class="tw:m-0 tw:border-t tw:border-rule tw:pt-[18px] tw:text-[0.78rem] tw:leading-[1.68] tw:text-ink-faint"
				>
					{copy.toolsNote}
				</p>
				<EditorialCaseLinks links={copy.toolsLinks} />
			</div>
		</div>
		<div class={figureGridClass}>
			<div class="tw:col-span-7 tw:col-start-1 tw:max-[900px]:mt-[34px]">
				<ProjectFigure {...copy.toolsFigures[0]} number="01" priority />
			</div>
			<div
				class="tw:col-span-5 tw:col-start-8 tw:mt-[clamp(30px,7vw,90px)] tw:max-[900px]:mt-[34px]"
			>
				<ProjectFigure {...copy.toolsFigures[1]} number="02" />
			</div>
			<div class="tw:col-span-8 tw:col-start-3 tw:max-[900px]:mt-[34px]">
				<ProjectFigure {...copy.toolsFigures[2]} number="03" />
			</div>
		</div>
	</article>

	<article
		id="ediciones-web"
		class={`${storySectionClass} tw:border-y tw:border-rule tw:py-[clamp(62px,9vw,110px)]`}
		use:reveal
	>
		<div class={sectionCopyClass}>
			<p class={labelClass}>{copy.editionsLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.editionsTitle}</h3>
			<p class={sectionBodyClass}>{copy.editionsBody}</p>
		</div>
		<div class="tw:grid tw:gap-[clamp(70px,11vw,150px)]">
			<section class="tw:grid tw:gap-[clamp(34px,6vw,80px)]">
				<div class={caseCopyClass}>
					<h4 class={caseHeadingClass}>{copy.frayTitle}</h4>
					<div>
						<p class={caseBodyClass}>{copy.frayBody}</p>
						<EditorialCaseLinks links={copy.frayLinks} />
					</div>
				</div>
				<div class={figureGridClass}>
					<div class="tw:col-span-6 tw:col-start-1 tw:max-[900px]:mt-[34px]">
						<ProjectFigure {...copy.frayFigures[0]} number="04" />
					</div>
					<div
						class="tw:col-span-6 tw:col-start-7 tw:mt-[clamp(36px,8vw,112px)] tw:max-[900px]:mt-[34px]"
					>
						<ProjectFigure {...copy.frayFigures[1]} number="05" />
					</div>
					<div class="tw:col-span-9 tw:col-start-2 tw:max-[900px]:mt-[34px]">
						<ProjectFigure {...copy.frayFigures[2]} number="06" />
					</div>
				</div>
			</section>

			<section class="tw:grid tw:gap-[clamp(34px,6vw,80px)]">
				<div class={caseCopyClass}>
					<h4 class={caseHeadingClass}>{copy.fuenteTitle}</h4>
					<div>
						<p class={caseBodyClass}>{copy.fuenteBody}</p>
						<EditorialCaseLinks links={copy.fuenteLinks} />
					</div>
				</div>
				<div class={figureGridClass}>
					<div class="tw:col-span-8 tw:col-start-1 tw:max-[900px]:mt-[34px]">
						<ProjectFigure {...copy.fuenteFigures[0]} number="07" />
					</div>
					<div
						class="tw:col-span-7 tw:col-start-6 tw:mt-[clamp(36px,8vw,108px)] tw:max-[900px]:mt-[34px]"
					>
						<ProjectFigure {...copy.fuenteFigures[1]} number="08" />
					</div>
					<div class="tw:col-span-7 tw:col-start-2 tw:max-[900px]:mt-[34px]">
						<ProjectFigure {...copy.fuenteFigures[2]} number="09" />
					</div>
				</div>
			</section>
		</div>
	</article>

	<article id="corpus-digitales" class={storySectionClass} use:reveal>
		<div class={sectionCopyClass}>
			<p class={labelClass}>{copy.corpusLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.corpusTitle}</h3>
			<p class={sectionBodyClass}>{copy.corpusBody}</p>
		</div>
		<div class="tw:grid tw:gap-[clamp(70px,11vw,150px)]">
			<section class="tw:grid tw:gap-[clamp(34px,6vw,80px)]">
				<div
					class="tw:grid tw:grid-cols-[minmax(200px,.28fr)_minmax(0,.42fr)_minmax(240px,.3fr)] tw:items-start tw:gap-[clamp(22px,4vw,56px)] tw:border-t tw:border-rule tw:pt-[18px] tw:max-[900px]:grid-cols-1"
				>
					<h4 class={caseHeadingClass}>{copy.tbsoTitle}</h4>
					<div>
						<p class={caseBodyClass}>{copy.tbsoBody}</p>
						<EditorialCaseLinks links={copy.tbsoLinks} />
					</div>
					<div
						class="tw:mt-[-8px] tw:[&_figcaption]:max-w-[34ch] tw:max-[900px]:mt-[30px]"
					>
						<ProjectFigure {...copy.tbsoFigures[0]} number="10" />
					</div>
				</div>
			</section>

			<section class="tw:grid tw:gap-[clamp(34px,6vw,80px)]">
				<div class={caseCopyClass}>
					<h4 class={caseHeadingClass}>{copy.dracorTitle}</h4>
					<div>
						<p class={caseBodyClass}>{copy.dracorBody}</p>
						<EditorialCaseLinks links={copy.dracorLinks} />
					</div>
				</div>
				<div class={figureGridClass}>
					<div class="tw:col-span-6 tw:col-start-1 tw:max-[900px]:mt-[34px]">
						<ProjectFigure {...copy.dracorFigures[0]} number="11" />
					</div>
					<div
						class="tw:col-span-6 tw:col-start-7 tw:mt-[clamp(28px,5vw,64px)] tw:max-[900px]:mt-[34px]"
					>
						<ProjectFigure {...copy.dracorFigures[1]} number="12" />
					</div>
				</div>
			</section>
		</div>
	</article>
</section>
