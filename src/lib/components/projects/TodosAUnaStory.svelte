<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();

	const copy = $derived(locale === 'es' ? {
		introLabel: '1619 — presente',
		introTitle: 'Cómo se construye un clásico',
		introBody: 'La centralidad actual de Fuenteovejuna contrasta con siglos de circulación editorial limitada, una vida escénica difícil de documentar y escasa atención crítica. La tesis reconstruye las mediaciones que transformaron esa trayectoria discontinua en un emblema cultural.',
		timeline: ['Publicación', 'Recuperación', 'Canon y memoria'],
		identityTitle: 'Una investigación hecha interfaz',
		identityBody: 'Todos a una traduce la investigación histórica y filológica en una experiencia pública, accesible en escritorio y móvil.',
		modelLabel: 'Base de datos',
		modelTitle: 'Modelar una historia no lineal',
		modelBody: 'Diseñé e implementé en Heurist un modelo relacional para conectar textos, versiones, ediciones, representaciones, documentos, agentes, instituciones, lugares y acontecimientos.',
		standards: ['FRBR', 'LRM', 'CIDOC CRM', 'Heurist'],
		editionLabel: 'XML-TEI',
		editionTitle: 'Leer el texto dentro de su historia',
		editionBody: 'La edición conecta pasajes concretos con notas léxicas, filológicas, intertextuales y escénicas. Los documentos vinculados permiten pasar de la lectura a las huellas materiales de cada puesta en escena, edición o apropiación.',
		archiveTitle: 'Un archivo de huellas',
		archiveBody: 'Programas, carteles, fotografías, figurines, ediciones y testimonios hacen visible la circulación cultural de la obra.',
		participationTitle: 'Una edición abierta, no desatendida',
		participationBody: 'Los lectores pueden evaluar y proponer notas, aportar objetos digitales y compartir testimonios. Cada contribución pasa por revisión editorial.',
		closingLabel: 'Sostenibilidad y validación',
		closingTitle: 'Separar para preservar',
		closingBody: 'La edición y el archivo se generan como sitio estático desde XML y CSV; la participación se recoge y modera por separado. Una prueba piloto con estudiantes, habitantes de Fuente Obejuna y usuarios generalistas evalúa la usabilidad y la viabilidad editorial del modelo.',
		captions: {
			cover: 'Identidad y portada del portal: una invitación a descubrir y participar de la historia de Fuenteovejuna.',
			mobile: 'La lectura adapta texto, notas, navegación y opciones editoriales a pantallas pequeñas.',
			network: 'El tamaño y la intensidad cromática expresan el grado de cada nodo: Fuenteovejuna ocupa el centro de la red.',
			edition: 'Texto, anotación escénica, documento de archivo y evaluación conviven en la misma interfaz.',
			archive: 'La colección permite explorar las huellas materiales de la transmisión y recepción de la obra.',
			lab: 'El laboratorio organiza la revisión participativa por pasajes sin renunciar a la autoridad editorial.'
		},
		alts: {
			cover: 'Portada de Todos a una en escritorio',
			mobile: 'Edición anotada de Fuenteovejuna en un teléfono móvil',
			network: 'Red de entidades de la base de datos de recepción de Fuenteovejuna',
			edition: 'Edición de Fuenteovejuna con una nota escénica abierta',
			archive: 'Archivo visual de documentos relacionados con Fuenteovejuna',
			lab: 'Laboratorio participativo para revisar las notas de la edición'
		}
	} : {
		introLabel: '1619 — present',
		introTitle: 'How a classic is made',
		introBody: 'Fuenteovejuna’s present centrality contrasts with centuries of limited editorial circulation, a stage history that is difficult to document, and little critical attention. The thesis reconstructs the mediations that transformed this discontinuous trajectory into a cultural emblem.',
		timeline: ['Publication', 'Recovery', 'Canon & memory'],
		identityTitle: 'Research made interface',
		identityBody: 'Todos a una translates historical and philological research into a public experience available across desktop and mobile.',
		modelLabel: 'Database',
		modelTitle: 'Modelling a non-linear history',
		modelBody: 'I designed and implemented a relational model in Heurist to connect texts, versions, editions, performances, documents, agents, institutions, places, and events.',
		standards: ['FRBR', 'LRM', 'CIDOC CRM', 'Heurist'],
		editionLabel: 'XML-TEI',
		editionTitle: 'Reading the text within its history',
		editionBody: 'The edition connects specific passages with lexical, philological, intertextual, and performance notes. Linked documents allow readers to move from the text to the material traces of each performance, edition, or appropriation.',
		archiveTitle: 'An archive of traces',
		archiveBody: 'Programmes, posters, photographs, costume designs, editions, and testimonies make the play’s cultural circulation visible.',
		participationTitle: 'An open, but not unattended, edition',
		participationBody: 'Readers can evaluate and propose notes, contribute digital objects, and share testimonies. Every contribution undergoes editorial review.',
		closingLabel: 'Sustainability & validation',
		closingTitle: 'Separate in order to preserve',
		closingBody: 'The edition and archive are generated as a static site from XML and CSV, while participation is collected and moderated separately. A pilot study with students, residents of Fuente Obejuna, and general users evaluates the model’s usability and editorial viability.',
		captions: {
			cover: 'The portal’s identity and homepage: an invitation to discover and participate in Fuenteovejuna’s history.',
			mobile: 'The reading interface adapts text, notes, navigation, and editorial options to smaller screens.',
			network: 'Node size and colour intensity encode degree: Fuenteovejuna occupies the centre of the network.',
			edition: 'Text, performance annotation, archival document, and evaluation coexist in a single interface.',
			archive: 'The collection enables exploration of the material traces of the play’s transmission and reception.',
			lab: 'The laboratory organises participatory review by passage while retaining editorial authority.'
		},
		alts: {
			cover: 'Todos a una homepage on desktop',
			mobile: 'Annotated Fuenteovejuna edition on a mobile phone',
			network: 'Entity network from the Fuenteovejuna reception database',
			edition: 'Fuenteovejuna edition with an open performance note',
			archive: 'Visual archive of documents related to Fuenteovejuna',
			lab: 'Participatory laboratory for reviewing the edition’s notes'
		}
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

<section class="todos-story">
	<article class="opening" use:reveal>
		<div class="opening-copy">
			<p class="meta label">{copy.introLabel}</p>
			<h3>{copy.introTitle}</h3>
			<p>{copy.introBody}</p>
		</div>
		<ol class="timeline">
			{#each copy.timeline as item, index (item)}
				<li><span class="meta">{index === 0 ? '1619' : index === 1 ? 'XIX' : 'XX–XXI'}</span><strong>{item}</strong></li>
			{/each}
		</ol>
	</article>

	<div class="identity-grid" use:reveal>
		<div class="identity-copy">
			<h3>{copy.identityTitle}</h3>
			<p>{copy.identityBody}</p>
		</div>
		<div class="cover-figure">
			<ProjectFigure src="/images/projects/todos-a-una/portada.webp" alt={copy.alts.cover} caption={copy.captions.cover} number="01" priority />
		</div>
		<div class="mobile-figure">
			<ProjectFigure src="/images/projects/todos-a-una/edicion-movil.webp" alt={copy.alts.mobile} caption={copy.captions.mobile} number="02" portrait />
		</div>
	</div>

	<article class="model-grid" use:reveal>
		<div class="network-figure">
			<ProjectFigure src="/images/projects/todos-a-una/red-recepcion.webp" alt={copy.alts.network} caption={copy.captions.network} number="03" />
		</div>
		<div class="model-copy">
			<p class="meta label">{copy.modelLabel}</p>
			<h3>{copy.modelTitle}</h3>
			<p>{copy.modelBody}</p>
			<ul>{#each copy.standards as standard (standard)}<li>{standard}</li>{/each}</ul>
		</div>
	</article>

	<article class="edition-grid" use:reveal>
		<div class="edition-copy">
			<p class="meta label">{copy.editionLabel}</p>
			<h3>{copy.editionTitle}</h3>
			<p>{copy.editionBody}</p>
		</div>
		<div class="edition-figure">
			<ProjectFigure src="/images/projects/todos-a-una/edicion-anotada.webp" alt={copy.alts.edition} caption={copy.captions.edition} number="04" />
		</div>
	</article>

	<div class="archive-grid">
		<article use:reveal>
			<div class="short-copy"><h3>{copy.archiveTitle}</h3><p>{copy.archiveBody}</p></div>
			<ProjectFigure src="/images/projects/todos-a-una/archivo.webp" alt={copy.alts.archive} caption={copy.captions.archive} number="05" />
		</article>
		<article class="lab" use:reveal>
			<div class="short-copy"><h3>{copy.participationTitle}</h3><p>{copy.participationBody}</p></div>
			<ProjectFigure src="/images/projects/todos-a-una/laboratorio-notas.webp" alt={copy.alts.lab} caption={copy.captions.lab} number="06" />
		</article>
	</div>

	<article class="closing" use:reveal>
		<p class="meta label">{copy.closingLabel}</p>
		<h3>{copy.closingTitle}</h3>
		<p>{copy.closingBody}</p>
		<div class="stack meta"><span>Jekyll</span><span>CollectionBuilder</span><span>XML / CSV</span><span>Supabase</span></div>
	</article>
</section>

<style>
	.todos-story {
		display: grid;
		gap: clamp(90px, 14vw, 210px);
		padding-block: clamp(76px, 11vw, 150px);
		border-top: 1px solid var(--line-strong);
	}
	.todos-story h3 { margin: 0; font-weight: 450; letter-spacing: -0.035em; }
	.todos-story p:not(.label) { color: var(--fg-dim); line-height: 1.68; }
	.label { margin: 0 0 16px; color: var(--accent-strong); }
	.opening {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
		gap: clamp(50px, 9vw, 130px);
		align-items: end;
	}
	.opening-copy { max-width: 760px; }
	.opening h3 { max-width: 11ch; font-size: clamp(2.8rem, 6.5vw, 6.5rem); line-height: 0.9; }
	.opening-copy > p:last-child { max-width: 65ch; margin: 28px 0 0; }
	.timeline { margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.timeline li { display: grid; grid-template-columns: 70px 1fr; gap: 14px; padding: 15px 0; border-bottom: 1px solid var(--line); }
	.timeline span { color: var(--fg-faint); }
	.timeline strong { font-family: var(--font-title); font-size: 1.05rem; font-weight: 450; }
	.identity-grid {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 24px clamp(18px, 3vw, 42px);
		align-items: end;
	}
	.identity-copy { grid-column: 2 / span 7; max-width: 650px; margin-bottom: 22px; }
	.identity-copy h3 { font-size: clamp(2rem, 4vw, 4rem); line-height: 0.95; }
	.identity-copy p { max-width: 52ch; margin: 18px 0 0; }
	.cover-figure { grid-column: 1 / span 9; }
	.mobile-figure { grid-column: 10 / span 3; justify-self: end; }
	.model-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
		gap: clamp(46px, 8vw, 120px);
		align-items: center;
	}
	.network-figure { width: min(100%, 840px); }
	.model-copy h3,
	.edition-copy h3 { font-size: clamp(2.1rem, 4.6vw, 4.6rem); line-height: 0.94; }
	.model-copy > p:not(.label),
	.edition-copy > p:not(.label) { margin: 23px 0 0; }
	.model-copy ul { display: flex; flex-wrap: wrap; gap: 7px; margin: 28px 0 0; padding: 0; list-style: none; }
	.model-copy li { padding: 7px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--fg-faint); font-family: var(--font-mono); font-size: 0.58rem; }
	.edition-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 40px; }
	.edition-copy { grid-column: 2 / span 5; max-width: 610px; }
	.edition-figure { grid-column: 1 / -1; }
	.archive-grid { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr); gap: clamp(28px, 5vw, 74px); align-items: start; }
	.archive-grid article { display: grid; gap: 28px; }
	.archive-grid .lab { margin-top: clamp(80px, 12vw, 180px); }
	.short-copy { max-width: 560px; }
	.short-copy h3 { font-size: clamp(1.8rem, 3.6vw, 3.6rem); line-height: 0.98; }
	.short-copy p { margin: 17px 0 0; }
	.closing { width: min(74%, 850px); margin-left: auto; padding-top: clamp(52px, 8vw, 100px); border-top: 1px solid var(--line-strong); }
	.closing h3 { font-size: clamp(2.4rem, 5vw, 5rem); line-height: 0.92; }
	.closing > p:not(.label) { max-width: 68ch; margin: 25px 0 0; }
	.stack { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 30px; color: var(--fg-faint); }
	.stack span:not(:last-child)::after { padding-left: 20px; color: var(--accent-strong); content: '/'; }
	:global(.reveal-pending) { opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 700ms ease, transform 850ms cubic-bezier(0.16, 1, 0.3, 1); }
	:global(.reveal-pending.reveal-visible) { opacity: 1; transform: none; }
	@media (max-width: 800px) {
		.opening,
		.model-grid,
		.archive-grid { grid-template-columns: 1fr; }
		.identity-copy { grid-column: 1 / -1; }
		.cover-figure { grid-column: 1 / span 8; }
		.mobile-figure { grid-column: 9 / span 4; }
		.edition-copy { grid-column: 1 / span 9; }
		.archive-grid .lab { margin-top: 30px; }
		.closing { width: 100%; }
	}
	@media (max-width: 560px) {
		.identity-grid { display: grid; grid-template-columns: 1fr; gap: 52px; }
		.identity-copy,
		.cover-figure,
		.mobile-figure,
		.edition-copy { grid-column: 1; }
		.mobile-figure { width: min(72vw, 310px); justify-self: center; }
		.edition-grid { display: block; }
		.edition-figure { margin-top: 36px; }
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.reveal-pending) { opacity: 1; transform: none; transition: none; }
	}
</style>
