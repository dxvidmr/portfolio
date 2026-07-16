<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import NetworkMethodVisual from './NetworkMethodVisual.svelte';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal({ threshold: 0.1 });
	const headingClass = 'm-0 font-[450] tracking-[-0.04em]';
	const bodyClass = 'text-ink-dim leading-[1.68]';
	const labelClass = 'meta mt-0 mb-4 text-accent-strong';
	const sectionHeadingClass = `${headingClass} text-[clamp(2.2rem,4.7vw,4.8rem)] leading-[0.94]`;

	const copy = $derived(locale === 'es' ? {
		introLabel: 'Investigación y pedagogía · 2022—2025',
		introTitle: 'Análisis de redes de personajes en la comedia urbana',
		introBody: 'Esta línea de trabajo estudia, visualiza y enseña los sistemas de personajes teatrales mediante análisis de redes. Comenzó con un TFM sobre ocho comedias urbanas de Lope de Vega y se amplió después hacia materiales abiertos y experiencias pedagógicas con dramaturgas de la Edad de Plata.',
		stats: [
			{ value: '8', label: 'comedias' },
			{ value: '1585—1634', label: 'arco cronológico' },
			{ value: '2', label: 'lecciones abiertas' }
		],
		methodLabel: 'Propuesta metodológica',
		methodTitle: 'Cómo se construyeron las redes',
		methodBody: 'Cada intervención se registra como una interacción lingüística directa entre un emisor y uno o varios receptores. El procedimiento fija qué se cuenta, cómo se estructura y cómo puede compararse entre obras.',
		methodSteps: ['Texto crítico', 'Matriz de adyacencia', 'Grafo dirigido', 'Lectura comparada'],
		attributes: ['género', 'función dramática', 'universo social', 'grupo social'],
		encodingTitle: 'Cómo se representa la información',
		encodingBody: 'La dirección se expresa mediante flechas; el grosor registra el número de interacciones; el tamaño del nodo, su grado con peso; y el color, la función dramática. ForceAtlas2 aproxima a quienes más hablan entre sí.',
		encoding: [
			{ mark: '→', label: 'dirección' },
			{ mark: '━', label: 'frecuencia' },
			{ mark: '●', label: 'centralidad' },
			{ mark: '●', label: 'función' }
		],
		nightLabel: 'Núcleo y periferia',
		nightTitle: 'Estructuras de núcleo y periferia',
		nightBody: 'En La noche de San Juan, las acciones amorosas ocupan el núcleo. A su alrededor aparecen escenas periféricas conectadas mediante pocos personajes: episodios urbanos que amplían el mundo de la comedia sin integrarse por completo en la intriga principal.',
		nightAlt: 'Red dirigida de personajes de La noche de San Juan, organizada en un núcleo y varias escenas periféricas',
		nightCaption: 'La noche de San Juan: el tamaño representa grado con peso y el color distingue las funciones dramáticas.',
		coreCallout: 'Núcleo · intrigas principales',
		peripheryCallout: 'Escenas periféricas',
		bridgeLabel: 'Centralidad de intermediación',
		bridgeTitle: 'La intermediación detecta personajes estructurales',
		bridgeBody: 'Guillermo, un buhonero de Las ferias de Madrid, interviene solo quince veces durante el primer acto. Sin embargo, conecta escenas y grupos que quedarían aislados: obtiene la intermediación más alta de la comedia.',
		bridgeStat: '0,331',
		bridgeStatLabel: 'intermediación normalizada',
		bridgeAlt: 'Red de Las ferias de Madrid con Guillermo situado como puente entre varios grupos de personajes',
		bridgeCaption: 'La posición de Guillermo muestra una importancia estructural que el número de intervenciones por sí solo no revelaría.',
		densityLabel: 'Hipótesis y contraste',
		densityTitle: 'Evolución del número de personajes y la densidad',
		densityBody: 'El número de personajes desciende en el periodo estudiado, pero la densidad no crece de forma clara. La discreta enamorada y El acero de Madrid concentran los valores más altos y rompen una lectura evolutiva sencilla.',
		densityAlt: 'Gráfico de densidad de las ocho comedias analizadas',
		densityCaption: 'La línea de tendencia apenas asciende: el corpus no confirma una densificación progresiva del enredo.',
		densityStats: [
			{ value: '28 → 11', label: 'personajes, primera y última obra' },
			{ value: 'R² 0,001', label: 'tendencia de la densidad' }
		],
		parallelLabel: 'Estructuras recurrentes',
		parallelTitle: 'Una estructura recurrente: el amor en paralelo',
		parallelBody: 'En las comedias tardías se estabiliza una figura relacional: el cortejo entre dama y galán encuentra su reflejo paródico en criada y criado. Las conexiones diagonales muestran además su papel como mensajeros cuando los amantes no pueden verse.',
		parallelFigures: [
			{ src: '/images/projects/redes-personajes/amar-sin-saber.webp', alt: 'Red de personajes de Amar sin saber a quién', caption: 'Amar sin saber a quién: Inés media entre una dama y un galán que todavía no pueden encontrarse.', number: '04' },
			{ src: '/images/projects/redes-personajes/santiago-verde.webp', alt: 'Red de personajes de Santiago el verde', caption: 'Santiago el verde: las dos parejas y sus relaciones diagonales quedan concentradas en el núcleo.', number: '05' },
			{ src: '/images/projects/redes-personajes/bizarrias-belisa.webp', alt: 'Red de personajes de Las bizarrías de Belisa', caption: 'Las bizarrías de Belisa: la estructura paralela se mantiene de manera especialmente estable.', number: '06' }
		],
		pedagogyLabel: 'Transferencia y pedagogía',
		pedagogyTitle: 'Una rama pedagógica con dos enfoques',
		pedagogyBody: 'La dimensión pedagógica del trabajo se desarrolló de dos maneras: enseñando a realizar análisis de redes con teatro del Siglo de Oro y utilizando las redes como herramienta para enseñar literatura de la Edad de Plata.',
		pedagogyItems: [
			{ type: 'Teatro del Siglo de Oro', title: 'Tutoriales en Programming Historian', body: 'Dos lecciones abiertas explican paso a paso cómo extraer interacciones lingüísticas, construir las redes y analizarlas con Gephi.' },
			{ type: 'Teatro de la Edad de Plata', title: 'e-DrAMAS: redes para enseñar literatura', body: 'En el taller de e-DrAMAS, las redes de coaparición en escena se utilizaron como herramienta pedagógica para estudiar a las dramaturgas de la Edad de Plata. La experiencia dio lugar al capítulo «De la escena al grafo».' }
		]
	} : {
		introLabel: 'Research & pedagogy · 2022—2025',
		introTitle: 'Character network analysis in urban comedy',
		introBody: 'This line of work studies, visualises, and teaches theatrical character systems through network analysis. It began with an MA thesis on eight urban comedies by Lope de Vega and later expanded into open learning materials and pedagogical work with women playwrights of Spain’s Silver Age.',
		stats: [
			{ value: '8', label: 'plays' },
			{ value: '1585—1634', label: 'chronological span' },
			{ value: '2', label: 'open lessons' }
		],
		methodLabel: 'Methodological proposal',
		methodTitle: 'How the networks were built',
		methodBody: 'Each speech is recorded as a direct linguistic interaction between a sender and one or more recipients. The procedure establishes what is counted, how it is structured, and how it can be compared across plays.',
		methodSteps: ['Critical text', 'Adjacency matrix', 'Directed graph', 'Comparative reading'],
		attributes: ['gender', 'dramatic function', 'social universe', 'social group'],
		encodingTitle: 'How information is represented',
		encodingBody: 'Direction is expressed through arrows; thickness records the number of interactions; node size represents weighted degree; and colour indicates dramatic function. ForceAtlas2 brings those who speak most closely together.',
		encoding: [
			{ mark: '→', label: 'direction' },
			{ mark: '━', label: 'frequency' },
			{ mark: '●', label: 'centrality' },
			{ mark: '●', label: 'function' }
		],
		nightLabel: 'Core & periphery',
		nightTitle: 'Core and periphery structures',
		nightBody: 'In La noche de San Juan, the amorous actions occupy the core. Peripheral scenes appear around them, connected through only a few characters: urban episodes that broaden the play’s world without fully joining its main plot.',
		nightAlt: 'Directed character network for La noche de San Juan, organised into a core and several peripheral scenes',
		nightCaption: 'La noche de San Juan: size represents weighted degree and colour distinguishes dramatic functions.',
		coreCallout: 'Core · main plots',
		peripheryCallout: 'Peripheral scenes',
		bridgeLabel: 'Betweenness centrality',
		bridgeTitle: 'Betweenness identifies structurally important characters',
		bridgeBody: 'Guillermo, a pedlar in Las ferias de Madrid, intervenes only fifteen times during the first act. Yet he connects scenes and groups that would otherwise remain isolated, giving him the highest betweenness in the play.',
		bridgeStat: '0.331',
		bridgeStatLabel: 'normalised betweenness',
		bridgeAlt: 'Las ferias de Madrid network with Guillermo acting as a bridge between groups of characters',
		bridgeCaption: 'Guillermo’s position reveals a structural importance that speech count alone would not show.',
		densityLabel: 'Hypothesis & evidence',
		densityTitle: 'Changes in character count and density',
		densityBody: 'The number of characters falls across the period, but density does not clearly rise. La discreta enamorada and El acero de Madrid have the highest values, disrupting a simple evolutionary reading.',
		densityAlt: 'Density chart for the eight plays in the corpus',
		densityCaption: 'The trend line barely rises: the corpus does not confirm a progressive densification of intrigue.',
		densityStats: [
			{ value: '28 → 11', label: 'characters, first and last play' },
			{ value: 'R² 0.001', label: 'density trend' }
		],
		parallelLabel: 'Recurring structures',
		parallelTitle: 'A recurring structure: parallel love plots',
		parallelBody: 'A relational pattern stabilises in the later plays: courtship between lady and gallant finds its parodic reflection in maid and servant. Diagonal connections also reveal their work as messengers when the lovers cannot meet.',
		parallelFigures: [
			{ src: '/images/projects/redes-personajes/amar-sin-saber.webp', alt: 'Character network for Amar sin saber a quién', caption: 'Amar sin saber a quién: Inés mediates between a lady and a gallant who cannot yet meet.', number: '04' },
			{ src: '/images/projects/redes-personajes/santiago-verde.webp', alt: 'Character network for Santiago el verde', caption: 'Santiago el verde: both couples and their diagonal relationships cluster in the core.', number: '05' },
			{ src: '/images/projects/redes-personajes/bizarrias-belisa.webp', alt: 'Character network for Las bizarrías de Belisa', caption: 'Las bizarrías de Belisa: the parallel structure remains particularly stable.', number: '06' }
		],
		pedagogyLabel: 'Transfer & pedagogy',
		pedagogyTitle: 'One pedagogical strand, two approaches',
		pedagogyBody: 'The pedagogical strand developed in two ways: teaching how to conduct network analysis with Golden Age drama and using networks as a tool for teaching Silver Age literature.',
		pedagogyNote: 'The networks are not built in the same way: the thesis and tutorials record direct linguistic interactions, while e-DrAMAS links characters through co-appearance in scenes.',
		pedagogyItems: [
			{ type: 'Golden Age drama', title: 'Programming Historian tutorials', body: 'Two open lessons explain step by step how to extract linguistic interactions, build the networks, and analyse them with Gephi.' },
			{ type: 'Silver Age drama', title: 'e-DrAMAS: networks for teaching literature', body: 'In the e-DrAMAS workshop, scene co-appearance networks were used as a pedagogical tool for studying women playwrights of the Silver Age. The experience led to the chapter “From stage to graph”.' }
		]
	});

</script>

<section class="grid gap-[clamp(90px,14vw,210px)] border-t border-rule-strong py-[clamp(76px,11vw,150px)]">
	<article class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] items-end gap-[clamp(50px,9vw,130px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="max-w-[800px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} max-w-[12ch] text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} mt-7 mb-0 max-w-[66ch]">{copy.introBody}</p>
		</div>
		<dl class="m-0 grid border-t border-rule-strong">
			{#each copy.stats as stat (stat.label)}
				<div class="grid grid-cols-[minmax(105px,.8fr)_1fr] items-baseline gap-4 border-b border-rule py-3.5">
					<dt class="font-title text-[clamp(1.6rem,2.8vw,2.7rem)] leading-none">{stat.value}</dt>
					<dd class="meta m-0 text-ink-faint">{stat.label}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<article class="grid grid-cols-[minmax(300px,.8fr)_minmax(0,1.2fr)] items-end gap-[clamp(55px,10vw,150px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="max-w-[650px]">
			<p class={labelClass}>{copy.methodLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.methodTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.methodBody}</p>
			<ul class="meta mt-7 mb-0 flex list-none flex-wrap gap-[7px] p-0">
				{#each copy.attributes as attribute (attribute)}<li class="rounded-full border border-rule px-[10px] py-[7px] text-[0.58rem] text-ink-faint">{attribute}</li>{/each}
			</ul>
		</div>
		<ol class="m-0 grid list-none grid-cols-4 border-t border-rule-strong p-0 max-[600px]:grid-cols-2">
			{#each copy.methodSteps as step, index (step)}
				<li class={`relative grid min-h-[230px] grid-rows-[1fr_auto] gap-[22px] border-b border-rule px-3.5 pt-5 pb-3.5 ${index < copy.methodSteps.length - 1 ? "border-r after:absolute after:top-1/2 after:right-[-7px] after:z-[2] after:text-accent-strong after:content-['→']" : ''} ${index === 1 ? 'max-[600px]:border-r-0 max-[600px]:after:hidden' : ''}`}>
					<NetworkMethodVisual {index} />
					<div class="grid gap-2"><span class="meta text-ink-faint">0{index + 1}</span><strong class="font-title text-[clamp(1rem,1.8vw,1.6rem)] font-[450]">{step}</strong></div>
				</li>
			{/each}
		</ol>
	</article>

	<article class="grid grid-cols-[minmax(0,.9fr)_minmax(380px,1.1fr)] gap-[clamp(50px,9vw,130px)] border-y border-rule-strong py-[clamp(50px,7vw,86px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="max-w-[650px]">
			<h3 class="{headingClass} text-[clamp(2rem,3.8vw,3.9rem)] leading-[0.96]">{copy.encodingTitle}</h3>
			<p class="{bodyClass} mt-[22px] mb-0">{copy.encodingBody}</p>
		</div>
		<dl class="m-0 grid grid-cols-4 max-[600px]:grid-cols-2">
			{#each copy.encoding as item, index (item)}
				<div class="grid place-items-center gap-[10px] border-b border-rule px-2 py-[18px]">
					<dt class={`font-title text-[clamp(2rem,4vw,4rem)] leading-none ${index === 3 ? 'translate-x-[-12px] text-[#d1be5c] [text-shadow:12px_0_#7baea0,24px_0_#aaa0bd]' : 'text-ink-dim'}`}>{item.mark}</dt>
					<dd class="meta m-0 text-ink-faint">{item.label}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<article class="grid gap-[clamp(50px,8vw,100px)]" use:reveal>
		<div class="ml-[8%] w-[min(720px,76%)] max-[600px]:ml-0 max-[600px]:w-full">
			<p class={labelClass}>{copy.nightLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.nightTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.nightBody}</p>
		</div>
		<div class="relative">
			<ProjectFigure src="/images/projects/redes-personajes/noche-san-juan.webp" alt={copy.nightAlt} caption={copy.nightCaption} number="01" priority bare />
			<span class="meta absolute top-[35%] left-[3%] z-[3] max-w-[180px] rounded-ui-sm bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] px-3 py-[9px] text-ink-dim backdrop-blur-[8px] after:absolute after:top-1/2 after:left-[96%] after:h-px after:w-[clamp(60px,10vw,150px)] after:origin-left after:rotate-[-14deg] after:bg-accent-strong after:content-[''] max-[600px]:hidden">{copy.peripheryCallout}</span>
			<span class="meta absolute top-[19%] right-[4%] z-[3] max-w-[180px] rounded-ui-sm bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] px-3 py-[9px] text-ink-dim backdrop-blur-[8px] after:absolute after:top-full after:left-[15%] after:h-px after:w-[clamp(55px,8vw,120px)] after:origin-left after:rotate-[124deg] after:bg-accent-strong after:content-[''] max-[600px]:hidden">{copy.coreCallout}</span>
		</div>
	</article>

	<article class="grid grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)] items-start gap-[clamp(55px,9vw,130px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="h-full">
			<div class="sticky top-[18vh] max-w-[610px] max-[850px]:static">
				<p class={labelClass}>{copy.bridgeLabel}</p>
				<h3 class={sectionHeadingClass}>{copy.bridgeTitle}</h3>
				<p class="{bodyClass} mt-[23px] mb-0">{copy.bridgeBody}</p>
				<div class="mt-11 grid gap-1.5 border-t border-rule-strong pt-[18px]">
					<strong class="font-title text-[clamp(3rem,7vw,7rem)] font-[450] leading-[0.8] tracking-[-0.05em]">{copy.bridgeStat}</strong>
					<span class="meta text-ink-faint">{copy.bridgeStatLabel}</span>
				</div>
			</div>
		</div>
		<div class="w-[min(100%,670px)] justify-self-center max-[850px]:w-[min(78vw,620px)] max-[600px]:w-full"><ProjectFigure src="/images/projects/redes-personajes/ferias-intermediacion.webp" alt={copy.bridgeAlt} caption={copy.bridgeCaption} number="02" bare /></div>
	</article>

	<article class="grid grid-cols-[minmax(0,1.18fr)_minmax(300px,.82fr)] items-center gap-[clamp(55px,9vw,130px)] max-[850px]:grid-cols-1" use:reveal>
		<div><ProjectFigure src="/images/projects/redes-personajes/densidad.webp" alt={copy.densityAlt} caption={copy.densityCaption} number="03" bare /></div>
		<div class="max-w-[620px] max-[850px]:row-start-1">
			<p class={labelClass}>{copy.densityLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.densityTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.densityBody}</p>
			<dl class="mt-[38px] mb-0 grid grid-cols-2 gap-7 border-t border-rule-strong pt-[18px] max-[600px]:grid-cols-1">
				{#each copy.densityStats as stat (stat.label)}
					<div class="grid gap-2"><dt class="font-title text-[clamp(1.8rem,3.5vw,3.4rem)] leading-none">{stat.value}</dt><dd class="meta m-0 text-ink-faint">{stat.label}</dd></div>
				{/each}
			</dl>
		</div>
	</article>

	<section class="grid gap-[clamp(60px,9vw,120px)]" use:reveal>
		<div class="ml-[12%] max-w-[740px] max-[600px]:ml-0 max-[600px]:w-full">
			<p class={labelClass}>{copy.parallelLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.parallelTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.parallelBody}</p>
		</div>
		<div class="grid grid-cols-12 items-start gap-x-6 gap-y-[clamp(38px,6vw,90px)] max-[600px]:grid-cols-1">
			{#each copy.parallelFigures as figure, index (figure.src)}
				<div class={`${index === 0 ? 'col-start-1 col-span-7' : index === 1 ? 'col-start-8 col-span-5 mt-[clamp(70px,10vw,140px)]' : 'col-start-3 col-span-6'} max-[600px]:col-start-1 max-[600px]:col-span-1 max-[600px]:mt-0`}>
					<ProjectFigure src={figure.src} alt={figure.alt} caption={figure.caption} number={figure.number} bare />
				</div>
			{/each}
		</div>
	</section>

	<section class="grid gap-[clamp(58px,9vw,120px)] border-y border-rule-strong py-[clamp(58px,9vw,110px)]" use:reveal>
		<header class="grid grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)] items-end gap-[clamp(48px,9vw,130px)] max-[850px]:grid-cols-1">
			<div class="max-w-[760px]">
				<p class={labelClass}>{copy.pedagogyLabel}</p>
				<h3 class={sectionHeadingClass}>{copy.pedagogyTitle}</h3>
				<p class="{bodyClass} mt-[23px] mb-0">{copy.pedagogyBody}</p>
			</div>
			<p class="m-0 max-w-[48ch] border-l-2 border-accent pl-6 font-title text-[clamp(1.05rem,1.8vw,1.45rem)] text-ink-dim leading-[1.68]">{copy.pedagogyNote}</p>
		</header>
		<ol class="m-0 list-none border-t border-rule-strong p-0">
			{#each copy.pedagogyItems as item (item.type)}
				<li class="grid grid-cols-[minmax(190px,.55fr)_minmax(0,1.45fr)] gap-[clamp(28px,7vw,100px)] border-b border-rule py-[clamp(24px,4vw,48px)] max-[600px]:grid-cols-1">
					<div class="pt-2"><span class="meta text-accent-strong">{item.type}</span></div>
					<div>
						<h4 class="m-0 font-title text-[clamp(1.45rem,2.8vw,2.6rem)] font-[450] tracking-[-0.025em]">{item.title}</h4>
						<p class="{bodyClass} mt-3 mb-0 max-w-[68ch]">{item.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>
</section>
