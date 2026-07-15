<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();

	const copy = $derived(locale === 'es' ? {
		introLabel: 'Verso dramático · datos · comparación',
		introTitle: 'Leer la métrica como una estructura',
		introBody: 'Versología es una base de datos y un conjunto de herramientas de estilometría estrófica para el teatro en verso. Convierte la arquitectura métrica de cada obra en datos comparables sin separarla de su organización dramática.',
		levels: ['Obra', 'Jornada', 'Cuadro', 'Secuencia métrica'],
		coverAlt: 'Portada de Versología con el buscador de obras y autores',
		coverCaption: 'La entrada pública concentra el acceso al corpus en una búsqueda única por obras y autores.',
		modelLabel: 'Modelo de datos',
		modelTitle: 'La secuencia métrica como unidad',
		modelBody: 'Cada tramo registra sus versos, forma estrófica, variaciones e intervención dramática dentro de una jerarquía de obras, jornadas y cuadros. El modelo relacional permite reconstruir la sucesión completa y calcularla a distintas escalas.',
		dashboardAlt: 'Panel editorial de Versología con las secuencias métricas de El esclavo del demonio',
		dashboardCaption: 'El dashboard privado reúne estructura, secuencias, autoría, observaciones y revisión en un mismo flujo editorial.',
		publicLabel: 'De la edición a la consulta',
		publicTitle: 'Un dato registrado una vez, múltiples lecturas',
		publicBody: 'La información revisada alimenta automáticamente la ficha pública: estructura de la obra, código de color de sus tramos y distribución de formas métricas. Los resúmenes se precalculan en la base de datos para que la exploración sea inmediata.',
		workAlt: 'Ficha pública de El esclavo del demonio con su estructura y perfil métrico',
		workCaption: 'La ficha combina contexto bibliográfico, estructura dramática, secuencia visual y perfil métrico de la obra.',
		authorshipLabel: 'Autoría',
		authorshipTitle: 'La atribución también se modela',
		authorshipBody: 'Las propuestas de autoría conservan su alcance —obra o jornada—, sus responsables y sus evidencias. Un texto solo contribuye al perfil métrico de un autor cuando la atribución es inequívoca y corresponde a una sola firma.',
		futureLabel: 'El corpus crecerá con el proyecto',
		futureTitle: 'Dos vistas preparadas para otra escala',
		futureBody: 'El catálogo y los perfiles de autor ocuparán este espacio cuando el número de obras permita que la comparación sea representativa.',
		catalogue: 'Catálogo ampliado',
		catalogueNote: 'Obras, facetas y cronología',
		author: 'Perfil de autor',
		authorNote: 'Diversidad, transiciones y evolución',
		labLabel: 'Laboratorio',
		labTitle: 'Comparar perfiles y recorridos',
		labBody: 'El laboratorio confronta tanto la proporción de formas como el orden de los tramos. Combina divergencia de Jensen–Shannon y distancia de Levenshtein para estudiar semejanzas desde dos perspectivas complementarias.',
		methods: ['Distribución de formas', 'Orden de secuencias', 'Evolución por quinquenios'],
		roleLabel: 'Desarrollo integral',
		roleTitle: 'De la pregunta metodológica a la interfaz',
		roleBody: 'Proyecto de Gaston Gilabert y David Merino Recalde. He desarrollado el modelo de datos, la base en Supabase, la interfaz pública y el dashboard editorial en SvelteKit, además de la lógica de análisis y visualización.',
		stack: ['SvelteKit', 'Supabase', 'PostgreSQL', 'ECharts', 'RLS']
	} : {
		introLabel: 'Dramatic verse · data · comparison',
		introTitle: 'Reading metre as structure',
		introBody: 'Versología is a database and toolkit for stanzaic stylometry in verse drama. It turns the metrical architecture of each play into comparable data without separating it from its dramatic organisation.',
		levels: ['Play', 'Act', 'Scene', 'Metrical sequence'],
		coverAlt: 'Versología homepage with its play and author search',
		coverCaption: 'The public entry point brings access to the corpus together in a single search for plays and authors.',
		modelLabel: 'Data model',
		modelTitle: 'The metrical sequence as a unit',
		modelBody: 'Each passage records its verse range, stanzaic form, variations, and dramatic participation within a hierarchy of plays, acts, and scenes. The relational model reconstructs the full succession and calculates it at different scales.',
		dashboardAlt: 'Versología editorial dashboard showing the metrical sequences in El esclavo del demonio',
		dashboardCaption: 'The private dashboard brings structure, sequences, authorship, observations, and review into a single editorial workflow.',
		publicLabel: 'From editing to consultation',
		publicTitle: 'One recorded datum, multiple readings',
		publicBody: 'Reviewed information automatically feeds the public record: the play’s structure, a colour-coded sequence of its passages, and the distribution of metrical forms. Summaries are precomputed in the database for immediate exploration.',
		workAlt: 'Public record for El esclavo del demonio with its structure and metrical profile',
		workCaption: 'The record combines bibliographic context, dramatic structure, visual sequence, and the play’s metrical profile.',
		authorshipLabel: 'Authorship',
		authorshipTitle: 'Attribution is modelled too',
		authorshipBody: 'Authorship proposals retain their scope—play or act—their proponents, and their evidence. A text contributes to an author’s metrical profile only when attribution is unequivocal and belongs to a single hand.',
		futureLabel: 'The corpus will grow with the project',
		futureTitle: 'Two views prepared for a different scale',
		futureBody: 'The catalogue and author profiles will occupy this space once the number of plays makes comparison representative.',
		catalogue: 'Expanded catalogue',
		catalogueNote: 'Plays, facets, and chronology',
		author: 'Author profile',
		authorNote: 'Diversity, transitions, and evolution',
		labLabel: 'Laboratory',
		labTitle: 'Comparing profiles and trajectories',
		labBody: 'The laboratory compares both the proportion of forms and the order of passages. It combines Jensen–Shannon divergence and Levenshtein distance to study similarity from two complementary perspectives.',
		methods: ['Distribution of forms', 'Sequence order', 'Five-year evolution'],
		roleLabel: 'End-to-end development',
		roleTitle: 'From methodological question to interface',
		roleBody: 'A project by Gaston Gilabert and David Merino Recalde. I developed the data model, Supabase database, public interface, and SvelteKit editorial dashboard, alongside the analysis and visualisation logic.',
		stack: ['SvelteKit', 'Supabase', 'PostgreSQL', 'ECharts', 'RLS']
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

<section class="versologia-story">
	<article class="opening" use:reveal>
		<div class="opening-copy">
			<p class="meta label">{copy.introLabel}</p>
			<h3>{copy.introTitle}</h3>
			<p>{copy.introBody}</p>
		</div>
		<ol class="data-levels">
			{#each copy.levels as level, index (level)}
				<li><span class="meta">0{index + 1}</span><strong>{level}</strong></li>
			{/each}
		</ol>
	</article>

	<div class="cover" use:reveal>
		<ProjectFigure src="/images/projects/versologia/portada.webp" alt={copy.coverAlt} caption={copy.coverCaption} number="01" priority />
	</div>

	<article class="model" use:reveal>
		<div class="model-copy">
			<p class="meta label">{copy.modelLabel}</p>
			<h3>{copy.modelTitle}</h3>
			<p>{copy.modelBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/dashboard.webp" alt={copy.dashboardAlt} caption={copy.dashboardCaption} number="02" />
	</article>

	<article class="public-view" use:reveal>
		<div class="public-copy">
			<p class="meta label">{copy.publicLabel}</p>
			<h3>{copy.publicTitle}</h3>
			<p>{copy.publicBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/ficha-obra.webp" alt={copy.workAlt} caption={copy.workCaption} number="03" />
	</article>

	<article class="authorship" use:reveal>
		<p class="meta label">{copy.authorshipLabel}</p>
		<div>
			<h3>{copy.authorshipTitle}</h3>
			<p>{copy.authorshipBody}</p>
		</div>
		<div class="attribution-flow meta" aria-hidden="true">
			<span>OBRA / JORNADA</span><i></i><span>PROPUESTA</span><i></i><span>EVIDENCIAS</span><i></i><b>PERFIL</b>
		</div>
	</article>

	<section class="future" use:reveal>
		<div class="future-copy">
			<p class="meta label">{copy.futureLabel}</p>
			<h3>{copy.futureTitle}</h3>
			<p>{copy.futureBody}</p>
		</div>
		<div class="future-slots">
			<div class="future-slot catalogue-slot">
				<span class="meta">04 / {copy.catalogue}</span>
				<div class="catalogue-lines" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
				<p>{copy.catalogueNote}</p>
			</div>
			<div class="future-slot author-slot">
				<span class="meta">05 / {copy.author}</span>
				<div class="profile-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
				<p>{copy.authorNote}</p>
			</div>
		</div>
	</section>

	<article class="laboratory" use:reveal>
		<div class="lab-visual" aria-hidden="true">
			{#each Array(25) as _, index}<i style={`--cell: ${((index * 37) % 82) + 12}%`}></i>{/each}
		</div>
		<div class="lab-copy">
			<p class="meta label">{copy.labLabel}</p>
			<h3>{copy.labTitle}</h3>
			<p>{copy.labBody}</p>
			<ul>{#each copy.methods as method (method)}<li>{method}</li>{/each}</ul>
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
	.versologia-story { display: grid; gap: clamp(90px, 14vw, 210px); padding-block: clamp(76px, 11vw, 150px); border-top: 1px solid var(--line-strong); }
	.versologia-story h3 { margin: 0; font-weight: 450; letter-spacing: -0.04em; }
	.versologia-story p:not(.label) { color: var(--fg-dim); line-height: 1.68; }
	.label { margin: 0 0 16px; color: var(--accent-strong); }
	.opening { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(280px, .8fr); gap: clamp(50px, 9vw, 130px); align-items: end; }
	.opening-copy { max-width: 780px; }
	.opening h3 { max-width: 12ch; font-size: clamp(2.8rem, 6.5vw, 6.5rem); line-height: .9; }
	.opening-copy > p:last-child { max-width: 66ch; margin: 28px 0 0; }
	.data-levels { margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.data-levels li { display: grid; grid-template-columns: 42px 1fr; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--line); }
	.data-levels span { color: var(--fg-faint); }
	.data-levels strong { font-family: var(--font-title); font-size: 1.05rem; font-weight: 450; }
	.cover { width: min(94%, 1500px); margin-inline: auto; }
	.model { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(30px, 5vw, 76px); align-items: end; }
	.model-copy { grid-column: 7 / span 5; grid-row: 1; max-width: 610px; margin-bottom: 8px; }
	.model > :global(figure) { grid-column: 1 / -1; grid-row: 2; }
	.model h3, .public-view h3, .future h3, .laboratory h3 { font-size: clamp(2.2rem, 4.7vw, 4.8rem); line-height: .94; }
	.model-copy > p:last-child, .public-copy > p:last-child, .future-copy > p:last-child, .lab-copy > p:not(.label) { margin: 23px 0 0; }
	.public-view { display: grid; grid-template-columns: minmax(290px, .72fr) minmax(0, 1.28fr); gap: clamp(44px, 7vw, 110px); align-items: center; }
	.public-copy { max-width: 570px; }
	.authorship { display: grid; grid-template-columns: 130px minmax(0, .9fr) minmax(360px, 1.1fr); gap: clamp(30px, 6vw, 90px); align-items: start; padding-block: clamp(54px, 8vw, 96px); border-block: 1px solid var(--line-strong); }
	.authorship .label { margin: 7px 0 0; }
	.authorship h3 { font-size: clamp(2rem, 4vw, 4rem); line-height: .95; }
	.authorship p:not(.label) { max-width: 62ch; margin: 22px 0 0; }
	.attribution-flow { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 9px 14px; color: var(--fg-faint); }
	.attribution-flow i { height: 1px; background: var(--line-strong); }
	.attribution-flow b { color: var(--accent-strong); font-weight: 600; }
	.future { display: grid; gap: clamp(54px, 8vw, 110px); }
	.future-copy { width: min(720px, 80%); margin-left: 9%; }
	.future-slots { display: grid; grid-template-columns: 1.12fr .88fr; gap: clamp(26px, 5vw, 74px); align-items: start; }
	.future-slot { position: relative; display: grid; min-height: clamp(260px, 34vw, 500px); padding: clamp(20px, 3vw, 38px); overflow: hidden; border-top: 1px solid var(--line-strong); border-bottom: 1px solid var(--line); background: color-mix(in srgb, var(--accent) 5%, transparent); }
	.future-slot > span { color: var(--fg-faint); }
	.future-slot > p { align-self: end; margin: 0; font-family: var(--font-title); font-size: clamp(1.3rem, 2.4vw, 2.2rem); }
	.author-slot { margin-top: clamp(70px, 10vw, 145px); }
	.catalogue-lines { position: absolute; top: 28%; right: 8%; left: 8%; display: grid; gap: 16px; }
	.catalogue-lines i { height: 1px; background: var(--line-strong); }
	.catalogue-lines i:nth-child(2) { width: 73%; }.catalogue-lines i:nth-child(3) { width: 88%; }.catalogue-lines i:nth-child(4) { width: 57%; }
	.profile-bars { position: absolute; top: 28%; right: 12%; left: 12%; display: flex; height: 32%; align-items: end; gap: 5%; }
	.profile-bars i { flex: 1; height: 35%; border-radius: var(--radius-sm) var(--radius-sm) 0 0; background: var(--accent); opacity: .18; }
	.profile-bars i:nth-child(2) { height: 82%; }.profile-bars i:nth-child(3) { height: 55%; }.profile-bars i:nth-child(4) { height: 100%; }.profile-bars i:nth-child(5) { height: 68%; }
	.laboratory { display: grid; grid-template-columns: minmax(300px, .85fr) minmax(0, 1.15fr); gap: clamp(48px, 9vw, 140px); align-items: center; }
	.lab-visual { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; aspect-ratio: 1; padding: 8%; border-radius: var(--radius); background: color-mix(in srgb, var(--accent) 6%, var(--visual-bg)); }
	.lab-visual i { border-radius: 2px; background: color-mix(in srgb, var(--accent-strong) var(--cell), var(--visual-bg)); }
	.lab-copy { max-width: 650px; }
	.lab-copy ul { display: flex; flex-wrap: wrap; gap: 7px; margin: 28px 0 0; padding: 0; list-style: none; }
	.lab-copy li { padding: 7px 10px; border: 1px solid var(--line); border-radius: 999px; color: var(--fg-faint); font-family: var(--font-mono); font-size: .58rem; }
	.role { width: min(76%, 900px); margin-left: auto; padding-top: clamp(52px, 8vw, 100px); border-top: 1px solid var(--line-strong); }
	.role h3 { font-size: clamp(2.4rem, 5vw, 5rem); line-height: .92; }
	.role > p:not(.label) { max-width: 70ch; margin: 25px 0 0; }
	.stack { display: flex; flex-wrap: wrap; gap: 8px 20px; margin-top: 30px; color: var(--fg-faint); }
	.stack span:not(:last-child)::after { padding-left: 20px; color: var(--accent-strong); content: '/'; }
	:global(.reveal-pending) { opacity: 0; transform: translate3d(0, 26px, 0); transition: opacity 700ms ease, transform 850ms cubic-bezier(.16, 1, .3, 1); }
	:global(.reveal-pending.reveal-visible) { opacity: 1; transform: none; }
	@media (max-width: 850px) {
		.opening, .public-view, .laboratory { grid-template-columns: 1fr; }
		.model-copy { grid-column: 2 / span 10; }
		.authorship { grid-template-columns: 1fr; }
		.attribution-flow { max-width: 560px; }
		.role { width: 100%; }
	}
	@media (max-width: 600px) {
		.cover { width: 100%; }
		.model { display: block; }
		.model > :global(figure) { margin-top: 38px; }
		.future-copy { width: 100%; margin-left: 0; }
		.future-slots { grid-template-columns: 1fr; }
		.author-slot { margin-top: 10px; }
		.future-slot { min-height: 300px; }
		.attribution-flow { font-size: .5rem; }
	}
	@media (prefers-reduced-motion: reduce) { :global(.reveal-pending) { opacity: 1; transform: none; transition: none; } }
</style>
