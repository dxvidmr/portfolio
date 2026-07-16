<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal({ threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

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

<section class="stage-story">
	<article class="research" id="investigacion" use:reveal>
		<div class="research-copy">
			<p class="meta label">{copy.researchLabel}</p>
			<h3>{copy.researchTitle}</h3>
			<p>{copy.researchBody}</p>
			<p class="publication meta">{copy.publication}</p>
		</div>
		<ol class="method">
			{#each copy.method as step, index (step.title)}
				<li>
					<span class="step-number meta">0{index + 1}</span>
					<div>
						<strong>{step.title}</strong>
						<p>{step.note}</p>
					</div>
				</li>
			{/each}
		</ol>
	</article>

	<section class="productions">
		<header class="productions-header" id="practica-escenica" use:reveal>
			<p class="meta label">{copy.productionsLabel}</p>
			<h3>{copy.productionsTitle}</h3>
		</header>
		<article class="production fuente" id="fuenteovejuna" use:reveal>
			<div class="production-number meta">01 / 03</div>
			<div class="production-copy">
				<p class="meta production-meta">{copy.fuenteMeta}</p>
				<h4>{copy.fuenteTitle}</h4>
				<p>{copy.fuenteBody}</p>
				<span class="role meta">{copy.fuenteRole}</span>
			</div>
			<div class="fuente-lead" aria-label={copy.fuenteImages.sequenceCaption}>
				<figure class="masonry-item item-conjunto"><img src="/images/projects/escena/fuenteovejuna-conjunto.webp" alt={copy.fuenteImages.conjuntoAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">01</span><p>{copy.fuenteImages.conjuntoCaption}</p></figcaption></figure>
				<figure class="masonry-item item-cartel"><img src="/images/projects/escena/fuenteovejuna-cartel.webp" alt={copy.fuenteImages.cartelAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">02</span><p>{copy.fuenteImages.cartelCaption}</p></figcaption></figure>
			</div>
			<div class="fuente-gallery">
				<figure class="masonry-item item-escena"><img src="/images/projects/escena/fuenteovejuna-escena.webp" alt={copy.fuenteImages.escenaAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">03</span><p>{copy.fuenteImages.escenaCaption}</p></figcaption></figure>
				<figure class="masonry-item item-accion"><img src="/images/projects/escena/fuenteovejuna-accion.webp" alt={copy.fuenteImages.accionAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">04</span><p>{copy.fuenteImages.accionCaption}</p></figcaption></figure>
				<figure class="masonry-item item-corral"><img src="/images/projects/escena/fuenteovejuna-corral.webp" alt={copy.fuenteImages.corralAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">05</span><p>{copy.fuenteImages.corralCaption}</p></figcaption></figure>
				<figure class="masonry-item item-frondoso"><img src="/images/projects/escena/fuenteovejuna-laurencia-frondoso.webp" alt={copy.fuenteImages.frondosoAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">06</span><p>{copy.fuenteImages.frondosoCaption}</p></figcaption></figure>
				<figure class="masonry-item item-reparto"><img src="/images/projects/escena/fuenteovejuna-reparto.webp" alt={copy.fuenteImages.repartoAlt} loading="lazy" decoding="async" /><figcaption><span class="meta">07</span><p>{copy.fuenteImages.repartoCaption}</p></figcaption></figure>
			</div>
		</article>

		<article class="production cueva" id="cueva-salamanca" use:reveal>
			<div class="production-number meta">02 / 03</div>
			<div class="production-copy">
				<p class="meta production-meta">{copy.cuevaMeta}</p>
				<h4>{copy.cuevaTitle}</h4>
				<p>{copy.cuevaBody}</p>
				<ul class="stats meta">{#each copy.cuevaStats as stat (stat)}<li>{stat}</li>{/each}</ul>
				<a class="project-link meta" href="https://www.ub.edu/metadrama/cueva/" target="_blank" rel="noreferrer">
					{copy.projectLink}<span><MoveUpRight size={18} strokeWidth={1.6} /></span>
				</a>
			</div>
			<div class="cueva-media">
				<ProjectFigure src="/images/projects/escena/cueva-escena.webp" alt={copy.cuevaAlt} caption={copy.cuevaCaption} number="08" />
				<ProjectFigure src="/images/projects/escena/cueva-cartel.webp" alt={copy.cuevaPosterAlt} caption={copy.cuevaPosterCaption} number="09" portrait />
			</div>
		</article>

		<article class="production dido" id="dido-eneas" use:reveal>
			<div class="production-number meta">03 / 03</div>
			<div class="dido-media">
				<ProjectFigure src="/images/projects/escena/dido-escena.webp" alt={copy.didoAlt} caption={copy.didoCaption} number="10" />
				<ProjectFigure src="/images/projects/escena/dido-cartel.webp" alt={copy.didoPosterAlt} caption={copy.didoPosterCaption} number="11" portrait />
			</div>
			<div class="production-copy">
				<p class="meta production-meta">{copy.didoMeta}</p>
				<h4>{copy.didoTitle}</h4>
				<p>{copy.didoBody}</p>
				<a class="project-link meta" href="https://www.ub.edu/metadrama/dido-y-eneas-no-hay-mal-que-por-bien-no-venga/" target="_blank" rel="noreferrer">
					{copy.projectLink}<span><MoveUpRight size={18} strokeWidth={1.6} /></span>
				</a>
			</div>
		</article>
	</section>

	<p class="closing" use:reveal>{copy.closing}</p>
</section>

<style>
	.stage-story { display: grid; gap: clamp(100px, 15vw, 220px); padding-block: clamp(76px, 11vw, 150px); border-top: 1px solid var(--line-strong); }
	.stage-story h3, .stage-story h4 { margin: 0; font-weight: 450; letter-spacing: -.04em; }
	.stage-story p:not(.label, .publication, .production-meta) { color: var(--fg-dim); line-height: 1.68; }
	.label { margin: 0 0 16px; color: var(--accent-strong); }
	.research { display: grid; grid-template-columns: minmax(300px, .85fr) minmax(0, 1.15fr); gap: clamp(60px, 10vw, 150px); align-items: start; }
	.research-copy { position: sticky; top: 120px; max-width: 620px; }
	.research h3 { font-size: clamp(2.4rem, 5.3vw, 5.4rem); line-height: .93; }
	.research-copy > p:not(.label, .publication) { margin: 26px 0 0; }
	.publication { margin: 34px 0 0; padding-top: 18px; border-top: 1px solid var(--line); color: var(--fg-faint); line-height: 1.6; }
	.method { margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.method li { position: relative; display: grid; grid-template-columns: 48px minmax(0, 1fr); gap: 20px; min-height: 104px; padding: 22px 0; border-bottom: 1px solid var(--line); }
	.step-number { display: grid; width: 35px; height: 35px; place-items: center; border: 1px solid color-mix(in srgb, var(--accent-strong) 45%, var(--line)); border-radius: 50%; color: var(--accent-strong); }
	.method strong { font-family: var(--font-title); font-size: 1.25rem; font-weight: 500; }
	.method p { max-width: 48ch; margin: 7px 0 0; font-size: .77rem; }
	.productions { display: grid; gap: 0; }
	.productions-header { display: grid; grid-template-columns: minmax(140px, .35fr) minmax(0, 1fr); gap: clamp(30px, 6vw, 90px); align-items: end; margin-bottom: clamp(54px, 8vw, 110px); padding-bottom: clamp(28px, 4vw, 52px); border-bottom: 1px solid var(--line-strong); }
	.productions-header .label { margin: 0 0 8px; }
	.productions-header h3 { max-width: 10ch; font-size: clamp(3rem, 6vw, 6.2rem); line-height: .9; }
	.production { position: relative; display: grid; grid-template-columns: 72px minmax(290px, .72fr) minmax(0, 1.28fr); gap: clamp(28px, 5vw, 80px); padding-top: 28px; border-top: 1px solid var(--line-strong); }
	.productions-header + .production { padding-top: 0; border-top: 0; }
	.production + .production { margin-top: clamp(100px, 15vw, 210px); }
	.production-number { color: var(--fg-faint); }
	.production-copy { max-width: 620px; }
	.production-meta { margin: 0 0 17px; color: var(--accent-strong); }
	.production h4 { font-size: clamp(2.2rem, 4.6vw, 4.8rem); line-height: .94; }
	.production-copy > p:not(.production-meta) { margin: 24px 0 0; }
	.role { display: block; margin-top: 26px; color: var(--fg-faint); }
	.fuente-lead { display: grid; grid-template-columns: minmax(0, 1fr) minmax(105px, .3fr); gap: clamp(12px, 2vw, 28px); min-width: 0; align-items: end; }
	.fuente-lead .item-cartel { width: min(100%, 220px); justify-self: end; }
	.fuente-gallery { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(28px, 4vw, 64px) clamp(12px, 2vw, 30px); align-items: start; margin-top: clamp(44px, 7vw, 100px); }
	.masonry-item { min-width: 0; margin: 0; }
	.masonry-item img { display: block; width: 100%; height: auto; border-radius: var(--radius-sm); background: var(--visual-bg); }
	.masonry-item figcaption { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 12px; margin-top: 11px; color: var(--fg-faint); }
	.masonry-item figcaption span { padding-top: 3px; }.masonry-item figcaption p { margin: 0; font-size: .7rem; line-height: 1.5; }
	.item-escena { grid-column: 1 / span 4; }
	.item-accion { grid-column: 5 / span 4; }
	.item-corral { grid-column: 9 / span 4; }
	.item-frondoso { grid-column: 1 / span 6; }
	.item-reparto { grid-column: 7 / span 6; }
	.stats { display: flex; flex-wrap: wrap; gap: 7px; margin: 28px 0 0; padding: 0; list-style: none; }
	.stats li { padding: 7px 10px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 9%, transparent); color: var(--fg-faint); }
	.project-link { display: inline-flex; gap: 8px; align-items: center; margin-top: 26px; color: var(--fg); text-decoration: none; }
	.project-link span { display: inline-flex; transition: transform 220ms ease, color 220ms ease; }
	.project-link:hover span, .project-link:focus-visible span { color: var(--accent-strong); transform: translate(3px, -3px); }
	.cueva { grid-template-columns: 72px minmax(300px, .68fr) minmax(0, 1.32fr); }
	.cueva-media { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, .3fr); gap: clamp(20px, 3vw, 42px); align-items: end; }
	.cueva-media > :global(figure:last-child) { margin-bottom: -16%; }
	.dido { grid-template-columns: 72px minmax(0, 1.25fr) minmax(300px, .75fr); align-items: center; }
	.dido-media { display: grid; grid-template-columns: minmax(0, 1fr) minmax(150px, .36fr); gap: clamp(20px, 3vw, 40px); align-items: start; }
	.dido-media > :global(figure:last-child) { margin-top: 28%; }
	.closing { width: min(70%, 850px); margin: 0 6% 0 auto; padding-top: clamp(48px, 7vw, 90px); border-top: 1px solid var(--line-strong); font-family: var(--font-title); font-size: clamp(1.5rem, 3vw, 2.7rem); line-height: 1.25 !important; }
	@media (max-width: 960px) {
		.research { grid-template-columns: 1fr; }
		.research-copy { position: static; }
		.production, .cueva, .dido { grid-template-columns: 52px 1fr; }
		.production-copy, .cueva-media, .dido-media, .fuente-lead { grid-column: 2; }
		.cueva-media, .dido-media { margin-top: 22px; }
		.fuente-lead { margin-top: 22px; }
		.fuente-gallery { grid-column: 1 / -1; }
		.dido .dido-media { grid-row: 3; }.dido .production-copy { grid-row: 2; }
	}
	@media (max-width: 1180px) and (min-width: 621px) {
		.fuente-gallery { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.fuente-gallery .masonry-item { grid-column: auto; }
		.fuente-gallery .item-reparto { grid-column: 1 / -1; width: 64%; justify-self: center; }
	}
	@media (max-width: 620px) {
		.closing { width: 100%; margin-left: 0; }
		.productions-header { grid-template-columns: 1fr; gap: 10px; }
		.method li { grid-template-columns: 42px 1fr; gap: 14px; }
		.production, .cueva, .dido { grid-template-columns: 1fr; }
		.production-number, .production-copy, .cueva-media, .dido-media, .fuente-lead, .fuente-gallery { grid-column: 1; }
		.cueva-media, .dido-media { grid-template-columns: minmax(0, 1fr) 115px; }
		.fuente-lead { grid-template-columns: minmax(0, 1fr) 90px; }
		.fuente-gallery { display: block; columns: 2; column-gap: 8px; margin-top: 34px; }
		.fuente-gallery .masonry-item { display: inline-block; width: 100%; margin: 0 0 8px; break-inside: avoid; }
		.fuente-gallery .item-accion, .fuente-gallery .item-frondoso { margin-top: 0; }
	}
</style>
