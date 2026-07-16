<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal();
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.04em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const labelClass = 'meta tw:mt-0 tw:mb-4 tw:text-accent-strong';
	const sectionHeadingClass = `${headingClass} tw:text-[clamp(2.2rem,4.7vw,4.8rem)] tw:leading-[0.94]`;

	const copy = $derived(locale === 'es' ? {
		introLabel: 'Drupal → SvelteKit',
		introTitle: 'Cambiar el motor sin perder la memoria',
		introBody: 'La nueva web de ETSO conserva la continuidad visual del proyecto, pero reconstruye por completo su arquitectura. El antiguo portal en Drupal y MySQL se convierte en una aplicación más rápida, mantenible y preparada para publicar un corpus en crecimiento.',
		stats: [
			{ value: '≈ 3.000', label: 'obras teatrales' },
			{ value: '38 M+', label: 'palabras' },
			{ value: '1', label: 'fuente de datos' }
		],
		coverAlt: 'Portada de la nueva web de ETSO dedicada al examen de autorías',
		coverCaption: 'La nueva portada organiza los distintos recursos de ETSO bajo una interfaz común, basada en la identidad visual anterior.',
		architectureLabel: 'Arquitectura web',
		architectureTitle: 'Una reconstrucción, no una capa nueva',
		architectureBody: 'La migración sustituye el CMS, el acceso a datos y la forma de desplegar el portal. SvelteKit sirve la interfaz; SQLite concentra los datos estructurados; los recursos pesados se distribuyen como archivos estáticos.',
		before: ['Drupal', 'MySQL', 'Actualización acoplada'],
		after: ['SvelteKit', 'SQLite', 'Despliegue automatizado'],
		dataLabel: 'Flujo de datos',
		dataTitle: 'Una fuente, varias salidas',
		dataBody: 'El investigador sigue trabajando sobre su Excel de referencia. Un único proceso de regeneración lo transforma en la base pública, genera los JSON de los resúmenes y construye desde los TXT los índices de búsqueda de TEXORO. Después actualiza la base y publica los nuevos estáticos en R2.',
		flow: ['Excel fuente', 'Regeneración', 'SQLite', 'JSON', 'Índices'],
		corpusTitle: 'La escala se vuelve navegable',
		corpusBody: 'La tabla de obras reúne autoría tradicional y estilométrica, género y estado del texto, y enlaza cada registro con sus informes, transcripción, resumen y red. La nueva arquitectura mantiene conectados recursos de naturaleza muy distinta.',
		corpusAlt: 'Listado de obras del examen de autorías de ETSO',
		corpusCaption: 'Cada obra funciona como punto de acceso a los distintos resultados y materiales producidos por el proyecto.',
		searchLabel: 'TEXORO',
		searchTitle: 'Buscar dentro del corpus',
		searchBody: 'Los índices se regeneran directamente a partir de los textos. La búsqueda devuelve ocurrencias agrupadas por obra, conserva el contexto, muestra sus metadatos y permite exportar los resultados.',
		searchAlt: 'Resultados de una búsqueda textual en TEXORO',
		searchCaption: 'TEXORO combina resultados cuantitativos, contexto textual y acceso inmediato a cada obra.',
		roleLabel: 'Diseño y desarrollo',
		roleTitle: 'Un sistema completo detrás de una web más sencilla',
		roleBody: 'Realicé en solitario el diseño y el desarrollo de la nueva plataforma, siempre en colaboración con Álvaro Cuéllar, investigador principal de ETSO. Mi trabajo abarca la arquitectura, la interfaz, el modelado de la base y todo el proceso de actualización y publicación.',
		stack: ['SvelteKit', 'SQLite', 'JSON estático', 'Cloudflare R2', 'TEXORO']
	} : {
		introLabel: 'Drupal → SvelteKit',
		introTitle: 'Changing the engine without losing its memory',
		introBody: 'The new ETSO website preserves the project’s visual continuity while completely rebuilding its architecture. The former Drupal and MySQL portal becomes a faster, maintainable application ready to publish a growing corpus.',
		stats: [
			{ value: '≈ 3,000', label: 'dramatic works' },
			{ value: '38 M+', label: 'words' },
			{ value: '1', label: 'data source' }
		],
		coverAlt: 'Homepage of the new ETSO website devoted to authorship examination',
		coverCaption: 'The new homepage organises ETSO’s resources within a shared interface based on its previous visual identity.',
		architectureLabel: 'Web architecture',
		architectureTitle: 'A rebuild, not a new layer',
		architectureBody: 'The migration replaces the CMS, data access, and deployment model. SvelteKit serves the interface; SQLite brings structured data together; heavy resources are distributed as static files.',
		before: ['Drupal', 'MySQL', 'Coupled updates'],
		after: ['SvelteKit', 'SQLite', 'Automated deployment'],
		dataLabel: 'Data pipeline',
		dataTitle: 'One source, several outputs',
		dataBody: 'The researcher continues to work from the reference Excel workbook. A single regeneration process turns it into the public database, produces summary JSON, and builds TEXORO search indexes from the TXT files. It then updates the database and publishes the new static assets to R2.',
		flow: ['Source Excel', 'Regeneration', 'SQLite', 'JSON', 'Indexes'],
		corpusTitle: 'Making scale navigable',
		corpusBody: 'The catalogue brings together traditional and stylometric attribution, genre, and text status, linking each record to reports, transcription, summary, and network. The new architecture keeps resources of very different kinds connected.',
		corpusAlt: 'List of plays in the ETSO authorship examination',
		corpusCaption: 'Each play acts as an access point to the different results and materials produced by the project.',
		searchLabel: 'TEXORO',
		searchTitle: 'Searching within the corpus',
		searchBody: 'Indexes are regenerated directly from the texts. Search returns occurrences grouped by play, retains their context, displays metadata, and allows results to be exported.',
		searchAlt: 'Text search results in TEXORO',
		searchCaption: 'TEXORO combines quantitative results, textual context, and immediate access to each play.',
		roleLabel: 'Design & development',
		roleTitle: 'A complete system behind a simpler website',
		roleBody: 'I independently designed and developed the new platform, working throughout with Álvaro Cuéllar, ETSO’s principal investigator. My work spans the architecture, interface, database modelling, and the entire update and publication process.',
		stack: ['SvelteKit', 'SQLite', 'Static JSON', 'Cloudflare R2', 'TEXORO']
	});

</script>

<section class="tw:grid tw:gap-[clamp(90px,14vw,210px)] tw:border-t tw:border-rule-strong tw:py-[clamp(76px,11vw,150px)]">
	<article class="tw:grid tw:grid-cols-[minmax(0,1.25fr)_minmax(280px,.75fr)] tw:items-end tw:gap-[clamp(50px,9vw,130px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[820px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} tw:max-w-[12ch] tw:text-[clamp(2.8rem,6.5vw,6.5rem)] tw:leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} tw:mt-7 tw:mb-0 tw:max-w-[68ch]">{copy.introBody}</p>
		</div>
		<dl class="tw:m-0 tw:grid tw:border-t tw:border-rule-strong">
			{#each copy.stats as stat (stat.label)}
				<div class="tw:grid tw:grid-cols-[minmax(100px,.7fr)_1fr] tw:items-baseline tw:gap-[18px] tw:border-b tw:border-rule tw:py-[13px]">
					<dt class="tw:font-title tw:text-[clamp(1.7rem,3vw,2.8rem)] tw:leading-none">{stat.value}</dt>
					<dd class="meta tw:m-0 tw:text-ink-faint">{stat.label}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<div class="tw:mx-auto tw:w-[min(94%,1500px)] tw:max-[600px]:w-full" use:reveal>
		<ProjectFigure src="/images/projects/etso/portada.webp" alt={copy.coverAlt} caption={copy.coverCaption} number="01" priority />
	</div>

	<article class="tw:grid tw:grid-cols-[minmax(0,.9fr)_minmax(420px,1.1fr)] tw:items-center tw:gap-[clamp(52px,9vw,140px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[620px]">
			<p class={labelClass}>{copy.architectureLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.architectureTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.architectureBody}</p>
		</div>
		<div class="tw:grid tw:grid-cols-[1fr_auto_1fr] tw:items-center tw:gap-[clamp(18px,3vw,42px)] tw:max-[850px]:max-w-[680px] tw:max-[600px]:gap-3" aria-label={`${copy.before.join(', ')} — ${copy.after.join(', ')}`}>
			<div class="tw:grid tw:border-t tw:border-rule-strong">
				{#each copy.before as item (item)}<span class="tw:border-b tw:border-rule tw:py-3.5 tw:font-mono tw:text-[0.62rem] tw:uppercase tw:text-ink-faint tw:max-[600px]:text-[0.5rem]">{item}</span>{/each}
			</div>
			<b class="tw:font-title tw:text-[2rem] tw:font-normal tw:text-accent-strong" aria-hidden="true">→</b>
			<div class="tw:grid tw:border-t tw:border-rule-strong">
				{#each copy.after as item (item)}<span class="tw:border-b tw:border-rule tw:py-3.5 tw:font-mono tw:text-[0.62rem] tw:uppercase tw:text-ink tw:max-[600px]:text-[0.5rem]">{item}</span>{/each}
			</div>
		</div>
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(300px,.75fr)_minmax(0,1.25fr)] tw:items-end tw:gap-[clamp(55px,10vw,150px)] tw:border-y tw:border-rule-strong tw:py-[clamp(58px,8vw,100px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[620px]">
			<p class={labelClass}>{copy.dataLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.dataTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.dataBody}</p>
		</div>
		<ol class="tw:m-0 tw:grid tw:list-none tw:grid-cols-6 tw:gap-x-4 tw:p-0 tw:max-[600px]:grid-cols-2">
			{#each copy.flow as item, index (item)}
				<li class={`tw:relative tw:grid tw:min-h-[100px] tw:gap-3 tw:border-t tw:border-rule-strong tw:py-4 tw:after:absolute tw:after:top-[-5px] tw:after:right-0 tw:after:size-[9px] tw:after:rounded-full tw:after:bg-accent tw:after:content-[''] ${
					index > 1 ? 'tw:col-span-2' : 'tw:col-span-3'
				} ${index === copy.flow.length - 1 ? 'tw:max-[600px]:col-span-full' : 'tw:max-[600px]:col-span-1'}`}>
					<span class="meta tw:text-ink-faint">0{index + 1}</span>
					<strong class="tw:self-end tw:font-title tw:text-[clamp(1.3rem,2vw,2rem)] tw:font-[450]">{item}</strong>
				</li>
			{/each}
		</ol>
	</article>

	<article class="tw:grid tw:grid-cols-12 tw:gap-10 tw:max-[600px]:block tw:[&>figure]:col-span-full tw:max-[600px]:[&>figure]:mt-[38px]" use:reveal>
		<div class="tw:col-start-2 tw:col-span-6 tw:max-w-[700px] tw:max-[850px]:col-start-1 tw:max-[850px]:col-span-10">
			<h3 class={sectionHeadingClass}>{copy.corpusTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.corpusBody}</p>
		</div>
		<ProjectFigure src="/images/projects/etso/examen-autorias.webp" alt={copy.corpusAlt} caption={copy.corpusCaption} number="02" />
	</article>

	<article class="tw:grid tw:grid-cols-12 tw:items-start tw:gap-10 tw:max-[600px]:block" use:reveal>
		<div class="tw:col-start-7 tw:col-span-5 tw:row-start-1 tw:max-w-[620px] tw:max-[850px]:col-start-2 tw:max-[850px]:col-span-10">
			<p class={labelClass}>{copy.searchLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.searchTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.searchBody}</p>
		</div>
		<div class="tw:col-start-1 tw:col-span-10 tw:row-start-2 tw:max-[850px]:col-span-full tw:max-[600px]:mt-[38px]">
			<ProjectFigure src="/images/projects/etso/texoro.webp" alt={copy.searchAlt} caption={copy.searchCaption} number="03" />
		</div>
	</article>

	<article class="tw:ml-auto tw:w-[min(76%,920px)] tw:border-t tw:border-rule-strong tw:pt-[clamp(52px,8vw,100px)] tw:max-[850px]:w-full" use:reveal>
		<p class={labelClass}>{copy.roleLabel}</p>
		<h3 class="{headingClass} tw:text-[clamp(2.4rem,5vw,5rem)] tw:leading-[0.92]">{copy.roleTitle}</h3>
		<p class="{bodyClass} tw:mt-[25px] tw:mb-0 tw:max-w-[72ch]">{copy.roleBody}</p>
		<div class="meta tw:mt-[30px] tw:flex tw:flex-wrap tw:gap-x-5 tw:gap-y-2 tw:text-ink-faint">
			{#each copy.stack as item, index (item)}
				<span class={index < copy.stack.length - 1 ? "tw:after:pl-5 tw:after:text-accent-strong tw:after:content-['/']" : ''}>{item}</span>
			{/each}
		</div>
	</article>
</section>
