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

<div class="works-index-explorer">
	<ol class="typographic-index" aria-label={copy.contents}>
		{#each projects as project, index (project.slug)}
			<li class:is-active={activeIndex === index}>
				<a
					href={localizedPath(`/proyectos/${project.slug}`, locale)}
					aria-current={activeIndex === index ? 'true' : undefined}
					onmouseenter={() => (activeIndex = index)}
					onfocus={() => (activeIndex = index)}
					onclick={(event) => openProject(event, index)}
				>
					<span class="meta entry-number">{String(index + 1).padStart(2, '0')}</span>
					<span class="entry-main">
						<span class="meta entry-kind">{projectText(project.kind, locale)}</span>
						<span class="entry-title">{projectText(project.title, locale)}</span>
					</span>
					<span class="entry-end">
						<span class="meta entry-year">{project.year}</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>

	<aside class="project-preview" aria-live="polite">
		<div class="preview-sticky">
			<a
				class="preview-link"
				href={localizedPath(`/proyectos/${activeProject.slug}`, locale)}
				onclick={(event) => openProject(event, activeIndex)}
			>
				{#key activeProject.slug}
					<div class="preview-change">
						<div class="preview-meta meta">
							<span>{copy.preview}</span>
							<span>{String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span>
						</div>
						<ProjectVisual
							visual={activeProject.visual}
							label={projectText(activeProject.kind, locale)}
							period={activeProject.year}
						/>
						<p class="preview-summary">{projectText(activeProject.summary, locale)}</p>
						<ul class="preview-tags" aria-label={locale === 'es' ? 'Temas' : 'Topics'}>
							{#each activeProject.tags.slice(0, 4) as tag (tag)}<li class="meta">{tag}</li>{/each}
						</ul>
					</div>
				{/key}
				<div class="preview-cta meta">
					<span>{copy.open}</span>
					<span aria-hidden="true"><MoveUpRight size={19} strokeWidth={1.7} /></span>
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

<style>
	.works-index-explorer { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr); gap: clamp(48px, 8vw, 120px); align-items: start; }
	.typographic-index { margin: 0; padding: 0; border-top: 1px solid var(--line-strong); list-style: none; }
	.typographic-index li { border-bottom: 1px solid var(--line); }
	.typographic-index a { display: grid; grid-template-columns: 36px minmax(0, 1fr) auto; gap: clamp(12px, 2vw, 24px); align-items: center; padding: clamp(18px, 2.5vw, 31px) 0; color: inherit; text-decoration: none; }
	.entry-number, .entry-kind, .entry-year { color: var(--fg-faint); }
	.entry-main { display: grid; gap: 8px; min-width: 0; }
	.entry-kind { transition: color 180ms ease; }
	.entry-title { font-family: var(--font-title); font-size: clamp(1.9rem, 3.9vw, 4.4rem); font-weight: 450; line-height: .9; letter-spacing: -.04em; transition: color 180ms ease, transform 320ms cubic-bezier(.16, 1, .3, 1); }
	.entry-end { justify-self: end; }
	.typographic-index li.is-active .entry-title { color: var(--accent-strong); transform: translateX(9px); }
	.typographic-index li.is-active .entry-kind { color: var(--fg-dim); }

	.project-preview { position: relative; height: 100%; }
	.preview-sticky { position: sticky; top: clamp(82px, 11vh, 118px); }
	.preview-link { display: block; color: inherit; text-decoration: none; }
	.preview-change { animation: preview-in 600ms cubic-bezier(.16, 1, .3, 1) both; }
	.preview-meta { display: flex; justify-content: space-between; gap: 18px; margin-bottom: 11px; color: var(--fg-faint); }
	.preview-summary { max-width: 58ch; margin: 18px 0 0; color: var(--fg-dim); font-size: clamp(.78rem, 1.1vw, .9rem); line-height: 1.6; }
	.preview-tags { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 16px 0 0; padding: 0; color: var(--fg-faint); list-style: none; }
	.preview-tags li:not(:last-child)::after { padding-left: 14px; color: var(--accent-strong); content: '/'; }
	.preview-cta { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-top: 22px; padding: 13px 0; border-block: 1px solid var(--line-strong); color: var(--fg); }
	.preview-cta > span:last-child { display: inline-grid; place-items: center; color: var(--accent-strong); transition: transform 180ms ease; }
	.preview-link:hover .preview-cta > span:last-child, .preview-link:focus-visible .preview-cta > span:last-child { transform: translate(3px, -3px); }
	@keyframes preview-in { from { opacity: 0; filter: blur(5px); transform: translate3d(0, 18px, 0) scale(.985); } }

	@media (max-width: 900px) {
		.works-index-explorer { grid-template-columns: minmax(0, 1.08fr) minmax(290px, .92fr); gap: 30px; }
		.typographic-index a { grid-template-columns: 30px minmax(0, 1fr); }
		.entry-end { grid-column: 2; grid-row: 2; display: flex; justify-content: space-between; justify-items: initial; }
	}
	@media (max-width: 700px) {
		.works-index-explorer { display: flex; flex-direction: column; }
		.project-preview { order: -1; width: 100%; }
		.preview-sticky { position: static; }
		.typographic-index { width: 100%; }
		.entry-title { font-size: clamp(2rem, 10vw, 3.6rem); }
	}
	@media (prefers-reduced-motion: reduce) {
		.preview-change { animation: none; }
		.entry-title, .preview-cta > span:last-child { transition: none; }
	}
</style>
