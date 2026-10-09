<script lang="ts">
	import { tick } from 'svelte';
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { plainInlineTitle } from '$lib/content/inline-markup';
	import { goto, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import type { Locale } from '$lib/paraglide/runtime';
	import { localizedPath } from '$lib/i18n';
	import { projectFromMetadata, projectText } from '$lib/content/projects';
	import { renderInlineMarkup } from '$lib/content/inline-markup';
	import type { PortfolioProjectMetadata, PortfolioRelatedItem } from '$lib/types/portfolio';
	import ProjectModal from '$lib/components/ProjectModal.svelte';
	import ProjectVisual from '$lib/components/ProjectVisual.svelte';

	let {
		locale,
		relatedItems,
		projectIndex
	}: {
		locale: Locale;
		relatedItems: PortfolioRelatedItem[];
		projectIndex: PortfolioProjectMetadata[];
	} = $props();
	let activeIndex = $state(0);
	let lastTrigger: HTMLElement | null = null;
	let projectList = $state<HTMLOListElement | null>(null);
	const allProjects = $derived(projectIndex.map((metadata) => projectFromMetadata(metadata)));
	const visibleProjects = $derived(projectIndex.map((metadata) => projectFromMetadata(metadata)));
	const activeProject = $derived(visibleProjects[activeIndex] ?? visibleProjects[0] ?? null);
	const shallowProjectSlug = $derived(
		typeof (page.state as Record<string, unknown>)?.portfolioModal === 'string'
			? String((page.state as Record<string, unknown>).portfolioModal)
			: null
	);
	const routeProjectSlug = $derived(page.url.pathname.match(/\/portfolio\/([^/]+)\/?$/)?.[1] ?? null);
	const requestedProjectSlug = $derived(shallowProjectSlug ?? routeProjectSlug);
	const modalIndex = $derived(
		requestedProjectSlug
			? (() => {
					const index = visibleProjects.findIndex((project) => project.slug === requestedProjectSlug);
					return index >= 0 ? index : null;
				})()
			: null
	);
	const modalProject = $derived(
		requestedProjectSlug
			? (allProjects.find((project) => project.slug === requestedProjectSlug) ?? null)
			: null
	);
	const modalCanNavigate = $derived(modalIndex !== null && visibleProjects.length > 1);
	const modalItems = $derived(
		modalProject ? relatedItems.filter((item) => item.portfolio_slug === modalProject.slug) : []
	);
	const copy = $derived(
		locale === 'es'
			? {
					open: 'Explorar ficha completa',
					contents: 'Índice de trabajos seleccionados',
					topics: 'Temas'
				}
			: {
					open: 'Explore full entry',
					contents: 'Selected work index',
					topics: 'Topics'
				}
	);

	$effect(() => {
		if (requestedProjectSlug) {
			const index = visibleProjects.findIndex((project) => project.slug === requestedProjectSlug);
			if (index >= 0) activeIndex = index;
		} else if (activeIndex >= visibleProjects.length) {
			activeIndex = 0;
		} else {
			window.requestAnimationFrame(() => lastTrigger?.focus());
		}
	});

	const openProject = (event: MouseEvent, index: number) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		lastTrigger = event.currentTarget as HTMLElement;
		activeIndex = index;
		const project = visibleProjects[index];
		if (!project) return;
		const baseUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
		pushState(localizedPath(`/portfolio/${project.slug}`, locale), {
			portfolioModal: project.slug,
			portfolioBase: baseUrl
		});
	};

	// En ordenador, al cambiar de proyecto activo se pliega el resumen anterior y la lista se movería
	// bajo el cursor: se compensa el desplazamiento para que el proyecto señalado no cambie de sitio.
	const activate = (index: number) => {
		if (index === activeIndex) return;
		const item = projectList?.querySelector<HTMLElement>(`[data-project-index="${index}"]`);
		const before = item?.getBoundingClientRect().top ?? 0;
		activeIndex = index;
		if (!item || window.matchMedia('(max-width: 700px)').matches) return;
		void tick().then(() => {
			const delta = item.getBoundingClientRect().top - before;
			if (Math.abs(delta) > 1) window.scrollBy(0, delta);
		});
	};

	const closeModal = () => {
		const state = page.state as Record<string, unknown>;
		if (shallowProjectSlug && typeof state.portfolioBase === 'string') {
			window.history.back();
			return;
		}
		void goto(localizedPath('/', locale), { replaceState: true, noScroll: true });
	};

	const showProject = (index: number) => {
		activeIndex = index;
		const project = visibleProjects[index];
		if (!project) return;
		const state = page.state as Record<string, unknown>;
		replaceState(localizedPath(`/portfolio/${project.slug}`, locale), {
			...state,
			portfolioModal: project.slug
		});
	};

	const previousProject = () => {
		if (modalIndex === null) return;
		showProject((modalIndex - 1 + visibleProjects.length) % visibleProjects.length);
	};

	const nextProject = () => {
		if (modalIndex === null) return;
		showProject((modalIndex + 1) % visibleProjects.length);
	};
</script>

{#if activeProject}
<!-- Ordenador: lista con el resumen del proyecto activo bajo su título y, a la derecha, solo el
     visual con sus temas. Móvil (sin hover): lista vertical con visual, resumen y temas en cada proyecto. -->
<div
	class="grid grid-cols-[minmax(0,1.08fr)_minmax(320px,.92fr)] items-start gap-[clamp(48px,8vw,120px)] max-[900px]:gap-[30px] max-[700px]:block"
>
	<ol
		class="m-0 grid list-none gap-[clamp(14px,2.4vw,34px)] p-0 max-[700px]:gap-[clamp(52px,13vw,76px)]"
		bind:this={projectList}
		aria-label={copy.contents}
	>
		{#each visibleProjects as project, index (project.slug)}
			{@const active = activeIndex === index}
			<li
				data-project-index={index}
				onmouseenter={() => activate(index)}
				onfocusin={() => activate(index)}
			>
				<a
					class="group block text-inherit no-underline"
					href={localizedPath(`/portfolio/${project.slug}`, locale)}
					aria-current={active ? 'true' : undefined}
					onclick={(event) => openProject(event, index)}
				>
					<span class="mb-5 hidden max-[700px]:block">
						<ProjectVisual visual={project.visual} label={projectText(project.kind, locale)} period={project.year} />
					</span>
					<span class="flex items-baseline justify-between gap-4 max-[700px]:hidden">
						<span class={`label [transition:color_180ms_ease] ${active ? 'text-ink-dim' : 'text-ink-faint'}`}>
							{projectText(project.kind, locale)}
						</span>
						<span class="font-mono text-[.72rem] text-ink-faint">{project.year}</span>
					</span>
					<span
						class={`mt-2 block font-title text-[clamp(1.6rem,3vw,2.7rem)] font-medium leading-[1.02] tracking-[-0.03em] [transition:color_180ms_ease] group-hover:text-accent-strong max-[700px]:text-[clamp(1.45rem,6.4vw,1.95rem)] ${active ? 'text-accent-strong max-[700px]:text-ink' : ''}`}
					>
						<InlineTitle text={projectText(project.title, locale)} />
					</span>
				</a>
				<div class={`${active ? 'block' : 'hidden'} max-[700px]:block`}>
					<p
						class="mt-3 mb-0 max-w-[52ch] text-[.92rem] leading-[1.6] text-ink-dim [&_b]:font-bold [&_em]:italic [&_i]:italic [&_strong]:font-bold"
					>{@html renderInlineMarkup(projectText(project.summary, locale))}</p>
					<ul class="mt-3 mb-0 hidden list-none flex-wrap gap-x-2.5 gap-y-1 p-0 text-ink-faint max-[700px]:flex" aria-label={copy.topics}>
						{#each project.tags as tag (tag.code)}
							<li class="label after:pl-2 after:text-rule-strong after:content-['/'] last:after:content-none">{projectText(tag, locale)}</li>
						{/each}
					</ul>
				</div>
			</li>
		{/each}
	</ol>

	<aside class="relative h-full max-[700px]:hidden" aria-live="polite">
		<div class="sticky top-[clamp(82px,11vh,118px)]">
			{#key activeProject.slug}
				<a
					class="group block text-inherit no-underline [animation:editorial-preview-in_600ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none"
					href={localizedPath(`/portfolio/${activeProject.slug}`, locale)}
					onclick={(event) => openProject(event, activeIndex)}
					aria-label={`${copy.open}: ${plainInlineTitle(projectText(activeProject.title, locale))}`}
				>
					<ProjectVisual
						visual={activeProject.visual}
						label={projectText(activeProject.kind, locale)}
						period={activeProject.year}
					/>
					<ul class="mt-4 mb-0 flex list-none flex-wrap gap-x-[14px] gap-y-1.5 p-0 text-ink-faint" aria-label={copy.topics}>
						{#each activeProject.tags as tag (tag.code)}
							<li class="label after:pl-[10px] after:text-rule-strong after:content-['/'] last:after:content-none group-hover:text-ink-dim">
								{projectText(tag, locale)}
							</li>
						{/each}
					</ul>
				</a>
			{/key}
		</div>
	</aside>
</div>
{:else}
	<p class="m-0 border-y border-rule py-8 text-sm text-ink-faint">
		{locale === 'es' ? 'No hay elementos del portfolio visibles en este momento.' : 'There are no visible portfolio entries at the moment.'}
	</p>
{/if}

{#if modalProject}
	<ProjectModal
		project={modalProject}
		relatedItems={modalItems}
		{locale}
		onclose={closeModal}
		onprevious={previousProject}
		onnext={nextProject}
		canNavigate={modalCanNavigate}
	/>
{/if}
