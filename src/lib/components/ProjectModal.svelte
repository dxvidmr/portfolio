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
	const additionalLinkLabel = (link: PortfolioRelatedItem['links'][number]) =>
		locale === 'en' ? link.label_en : link.label_es;
	const documentLabel = (document: PortfolioRelatedItem['documents'][number]) =>
		document.title ?? (locale === 'en' ? document.label_en : document.label_es);
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
	const modalControlClass =
		'tw:pointer-events-auto tw:relative tw:grid tw:h-[46px] tw:w-[46px] tw:cursor-pointer tw:place-items-center tw:rounded-ui-sm tw:border-0 tw:bg-transparent tw:text-ink tw:opacity-50 tw:[transition:color_180ms_ease,opacity_180ms_ease] tw:hover:bg-transparent tw:hover:text-accent-strong tw:hover:opacity-100 tw:focus-visible:bg-transparent tw:focus-visible:text-accent-strong tw:focus-visible:opacity-100 tw:motion-reduce:transition-none';
	const sectionNavItemClass =
		'meta tw:inline-flex tw:min-h-[30px] tw:items-center tw:rounded-full tw:border tw:border-rule tw:px-3 tw:text-ink-dim tw:no-underline tw:[transition:border-color_180ms_ease,color_180ms_ease] tw:hover:border-[color-mix(in_srgb,var(--accent-strong)_52%,var(--line))] tw:hover:text-accent-strong tw:focus-visible:border-[color-mix(in_srgb,var(--accent-strong)_52%,var(--line))] tw:focus-visible:text-accent-strong';

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

<div
	class="tw:fixed tw:inset-0 tw:z-[10000] tw:bg-canvas tw:[animation:project-layer-in_260ms_ease_both] tw:motion-reduce:animate-none"
	role="presentation"
>
	<div
		class="tw:relative tw:flex tw:h-dvh tw:w-full tw:flex-col tw:overflow-hidden tw:bg-canvas tw:[animation:project-modal-in_520ms_cubic-bezier(.16,1,.3,1)_both] tw:motion-reduce:animate-none"
		bind:this={shell}
		role="dialog"
		aria-modal="true"
		aria-labelledby="project-modal-title"
	>
		<nav
			class="tw:pointer-events-none tw:absolute tw:bottom-[clamp(12px,2vw,28px)] tw:left-1/2 tw:z-20 tw:flex tw:translate-x-[-50%] tw:items-center tw:gap-px tw:rounded-full tw:bg-[color-mix(in_srgb,var(--surface-glass)_24%,transparent)] tw:p-1 tw:[backdrop-filter:blur(18px)_saturate(1.04)] tw:max-[700px]:bottom-2"
			aria-label={locale === 'es' ? 'Navegar entre proyectos' : 'Navigate projects'}
		>
			<button class={modalControlClass} type="button" onclick={onprevious} aria-label={copy.previous} title={copy.previous}>
				<ChevronLeft size={27} strokeWidth={1.5} />
			</button>
			<button class={modalControlClass} bind:this={closeButton} type="button" onclick={onclose} aria-label={copy.close} title={copy.close}>
				<XIcon size={27} strokeWidth={1.5} />
			</button>
			<button class={modalControlClass} type="button" onclick={onnext} aria-label={copy.next} title={copy.next}>
				<ChevronRight size={27} strokeWidth={1.5} />
			</button>
		</nav>

		<div
			class="tw:flex-1 tw:overflow-y-auto tw:[overscroll-behavior:contain] tw:[scrollbar-gutter:stable]"
			bind:this={viewport}
		>
			<div
				class="tw:mx-auto tw:w-[min(100%_-_clamp(32px,7vw,112px),1380px)] tw:pt-[clamp(64px,8vw,112px)] tw:pb-[clamp(86px,11vw,150px)] tw:max-[700px]:w-[min(100%_-_30px,680px)] tw:max-[700px]:pt-[76px] tw:max-[700px]:pb-[120px]"
			>
				<header
					class="tw:grid tw:min-h-[calc(100vh-190px)] tw:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] tw:items-center tw:gap-[clamp(40px,7vw,100px)] tw:pb-[clamp(54px,8vw,110px)] tw:max-[980px]:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)] tw:max-[700px]:min-h-0 tw:max-[700px]:grid-cols-1 tw:max-[700px]:gap-[34px] tw:max-[700px]:pb-[70px]"
				>
					<div class="intro-copy">
						<p class="meta tw:text-accent-strong">{projectText(project.kicker, locale)}</p>
						<h2
							class="tw:mt-[18px] tw:mb-0 tw:max-w-[10ch] tw:text-[clamp(3.2rem,8vw,7.8rem)] tw:leading-[.86] tw:tracking-[-.045em] tw:max-[700px]:text-[clamp(3rem,15vw,5.5rem)]"
							id="project-modal-title"
						>
							{projectText(project.title, locale)}
						</h2>
						<p class="tw:mt-[30px] tw:mb-0 tw:max-w-[58ch] tw:text-[clamp(.92rem,1.35vw,1.12rem)] tw:leading-[1.55] tw:text-ink-dim">
							{projectText(project.summary, locale)}
						</p>
						<dl class="tw:mt-[34px] tw:mb-0 tw:grid tw:max-w-[620px] tw:grid-cols-2 tw:gap-x-[34px] tw:gap-y-3.5 tw:border-t tw:border-rule tw:pt-[18px] tw:max-[700px]:grid-cols-1">
							<div class="tw:grid tw:gap-1"><dt class="meta tw:text-ink-faint">{copy.status}</dt><dd class="tw:m-0 tw:text-[.78rem]">{projectText(project.status, locale)}</dd></div>
							<div class="tw:grid tw:gap-1"><dt class="meta tw:text-ink-faint">{copy.period}</dt><dd class="tw:m-0 tw:text-[.78rem]">{project.year}</dd></div>
							{#if project.tags.length}
								<div class="tw:col-span-full tw:grid tw:gap-1">
									<dt class="meta tw:text-ink-faint">{copy.topics}</dt>
									<dd class="tw:m-0 tw:flex tw:flex-wrap tw:gap-x-[14px] tw:gap-y-1.5 tw:text-[.78rem] tw:leading-[1.45] tw:text-ink-dim">
										{#each project.tags as tag (tag)}
											<span class="tw:after:pl-[14px] tw:after:text-accent-strong tw:after:content-['/'] tw:last:after:content-none">{tag}</span>
										{/each}
									</dd>
								</div>
							{/if}
							{#if project.links?.length}
								<div class="tw:col-span-full tw:grid tw:gap-1">
									<dt class="meta tw:text-ink-faint">{copy.links}</dt>
									<dd class="tw:m-0 tw:flex tw:flex-wrap tw:gap-x-[18px] tw:gap-y-[9px] tw:text-[.78rem]">
										{#each project.links as link (link.url)}
											<a class="tw:inline-flex tw:items-center tw:gap-1.5 tw:text-ink tw:no-underline tw:[transition:color_180ms_ease] tw:[&>svg]:text-accent-strong tw:[&>svg]:[transition:transform_180ms_ease] tw:hover:text-accent-strong tw:hover:[&>svg]:translate-x-[3px] tw:hover:[&>svg]:translate-y-[-3px] tw:focus-visible:text-accent-strong tw:focus-visible:[&>svg]:translate-x-[3px] tw:focus-visible:[&>svg]:translate-y-[-3px]" href={link.url} target="_blank" rel="noreferrer">
												{projectText(link.label, locale)}
												<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
											</a>
										{/each}
									</dd>
								</div>
							{/if}
						</dl>
						{#if project.sectionNav?.length}
							<nav class="tw:mt-[22px] tw:grid tw:max-w-[620px] tw:gap-2.5 tw:border-t tw:border-rule-strong tw:pt-3.5" aria-label={locale === 'es' ? 'Secciones del proyecto' : 'Project sections'}>
								<span class="meta tw:text-accent-strong">{copy.sectionMenu}</span>
								<div class="tw:flex tw:flex-wrap tw:items-start tw:gap-2">
									{#each project.sectionNav as item (item.label.es)}
										{#if item.children?.length}
											<details class="tw:group tw:relative">
												<summary class={`${sectionNavItemClass} tw:cursor-pointer tw:gap-[7px] tw:list-none tw:[&::-webkit-details-marker]:hidden tw:[&>svg]:[transition:transform_180ms_ease] tw:group-open:[&>svg]:rotate-180`}>
													{projectText(item.label, locale)}
													<ChevronDown size={14} strokeWidth={1.7} aria-hidden="true" />
												</summary>
												<div class="tw:absolute tw:top-[calc(100%+7px)] tw:left-0 tw:z-[5] tw:grid tw:min-w-max tw:rounded-ui tw:bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] tw:p-1.5 tw:shadow-[0_16px_42px_color-mix(in_srgb,var(--fg)_10%,transparent)] tw:[backdrop-filter:blur(16px)]">
													{#each item.children as child (child.href)}
														<a class={`${sectionNavItemClass} tw:min-h-8 tw:border-transparent`} href={child.href}>{projectText(child.label, locale)}</a>
													{/each}
												</div>
											</details>
										{:else if item.href}
											<a class={sectionNavItemClass} href={item.href}>{projectText(item.label, locale)}</a>
										{/if}
									{/each}
								</div>
							</nav>
						{/if}
					</div>
					{#key project.slug}
						<div class="tw:[animation:project-visual-in_620ms_100ms_cubic-bezier(.16,1,.3,1)_both] tw:motion-reduce:animate-none">
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
					<section class="tw:border-t tw:border-rule-strong tw:pt-[clamp(58px,8vw,110px)]">
						<header class="tw:mb-10 tw:grid tw:grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)] tw:items-end tw:gap-9 tw:max-[700px]:grid-cols-1">
							<div>
								<h3 class="tw:mt-3.5 tw:mb-0 tw:text-[clamp(2.2rem,5vw,4.8rem)] tw:leading-[.92]">{copy.related}</h3>
							</div>
							<p class="tw:m-0 tw:text-[.8rem] tw:text-ink-dim">{copy.relatedIntro}</p>
						</header>
						<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule tw:p-0">
							{#each relatedItems as item, index (`${item.entity_type}-${item.entity_id}`)}
								<li class="tw:relative tw:grid tw:grid-cols-[minmax(190px,.65fr)_minmax(0,1.35fr)] tw:gap-[clamp(20px,4vw,60px)] tw:border-b tw:border-rule tw:py-[clamp(20px,3vw,34px)] tw:max-[700px]:grid-cols-1">
									<div class="meta tw:grid tw:grid-cols-[28px_1fr_40px] tw:gap-3 tw:text-ink-faint">
									<span class="tw:grid tw:content-start tw:gap-[7px]">
										{String(index + 1).padStart(2, '0')}
										{#if item.featured}
											<span class="tw:text-[.72rem] tw:leading-none tw:text-accent-strong" title={copy.featured} aria-label={copy.featured}>★</span>
										{/if}
									</span>
										<span class="tw:grid tw:gap-[5px]">
											<span class="tw:text-accent-strong">{entityLabel(item.entity_type, locale)}</span>
											{#if subtypeLabel(item)}
												<span class="tw:text-left tw:text-[.62rem] tw:leading-[1.3] tw:text-ink-dim">{subtypeLabel(item)}</span>
											{/if}
										</span>
										<span class="tw:text-right">{itemYear(item.sort_date)}</span>
									</div>
									<div>
										{#if item.url}
											<a class="tw:group tw:m-0 tw:flex tw:justify-between tw:gap-[18px] tw:font-title tw:text-[clamp(1.15rem,2.2vw,1.8rem)] tw:leading-[1.1] tw:text-ink" href={item.url} target="_blank" rel="noreferrer">
												{item.title}
												<span class="tw:grid tw:h-[22px] tw:w-[22px] tw:flex-[0_0_22px] tw:place-items-center tw:text-accent-strong tw:[transition:transform_180ms_ease] tw:group-hover:translate-x-0.5 tw:group-hover:translate-y-[-2px]" aria-hidden="true"><MoveUpRight size={22} strokeWidth={1.7} /></span>
											</a>
										{:else}
											<p class="tw:m-0 tw:flex tw:justify-between tw:gap-[18px] tw:font-title tw:text-[clamp(1.15rem,2.2vw,1.8rem)] tw:leading-[1.1] tw:text-ink">{item.title}</p>
										{/if}
										{#if item.detail}<p class="tw:mt-[9px] tw:mb-0 tw:max-w-[72ch] tw:text-[.72rem] tw:leading-[1.45] tw:text-ink-faint">{item.detail}</p>{/if}
										{#if item.links.length}
											<div class="tw:mt-2.5 tw:flex tw:flex-wrap tw:gap-1.5">
												{#each item.links as link (link.url)}
													<a class={`tw:border tw:px-[7px] tw:py-1 tw:text-[.64rem] tw:no-underline tw:hover:border-accent-strong tw:hover:text-accent-strong tw:focus-visible:border-accent-strong tw:focus-visible:text-accent-strong ${link.is_primary ? 'tw:border-accent-strong tw:text-accent-strong' : 'tw:border-rule tw:text-ink-faint'}`} href={link.url} target="_blank" rel="noreferrer">
														{additionalLinkLabel(link)}
													</a>
												{/each}
											</div>
										{/if}
										{#if item.documents.length}
											<div class="tw:mt-2 tw:flex tw:flex-wrap tw:gap-2">
												{#each item.documents as document (document.url)}
													<a class="tw:text-[.64rem] tw:text-ink-faint tw:hover:text-accent-strong tw:focus-visible:text-accent-strong" href={document.url} target="_blank" rel="noreferrer">↓ {documentLabel(document)}</a>
												{/each}
											</div>
										{/if}
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
