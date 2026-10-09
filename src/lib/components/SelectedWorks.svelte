<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { plainInlineTitle } from '$lib/content/inline-markup';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
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
	let mobileSelector = $state<HTMLOListElement | null>(null);
	let mobileScrollFrame = 0;
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
					contents: 'Índice de trabajos seleccionados'
				}
			: {
					open: 'Explore full entry',
					contents: 'Selected work index'
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

	const syncMobileSelection = () => {
		if (!mobileSelector || !window.matchMedia('(max-width: 700px)').matches) return;
		window.cancelAnimationFrame(mobileScrollFrame);
		mobileScrollFrame = window.requestAnimationFrame(() => {
			if (!mobileSelector) return;
			const selectorRect = mobileSelector.getBoundingClientRect();
			const selectorCenter = selectorRect.left + selectorRect.width / 2;
			const items = Array.from(
				mobileSelector.querySelectorAll<HTMLElement>('[data-project-index]')
			);
			const closest = items.reduce<{ index: number; distance: number } | null>((current, item) => {
				const rect = item.getBoundingClientRect();
				const distance = Math.abs(rect.left + rect.width / 2 - selectorCenter);
				const index = Number(item.dataset.projectIndex);
				return !current || distance < current.distance ? { index, distance } : current;
			}, null);
			if (closest && Number.isFinite(closest.index)) activeIndex = closest.index;
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
<div
	class="grid grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] items-start gap-[clamp(48px,8vw,120px)] max-[900px]:grid-cols-[minmax(0,1.08fr)_minmax(290px,.92fr)] max-[900px]:gap-[30px] max-[700px]:flex max-[700px]:flex-col max-[700px]:gap-0"
>
	<ol
		class="m-0 list-none p-0 max-[700px]:order-2 max-[700px]:mt-4 max-[700px]:flex max-[700px]:w-[calc(100%+var(--gutter))] max-[700px]:snap-x max-[700px]:snap-mandatory max-[700px]:overflow-x-auto max-[700px]:scroll-smooth max-[700px]:overscroll-x-contain max-[700px]:pr-[var(--gutter)]"
		bind:this={mobileSelector}
		onscroll={syncMobileSelection}
		aria-label={copy.contents}
	>
		{#each visibleProjects as project, index (project.slug)}
			<li
				class="max-[700px]:flex-[0_0_min(70vw,290px)] max-[700px]:snap-start max-[700px]:border-r max-[700px]:last:border-r-0"
				data-project-index={index}
			>
				<a
					class="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-[clamp(12px,2vw,24px)] py-[clamp(16px,2.4vw,30px)] text-inherit no-underline max-[700px]:h-full max-[700px]:min-h-[92px] max-[700px]:grid-cols-[minmax(0,1fr)] max-[700px]:gap-x-2.5 max-[700px]:px-3 max-[700px]:py-3"
					href={localizedPath(`/portfolio/${project.slug}`, locale)}
					aria-current={activeIndex === index ? 'true' : undefined}
					onmouseenter={() => (activeIndex = index)}
					onfocus={() => (activeIndex = index)}
					onclick={(event) => openProject(event, index)}
				>
					<span class="grid min-w-0 gap-2">
						<span
							class={`label [transition:color_180ms_ease] max-[700px]:hidden ${activeIndex === index ? 'text-ink-dim' : 'text-ink-faint'}`}
						>
							{projectText(project.kind, locale)}
						</span>
						<span
							class={`font-title text-[clamp(1.6rem,3vw,2.7rem)] font-medium leading-[1.02] tracking-[-0.03em] [transition:color_180ms_ease] motion-reduce:transition-none max-[700px]:text-[clamp(1.2rem,5.6vw,1.6rem)] ${activeIndex === index ? 'text-accent-strong' : ''}`}
						>
							<InlineTitle text={projectText(project.title, locale)} />
						</span>
					</span>
					<span
						class="justify-self-end max-[700px]:hidden"
					>
						<span class="font-mono text-[.72rem] text-ink-faint">{project.year}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>

	<!-- En ordenador la columna solo muestra el visual y el resumen, que cambian con un fundido al
	     pasar por los títulos; temas y enlace a la ficha quedan para el móvil. -->
	<aside
		class="relative h-full max-[700px]:contents"
		aria-live="polite"
	>
		<div class="sticky top-[clamp(82px,11vh,118px)] max-[700px]:contents">
			{#key activeProject.slug}
				<div
					class="[animation:editorial-preview-in_600ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none max-[700px]:order-1 max-[700px]:w-full"
				>
						<a
							class="block text-inherit no-underline"
							href={localizedPath(`/portfolio/${activeProject.slug}`, locale)}
							onclick={(event) => openProject(event, activeIndex)}
							aria-label={`${copy.open}: ${plainInlineTitle(projectText(activeProject.title, locale))}`}
						>
							<ProjectVisual
								visual={activeProject.visual}
								label={projectText(activeProject.kind, locale)}
								period={activeProject.year}
								mobileTall
							/>
						</a>
				</div>
				<div
					class="[animation:editorial-preview-in_600ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none max-[700px]:order-3 max-[700px]:w-full"
				>
						<p
							class="mt-[18px] mb-0 max-w-[58ch] text-[.86rem] leading-[1.6] text-ink-dim max-[700px]:mt-3.5 max-[700px]:text-[.92rem] max-[700px]:leading-[1.5] [&_b]:font-bold [&_em]:italic [&_i]:italic [&_strong]:font-bold"
						>{@html renderInlineMarkup(projectText(activeProject.summary, locale))}</p>
						<ul
							class="mt-4 mb-0 flex list-none flex-wrap gap-x-[14px] gap-y-1.5 p-0 text-ink-faint min-[701px]:hidden max-[700px]:mt-3 max-[700px]:gap-x-2.5 max-[700px]:gap-y-1"
							aria-label={locale === 'es' ? 'Temas' : 'Topics'}
						>
							{#each activeProject.tags as tag (tag.code)}
								<li
									class="label after:pl-[10px] after:text-rule-strong after:content-['/'] last:after:content-none max-[700px]:text-[.72rem] max-[700px]:after:pl-2"
								>
									{projectText(tag, locale)}
								</li>
							{/each}
						</ul>
				</div>
			{/key}
			<a
				class="group mt-[22px] flex items-center justify-between gap-[18px] py-[10px] label text-ink no-underline min-[701px]:hidden max-[700px]:order-4 max-[700px]:min-h-[54px] max-[700px]:w-full"
				href={localizedPath(`/portfolio/${activeProject.slug}`, locale)}
				onclick={(event) => openProject(event, activeIndex)}
			>
				<span>{copy.open}</span>
				<span
					class="inline-grid place-items-center text-accent-strong [transition:transform_180ms_ease] motion-reduce:transition-none group-hover:translate-x-[3px] group-hover:translate-y-[-3px] group-focus-visible:translate-x-[3px] group-focus-visible:translate-y-[-3px]"
					aria-hidden="true"><MoveUpRight size={19} strokeWidth={1.7} /></span
				>
			</a>
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
