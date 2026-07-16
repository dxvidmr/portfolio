<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import { goto, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import type { Locale } from '$lib/paraglide/runtime';
	import { localizedPath } from '$lib/i18n';
	import { projects, projectText } from '$lib/content/projects';
	import type { PortfolioRelatedItem } from '$lib/types/portfolio';
	import ProjectModal from '$lib/components/ProjectModal.svelte';
	import ProjectVisual from '$lib/components/ProjectVisual.svelte';

	let { locale, relatedItems }: { locale: Locale; relatedItems: PortfolioRelatedItem[] } = $props();
	let activeIndex = $state(0);
	let lastTrigger: HTMLElement | null = null;
	const activeProject = $derived(projects[activeIndex] ?? projects[0]);
	const shallowProjectSlug = $derived(
		typeof (page.state as Record<string, unknown>)?.portfolioModal === 'string'
			? String((page.state as Record<string, unknown>).portfolioModal)
			: null
	);
	const routeProjectSlug = $derived(page.url.pathname.match(/\/proyectos\/([^/]+)\/?$/)?.[1] ?? null);
	const requestedProjectSlug = $derived(shallowProjectSlug ?? routeProjectSlug);
	const modalIndex = $derived(
		requestedProjectSlug
			? (() => {
					const index = projects.findIndex((project) => project.slug === requestedProjectSlug);
					return index >= 0 ? index : null;
				})()
			: null
	);
	const modalProject = $derived(modalIndex === null ? null : (projects[modalIndex] ?? null));
	const modalItems = $derived(
		modalProject ? relatedItems.filter((item) => item.portfolio_slug === modalProject.slug) : []
	);
	const copy = $derived(
		locale === 'es'
			? {
					open: 'Explorar proyecto completo',
					contents: 'Índice de trabajos seleccionados',
					preview: 'Proyecto seleccionado'
				}
			: {
					open: 'Explore full project',
					contents: 'Selected work index',
					preview: 'Selected project'
				}
	);

	$effect(() => {
		if (requestedProjectSlug) {
			const index = projects.findIndex((project) => project.slug === requestedProjectSlug);
			if (index >= 0) activeIndex = index;
		} else {
			window.requestAnimationFrame(() => lastTrigger?.focus());
		}
	});

	const openProject = (event: MouseEvent, index: number) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		lastTrigger = event.currentTarget as HTMLElement;
		activeIndex = index;
		const project = projects[index];
		const baseUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
		pushState(localizedPath(`/proyectos/${project.slug}`, locale), {
			portfolioModal: project.slug,
			portfolioBase: baseUrl
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
		const project = projects[index];
		const state = page.state as Record<string, unknown>;
		replaceState(localizedPath(`/proyectos/${project.slug}`, locale), {
			...state,
			portfolioModal: project.slug
		});
	};

	const previousProject = () => {
		if (modalIndex === null) return;
		showProject((modalIndex - 1 + projects.length) % projects.length);
	};

	const nextProject = () => {
		if (modalIndex === null) return;
		showProject((modalIndex + 1) % projects.length);
	};
</script>

<div
	class="tw:grid tw:grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] tw:items-start tw:gap-[clamp(48px,8vw,120px)] tw:max-[900px]:grid-cols-[minmax(0,1.08fr)_minmax(290px,.92fr)] tw:max-[900px]:gap-[30px] tw:max-[700px]:flex tw:max-[700px]:flex-col"
>
	<ol
		class="tw:m-0 tw:list-none tw:border-t tw:border-rule-strong tw:p-0 tw:max-[700px]:w-full"
		aria-label={copy.contents}
	>
		{#each projects as project, index (project.slug)}
			<li class="tw:border-b tw:border-rule">
				<a
					class="tw:grid tw:grid-cols-[36px_minmax(0,1fr)_auto] tw:items-center tw:gap-[clamp(12px,2vw,24px)] tw:py-[clamp(18px,2.5vw,31px)] tw:text-inherit tw:no-underline tw:max-[900px]:grid-cols-[30px_minmax(0,1fr)]"
					href={localizedPath(`/proyectos/${project.slug}`, locale)}
					aria-current={activeIndex === index ? 'true' : undefined}
					onmouseenter={() => (activeIndex = index)}
					onfocus={() => (activeIndex = index)}
					onclick={(event) => openProject(event, index)}
				>
					<span class="meta tw:text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
					<span class="tw:grid tw:min-w-0 tw:gap-2">
						<span
							class={`meta tw:[transition:color_180ms_ease] ${activeIndex === index ? 'tw:text-ink-dim' : 'tw:text-ink-faint'}`}
						>
							{projectText(project.kind, locale)}
						</span>
						<span
							class={`tw:font-title tw:text-[clamp(1.9rem,3.9vw,4.4rem)] tw:font-[450] tw:leading-[0.9] tw:tracking-[-0.04em] tw:[transition:color_180ms_ease,transform_320ms_cubic-bezier(.16,1,.3,1)] tw:motion-reduce:transition-none tw:max-[700px]:text-[clamp(2rem,10vw,3.6rem)] ${activeIndex === index ? 'tw:translate-x-[9px] tw:text-accent-strong' : ''}`}
						>
							{projectText(project.title, locale)}
						</span>
					</span>
					<span
						class="tw:justify-self-end tw:max-[900px]:col-start-2 tw:max-[900px]:row-start-2 tw:max-[900px]:flex tw:max-[900px]:justify-between tw:max-[900px]:justify-items-[initial]"
					>
						<span class="meta tw:text-ink-faint">{project.year}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside
		class="tw:relative tw:h-full tw:max-[700px]:order-[-1] tw:max-[700px]:w-full"
		aria-live="polite"
	>
		<div class="tw:sticky tw:top-[clamp(82px,11vh,118px)] tw:max-[700px]:static">
			<a
				class="tw:group tw:block tw:text-inherit tw:no-underline"
				href={localizedPath(`/proyectos/${activeProject.slug}`, locale)}
				onclick={(event) => openProject(event, activeIndex)}
			>
				{#key activeProject.slug}
					<div
						class="tw:[animation:editorial-preview-in_600ms_cubic-bezier(.16,1,.3,1)_both] tw:motion-reduce:animate-none"
					>
						<div class="meta tw:mb-[11px] tw:flex tw:justify-between tw:gap-[18px] tw:text-ink-faint">
							<span>{copy.preview}</span>
							<span>{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
						</div>
						<ProjectVisual
							visual={activeProject.visual}
							label={projectText(activeProject.kind, locale)}
							period={activeProject.year}
						/>
						<p
							class="tw:mt-[18px] tw:mb-0 tw:max-w-[58ch] tw:text-[clamp(.78rem,1.1vw,.9rem)] tw:leading-[1.6] tw:text-ink-dim"
						>
							{projectText(activeProject.summary, locale)}
						</p>
						<ul
							class="tw:mt-4 tw:mb-0 tw:flex tw:list-none tw:flex-wrap tw:gap-x-[14px] tw:gap-y-1.5 tw:p-0 tw:text-ink-faint"
							aria-label={locale === 'es' ? 'Temas' : 'Topics'}
						>
							{#each activeProject.tags.slice(0, 4) as tag (tag)}
								<li
									class="meta tw:after:pl-[14px] tw:after:text-accent-strong tw:after:content-['/'] tw:last:after:content-none"
								>
									{tag}
								</li>
							{/each}
						</ul>
					</div>
				{/key}
				<div
					class="meta tw:mt-[22px] tw:flex tw:items-center tw:justify-between tw:gap-[18px] tw:border-y tw:border-rule-strong tw:py-[13px] tw:text-ink"
				>
					<span>{copy.open}</span>
					<span
						class="tw:inline-grid tw:place-items-center tw:text-accent-strong tw:[transition:transform_180ms_ease] tw:motion-reduce:transition-none tw:group-hover:translate-x-[3px] tw:group-hover:translate-y-[-3px] tw:group-focus-visible:translate-x-[3px] tw:group-focus-visible:translate-y-[-3px]"
						aria-hidden="true"><MoveUpRight size={19} strokeWidth={1.7} /></span
					>
				</div>
			</a>
		</div>
	</aside>
</div>

{#if modalProject && modalIndex !== null}
	<ProjectModal
		project={modalProject}
		relatedItems={modalItems}
		{locale}
		onclose={closeModal}
		onprevious={previousProject}
		onnext={nextProject}
	/>
{/if}
