<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { createReveal } from '$lib/actions/reveal';
	import ProjectFigure from './ProjectFigure.svelte';

	let { locale }: { locale: Locale } = $props();
	const reveal = createReveal();
	const headingClass = 'tw:m-0 tw:font-[450] tw:tracking-[-0.04em]';
	const bodyClass = 'tw:text-ink-dim tw:leading-[1.68]';
	const labelClass = 'meta tw:mt-0 tw:mb-4 tw:text-accent-strong';
	const sectionHeadingClass = `${headingClass} tw:text-[clamp(2.2rem,4.7vw,4.8rem)] tw:leading-[0.94]`;
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

<section class="tw:grid tw:gap-[clamp(90px,14vw,210px)] tw:border-t tw:border-rule-strong tw:py-[clamp(76px,11vw,150px)]">
	<article class="tw:grid tw:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)] tw:items-end tw:gap-[clamp(50px,9vw,130px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[780px]">
			<p class={labelClass}>{copy.introLabel}</p>
			<h3 class="{headingClass} tw:max-w-[12ch] tw:text-[clamp(2.8rem,6.5vw,6.5rem)] tw:leading-[0.9]">{copy.introTitle}</h3>
			<p class="{bodyClass} tw:mt-7 tw:mb-0 tw:max-w-[66ch]">{copy.introBody}</p>
		</div>
		<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule-strong tw:p-0">
			{#each copy.levels as level, index (level)}
				<li class="tw:grid tw:grid-cols-[42px_1fr] tw:gap-3.5 tw:border-b tw:border-rule tw:py-3.5">
					<span class="meta tw:text-ink-faint">0{index + 1}</span>
					<strong class="tw:font-title tw:text-[1.05rem] tw:font-[450]">{level}</strong>
				</li>
			{/each}
		</ol>
	</article>

	<div class="tw:mx-auto tw:w-[min(94%,1500px)] tw:max-[600px]:w-full" use:reveal>
		<ProjectFigure src="/images/projects/versologia/portada.webp" alt={copy.coverAlt} caption={copy.coverCaption} number="01" priority />
	</div>

	<article class="tw:grid tw:grid-cols-12 tw:items-end tw:gap-[clamp(30px,5vw,76px)] tw:max-[600px]:block tw:[&>figure]:col-span-full tw:[&>figure]:row-start-2 tw:max-[600px]:[&>figure]:mt-[38px]" use:reveal>
		<div class="tw:col-start-7 tw:col-span-5 tw:row-start-1 tw:mb-2 tw:max-w-[610px] tw:max-[850px]:col-start-2 tw:max-[850px]:col-span-10">
			<p class={labelClass}>{copy.modelLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.modelTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.modelBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/dashboard.webp" alt={copy.dashboardAlt} caption={copy.dashboardCaption} number="02" />
	</article>

	<article class="tw:grid tw:grid-cols-[minmax(290px,.72fr)_minmax(0,1.28fr)] tw:items-center tw:gap-[clamp(44px,7vw,110px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:max-w-[570px]">
			<p class={labelClass}>{copy.publicLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.publicTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.publicBody}</p>
		</div>
		<ProjectFigure src="/images/projects/versologia/ficha-obra.webp" alt={copy.workAlt} caption={copy.workCaption} number="03" />
	</article>

	<article class="tw:grid tw:grid-cols-[130px_minmax(0,.9fr)_minmax(360px,1.1fr)] tw:items-start tw:gap-[clamp(30px,6vw,90px)] tw:border-y tw:border-rule-strong tw:py-[clamp(54px,8vw,96px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<p class="meta tw:mt-[7px] tw:mb-0 tw:text-accent-strong">{copy.authorshipLabel}</p>
		<div>
			<h3 class="{headingClass} tw:text-[clamp(2rem,4vw,4rem)] tw:leading-[0.95]">{copy.authorshipTitle}</h3>
			<p class="{bodyClass} tw:mt-[22px] tw:mb-0 tw:max-w-[62ch]">{copy.authorshipBody}</p>
		</div>
		<div class="meta tw:grid tw:grid-cols-[auto_1fr] tw:items-center tw:gap-x-3.5 tw:gap-y-[9px] tw:text-ink-faint tw:max-[850px]:max-w-[560px] tw:max-[600px]:text-[0.5rem]" aria-hidden="true">
			<span>OBRA / JORNADA</span><i class="tw:h-px tw:bg-rule-strong"></i>
			<span>PROPUESTA</span><i class="tw:h-px tw:bg-rule-strong"></i>
			<span>EVIDENCIAS</span><i class="tw:h-px tw:bg-rule-strong"></i>
			<b class="tw:font-semibold tw:text-accent-strong">PERFIL</b>
		</div>
	</article>

	<section class="tw:grid tw:gap-[clamp(54px,8vw,110px)]" use:reveal>
		<div class="tw:ml-[9%] tw:w-[min(720px,80%)] tw:max-[600px]:ml-0 tw:max-[600px]:w-full">
			<p class={labelClass}>{copy.futureLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.futureTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.futureBody}</p>
		</div>
		<div class="tw:grid tw:grid-cols-[1.12fr_.88fr] tw:items-start tw:gap-[clamp(26px,5vw,74px)] tw:max-[600px]:grid-cols-1">
			<div class="tw:relative tw:grid tw:min-h-[clamp(260px,34vw,500px)] tw:overflow-hidden tw:border-y tw:border-t-rule-strong tw:border-b-rule tw:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] tw:p-[clamp(20px,3vw,38px)] tw:max-[600px]:min-h-[300px]">
				<span class="meta tw:text-ink-faint">04 / {copy.catalogue}</span>
				<div class="tw:absolute tw:top-[28%] tw:right-[8%] tw:left-[8%] tw:grid tw:gap-4" aria-hidden="true">
					{#each catalogueLineWidths as width (width)}<i class="tw:h-px tw:bg-rule-strong" style={`width: ${width}`}></i>{/each}
				</div>
				<p class="tw:m-0 tw:self-end tw:font-title tw:text-[clamp(1.3rem,2.4vw,2.2rem)] tw:text-ink-dim tw:leading-[1.68]">{copy.catalogueNote}</p>
			</div>
			<div class="tw:relative tw:mt-[clamp(70px,10vw,145px)] tw:grid tw:min-h-[clamp(260px,34vw,500px)] tw:overflow-hidden tw:border-y tw:border-t-rule-strong tw:border-b-rule tw:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] tw:p-[clamp(20px,3vw,38px)] tw:max-[600px]:mt-[10px] tw:max-[600px]:min-h-[300px]">
				<span class="meta tw:text-ink-faint">05 / {copy.author}</span>
				<div class="tw:absolute tw:top-[28%] tw:right-[12%] tw:left-[12%] tw:flex tw:h-[32%] tw:items-end tw:gap-[5%]" aria-hidden="true">
					{#each profileBarHeights as height (height)}<i class="tw:flex-1 tw:rounded-t-ui-sm tw:bg-accent tw:opacity-[0.18]" style={`height: ${height}`}></i>{/each}
				</div>
				<p class="tw:m-0 tw:self-end tw:font-title tw:text-[clamp(1.3rem,2.4vw,2.2rem)] tw:text-ink-dim tw:leading-[1.68]">{copy.authorNote}</p>
			</div>
		</div>
	</section>

	<article class="tw:grid tw:grid-cols-[minmax(300px,.85fr)_minmax(0,1.15fr)] tw:items-center tw:gap-[clamp(48px,9vw,140px)] tw:max-[850px]:grid-cols-1" use:reveal>
		<div class="tw:grid tw:aspect-square tw:grid-cols-5 tw:gap-1 tw:rounded-ui tw:bg-[color-mix(in_srgb,var(--accent)_6%,var(--visual-bg))] tw:p-[8%]" aria-hidden="true">
			{#each Array(25) as _, index}
				<i class="tw:rounded-[2px] tw:bg-[color-mix(in_srgb,var(--accent-strong)_var(--cell),var(--visual-bg))]" style={`--cell: ${((index * 37) % 82) + 12}%`}></i>
			{/each}
		</div>
		<div class="tw:max-w-[650px]">
			<p class={labelClass}>{copy.labLabel}</p>
			<h3 class={sectionHeadingClass}>{copy.labTitle}</h3>
			<p class="{bodyClass} tw:mt-[23px] tw:mb-0">{copy.labBody}</p>
			<ul class="tw:mt-7 tw:mb-0 tw:flex tw:list-none tw:flex-wrap tw:gap-[7px] tw:p-0">
				{#each copy.methods as method (method)}
					<li class="tw:rounded-full tw:border tw:border-rule tw:px-[10px] tw:py-[7px] tw:font-mono tw:text-[0.58rem] tw:text-ink-faint">{method}</li>
				{/each}
			</ul>
		</div>
	</article>

	<article class="tw:ml-auto tw:w-[min(76%,900px)] tw:border-t tw:border-rule-strong tw:pt-[clamp(52px,8vw,100px)] tw:max-[850px]:w-full" use:reveal>
		<p class={labelClass}>{copy.roleLabel}</p>
		<h3 class="{headingClass} tw:text-[clamp(2.4rem,5vw,5rem)] tw:leading-[0.92]">{copy.roleTitle}</h3>
		<p class="{bodyClass} tw:mt-[25px] tw:mb-0 tw:max-w-[70ch]">{copy.roleBody}</p>
		<div class="meta tw:mt-[30px] tw:flex tw:flex-wrap tw:gap-x-5 tw:gap-y-2 tw:text-ink-faint">
			{#each copy.stack as item, index (item)}
				<span class={index < copy.stack.length - 1 ? "tw:after:pl-5 tw:after:text-accent-strong tw:after:content-['/']" : ''}>{item}</span>
			{/each}
		</div>
	</article>
</section>
