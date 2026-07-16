<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';
	import StageFigure from './StageFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal({ threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.04em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const labelClass = 'meta tw:mt-0 tw:mb-4 tw:text-accent-strong';
	const productionHeadingClass = `${headingClass} tw:text-[clamp(2.2rem,4.6vw,4.8rem)] tw:leading-[0.94]`;
	const productionClass =
		'tw:relative tw:grid tw:grid-cols-[72px_minmax(290px,.72fr)_minmax(0,1.28fr)] tw:gap-[clamp(28px,5vw,80px)] tw:border-t tw:border-rule-strong tw:pt-7 tw:max-[960px]:grid-cols-[52px_1fr] tw:max-[620px]:grid-cols-1';
	const productionCopyClass =
		'tw:max-w-[620px] tw:max-[960px]:col-start-2 tw:max-[620px]:col-start-1';

	const copy = $derived(locale === 'es' ? {
		researchLabel: 'Investigación escénica',
		researchTitle: 'Un laboratorio para contrastar hipótesis',
		researchBody: 'El artículo «Documentos en acción» propone estudiar la técnica actoral del Siglo de Oro mediante un laboratorio escénico. No busca reconstruir literalmente una interpretación perdida: combina archivo y práctica para producir conocimiento situado sobre las posibilidades del texto.',
		method: [
			{ title: 'Fuentes', note: 'Textos, tratados e indicios históricos' },
			{ title: 'Hipótesis', note: 'Preguntas concretas sobre voz, gesto y ritmo' },
			{ title: 'Ensayo', note: 'Experimentación y registro del proceso' },
			{ title: 'Análisis', note: 'Contraste entre resultados y documentos' },
			{ title: 'Creación', note: 'La puesta en escena comunica los hallazgos' }
		],
		publication: 'Publicado en METADRAMA. Filología y puesta en escena del teatro del Siglo de Oro, Reichenberger, 2025.',
		productionsLabel: 'Trayectoria escénica',
		productionsTitle: 'Montajes teatrales',
		fuenteTitle: 'Fuenteovejuna',
		fuenteMeta: 'ESAD de Asturias · 2018',
		fuenteBody: 'Taller Escénico Final del Grado en Arte Dramático, dirigido por Cristina Suárez. El montaje se estrenó en el Teatro de La Laboral de Gijón y tuvo varias funciones en Asturias, además de un pasacalles en Oviedo. Fue el cierre de mi formación reglada como actor y mi primer contacto prolongado con un clásico desde el proceso completo de montaje.',
		fuenteRole: 'Interpretación · montaje de graduación',
		fuenteImages: {
			conjuntoAlt: 'El reparto de Fuenteovejuna alineado sobre el escenario bajo una iluminación violeta',
			conjuntoCaption: 'El reparto completo en una de las escenas corales del montaje.',
			cartelAlt: 'Cartel del Taller Escénico Final Fuenteovejuna de la ESAD de Asturias',
			cartelCaption: 'Cartel del montaje estrenado en mayo de 2018.',
			escenaAlt: 'Escena entre Laurencia y Frondoso en el montaje de Fuenteovejuna',
			escenaCaption: 'El montaje combinaba la dimensión colectiva de la obra con escenas de mayor intimidad.',
			accionAlt: 'Tres intérpretes ejecutan una acción física bajo un foco en Fuenteovejuna',
			accionCaption: 'La iluminación recortaba acciones concretas dentro del gran espacio negro.',
			corralAlt: 'Escena coral de Fuenteovejuna con el reparto celebrando en el escenario',
			corralCaption: 'Movimiento, música y acción colectiva articulaban el espacio escénico.',
			frondosoAlt: 'Frondoso sostiene a Laurencia durante una escena de Fuenteovejuna',
			frondosoCaption: 'Una de las escenas de Laurencia y Frondoso.',
			repartoAlt: 'Varios personajes de Fuenteovejuna distribuidos por las gradas del escenario',
			repartoCaption: 'La escenografía escalonada permitía mantener visible la presencia del pueblo.',
			sequenceCaption: 'Ensayo, acción y escenas del montaje'
		},
		cuevaTitle: 'La cueva de Salamanca',
		cuevaMeta: 'METADRAMA · 2024–2025',
		cuevaBody: 'Adaptación de la comedia de Juan Ruiz de Alarcón dirigida por Gaston Gilabert. Tras su estreno en la Universitat de Barcelona, el montaje circuló por encuentros de investigación y festivales de Barcelona y Toledo. Superó los mil espectadores y recibió once premios; dos de ellos reconocieron mi trabajo como mejor actor.',
		cuevaStats: ['10 funciones', '+1.000 espectadores', '11 premios', '2 premios al mejor actor'],
		cuevaAlt: 'Escena nocturna de La cueva de Salamanca iluminada en azul',
		cuevaCaption: 'Una escena de La cueva de Salamanca, montaje de METADRAMA dirigido por Gaston Gilabert.',
		cuevaPosterAlt: 'Cartel de La cueva de Salamanca de METADRAMA',
		cuevaPosterCaption: 'Cartel del montaje, representado entre 2024 y 2025.',
		didoTitle: 'Dido y Eneas: no hay mal que por bien no venga',
		didoMeta: 'METADRAMA · 2026—',
		didoBody: 'Nuevo montaje de METADRAMA adaptado y dirigido por Gaston Gilabert a partir de la tragicomedia áurea sobre Dido y Eneas. La producción continúa la investigación práctica de la compañía sobre la actualización del teatro clásico y se estrenó en julio de 2026 en los Jardines Ferran Soldevila de la Universitat de Barcelona.',
		didoAlt: 'Representación al aire libre de Dido y Eneas de METADRAMA',
		didoCaption: 'Primera etapa de representaciones de Dido y Eneas en 2026.',
		didoPosterAlt: 'Cartel de Dido y Eneas: no hay mal que por bien no venga',
		didoPosterCaption: 'Cartel del montaje adaptado y dirigido por Gaston Gilabert.',
		projectLink: 'Ficha del montaje',
		closing: 'La investigación escénica no sustituye la práctica teatral ni la convierte en una simple demostración académica. Ambas líneas conviven: actuar es también una forma de observar, probar y comprender el teatro desde dentro.'
	} : {
		researchLabel: 'Performance research',
		researchTitle: 'A laboratory for testing hypotheses',
		researchBody: 'The article “Documents in Action” proposes studying Golden Age acting technique through a performance laboratory. It does not attempt to literally reconstruct a lost performance: it combines archive and practice to produce situated knowledge about the possibilities of the text.',
		method: [
			{ title: 'Sources', note: 'Texts, treatises, and historical traces' },
			{ title: 'Hypotheses', note: 'Specific questions about voice, gesture, and rhythm' },
			{ title: 'Rehearsal', note: 'Experimentation and process documentation' },
			{ title: 'Analysis', note: 'Comparing results and documents' },
			{ title: 'Creation', note: 'Performance communicates the findings' }
		],
		publication: 'Published in METADRAMA. Filología y puesta en escena del teatro del Siglo de Oro, Reichenberger, 2025.',
		productionsLabel: 'Stage experience',
		productionsTitle: 'Theatre productions',
		fuenteTitle: 'Fuenteovejuna',
		fuenteMeta: 'ESAD Asturias · 2018',
		fuenteBody: 'Final Stage Workshop for the Drama degree, directed by Cristina Suárez. The production premiered at Teatro de La Laboral in Gijón and was performed several times across Asturias, as well as in a street parade in Oviedo. It closed my formal actor training and was my first sustained encounter with a classic through a complete production process.',
		fuenteRole: 'Performance · graduation production',
		fuenteImages: {
			conjuntoAlt: 'The Fuenteovejuna cast lined up on stage under violet lighting',
			conjuntoCaption: 'The full cast in one of the production’s ensemble scenes.',
			cartelAlt: 'Poster for ESAD Asturias’s final Fuenteovejuna stage workshop',
			cartelCaption: 'Poster for the production premiered in May 2018.',
			escenaAlt: 'A scene between Laurencia and Frondoso in Fuenteovejuna',
			escenaCaption: 'The production combined the play’s collective dimension with more intimate scenes.',
			accionAlt: 'Three performers carry out a physical action under a spotlight in Fuenteovejuna',
			accionCaption: 'Lighting isolated specific actions within the large black space.',
			corralAlt: 'An ensemble scene from Fuenteovejuna with the cast celebrating on stage',
			corralCaption: 'Movement, music, and collective action shaped the stage space.',
			frondosoAlt: 'Frondoso holds Laurencia during a scene from Fuenteovejuna',
			frondosoCaption: 'One of Laurencia and Frondoso’s scenes.',
			repartoAlt: 'Several Fuenteovejuna characters distributed across the stage tiers',
			repartoCaption: 'The tiered set kept the presence of the village visible.',
			sequenceCaption: 'Rehearsal, action, and scenes from the production'
		},
		cuevaTitle: 'La cueva de Salamanca',
		cuevaMeta: 'METADRAMA · 2024–2025',
		cuevaBody: 'An adaptation of Juan Ruiz de Alarcón’s comedy directed by Gaston Gilabert. After premiering at the University of Barcelona, the production toured research meetings and festivals in Barcelona and Toledo. It reached over one thousand spectators and received eleven awards, including two best actor awards for my performance.',
		cuevaStats: ['10 performances', '1,000+ spectators', '11 awards', '2 best actor awards'],
		cuevaAlt: 'A blue-lit night scene from La cueva de Salamanca',
		cuevaCaption: 'A scene from METADRAMA’s La cueva de Salamanca, directed by Gaston Gilabert.',
		cuevaPosterAlt: 'Poster for METADRAMA’s La cueva de Salamanca',
		cuevaPosterCaption: 'Poster for the production performed in 2024 and 2025.',
		didoTitle: 'Dido y Eneas: no hay mal que por bien no venga',
		didoMeta: 'METADRAMA · 2026—',
		didoBody: 'A new METADRAMA production adapted and directed by Gaston Gilabert from the Golden Age tragicomedy about Dido and Aeneas. The production continues the company’s practice-based research into bringing classical theatre into the present and premiered in July 2026 at the University of Barcelona’s Ferran Soldevila Gardens.',
		didoAlt: 'Outdoor performance of METADRAMA’s Dido and Aeneas',
		didoCaption: 'The first series of Dido and Aeneas performances in 2026.',
		didoPosterAlt: 'Poster for Dido y Eneas: no hay mal que por bien no venga',
		didoPosterCaption: 'Poster for the production adapted and directed by Gaston Gilabert.',
		projectLink: 'Production page',
		closing: 'Performance research does not replace theatre practice or reduce it to an academic demonstration. The two strands coexist: acting is also a way of observing, testing, and understanding theatre from within.'
	});

</script>

<section class="tw:grid tw:gap-[clamp(100px,15vw,220px)] tw:border-t tw:border-rule-strong tw:py-[clamp(76px,11vw,150px)]">
	<article class="tw:grid tw:grid-cols-[minmax(300px,.85fr)_minmax(0,1.15fr)] tw:items-start tw:gap-[clamp(60px,10vw,150px)] tw:max-[960px]:grid-cols-1" id="investigacion" use:reveal>
		<div class="tw:sticky tw:top-[120px] tw:max-w-[620px] tw:max-[960px]:static">
			<p class={labelClass}>{copy.researchLabel}</p>
			<h3 class="{headingClass} tw:text-[clamp(2.4rem,5.3vw,5.4rem)] tw:leading-[0.93]">{copy.researchTitle}</h3>
			<p class="{bodyClass} tw:mt-[26px] tw:mb-0">{copy.researchBody}</p>
			<p class="meta tw:mt-[34px] tw:mb-0 tw:border-t tw:border-rule tw:pt-[18px] tw:leading-[1.6] tw:text-ink-faint">{copy.publication}</p>
		</div>
		<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule-strong tw:p-0">
			{#each copy.method as step, index (step.title)}
				<li class="tw:relative tw:grid tw:min-h-[104px] tw:grid-cols-[48px_minmax(0,1fr)] tw:gap-5 tw:border-b tw:border-rule tw:py-[22px] tw:max-[620px]:grid-cols-[42px_1fr] tw:max-[620px]:gap-3.5">
					<span class="meta tw:grid tw:size-[35px] tw:place-items-center tw:rounded-full tw:border tw:border-[color-mix(in_srgb,var(--accent-strong)_45%,var(--line))] tw:text-accent-strong">0{index + 1}</span>
					<div>
						<strong class="tw:font-title tw:text-xl tw:font-medium">{step.title}</strong>
						<p class="{bodyClass} tw:mt-[7px] tw:mb-0 tw:max-w-[48ch] tw:text-[0.77rem]">{step.note}</p>
					</div>
				</li>
			{/each}
		</ol>
	</article>

	<section class="tw:grid tw:gap-0">
		<header class="tw:mb-[clamp(54px,8vw,110px)] tw:grid tw:grid-cols-[minmax(140px,.35fr)_minmax(0,1fr)] tw:items-end tw:gap-[clamp(30px,6vw,90px)] tw:border-b tw:border-rule-strong tw:pb-[clamp(28px,4vw,52px)] tw:max-[620px]:grid-cols-1 tw:max-[620px]:gap-[10px]" id="practica-escenica" use:reveal>
			<p class="meta tw:mt-0 tw:mb-2 tw:text-accent-strong">{copy.productionsLabel}</p>
			<h3 class="{headingClass} tw:max-w-[10ch] tw:text-[clamp(3rem,6vw,6.2rem)] tw:leading-[0.9]">{copy.productionsTitle}</h3>
		</header>
		<article class="{productionClass} tw:border-t-0 tw:pt-0" id="fuenteovejuna" use:reveal>
			<div class="meta tw:text-ink-faint">01 / 03</div>
			<div class={productionCopyClass}>
				<p class="meta tw:mt-0 tw:mb-[17px] tw:text-accent-strong">{copy.fuenteMeta}</p>
				<h4 class={productionHeadingClass}>{copy.fuenteTitle}</h4>
				<p class="{bodyClass} tw:mt-6 tw:mb-0">{copy.fuenteBody}</p>
				<span class="meta tw:mt-[26px] tw:block tw:text-ink-faint">{copy.fuenteRole}</span>
			</div>
			<div class="tw:grid tw:min-w-0 tw:grid-cols-[minmax(0,1fr)_minmax(105px,.3fr)] tw:items-end tw:gap-[clamp(12px,2vw,28px)] tw:max-[960px]:col-start-2 tw:max-[960px]:mt-[22px] tw:max-[620px]:col-start-1 tw:max-[620px]:grid-cols-[minmax(0,1fr)_90px]" aria-label={copy.fuenteImages.sequenceCaption}>
				<StageFigure src="/images/projects/escena/fuenteovejuna-conjunto.webp" alt={copy.fuenteImages.conjuntoAlt} caption={copy.fuenteImages.conjuntoCaption} number="01" />
				<StageFigure class="tw:w-[min(100%,220px)] tw:justify-self-end" src="/images/projects/escena/fuenteovejuna-cartel.webp" alt={copy.fuenteImages.cartelAlt} caption={copy.fuenteImages.cartelCaption} number="02" />
			</div>
			<div class="tw:col-span-full tw:mt-[clamp(44px,7vw,100px)] tw:grid tw:grid-cols-12 tw:items-start tw:gap-x-[clamp(12px,2vw,30px)] tw:gap-y-[clamp(28px,4vw,64px)] tw:max-[1180px]:min-[621px]:grid-cols-2 tw:max-[620px]:col-start-1 tw:max-[620px]:mt-[34px] tw:max-[620px]:block tw:max-[620px]:[columns:2] tw:max-[620px]:[column-gap:8px]">
				<StageFigure masonry class="tw:col-start-1 tw:col-span-4 tw:max-[1180px]:min-[621px]:col-auto" src="/images/projects/escena/fuenteovejuna-escena.webp" alt={copy.fuenteImages.escenaAlt} caption={copy.fuenteImages.escenaCaption} number="03" />
				<StageFigure masonry class="tw:col-start-5 tw:col-span-4 tw:max-[1180px]:min-[621px]:col-auto" src="/images/projects/escena/fuenteovejuna-accion.webp" alt={copy.fuenteImages.accionAlt} caption={copy.fuenteImages.accionCaption} number="04" />
				<StageFigure masonry class="tw:col-start-9 tw:col-span-4 tw:max-[1180px]:min-[621px]:col-auto" src="/images/projects/escena/fuenteovejuna-corral.webp" alt={copy.fuenteImages.corralAlt} caption={copy.fuenteImages.corralCaption} number="05" />
				<StageFigure masonry class="tw:col-start-1 tw:col-span-6 tw:max-[1180px]:min-[621px]:col-auto" src="/images/projects/escena/fuenteovejuna-laurencia-frondoso.webp" alt={copy.fuenteImages.frondosoAlt} caption={copy.fuenteImages.frondosoCaption} number="06" />
				<StageFigure masonry class="tw:col-start-7 tw:col-span-6 tw:max-[1180px]:min-[621px]:col-span-full tw:max-[1180px]:min-[621px]:w-[64%] tw:max-[1180px]:min-[621px]:justify-self-center" src="/images/projects/escena/fuenteovejuna-reparto.webp" alt={copy.fuenteImages.repartoAlt} caption={copy.fuenteImages.repartoCaption} number="07" />
			</div>
		</article>

		<article class="{productionClass} tw:mt-[clamp(100px,15vw,210px)] tw:grid-cols-[72px_minmax(300px,.68fr)_minmax(0,1.32fr)] tw:max-[960px]:grid-cols-[52px_1fr] tw:max-[620px]:grid-cols-1" id="cueva-salamanca" use:reveal>
			<div class="meta tw:text-ink-faint">02 / 03</div>
			<div class={productionCopyClass}>
				<p class="meta tw:mt-0 tw:mb-[17px] tw:text-accent-strong">{copy.cuevaMeta}</p>
				<h4 class={productionHeadingClass}>{copy.cuevaTitle}</h4>
				<p class="{bodyClass} tw:mt-6 tw:mb-0">{copy.cuevaBody}</p>
				<ul class="meta tw:mt-7 tw:mb-0 tw:flex tw:list-none tw:flex-wrap tw:gap-[7px] tw:p-0">
					{#each copy.cuevaStats as stat (stat)}<li class="tw:rounded-full tw:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] tw:px-[10px] tw:py-[7px] tw:text-ink-faint">{stat}</li>{/each}
				</ul>
				<a class="meta tw:mt-[26px] tw:inline-flex tw:items-center tw:gap-2 tw:text-ink tw:[&>span]:inline-flex tw:[&>span]:transition-[transform,color] tw:[&>span]:duration-[220ms] tw:hover:[&>span]:translate-x-[3px] tw:hover:[&>span]:translate-y-[-3px] tw:hover:[&>span]:text-accent-strong tw:focus-visible:[&>span]:translate-x-[3px] tw:focus-visible:[&>span]:translate-y-[-3px] tw:focus-visible:[&>span]:text-accent-strong" href="https://www.ub.edu/metadrama/cueva/" target="_blank" rel="noreferrer">
					{copy.projectLink}<span><MoveUpRight size={18} strokeWidth={1.6} /></span>
				</a>
			</div>
			<div class="tw:grid tw:grid-cols-[minmax(0,1fr)_minmax(150px,.3fr)] tw:items-end tw:gap-[clamp(20px,3vw,42px)] tw:[&>figure:last-child]:mb-[-16%] tw:max-[960px]:col-start-2 tw:max-[960px]:mt-[22px] tw:max-[620px]:col-start-1 tw:max-[620px]:grid-cols-[minmax(0,1fr)_115px]">
				<ProjectFigure src="/images/projects/escena/cueva-escena.webp" alt={copy.cuevaAlt} caption={copy.cuevaCaption} number="08" />
				<ProjectFigure src="/images/projects/escena/cueva-cartel.webp" alt={copy.cuevaPosterAlt} caption={copy.cuevaPosterCaption} number="09" portrait />
			</div>
		</article>

		<article class="{productionClass} tw:mt-[clamp(100px,15vw,210px)] tw:grid-cols-[72px_minmax(0,1.25fr)_minmax(300px,.75fr)] tw:items-center tw:max-[960px]:grid-cols-[52px_1fr] tw:max-[620px]:grid-cols-1" id="dido-eneas" use:reveal>
			<div class="meta tw:text-ink-faint">03 / 03</div>
			<div class="tw:grid tw:grid-cols-[minmax(0,1fr)_minmax(150px,.36fr)] tw:items-start tw:gap-[clamp(20px,3vw,40px)] tw:[&>figure:last-child]:mt-[28%] tw:max-[960px]:col-start-2 tw:max-[960px]:row-start-3 tw:max-[960px]:mt-[22px] tw:max-[620px]:col-start-1 tw:max-[620px]:grid-cols-[minmax(0,1fr)_115px]">
				<ProjectFigure src="/images/projects/escena/dido-escena.webp" alt={copy.didoAlt} caption={copy.didoCaption} number="10" />
				<ProjectFigure src="/images/projects/escena/dido-cartel.webp" alt={copy.didoPosterAlt} caption={copy.didoPosterCaption} number="11" portrait />
			</div>
			<div class="{productionCopyClass} tw:max-[960px]:row-start-2">
				<p class="meta tw:mt-0 tw:mb-[17px] tw:text-accent-strong">{copy.didoMeta}</p>
				<h4 class={productionHeadingClass}>{copy.didoTitle}</h4>
				<p class="{bodyClass} tw:mt-6 tw:mb-0">{copy.didoBody}</p>
				<a class="meta tw:mt-[26px] tw:inline-flex tw:items-center tw:gap-2 tw:text-ink tw:[&>span]:inline-flex tw:[&>span]:transition-[transform,color] tw:[&>span]:duration-[220ms] tw:hover:[&>span]:translate-x-[3px] tw:hover:[&>span]:translate-y-[-3px] tw:hover:[&>span]:text-accent-strong tw:focus-visible:[&>span]:translate-x-[3px] tw:focus-visible:[&>span]:translate-y-[-3px] tw:focus-visible:[&>span]:text-accent-strong" href="https://www.ub.edu/metadrama/dido-y-eneas-no-hay-mal-que-por-bien-no-venga/" target="_blank" rel="noreferrer">
					{copy.projectLink}<span><MoveUpRight size={18} strokeWidth={1.6} /></span>
				</a>
			</div>
		</article>
	</section>

	<p class="tw:mt-0 tw:mr-[6%] tw:mb-0 tw:ml-auto tw:w-[min(70%,850px)] tw:border-t tw:border-rule-strong tw:pt-[clamp(48px,7vw,90px)] tw:font-title tw:text-[clamp(1.5rem,3vw,2.7rem)] tw:leading-[1.25] tw:text-ink-dim tw:max-[620px]:mr-0 tw:max-[620px]:w-full" use:reveal>{copy.closing}</p>
</section>
