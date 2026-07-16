<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal();
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.035em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const labelClass = 'meta tw:mt-0 tw:mb-4 tw:text-accent-strong';
	const sectionHeadingClass = `${headingClass} tw:text-[clamp(2.1rem,4.6vw,4.6rem)] tw:leading-[0.94]`;
	const stack = ['Jekyll', 'CollectionBuilder', 'XML / CSV', 'Supabase'];

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

</script>

<section class="tw:grid tw:gap-[clamp(90px,14vw,210px)] tw:border-t tw:border-rule-strong tw:py-[clamp(76px,11vw,150px)]">
	<article class="tw:grid tw:grid-cols-[minmax(0,1.2fr)_minmax(300px,.8fr)] tw:items-end tw:gap-[clamp(50px,9vw,130px)] tw:max-[800px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[760px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} tw:max-w-[11ch] tw:text-[clamp(2.8rem,6.5vw,6.5rem)] tw:leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} tw:mt-7 tw:mb-0 tw:max-w-[65ch]">{copy.introBody}</p>
		</div>
		<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule-strong tw:p-0">
			{#each copy.timeline as item, index (item)}
				<li class="tw:grid tw:grid-cols-[70px_1fr] tw:gap-3.5 tw:border-b tw:border-rule tw:py-[15px]">
					<span class="meta tw:text-ink-faint">{index === 0 ? '1619' : index === 1 ? 'XIX' : 'XX–XXI'}</span>
					<strong class="tw:font-title tw:text-[1.05rem] tw:font-[450]">{item}</strong>
				</li>
			{/each}
		</ol>
	</article>

	<div class="tw:grid tw:grid-cols-12 tw:items-end tw:gap-x-[clamp(18px,3vw,42px)] tw:gap-y-6 tw:max-[560px]:grid-cols-1 tw:max-[560px]:gap-[52px]" use:reveal>
		<div class="tw:col-start-2 tw:col-span-7 tw:mb-[22px] tw:max-w-[650px] tw:max-[800px]:col-span-full tw:max-[560px]:col-start-1 tw:max-[560px]:col-span-1">
			<h3 class="{headingClass} tw:text-[clamp(2rem,4vw,4rem)] tw:leading-[0.95]">{copy.identityTitle}</h3>
			<p class="{bodyClass} tw:mt-[18px] tw:mb-0 tw:max-w-[52ch]">{copy.identityBody}</p>
		</div>
		<div class="tw:col-start-1 tw:col-span-9 tw:max-[800px]:col-span-8 tw:max-[560px]:col-span-1">
			<ProjectFigure src="/images/projects/todos-a-una/portada.webp" alt={copy.alts.cover} caption={copy.captions.cover} number="01" priority />
		</div>
		<div class="tw:col-start-10 tw:col-span-3 tw:justify-self-end tw:max-[800px]:col-start-9 tw:max-[800px]:col-span-4 tw:max-[560px]:col-start-1 tw:max-[560px]:col-span-1 tw:max-[560px]:w-[min(72vw,310px)] tw:max-[560px]:justify-self-center">
			<ProjectFigure src="/images/projects/todos-a-una/edicion-movil.webp" alt={copy.alts.mobile} caption={copy.captions.mobile} number="02" portrait />
		</div>
	</div>

	<article class="tw:grid tw:grid-cols-[minmax(0,1.25fr)_minmax(300px,.75fr)] tw:items-center tw:gap-[clamp(46px,8vw,120px)] tw:max-[800px]:grid-cols-1" use:reveal>
		<div class="tw:w-[min(100%,840px)]">
			<ProjectFigure src="/images/projects/todos-a-una/red-recepcion.webp" alt={copy.alts.network} caption={copy.captions.network} number="03" />
		</div>
		<div>
			<p class={labelClass}>{copy.modelLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.modelTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.modelBody}</p>
			<ul class="tw:mt-7 tw:mb-0 tw:flex tw:list-none tw:flex-wrap tw:gap-[7px] tw:p-0">
				{#each copy.standards as standard (standard)}
					<li class="tw:rounded-full tw:border tw:border-rule tw:px-[10px] tw:py-[7px] tw:font-mono tw:text-[0.58rem] tw:text-ink-faint">{standard}</li>
				{/each}
			</ul>
		</div>
	</article>

	<article class="tw:grid tw:grid-cols-12 tw:gap-10 tw:max-[560px]:block" use:reveal>
		<div class="tw:col-start-2 tw:col-span-5 tw:max-w-[610px] tw:max-[800px]:col-start-1 tw:max-[800px]:col-span-9">
			<p class={labelClass}>{copy.editionLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.editionTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.editionBody}</p>
		</div>
		<div class="tw:col-span-full tw:max-[560px]:mt-9">
			<ProjectFigure src="/images/projects/todos-a-una/edicion-anotada.webp" alt={copy.alts.edition} caption={copy.captions.edition} number="04" />
		</div>
	</article>

	<div class="tw:grid tw:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] tw:items-start tw:gap-[clamp(28px,5vw,74px)] tw:max-[800px]:grid-cols-1">
		<article class="tw:grid tw:gap-7" use:reveal>
			<div class="tw:max-w-[560px]">
				<h3 class="{headingClass} tw:text-[clamp(1.8rem,3.6vw,3.6rem)] tw:leading-[0.98]">{copy.archiveTitle}</h3>
				<p class="{bodyClass} tw:mt-[17px] tw:mb-0">{copy.archiveBody}</p>
			</div>
			<ProjectFigure src="/images/projects/todos-a-una/archivo.webp" alt={copy.alts.archive} caption={copy.captions.archive} number="05" />
		</article>
		<article class="tw:mt-[clamp(80px,12vw,180px)] tw:grid tw:gap-7 tw:max-[800px]:mt-[30px]" use:reveal>
			<div class="tw:max-w-[560px]">
				<h3 class="{headingClass} tw:text-[clamp(1.8rem,3.6vw,3.6rem)] tw:leading-[0.98]">{copy.participationTitle}</h3>
				<p class="{bodyClass} tw:mt-[17px] tw:mb-0">{copy.participationBody}</p>
			</div>
			<ProjectFigure src="/images/projects/todos-a-una/laboratorio-notas.webp" alt={copy.alts.lab} caption={copy.captions.lab} number="06" />
		</article>
	</div>

	<article class="tw:ml-auto tw:w-[min(74%,850px)] tw:border-t tw:border-rule-strong tw:pt-[clamp(52px,8vw,100px)] tw:max-[800px]:w-full" use:reveal>
		<p class={labelClass}>{copy.closingLabel}</p>
		<h3 class="{headingClass} tw:text-[clamp(2.4rem,5vw,5rem)] tw:leading-[0.92]">{copy.closingTitle}</h3>
		<p class="{bodyClass} tw:mt-[25px] tw:mb-0 tw:max-w-[68ch]">{copy.closingBody}</p>
		<div class="meta tw:mt-[30px] tw:flex tw:flex-wrap tw:gap-x-5 tw:gap-y-2 tw:text-ink-faint">
			{#each stack as item, index (item)}
				<span class={index < stack.length - 1 ? "tw:after:pl-5 tw:after:text-accent-strong tw:after:content-['/']" : ''}>{item}</span>
			{/each}
		</div>
	</article>
</section>
