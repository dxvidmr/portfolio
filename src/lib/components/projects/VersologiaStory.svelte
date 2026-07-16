<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal();
	const headingClass = 'm-0 font-[450] tracking-[-0.04em]';
	const bodyClass = 'text-ink-dim leading-[1.68]';
	const labelClass = 'meta mt-0 mb-4 text-accent-strong';
	const sectionHeadingClass = `${headingClass} text-[clamp(2.2rem,4.7vw,4.8rem)] leading-[0.94]`;
	const catalogueLineWidths = ['100%', '73%', '88%', '57%'];
	const profileBarHeights = ['35%', '82%', '55%', '100%', '68%'];

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

</script>

<section class="grid gap-[clamp(90px,14vw,210px)] border-t border-rule-strong py-[clamp(76px,11vw,150px)]">
	<article class="grid grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] items-end gap-[clamp(50px,9vw,130px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="max-w-[780px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} max-w-[12ch] text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} mt-7 mb-0 max-w-[66ch]">{copy.introBody}</p>
		</div>
		<ol class="m-0 list-none border-t border-rule-strong p-0">
			{#each copy.levels as level, index (level)}
				<li class="grid grid-cols-[42px_1fr] gap-3.5 border-b border-rule py-3.5">
					<span class="meta text-ink-faint">0{index + 1}</span>
					<strong class="font-title text-[1.05rem] font-[450]">{level}</strong>
				</li>
			{/each}
		</ol>
	</article>

	<div class="mx-auto w-[min(94%,1500px)] max-[600px]:w-full" use:reveal>
		<ProjectFigure src="/images/projects/versologia/portada.webp" alt={copy.coverAlt} caption={copy.coverCaption} number="01" priority />
	</div>

	<article class="grid grid-cols-12 items-end gap-[clamp(30px,5vw,76px)] max-[600px]:block [&>figure]:col-span-full [&>figure]:row-start-2 max-[600px]:[&>figure]:mt-[38px]" use:reveal>
		<div class="col-start-7 col-span-5 row-start-1 mb-2 max-w-[610px] max-[850px]:col-start-2 max-[850px]:col-span-10">
			<p class={labelClass}>{copy.modelLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.modelTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.modelBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/dashboard.webp" alt={copy.dashboardAlt} caption={copy.dashboardCaption} number="02" />
	</article>

	<article class="grid grid-cols-[minmax(290px,.72fr)_minmax(0,1.28fr)] items-center gap-[clamp(44px,7vw,110px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="max-w-[570px]">
			<p class={labelClass}>{copy.publicLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.publicTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.publicBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/ficha-obra.webp" alt={copy.workAlt} caption={copy.workCaption} number="03" />
	</article>

	<article class="grid grid-cols-[130px_minmax(0,.9fr)_minmax(360px,1.1fr)] items-start gap-[clamp(30px,6vw,90px)] border-y border-rule-strong py-[clamp(54px,8vw,96px)] max-[850px]:grid-cols-1" use:reveal>
		<p class="meta mt-[7px] mb-0 text-accent-strong">{copy.authorshipLabel}</p>
		<div>
			<h3 class="{headingClass} text-[clamp(2rem,4vw,4rem)] leading-[0.95]">{copy.authorshipTitle}</h3>
			<p class="{bodyClass} mt-[22px] mb-0 max-w-[62ch]">{copy.authorshipBody}</p>
		</div>
		<div class="meta grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-[9px] text-ink-faint max-[850px]:max-w-[560px] max-[600px]:text-[0.5rem]" aria-hidden="true">
			<span>OBRA / JORNADA</span><i class="h-px bg-rule-strong"></i>
			<span>PROPUESTA</span><i class="h-px bg-rule-strong"></i>
			<span>EVIDENCIAS</span><i class="h-px bg-rule-strong"></i>
			<b class="font-semibold text-accent-strong">PERFIL</b>
		</div>
	</article>

	<section class="grid gap-[clamp(54px,8vw,110px)]" use:reveal>
		<div class="ml-[9%] w-[min(720px,80%)] max-[600px]:ml-0 max-[600px]:w-full">
			<p class={labelClass}>{copy.futureLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.futureTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.futureBody}</p>
		</div>
		<div class="grid grid-cols-[1.12fr_.88fr] items-start gap-[clamp(26px,5vw,74px)] max-[600px]:grid-cols-1">
			<div class="relative grid min-h-[clamp(260px,34vw,500px)] overflow-hidden border-y border-t-rule-strong border-b-rule bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] p-[clamp(20px,3vw,38px)] max-[600px]:min-h-[300px]">
				<span class="meta text-ink-faint">04 / {copy.catalogue}</span>
				<div class="absolute top-[28%] right-[8%] left-[8%] grid gap-4" aria-hidden="true">
					{#each catalogueLineWidths as width (width)}<i class="h-px bg-rule-strong" style={`width: ${width}`}></i>{/each}
				</div>
				<p class="m-0 self-end font-title text-[clamp(1.3rem,2.4vw,2.2rem)] text-ink-dim leading-[1.68]">{copy.catalogueNote}</p>
			</div>
			<div class="relative mt-[clamp(70px,10vw,145px)] grid min-h-[clamp(260px,34vw,500px)] overflow-hidden border-y border-t-rule-strong border-b-rule bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] p-[clamp(20px,3vw,38px)] max-[600px]:mt-[10px] max-[600px]:min-h-[300px]">
				<span class="meta text-ink-faint">05 / {copy.author}</span>
				<div class="absolute top-[28%] right-[12%] left-[12%] flex h-[32%] items-end gap-[5%]" aria-hidden="true">
					{#each profileBarHeights as height (height)}<i class="flex-1 rounded-t-ui-sm bg-accent opacity-[0.18]" style={`height: ${height}`}></i>{/each}
				</div>
				<p class="m-0 self-end font-title text-[clamp(1.3rem,2.4vw,2.2rem)] text-ink-dim leading-[1.68]">{copy.authorNote}</p>
			</div>
		</div>
	</section>

	<article class="grid grid-cols-[minmax(300px,.85fr)_minmax(0,1.15fr)] items-center gap-[clamp(48px,9vw,140px)] max-[850px]:grid-cols-1" use:reveal>
		<div class="grid aspect-square grid-cols-5 gap-1 rounded-ui bg-[color-mix(in_srgb,var(--accent)_6%,var(--visual-bg))] p-[8%]" aria-hidden="true">
			{#each Array(25) as _, index}
				<i class="rounded-[2px] bg-[color-mix(in_srgb,var(--accent-strong)_var(--cell),var(--visual-bg))]" style={`--cell: ${((index * 37) % 82) + 12}%`}></i>
			{/each}
		</div>
		<div class="max-w-[650px]">
			<p class={labelClass}>{copy.labLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.labTitle}</h3>
			<p class="{bodyClass} mt-[23px] mb-0">{copy.labBody}</p>
			<ul class="mt-7 mb-0 flex list-none flex-wrap gap-[7px] p-0">
				{#each copy.methods as method (method)}
					<li class="rounded-full border border-rule px-[10px] py-[7px] font-mono text-[0.58rem] text-ink-faint">{method}</li>
				{/each}
			</ul>
		</div>
	</article>

	<article class="ml-auto w-[min(76%,900px)] border-t border-rule-strong pt-[clamp(52px,8vw,100px)] max-[850px]:w-full" use:reveal>
		<p class={labelClass}>{copy.roleLabel}</p>
		<h3 class="{headingClass} text-[clamp(2.4rem,5vw,5rem)] leading-[0.92]">{copy.roleTitle}</h3>
		<p class="{bodyClass} mt-[25px] mb-0 max-w-[70ch]">{copy.roleBody}</p>
		<div class="meta mt-[30px] flex flex-wrap gap-x-5 gap-y-2 text-ink-faint">
			{#each copy.stack as item, index (item)}
				<span class={index < copy.stack.length - 1 ? "after:pl-5 after:text-accent-strong after:content-['/']" : ''}>{item}</span>
			{/each}
		</div>
	</article>
</section>
