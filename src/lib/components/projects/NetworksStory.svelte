<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import NetworkMethodVisual from './NetworkMethodVisual.svelte';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal({ threshold: 0.1 });
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.04em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const labelClass = 'meta tw:mt-0 tw:mb-4 tw:text-accent-strong';
	const sectionHeadingClass = `${headingClass} tw:text-[clamp(2.2rem,4.7vw,4.8rem)] tw:leading-[0.94]`;

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

<section class="tw:grid tw:gap-[clamp(90px,14vw,210px)] tw:border-t tw:border-rule-strong tw:py-[clamp(76px,11vw,150px)]">
	<article class="tw:grid tw:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] tw:items-end tw:gap-[clamp(50px,9vw,130px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[800px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} tw:max-w-[12ch] tw:text-[clamp(2.8rem,6.5vw,6.5rem)] tw:leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} tw:mt-7 tw:mb-0 tw:max-w-[66ch]">{copy.introBody}</p>
		</div>
		<dl class="tw:m-0 tw:grid tw:border-t tw:border-rule-strong">
			{#each copy.stats as stat (stat.label)}
				<div class="tw:grid tw:grid-cols-[minmax(105px,.8fr)_1fr] tw:items-baseline tw:gap-4 tw:border-b tw:border-rule tw:py-3.5">
					<dt class="tw:font-title tw:text-[clamp(1.6rem,2.8vw,2.7rem)] tw:leading-none">{stat.value}</dt>
					<dd class="meta tw:m-0 tw:text-ink-faint">{stat.label}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(300px,.8fr)_minmax(0,1.2fr)] tw:items-end tw:gap-[clamp(55px,10vw,150px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[650px]">
			<p class={labelClass}>{copy.methodLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.methodTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.methodBody}</p>
			<ul class="meta tw:mt-7 tw:mb-0 tw:flex tw:list-none tw:flex-wrap tw:gap-[7px] tw:p-0">
				{#each copy.attributes as attribute (attribute)}<li class="tw:rounded-full tw:border tw:border-rule tw:px-[10px] tw:py-[7px] tw:text-[0.58rem] tw:text-ink-faint">{attribute}</li>{/each}
			</ul>
		</div>
		<ol class="tw:m-0 tw:grid tw:list-none tw:grid-cols-4 tw:border-t tw:border-rule-strong tw:p-0 tw:max-[600px]:grid-cols-2">
			{#each copy.methodSteps as step, index (step)}
				<li class={`tw:relative tw:grid tw:min-h-[230px] tw:grid-rows-[1fr_auto] tw:gap-[22px] tw:border-b tw:border-rule tw:px-3.5 tw:pt-5 tw:pb-3.5 ${index < copy.methodSteps.length - 1 ? "tw:border-r tw:after:absolute tw:after:top-1/2 tw:after:right-[-7px] tw:after:z-[2] tw:after:text-accent-strong tw:after:content-['→']" : ''} ${index === 1 ? 'tw:max-[600px]:border-r-0 tw:max-[600px]:after:hidden' : ''}`}>
					<NetworkMethodVisual {index} />
					<div class="tw:grid tw:gap-2"><span class="meta tw:text-ink-faint">0{index + 1}</span><strong class="tw:font-title tw:text-[clamp(1rem,1.8vw,1.6rem)] tw:font-[450]">{step}</strong></div>
				</li>
			{/each}
		</ol>
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(0,.9fr)_minmax(380px,1.1fr)] tw:gap-[clamp(50px,9vw,130px)] tw:border-y tw:border-rule-strong tw:py-[clamp(50px,7vw,86px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[650px]">
			<h3 class="{headingClass} tw:text-[clamp(2rem,3.8vw,3.9rem)] tw:leading-[0.96]">{copy.encodingTitle}</h3>
			<p class="{bodyClass} tw:mt-[22px] tw:mb-0">{copy.encodingBody}</p>
		</div>
		<dl class="tw:m-0 tw:grid tw:grid-cols-4 tw:max-[600px]:grid-cols-2">
			{#each copy.encoding as item, index (item)}
				<div class="tw:grid tw:place-items-center tw:gap-[10px] tw:border-b tw:border-rule tw:px-2 tw:py-[18px]">
					<dt class={`tw:font-title tw:text-[clamp(2rem,4vw,4rem)] tw:leading-none ${index === 3 ? 'tw:translate-x-[-12px] tw:text-[#d1be5c] tw:[text-shadow:12px_0_#7baea0,24px_0_#aaa0bd]' : 'tw:text-ink-dim'}`}>{item.mark}</dt>
					<dd class="meta tw:m-0 tw:text-ink-faint">{item.label}</dd>
				</div>
			{/each}
		</dl>
	</article>

	<article class="tw:grid tw:gap-[clamp(50px,8vw,100px)]" use:reveal>
		<div class="tw:ml-[8%] tw:w-[min(720px,76%)] tw:max-[600px]:ml-0 tw:max-[600px]:w-full">
			<p class={labelClass}>{copy.nightLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.nightTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.nightBody}</p>
		</div>
		<div class="tw:relative">
			<ProjectFigure src="/images/projects/redes-personajes/noche-san-juan.webp" alt={copy.nightAlt} caption={copy.nightCaption} number="01" priority bare />
			<span class="meta tw:absolute tw:top-[35%] tw:left-[3%] tw:z-[3] tw:max-w-[180px] tw:rounded-ui-sm tw:bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] tw:px-3 tw:py-[9px] tw:text-ink-dim tw:backdrop-blur-[8px] tw:after:absolute tw:after:top-1/2 tw:after:left-[96%] tw:after:h-px tw:after:w-[clamp(60px,10vw,150px)] tw:after:origin-left tw:after:rotate-[-14deg] tw:after:bg-accent-strong tw:after:content-[''] tw:max-[600px]:hidden">{copy.peripheryCallout}</span>
			<span class="meta tw:absolute tw:top-[19%] tw:right-[4%] tw:z-[3] tw:max-w-[180px] tw:rounded-ui-sm tw:bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] tw:px-3 tw:py-[9px] tw:text-ink-dim tw:backdrop-blur-[8px] tw:after:absolute tw:after:top-full tw:after:left-[15%] tw:after:h-px tw:after:w-[clamp(55px,8vw,120px)] tw:after:origin-left tw:after:rotate-[124deg] tw:after:bg-accent-strong tw:after:content-[''] tw:max-[600px]:hidden">{copy.coreCallout}</span>
		</div>
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)] tw:items-start tw:gap-[clamp(55px,9vw,130px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:h-full">
			<div class="tw:sticky tw:top-[18vh] tw:max-w-[610px] tw:max-[850px]:static">
				<p class={labelClass}>{copy.bridgeLabel}</p>
				<h3 class={sectionHeadingClass}>{copy.bridgeTitle}</h3>
				<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.bridgeBody}</p>
				<div class="tw:mt-11 tw:grid tw:gap-1.5 tw:border-t tw:border-rule-strong tw:pt-[18px]">
					<strong class="tw:font-title tw:text-[clamp(3rem,7vw,7rem)] tw:font-[450] tw:leading-[0.8] tw:tracking-[-0.05em]">{copy.bridgeStat}</strong>
					<span class="meta tw:text-ink-faint">{copy.bridgeStatLabel}</span>
				</div>
			</div>
		</div>
		<div class="tw:w-[min(100%,670px)] tw:justify-self-center tw:max-[850px]:w-[min(78vw,620px)] tw:max-[600px]:w-full"><ProjectFigure src="/images/projects/redes-personajes/ferias-intermediacion.webp" alt={copy.bridgeAlt} caption={copy.bridgeCaption} number="02" bare /></div>
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(0,1.18fr)_minmax(300px,.82fr)] tw:items-center tw:gap-[clamp(55px,9vw,130px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div><ProjectFigure src="/images/projects/redes-personajes/densidad.webp" alt={copy.densityAlt} caption={copy.densityCaption} number="03" bare /></div>
		<div class="tw:max-w-[620px] tw:max-[850px]:row-start-1">
			<p class={labelClass}>{copy.densityLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.densityTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.densityBody}</p>
			<dl class="tw:mt-[38px] tw:mb-0 tw:grid tw:grid-cols-2 tw:gap-7 tw:border-t tw:border-rule-strong tw:pt-[18px] tw:max-[600px]:grid-cols-1">
				{#each copy.densityStats as stat (stat.label)}
					<div class="tw:grid tw:gap-2"><dt class="tw:font-title tw:text-[clamp(1.8rem,3.5vw,3.4rem)] tw:leading-none">{stat.value}</dt><dd class="meta tw:m-0 tw:text-ink-faint">{stat.label}</dd></div>
				{/each}
			</dl>
		</div>
	</article>

	<section class="tw:grid tw:gap-[clamp(60px,9vw,120px)]" use:reveal>
		<div class="tw:ml-[12%] tw:max-w-[740px] tw:max-[600px]:ml-0 tw:max-[600px]:w-full">
			<p class={labelClass}>{copy.parallelLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.parallelTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.parallelBody}</p>
		</div>
		<div class="tw:grid tw:grid-cols-12 tw:items-start tw:gap-x-6 tw:gap-y-[clamp(38px,6vw,90px)] tw:max-[600px]:grid-cols-1">
			{#each copy.parallelFigures as figure, index (figure.src)}
				<div class={`${index === 0 ? 'tw:col-start-1 tw:col-span-7' : index === 1 ? 'tw:col-start-8 tw:col-span-5 tw:mt-[clamp(70px,10vw,140px)]' : 'tw:col-start-3 tw:col-span-6'} tw:max-[600px]:col-start-1 tw:max-[600px]:col-span-1 tw:max-[600px]:mt-0`}>
					<ProjectFigure src={figure.src} alt={figure.alt} caption={figure.caption} number={figure.number} bare />
				</div>
			{/each}
		</div>
	</section>

	<section class="tw:grid tw:gap-[clamp(58px,9vw,120px)] tw:border-y tw:border-rule-strong tw:py-[clamp(58px,9vw,110px)]" use:reveal>
		<header class="tw:grid tw:grid-cols-[minmax(0,1.15fr)_minmax(280px,.85fr)] tw:items-end tw:gap-[clamp(48px,9vw,130px)] tw:max-[850px]:grid-cols-1">
			<div class="tw:max-w-[760px]">
				<p class={labelClass}>{copy.pedagogyLabel}</p>
				<h3 class={sectionHeadingClass}>{copy.pedagogyTitle}</h3>
				<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.pedagogyBody}</p>
			</div>
			<p class="tw:m-0 tw:max-w-[48ch] tw:border-l-2 tw:border-accent tw:pl-6 tw:font-title tw:text-[clamp(1.05rem,1.8vw,1.45rem)] tw:text-ink-dim tw:leading-[1.68]">{copy.pedagogyNote}</p>
		</header>
		<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule-strong tw:p-0">
			{#each copy.pedagogyItems as item (item.type)}
				<li class="tw:grid tw:grid-cols-[minmax(190px,.55fr)_minmax(0,1.45fr)] tw:gap-[clamp(28px,7vw,100px)] tw:border-b tw:border-rule tw:py-[clamp(24px,4vw,48px)] tw:max-[600px]:grid-cols-1">
					<div class="tw:pt-2"><span class="meta tw:text-accent-strong">{item.type}</span></div>
					<div>
						<h4 class="tw:m-0 tw:font-title tw:text-[clamp(1.45rem,2.8vw,2.6rem)] tw:font-[450] tw:tracking-[-0.025em]">{item.title}</h4>
						<p class="{bodyClass} tw:mt-3 tw:mb-0 tw:max-w-[68ch]">{item.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</section>
</section>
