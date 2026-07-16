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
	class="grid grid-cols-[minmax(0,1.08fr)_minmax(360px,.92fr)] items-start gap-[clamp(48px,8vw,120px)] max-[900px]:grid-cols-[minmax(0,1.08fr)_minmax(290px,.92fr)] max-[900px]:gap-[30px] max-[700px]:flex max-[700px]:flex-col"
>
	<ol
		class="m-0 list-none border-t border-rule-strong p-0 max-[700px]:w-full"
		aria-label={copy.contents}
	>
		{#each projects as project, index (project.slug)}
			<li class="border-b border-rule">
				<a
					class="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-[clamp(12px,2vw,24px)] py-[clamp(18px,2.5vw,31px)] text-inherit no-underline max-[900px]:grid-cols-[30px_minmax(0,1fr)]"
					href={localizedPath(`/proyectos/${project.slug}`, locale)}
					aria-current={activeIndex === index ? 'true' : undefined}
					onmouseenter={() => (activeIndex = index)}
					onfocus={() => (activeIndex = index)}
					onclick={(event) => openProject(event, index)}
				>
					<span class="meta text-ink-faint">{String(index + 1).padStart(2, '0')}</span>
					<span class="grid min-w-0 gap-2">
						<span
							class={`meta [transition:color_180ms_ease] ${activeIndex === index ? 'text-ink-dim' : 'text-ink-faint'}`}
						>
							{projectText(project.kind, locale)}
						</span>
						<span
							class={`font-title text-[clamp(1.9rem,3.9vw,4.4rem)] font-[450] leading-[0.9] tracking-[-0.04em] [transition:color_180ms_ease,transform_320ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none max-[700px]:text-[clamp(2rem,10vw,3.6rem)] ${activeIndex === index ? 'translate-x-[9px] text-accent-strong' : ''}`}
						>
							{projectText(project.title, locale)}
						</span>
					</span>
					<span
						class="justify-self-end max-[900px]:col-start-2 max-[900px]:row-start-2 max-[900px]:flex max-[900px]:justify-between max-[900px]:justify-items-[initial]"
					>
						<span class="meta text-ink-faint">{project.year}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside
		class="relative h-full max-[700px]:order-[-1] max-[700px]:w-full"
		aria-live="polite"
	>
		<div class="sticky top-[clamp(82px,11vh,118px)] max-[700px]:static">
			<a
				class="group block text-inherit no-underline"
				href={localizedPath(`/proyectos/${activeProject.slug}`, locale)}
				onclick={(event) => openProject(event, activeIndex)}
			>
				{#key activeProject.slug}
					<div
						class="[animation:editorial-preview-in_600ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none"
					>
						<div class="meta mb-[11px] flex justify-between gap-[18px] text-ink-faint">
							<span>{copy.preview}</span>
							<span>{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
						</div>
						<ProjectVisual
							visual={activeProject.visual}
							label={projectText(activeProject.kind, locale)}
							period={activeProject.year}
						/>
						<p
							class="mt-[18px] mb-0 max-w-[58ch] text-[clamp(.78rem,1.1vw,.9rem)] leading-[1.6] text-ink-dim"
						>
							{projectText(activeProject.summary, locale)}
						</p>
						<ul
							class="mt-4 mb-0 flex list-none flex-wrap gap-x-[14px] gap-y-1.5 p-0 text-ink-faint"
							aria-label={locale === 'es' ? 'Temas' : 'Topics'}
						>
							{#each activeProject.tags.slice(0, 4) as tag (tag)}
								<li
									class="meta after:pl-[14px] after:text-accent-strong after:content-['/'] last:after:content-none"
								>
									{tag}
								</li>
							{/each}
						</ul>
					</div>
				{/key}
				<div
					class="meta mt-[22px] flex items-center justify-between gap-[18px] border-y border-rule-strong py-[13px] text-ink"
				>
					<span>{copy.open}</span>
					<span
						class="inline-grid place-items-center text-accent-strong [transition:transform_180ms_ease] motion-reduce:transition-none group-hover:translate-x-[3px] group-hover:translate-y-[-3px] group-focus-visible:translate-x-[3px] group-focus-visible:translate-y-[-3px]"
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
