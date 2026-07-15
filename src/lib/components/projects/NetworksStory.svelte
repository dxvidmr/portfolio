<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();

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

	function reveal(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		node.classList.add('reveal-pending');
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('reveal-visible');
			observer.disconnect();
		}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}
</script>

<section class="networks-story">
	<article class="opening" use:reveal>
		<div class="opening-copy">
			<p class="meta label">{copy.introLabel}</p>
			<h3>{copy.introTitle}</h3>
			<p>{copy.introBody}</p>
		</div>
		<dl class="stats">
			{#each copy.stats as stat (stat.label)}<div><dt>{stat.value}</dt><dd class="meta">{stat.label}</dd></div>{/each}
		</dl>
	</article>

	<article class="method" use:reveal>
		<div class="method-copy">
			<p class="meta label">{copy.methodLabel}</p>
			<h3>{copy.methodTitle}</h3>
			<p>{copy.methodBody}</p>
			<ul class="attributes meta">{#each copy.attributes as attribute (attribute)}<li>{attribute}</li>{/each}</ul>
		</div>
		<ol class="method-flow">
			{#each copy.methodSteps as step, index (step)}
				<li>
					<div class="method-visual" aria-hidden="true">
						{#if index === 0}
							<div class="text-sample"><b>DON JUAN</b><i></i><i></i><b>INÉS</b><i></i></div>
						{:else if index === 1}
							<div class="matrix-sample">
								{#each [0, 3, 1, 0, 2, 0, 4, 1, 0, 2, 0, 5, 1, 0, 3, 0] as value}<i class:filled={value > 0}>{value || ''}</i>{/each}
							</div>
						{:else if index === 2}
							<svg class="graph-sample" viewBox="0 0 120 82" role="presentation">
								<path d="M18 42 55 18M18 42 58 66M55 18 101 36M58 66 101 36M55 18 58 66" />
								<circle cx="18" cy="42" r="7" /><circle cx="55" cy="18" r="10" /><circle cx="58" cy="66" r="6" /><circle cx="101" cy="36" r="12" />
							</svg>
						{:else}
							<div class="compare-sample">
								<svg viewBox="0 0 60 76" role="presentation"><path d="M8 40 27 16 48 34 35 63 8 40Z" /><circle cx="8" cy="40" r="4" /><circle cx="27" cy="16" r="6" /><circle cx="48" cy="34" r="5" /><circle cx="35" cy="63" r="4" /></svg>
								<svg viewBox="0 0 60 76" role="presentation"><path d="M9 24 48 24 48 58 9 58 9 24ZM9 24 48 58M48 24 9 58" /><circle cx="9" cy="24" r="5" /><circle cx="48" cy="24" r="5" /><circle cx="48" cy="58" r="5" /><circle cx="9" cy="58" r="5" /></svg>
							</div>
						{/if}
					</div>
					<div class="step-label"><span class="meta">0{index + 1}</span><strong>{step}</strong></div>
				</li>
			{/each}
		</ol>
	</article>

	<article class="encoding" use:reveal>
		<div><h3>{copy.encodingTitle}</h3><p>{copy.encodingBody}</p></div>
		<dl>
			{#each copy.encoding as item, index (item)}<div class:color-mark={index === 3}><dt>{item.mark}</dt><dd class="meta">{item.label}</dd></div>{/each}
		</dl>
	</article>

	<article class="night" use:reveal>
		<div class="night-copy">
			<p class="meta label">{copy.nightLabel}</p>
			<h3>{copy.nightTitle}</h3>
			<p>{copy.nightBody}</p>
		</div>
		<div class="annotated-network">
			<ProjectFigure src="/images/projects/redes-personajes/noche-san-juan.webp" alt={copy.nightAlt} caption={copy.nightCaption} number="01" priority bare />
			<span class="callout periphery meta">{copy.peripheryCallout}</span>
			<span class="callout core meta">{copy.coreCallout}</span>
		</div>
	</article>

	<article class="bridge" use:reveal>
		<div class="bridge-copy">
			<div class="sticky-copy">
				<p class="meta label">{copy.bridgeLabel}</p>
				<h3>{copy.bridgeTitle}</h3>
				<p>{copy.bridgeBody}</p>
				<div class="big-stat"><strong>{copy.bridgeStat}</strong><span class="meta">{copy.bridgeStatLabel}</span></div>
			</div>
		</div>
		<div class="bridge-figure"><ProjectFigure src="/images/projects/redes-personajes/ferias-intermediacion.webp" alt={copy.bridgeAlt} caption={copy.bridgeCaption} number="02" bare /></div>
	</article>

	<article class="density" use:reveal>
		<div class="density-figure"><ProjectFigure src="/images/projects/redes-personajes/densidad.webp" alt={copy.densityAlt} caption={copy.densityCaption} number="03" bare /></div>
		<div class="density-copy">
			<p class="meta label">{copy.densityLabel}</p>
			<h3>{copy.densityTitle}</h3>
			<p>{copy.densityBody}</p>
			<dl>{#each copy.densityStats as stat (stat.label)}<div><dt>{stat.value}</dt><dd class="meta">{stat.label}</dd></div>{/each}</dl>
		</div>
	</article>

	<section class="parallel" use:reveal>
		<div class="parallel-copy">
			<p class="meta label">{copy.parallelLabel}</p>
			<h3>{copy.parallelTitle}</h3>
			<p>{copy.parallelBody}</p>
		</div>
		<div class="parallel-figures">
			{#each copy.parallelFigures as figure (figure.src)}
				<ProjectFigure src={figure.src} alt={figure.alt} caption={figure.caption} number={figure.number} bare />
			{/each}
		</div>
	</section>

	<section class="pedagogy" use:reveal>
		<header>
			<div class="pedagogy-copy">
				<p class="meta label">{copy.pedagogyLabel}</p>
				<h3>{copy.pedagogyTitle}</h3>
				<p>{copy.pedagogyBody}</p>
			</div>
			<p class="pedagogy-note">{copy.pedagogyNote}</p>
		</header>
		<ol class="pedagogy-path">
			{#each copy.pedagogyItems as item (item.type)}
				<li>
					<div class="path-meta"><span class="meta">{item.type}</span></div>
					<div><h4>{item.title}</h4><p>{item.body}</p></div>
				</li>
			{/each}
		</ol>
	</section>
</section>

<style>
	.networks-story { display: grid; gap: clamp(90px, 14vw, 210px); padding-block: clamp(76px, 11vw, 150px); border-top: 1px solid var(--line-strong); }
	.networks-story h3 { margin: 0; font-weight: 450; letter-spacing: -.04em; }
	.networks-story p:not(.label) { color: var(--fg-dim); line-height: 1.68; }
	.label { margin: 0 0 16px; color: var(--accent-strong); }
	.opening { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: clamp(50px, 9vw, 130px); align-items: end; }
	.opening-copy { max-width: 800px; }
	.opening h3 { max-width: 12ch; font-size: clamp(2.8rem, 6.5vw, 6.5rem); line-height: .9; }
	.opening-copy > p:last-child { max-width: 66ch; margin: 28px 0 0; }
	.stats { display: grid; margin: 0; border-top: 1px solid var(--line-strong); }
	.stats div { display: grid; grid-template-columns: minmax(105px, .8fr) 1fr; gap: 16px; align-items: baseline; padding: 14px 0; border-bottom: 1px solid var(--line); }
	.stats dt { font-family: var(--font-title); font-size: clamp(1.6rem, 2.8vw, 2.7rem); line-height: 1; }
	.stats dd { margin: 0; color: var(--fg-faint); }
	.method { display: grid; grid-template-columns: minmax(300px, .8fr) minmax(0, 1.2fr); gap: clamp(55px, 10vw, 150px); align-items: end; }
	.method-copy { max-width: 650px; }
	.method h3, .night h3, .bridge h3, .density h3, .parallel h3 { font-size: clamp(2.2rem, 4.7vw, 4.8rem); line-height: .94; }
	.method-copy > p:not(.label), .night-copy > p:not(.label), .bridge-copy p:not(.label), .density-copy > p:not(.label), .parallel-copy > p:not(.label) { margin: 23px 0 0; }
	.attributes { display: flex; flex-wrap: wrap; gap: 7px; margin: 28px 0 0; padding: 0; list-style: none; }
	.attributes li { padding: 7px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--fg-faint); font-size: .58rem; }
	.method-flow { display: grid; grid-template-columns: repeat(4, 1fr); margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.method-flow li { position: relative; display: grid; min-height: 230px; grid-template-rows: 1fr auto; gap: 22px; padding: 20px 14px 14px; border-bottom: 1px solid var(--line); }
	.method-flow li:not(:last-child) { border-right: 1px solid var(--line); }
	.method-flow li:not(:last-child)::after { position: absolute; top: 50%; right: -7px; z-index: 2; color: var(--accent-strong); content: '→'; }
	.method-visual { display: grid; min-height: 120px; place-items: center; color: var(--fg-dim); }
	.step-label { display: grid; gap: 8px; }
	.step-label span { color: var(--fg-faint); }
	.step-label strong { font-family: var(--font-title); font-size: clamp(1rem, 1.8vw, 1.6rem); font-weight: 450; }
	.text-sample { display: grid; width: min(100%, 112px); gap: 6px; font-family: var(--font-mono); font-size: .46rem; }
	.text-sample b { font-weight: 600; letter-spacing: .08em; }
	.text-sample b:nth-of-type(2) { margin-top: 5px; color: var(--accent-strong); }
	.text-sample i { height: 2px; border-radius: 2px; background: var(--line-strong); }
	.text-sample i:nth-of-type(2) { width: 78%; }
	.matrix-sample { display: grid; grid-template-columns: repeat(4, 1fr); width: min(100%, 105px); aspect-ratio: 1; gap: 2px; }
	.matrix-sample i { display: grid; place-items: center; border: 1px solid var(--line); color: var(--fg-faint); font-family: var(--font-mono); font-size: .42rem; font-style: normal; }
	.matrix-sample i.filled { background: color-mix(in srgb, var(--accent) 22%, transparent); color: var(--fg); }
	.graph-sample { width: min(100%, 126px); overflow: visible; }
	.graph-sample path, .compare-sample path { fill: none; stroke: var(--fg-faint); stroke-width: 1.2; }
	.graph-sample circle { fill: var(--accent); stroke: var(--fg-dim); stroke-width: .8; }
	.graph-sample circle:nth-of-type(2) { fill: #aaa0bd; }.graph-sample circle:nth-of-type(3) { fill: #7baea0; }.graph-sample circle:nth-of-type(4) { fill: #d1be5c; }
	.compare-sample { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: min(100%, 128px); }
	.compare-sample svg { width: 100%; }
	.compare-sample circle { fill: var(--visual-bg); stroke: var(--accent-strong); stroke-width: 1.2; }
	.encoding { display: grid; grid-template-columns: minmax(0, .9fr) minmax(380px, 1.1fr); gap: clamp(50px, 9vw, 130px); padding-block: clamp(50px, 7vw, 86px); border-block: 1px solid var(--line-strong); }
	.encoding > div { max-width: 650px; }
	.encoding h3 { font-size: clamp(2rem, 3.8vw, 3.9rem); line-height: .96; }
	.encoding p { margin: 22px 0 0; }
	.encoding dl { display: grid; grid-template-columns: repeat(4, 1fr); margin: 0; }
	.encoding dl div { display: grid; place-items: center; gap: 10px; padding: 18px 8px; border-bottom: 1px solid var(--line); }
	.encoding dt { color: var(--fg-dim); font-family: var(--font-title); font-size: clamp(2rem, 4vw, 4rem); line-height: 1; }
	.encoding dd { margin: 0; color: var(--fg-faint); }
	.encoding .color-mark dt { color: #d1be5c; text-shadow: 12px 0 #7baea0, 24px 0 #aaa0bd; transform: translateX(-12px); }
	.night { display: grid; gap: clamp(50px, 8vw, 100px); }
	.night-copy { width: min(720px, 76%); margin-left: 8%; }
	.annotated-network { position: relative; }
	.callout { position: absolute; z-index: 3; max-width: 180px; padding: 9px 12px; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--bg) 76%, transparent); color: var(--fg-dim); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); }
	.callout::after { position: absolute; height: 1px; background: var(--accent-strong); content: ''; transform-origin: left; }
	.callout.periphery { top: 35%; left: 3%; }
	.callout.periphery::after { top: 50%; left: 96%; width: clamp(60px, 10vw, 150px); transform: rotate(-14deg); }
	.callout.core { top: 19%; right: 4%; }
	.callout.core::after { top: 100%; left: 15%; width: clamp(55px, 8vw, 120px); transform: rotate(124deg); }
	.bridge { display: grid; grid-template-columns: minmax(300px, .72fr) minmax(0, 1.28fr); gap: clamp(55px, 9vw, 130px); align-items: start; }
	.bridge-copy { height: 100%; }
	.sticky-copy { position: sticky; top: 18vh; max-width: 610px; }
	.big-stat { display: grid; gap: 6px; margin-top: 44px; padding-top: 18px; border-top: 1px solid var(--line-strong); }
	.big-stat strong { font-family: var(--font-title); font-size: clamp(3rem, 7vw, 7rem); font-weight: 450; line-height: .8; letter-spacing: -.05em; }
	.big-stat span { color: var(--fg-faint); }
	.bridge-figure { width: min(100%, 670px); justify-self: center; }
	.density { display: grid; grid-template-columns: minmax(0, 1.18fr) minmax(300px, .82fr); gap: clamp(55px, 9vw, 130px); align-items: center; }
	.density-copy { max-width: 620px; }
	.density-copy dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; margin: 38px 0 0; padding-top: 18px; border-top: 1px solid var(--line-strong); }
	.density-copy dl div { display: grid; gap: 8px; }
	.density-copy dt { font-family: var(--font-title); font-size: clamp(1.8rem, 3.5vw, 3.4rem); line-height: 1; }
	.density-copy dd { margin: 0; color: var(--fg-faint); }
	.parallel { display: grid; gap: clamp(60px, 9vw, 120px); }
	.parallel-copy { max-width: 740px; margin-left: 12%; }
	.parallel-figures { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(38px, 6vw, 90px) 24px; align-items: start; }
	.parallel-figures > :global(figure:nth-child(1)) { grid-column: 1 / span 7; }
	.parallel-figures > :global(figure:nth-child(2)) { grid-column: 8 / span 5; margin-top: clamp(70px, 10vw, 140px); }
	.parallel-figures > :global(figure:nth-child(3)) { grid-column: 3 / span 6; }
	.pedagogy { display: grid; gap: clamp(58px, 9vw, 120px); padding-block: clamp(58px, 9vw, 110px); border-block: 1px solid var(--line-strong); }
	.pedagogy > header { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(280px, .85fr); gap: clamp(48px, 9vw, 130px); align-items: end; }
	.pedagogy-copy { max-width: 760px; }
	.pedagogy h3 { font-size: clamp(2.2rem, 4.7vw, 4.8rem); line-height: .94; }
	.pedagogy-copy > p:not(.label) { margin: 23px 0 0; }
	.pedagogy-note { max-width: 48ch; margin: 0; padding-left: 24px; border-left: 2px solid var(--accent); font-family: var(--font-title); font-size: clamp(1.05rem, 1.8vw, 1.45rem); }
	.pedagogy-path { margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.pedagogy-path li { display: grid; grid-template-columns: minmax(190px, .55fr) minmax(0, 1.45fr); gap: clamp(28px, 7vw, 100px); padding: clamp(24px, 4vw, 48px) 0; border-bottom: 1px solid var(--line); }
	.path-meta { padding-top: 8px; }
	.path-meta span { color: var(--accent-strong); }
	.pedagogy-path h4 { margin: 0; font-family: var(--font-title); font-size: clamp(1.45rem, 2.8vw, 2.6rem); font-weight: 450; letter-spacing: -.025em; }
	.pedagogy-path p { max-width: 68ch; margin: 12px 0 0; }
	:global(.reveal-pending) { opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 700ms ease, transform 850ms cubic-bezier(.16, 1, .3, 1); }
	:global(.reveal-pending.reveal-visible) { opacity: 1; transform: none; }
	@media (max-width: 850px) {
		.opening, .method, .encoding, .bridge, .density, .pedagogy > header { grid-template-columns: 1fr; }
		.sticky-copy { position: static; }
		.bridge-figure { width: min(78vw, 620px); }
		.density-copy { grid-row: 1; }
	}
	@media (max-width: 600px) {
		.method-flow { grid-template-columns: repeat(2, 1fr); }
		.method-flow li:nth-child(2) { border-right: 0; }
		.encoding dl { grid-template-columns: repeat(2, 1fr); }
		.night-copy, .parallel-copy { width: 100%; margin-left: 0; }
		.callout { display: none; }
		.bridge-figure { width: 100%; }
		.density-copy dl { grid-template-columns: 1fr; }
		.parallel-figures { display: grid; grid-template-columns: 1fr; }
		.parallel-figures > :global(figure:nth-child(n)) { grid-column: 1; margin-top: 0; }
		.pedagogy-path li { grid-template-columns: 1fr; }
	}
	@media (prefers-reduced-motion: reduce) { :global(.reveal-pending) { opacity: 1; transform: none; transition: none; } }
</style>
