<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();

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

	function reveal(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		node.classList.add('reveal-pending');
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('reveal-visible');
			observer.disconnect();
		}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section class="etso-story">
	<article class="opening" use:reveal>
		<div class="opening-copy">
			<p class="meta label">{copy.introLabel}</p>
			<h3>{copy.introTitle}</h3>
			<p>{copy.introBody}</p>
		</div>
		<dl class="stats">
			{#each copy.stats as stat (stat.label)}
				<div><dt>{stat.value}</dt><dd class="meta">{stat.label}</dd></div>
			{/each}
		</dl>
	</article>

	<div class="cover" use:reveal>
		<ProjectFigure src="/images/projects/etso/portada.webp" alt={copy.coverAlt} caption={copy.coverCaption} number="01" priority />
	</div>

	<article class="architecture" use:reveal>
		<div class="architecture-copy">
			<p class="meta label">{copy.architectureLabel}</p>
			<h3>{copy.architectureTitle}</h3>
			<p>{copy.architectureBody}</p>
		</div>
		<div class="migration" aria-label={`${copy.before.join(', ')} — ${copy.after.join(', ')}`}>
			<div>{#each copy.before as item (item)}<span>{item}</span>{/each}</div>
			<b aria-hidden="true">→</b>
			<div class="current">{#each copy.after as item (item)}<span>{item}</span>{/each}</div>
		</div>
	</article>

	<article class="data-flow" use:reveal>
		<div class="flow-copy">
			<p class="meta label">{copy.dataLabel}</p>
			<h3>{copy.dataTitle}</h3>
			<p>{copy.dataBody}</p>
		</div>
		<ol class="flow-diagram">
			{#each copy.flow as item, index (item)}
				<li class:branch={index > 1}><span class="meta">0{index + 1}</span><strong>{item}</strong></li>
			{/each}
		</ol>
	</article>

	<article class="corpus" use:reveal>
		<div class="corpus-copy">
			<h3>{copy.corpusTitle}</h3>
			<p>{copy.corpusBody}</p>
		</div>
		<ProjectFigure src="/images/projects/etso/examen-autorias.webp" alt={copy.corpusAlt} caption={copy.corpusCaption} number="02" />
	</article>

	<article class="search" use:reveal>
		<div class="search-copy">
			<p class="meta label">{copy.searchLabel}</p>
			<h3>{copy.searchTitle}</h3>
			<p>{copy.searchBody}</p>
		</div>
		<div class="search-figure">
			<ProjectFigure src="/images/projects/etso/texoro.webp" alt={copy.searchAlt} caption={copy.searchCaption} number="03" />
		</div>
	</article>

	<article class="role" use:reveal>
		<p class="meta label">{copy.roleLabel}</p>
		<h3>{copy.roleTitle}</h3>
		<p>{copy.roleBody}</p>
		<div class="stack meta">{#each copy.stack as item (item)}<span>{item}</span>{/each}</div>
	</article>
</section>

<style>
	.etso-story { display: grid; gap: clamp(90px, 14vw, 210px); padding-block: clamp(76px, 11vw, 150px); border-top: 1px solid var(--line-strong); }
	.etso-story h3 { margin: 0; font-weight: 450; letter-spacing: -.04em; }
	.etso-story p:not(.label) { color: var(--fg-dim); line-height: 1.68; }
	.label { margin: 0 0 16px; color: var(--accent-strong); }
	.opening { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr); gap: clamp(50px, 9vw, 130px); align-items: end; }
	.opening-copy { max-width: 820px; }
	.opening h3 { max-width: 12ch; font-size: clamp(2.8rem, 6.5vw, 6.5rem); line-height: .9; }
	.opening-copy > p:last-child { max-width: 68ch; margin: 28px 0 0; }
	.stats { display: grid; margin: 0; border-top: 1px solid var(--line-strong); }
	.stats div { display: grid; grid-template-columns: minmax(100px, .7fr) 1fr; gap: 18px; align-items: baseline; padding: 13px 0; border-bottom: 1px solid var(--line); }
	.stats dt { font-family: var(--font-title); font-size: clamp(1.7rem, 3vw, 2.8rem); line-height: 1; }
	.stats dd { margin: 0; color: var(--fg-faint); }
	.cover { width: min(94%, 1500px); margin-inline: auto; }
	.architecture { display: grid; grid-template-columns: minmax(0, .9fr) minmax(420px, 1.1fr); gap: clamp(52px, 9vw, 140px); align-items: center; }
	.architecture-copy { max-width: 620px; }
	.architecture h3, .data-flow h3, .corpus h3, .search h3 { font-size: clamp(2.2rem, 4.7vw, 4.8rem); line-height: .94; }
	.architecture-copy > p:last-child, .flow-copy > p:last-child, .corpus-copy p, .search-copy > p:last-child { margin: 23px 0 0; }
	.migration { display: grid; grid-template-columns: 1fr auto 1fr; gap: clamp(18px, 3vw, 42px); align-items: center; }
	.migration > div { display: grid; border-top: 1px solid var(--line-strong); }
	.migration span { padding: 14px 0; border-bottom: 1px solid var(--line); color: var(--fg-faint); font-family: var(--font-mono); font-size: .62rem; text-transform: uppercase; }
	.migration .current span { color: var(--fg); }
	.migration b { color: var(--accent-strong); font-family: var(--font-title); font-size: 2rem; font-weight: 400; }
	.data-flow { display: grid; grid-template-columns: minmax(300px, .75fr) minmax(0, 1.25fr); gap: clamp(55px, 10vw, 150px); align-items: end; padding-block: clamp(58px, 8vw, 100px); border-block: 1px solid var(--line-strong); }
	.flow-copy { max-width: 620px; }
	.flow-diagram { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0 16px; margin: 0; padding: 0; list-style: none; }
	.flow-diagram li { position: relative; grid-column: span 3; display: grid; gap: 12px; min-height: 100px; padding: 16px 0; border-top: 1px solid var(--line-strong); }
	.flow-diagram li:nth-child(2) { grid-column: span 3; }
	.flow-diagram .branch { grid-column: span 2; }
	.flow-diagram li::after { position: absolute; top: -5px; right: 0; width: 9px; height: 9px; border-radius: 50%; background: var(--accent); content: ''; }
	.flow-diagram span { color: var(--fg-faint); }
	.flow-diagram strong { align-self: end; font-family: var(--font-title); font-size: clamp(1.3rem, 2vw, 2rem); font-weight: 450; }
	.corpus { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 40px; }
	.corpus-copy { grid-column: 2 / span 6; max-width: 700px; }
	.corpus > :global(figure) { grid-column: 1 / -1; }
	.search { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 40px; align-items: start; }
	.search-copy { grid-column: 7 / span 5; grid-row: 1; max-width: 620px; }
	.search-figure { grid-column: 1 / span 10; grid-row: 2; }
	.role { width: min(76%, 920px); margin-left: auto; padding-top: clamp(52px, 8vw, 100px); border-top: 1px solid var(--line-strong); }
	.role h3 { font-size: clamp(2.4rem, 5vw, 5rem); line-height: .92; }
	.role > p:not(.label) { max-width: 72ch; margin: 25px 0 0; }
	.stack { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 30px; color: var(--fg-faint); }
	.stack span:not(:last-child)::after { padding-left: 20px; color: var(--accent-strong); content: '/'; }
	:global(.reveal-pending) { opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 700ms ease, transform 850ms cubic-bezier(.16, 1, .3, 1); }
	:global(.reveal-pending.reveal-visible) { opacity: 1; transform: none; }
	@media (max-width: 850px) {
		.opening, .architecture, .data-flow { grid-template-columns: 1fr; }
		.migration { max-width: 680px; }
		.corpus-copy { grid-column: 1 / span 10; }
		.search-copy { grid-column: 2 / span 10; }
		.search-figure { grid-column: 1 / -1; }
		.role { width: 100%; }
	}
	@media (max-width: 600px) {
		.cover { width: 100%; }
		.migration { grid-template-columns: 1fr auto 1fr; gap: 12px; }
		.migration span { font-size: .5rem; }
		.flow-diagram { grid-template-columns: repeat(2, 1fr); }
		.flow-diagram li, .flow-diagram li:nth-child(2), .flow-diagram .branch { grid-column: span 1; }
		.flow-diagram li:last-child { grid-column: 1 / -1; }
		.corpus, .search { display: block; }
		.corpus > :global(figure), .search-figure { margin-top: 38px; }
	}
	@media (prefers-reduced-motion: reduce) { :global(.reveal-pending) { opacity: 1; transform: none; transition: none; } }
</style>
