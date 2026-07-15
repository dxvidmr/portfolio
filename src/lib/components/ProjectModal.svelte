<script lang="ts">
	import { onMount } from 'svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Locale } from '$lib/paraglide/runtime';
	import { entityLabel } from '$lib/content/labels';
	import { projectText, type PortfolioProject } from '$lib/content/projects';
	import type { PortfolioRelatedItem } from '$lib/types/portfolio';
	import ProjectVisual from '$lib/components/ProjectVisual.svelte';
	import ProjectStory from '$lib/components/projects/ProjectStory.svelte';

	let {
		project,
		relatedItems,
		locale,
		onclose,
		onprevious,
		onnext
	}: {
		project: PortfolioProject;
		relatedItems: PortfolioRelatedItem[];
		locale: Locale;
		onclose: () => void;
		onprevious: () => void;
		onnext: () => void;
	} = $props();

	let shell = $state<HTMLElement | null>(null);
	let viewport = $state<HTMLElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);
	const itemYear = (value: string | null) => value?.slice(0, 4) ?? '—';
	// Etiquetas de subtipo desde type_vocab (decisión 16); el código es el fallback.
	const subtypeLabel = (item: PortfolioRelatedItem) =>
		(locale === 'en' ? item.subtype_label_en : item.subtype_label_es) ??
		item.subtype?.replaceAll('_', ' ') ??
		null;
	const copy = $derived(
		locale === 'es'
			? {
					close: 'Cerrar proyecto',
					previous: 'Proyecto anterior',
					next: 'Proyecto siguiente',
					status: 'Estado',
					period: 'Periodo',
					topics: 'Temas',
					links: 'Enlaces',
					sectionMenu: 'Menú del proyecto',
					related: 'Resultados relacionados',
					relatedIntro: 'Publicaciones, proyectos y otras actividades vinculadas.',
					featured: 'Resultado destacado'
				}
			: {
					close: 'Close project',
					previous: 'Previous project',
					next: 'Next project',
					status: 'Status',
					period: 'Period',
					topics: 'Topics',
					links: 'Links',
					sectionMenu: 'Project menu',
					related: 'Related outputs',
					relatedIntro: 'Related publications, projects, and other activities.',
					featured: 'Featured output'
				}
	);

	$effect(() => {
		project.slug;
		if (viewport) viewport.scrollTop = 0;
	});

	onMount(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		document.body.classList.add('project-modal-open');
		closeButton?.focus();

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onclose();
				return;
			}
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				onprevious();
				return;
			}
			if (event.key === 'ArrowRight') {
				event.preventDefault();
				onnext();
				return;
			}
			if (event.key !== 'Tab' || !shell) return;

			const focusable = Array.from(
				shell.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
			).filter((element) => !element.hasAttribute('hidden'));
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = previousOverflow;
			document.body.classList.remove('project-modal-open');
			window.removeEventListener('keydown', handleKeydown);
		};
	});

</script>

<div class="modal-layer" role="presentation">
	<div
		class="modal-shell"
		bind:this={shell}
		role="dialog"
		aria-modal="true"
		aria-labelledby="project-modal-title"
	>
		<nav class="modal-controls" aria-label={locale === 'es' ? 'Navegar entre proyectos' : 'Navigate projects'}>
			<button class="modal-arrow modal-previous" type="button" onclick={onprevious} aria-label={copy.previous} title={copy.previous}>
				<ChevronLeft size={27} strokeWidth={1.5} />
			</button>
			<button class="modal-close" bind:this={closeButton} type="button" onclick={onclose} aria-label={copy.close} title={copy.close}>
				<XIcon size={27} strokeWidth={1.5} />
			</button>
			<button class="modal-arrow modal-next" type="button" onclick={onnext} aria-label={copy.next} title={copy.next}>
				<ChevronRight size={27} strokeWidth={1.5} />
			</button>
		</nav>

		<div class="modal-viewport" bind:this={viewport}>
			<div class="modal-content">
				<header class="project-intro">
					<div class="intro-copy">
						<p class="meta kicker">{projectText(project.kicker, locale)}</p>
						<h2 id="project-modal-title">{projectText(project.title, locale)}</h2>
						<p class="summary">{projectText(project.summary, locale)}</p>
						<dl class="project-facts">
							<div><dt class="meta">{copy.status}</dt><dd>{projectText(project.status, locale)}</dd></div>
							<div><dt class="meta">{copy.period}</dt><dd>{project.year}</dd></div>
							{#if project.tags.length}
								<div class="is-wide">
									<dt class="meta">{copy.topics}</dt>
									<dd class="topic-list">
										{#each project.tags as tag (tag)}
											<span>{tag}</span>
										{/each}
									</dd>
								</div>
							{/if}
							{#if project.links?.length}
								<div class="is-wide">
									<dt class="meta">{copy.links}</dt>
									<dd class="header-links">
										{#each project.links as link (link.url)}
											<a href={link.url} target="_blank" rel="noreferrer">
												{projectText(link.label, locale)}
												<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
											</a>
										{/each}
									</dd>
								</div>
							{/if}
						</dl>
						{#if project.sectionNav?.length}
							<nav class="project-section-nav" aria-label={locale === 'es' ? 'Secciones del proyecto' : 'Project sections'}>
								<span class="meta nav-label">{copy.sectionMenu}</span>
								<div class="section-nav-items">
									{#each project.sectionNav as item (item.label.es)}
										{#if item.children?.length}
											<details class="section-nav-group">
												<summary class="meta">
													{projectText(item.label, locale)}
													<ChevronDown size={14} strokeWidth={1.7} aria-hidden="true" />
												</summary>
												<div class="section-submenu">
													{#each item.children as child (child.href)}
														<a class="meta" href={child.href}>{projectText(child.label, locale)}</a>
													{/each}
												</div>
											</details>
										{:else if item.href}
											<a class="meta" href={item.href}>{projectText(item.label, locale)}</a>
										{/if}
									{/each}
								</div>
							</nav>
						{/if}
					</div>
					{#key project.slug}
						<div class="modal-visual">
							<ProjectVisual
								visual={project.visual}
								label={projectText(project.kind, locale)}
								period={project.year}
							/>
						</div>
					{/key}
				</header>

				{#key project.slug}
					<ProjectStory slug={project.slug} {locale} />
				{/key}

				{#if relatedItems.length}
					<section class="related-section">
						<header>
							<div>
								<h3>{copy.related}</h3>
							</div>
							<p>{copy.relatedIntro}</p>
						</header>
						<ol class="related-list">
							{#each relatedItems as item, index (`${item.entity_type}-${item.entity_id}`)}
								<li class:is-featured={item.featured}>
									<div class="item-meta meta">
									<span class="item-index">
										{String(index + 1).padStart(2, '0')}
										{#if item.featured}
											<span class="featured-mark" title={copy.featured} aria-label={copy.featured}>★</span>
										{/if}
									</span>
										<span class="item-kind">
											<span>{entityLabel(item.entity_type, locale)}</span>
											{#if subtypeLabel(item)}
												<span class="item-subtype">{subtypeLabel(item)}</span>
											{/if}
										</span>
										<span>{itemYear(item.sort_date)}</span>
									</div>
									<div>
										{#if item.url}
											<a class="item-title" href={item.url} target="_blank" rel="noreferrer">
												{item.title}
												<span class="external-icon" aria-hidden="true"><MoveUpRight size={22} strokeWidth={1.7} /></span>
											</a>
										{:else}
											<p class="item-title">{item.title}</p>
										{/if}
										{#if item.detail}<p class="item-detail">{item.detail}</p>{/if}
									</div>
								</li>
							{/each}
						</ol>
					</section>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.modal-layer {
		position: fixed;
		z-index: 10000;
		inset: 0;
		background: var(--bg);
		animation: layer-in 260ms ease both;
	}

	.modal-shell {
		position: relative;
		display: flex;
		width: 100%;
		height: 100dvh;
		flex-direction: column;
		overflow: hidden;
		background: var(--bg);
		animation: modal-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.modal-controls {
		position: absolute;
		z-index: 20;
		bottom: clamp(12px, 2vw, 28px);
		left: 50%;
		display: flex;
		gap: 1px;
		align-items: center;
		padding: 4px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--surface-glass) 24%, transparent);
		transform: translateX(-50%);
		pointer-events: none;
		-webkit-backdrop-filter: blur(18px) saturate(1.04);
		backdrop-filter: blur(18px) saturate(1.04);
	}

	.modal-controls button {
		position: relative;
		display: grid;
		width: 46px;
		height: 46px;
		place-items: center;
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--fg);
		cursor: pointer;
		opacity: 0.5;
		pointer-events: auto;
		transition: color 180ms ease, opacity 180ms ease;
	}

	.modal-controls button:hover,
	.modal-controls button:focus-visible {
		background: transparent;
		color: var(--accent-strong);
		opacity: 1;
	}

	:global(body.project-modal-open .site-header) {
		opacity: 0 !important;
		visibility: hidden !important;
		pointer-events: none !important;
	}

	.modal-viewport {
		flex: 1;
		overflow-y: auto;
		overscroll-behavior: contain;
		scrollbar-gutter: stable;
	}

	.modal-content {
		width: min(100% - clamp(32px, 7vw, 112px), 1380px);
		margin-inline: auto;
		padding-block: clamp(64px, 8vw, 112px) clamp(86px, 11vw, 150px);
	}

	.project-intro {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
		gap: clamp(40px, 7vw, 100px);
		align-items: center;
		min-height: calc(100vh - 190px);
		padding-bottom: clamp(54px, 8vw, 110px);
	}

	.kicker { color: var(--accent-strong); }

	.project-intro h2 {
		max-width: 10ch;
		margin: 18px 0 0;
		font-size: clamp(3.2rem, 8vw, 7.8rem);
		line-height: 0.86;
		letter-spacing: -0.045em;
	}

	.summary {
		max-width: 58ch;
		margin: 30px 0 0;
		color: var(--fg-dim);
		font-size: clamp(0.92rem, 1.35vw, 1.12rem);
		line-height: 1.55;
	}

	.project-facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px 34px;
		max-width: 620px;
		margin: 34px 0 0;
		padding-top: 18px;
		border-top: 1px solid var(--line);
	}

	.project-facts div { display: grid; gap: 4px; }
	.project-facts .is-wide { grid-column: 1 / -1; }
	.project-facts dt { color: var(--fg-faint); }
	.project-facts dd { margin: 0; font-size: 0.78rem; }

	.topic-list {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 14px;
		color: var(--fg-dim);
		line-height: 1.45;
	}

	.topic-list span:not(:last-child)::after {
		padding-left: 14px;
		color: var(--accent-strong);
		content: '/';
	}

	.header-links {
		display: flex;
		flex-wrap: wrap;
		gap: 9px 18px;
	}

	.header-links a {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		color: var(--fg);
		text-decoration: none;
		transition: color 180ms ease;
	}

	.header-links a :global(svg) {
		color: var(--accent-strong);
		transition: transform 180ms ease;
	}

	.header-links a:hover,
	.header-links a:focus-visible {
		color: var(--accent-strong);
	}

	.header-links a:hover :global(svg),
	.header-links a:focus-visible :global(svg) {
		transform: translate(3px, -3px);
	}

	.project-section-nav {
		display: grid;
		gap: 10px;
		max-width: 620px;
		margin-top: 22px;
		padding: 14px 0 0;
		border-top: 1px solid var(--line-strong);
	}

	.project-section-nav .nav-label {
		color: var(--accent-strong);
	}

	.project-section-nav .section-nav-items {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: flex-start;
	}

	.project-section-nav a,
	.section-nav-group summary {
		display: inline-flex;
		min-height: 30px;
		align-items: center;
		padding: 0 12px;
		border: 1px solid var(--line);
		border-radius: 999px;
		color: var(--fg-dim);
		text-decoration: none;
		transition: border-color 180ms ease, color 180ms ease;
	}

	.section-nav-group { position: relative; }
	.section-nav-group summary { gap: 7px; cursor: pointer; list-style: none; }
	.section-nav-group summary::-webkit-details-marker { display: none; }
	.section-nav-group summary :global(svg) { transition: transform 180ms ease; }
	.section-nav-group[open] summary :global(svg) { transform: rotate(180deg); }
	.section-submenu {
		position: absolute;
		top: calc(100% + 7px);
		left: 0;
		z-index: 5;
		display: grid;
		min-width: max-content;
		padding: 6px;
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--bg) 76%, transparent);
		box-shadow: 0 16px 42px color-mix(in srgb, var(--fg) 10%, transparent);
		backdrop-filter: blur(16px);
	}

	.section-submenu a { min-height: 32px; border-color: transparent; }

	.project-section-nav a:hover,
	.project-section-nav a:focus-visible,
	.section-nav-group summary:hover,
	.section-nav-group summary:focus-visible {
		border-color: color-mix(in srgb, var(--accent-strong) 52%, var(--line));
		color: var(--accent-strong);
	}

	.modal-visual {
		animation: visual-in 620ms 100ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.related-section { padding-top: clamp(58px, 8vw, 110px); border-top: 1px solid var(--line-strong); }
	.related-section > header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(260px, 0.65fr);
		gap: 36px;
		align-items: end;
		margin-bottom: 40px;
	}
	.related-section h3 {
		margin: 14px 0 0;
		font-size: clamp(2.2rem, 5vw, 4.8rem);
		line-height: 0.92;
	}
	.related-section > header > p { margin: 0; color: var(--fg-dim); font-size: 0.8rem; }

	.related-list { margin: 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
	.related-list li {
		position: relative;
		display: grid;
		grid-template-columns: minmax(190px, 0.65fr) minmax(0, 1.35fr);
		gap: clamp(20px, 4vw, 60px);
		padding: clamp(20px, 3vw, 34px) 0;
		border-bottom: 1px solid var(--line);
	}
	.item-meta { display: grid; grid-template-columns: 28px 1fr 40px; gap: 12px; color: var(--fg-faint); }
	.item-index { display: grid; gap: 7px; align-content: start; }
	.featured-mark { color: var(--accent-strong); font-size: 0.72rem; line-height: 1; }
	.item-meta > span:last-child { text-align: right; }
	.item-kind { display: grid; gap: 5px; }
	.item-kind > span:first-child { color: var(--accent-strong); }
	.item-kind .item-subtype { color: var(--fg-dim); font-size: 0.62rem; line-height: 1.3; text-align: left; }
	.item-title {
		display: flex;
		justify-content: space-between;
		gap: 18px;
		margin: 0;
		color: var(--fg);
		font-family: var(--font-title);
		font-size: clamp(1.15rem, 2.2vw, 1.8rem);
		line-height: 1.1;
	}
	.item-title .external-icon {
		display: grid;
		flex: 0 0 22px;
		width: 22px;
		height: 22px;
		place-items: center;
		color: var(--accent-strong);
		transition: transform 180ms ease;
	}
	.item-title:hover .external-icon { transform: translate(2px, -2px); }
	.item-detail { max-width: 72ch; margin: 9px 0 0; color: var(--fg-faint); font-size: 0.72rem; line-height: 1.45; }

	@keyframes layer-in { from { opacity: 0; } }
	@keyframes modal-in { from { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.985); } }
	@keyframes visual-in { from { opacity: 0; filter: blur(5px); transform: translate3d(22px, 0, 0); } }

	@media (max-width: 980px) {
		.project-intro { grid-template-columns: minmax(0, 1fr) minmax(300px, 0.8fr); }
	}

	@media (max-width: 700px) {
		.modal-content {
			width: min(100% - 30px, 680px);
			padding-block: 76px 120px;
		}

		.project-intro {
			grid-template-columns: 1fr;
			gap: 34px;
			min-height: 0;
			padding-bottom: 70px;
		}

		.project-intro h2 {
			font-size: clamp(3rem, 15vw, 5.5rem);
		}

		.project-facts,
		.related-section > header,
		.related-list li {
			grid-template-columns: 1fr;
		}

		.modal-controls { bottom: 8px; }
	}

	@media (prefers-reduced-motion: reduce) {
		.modal-layer,
		.modal-shell,
		.modal-visual { animation: none; }
		.modal-controls button { transition: none; }
	}
</style>
