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
	import { renderInlineMarkup } from '$lib/content/inline-markup';
	import type { PortfolioRelatedItem } from '$lib/types/portfolio';
	import ProjectVisual from '$lib/components/ProjectVisual.svelte';
	import ProjectStory from '$lib/components/projects/ProjectStory.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';

	let {
		project,
		relatedItems,
		locale,
		onclose,
		onprevious,
		onnext,
		canNavigate = true
	}: {
		project: PortfolioProject;
		relatedItems: PortfolioRelatedItem[];
		locale: Locale;
		onclose: () => void;
		onprevious: () => void;
		onnext: () => void;
		canNavigate?: boolean;
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
	const copy = $derived(
		locale === 'es'
			? {
					close: 'Cerrar ficha',
					previous: 'Ficha anterior',
					next: 'Ficha siguiente',
					status: 'Estado',
					period: 'Periodo',
					topics: 'Temas',
					links: 'Enlaces',
					sectionMenu: 'Menú de la ficha',
					related: 'Resultados relacionados',
					relatedIntro: 'Publicaciones, proyectos y otras actividades vinculadas.',
					featured: 'Resultado destacado'
				}
			: {
					close: 'Close entry',
					previous: 'Previous entry',
					next: 'Next entry',
					status: 'Status',
					period: 'Period',
					topics: 'Topics',
					links: 'Links',
					sectionMenu: 'Entry menu',
					related: 'Related outputs',
					relatedIntro: 'Related publications, projects, and other activities.',
					featured: 'Featured output'
				}
	);
	const modalControlClass =
		'pointer-events-auto relative grid h-[46px] w-[46px] cursor-pointer place-items-center rounded-ui-sm border-0 bg-transparent text-ink opacity-50 [transition:color_180ms_ease,opacity_180ms_ease] hover:bg-transparent hover:text-accent-strong hover:opacity-100 focus-visible:bg-transparent focus-visible:text-accent-strong focus-visible:opacity-100 motion-reduce:transition-none';
	const sectionNavItemClass =
		'meta inline-flex min-h-[30px] items-center rounded-full border border-rule px-3 text-ink-dim no-underline [transition:border-color_180ms_ease,color_180ms_ease] hover:border-[color-mix(in_srgb,var(--accent-strong)_52%,var(--line))] hover:text-accent-strong focus-visible:border-[color-mix(in_srgb,var(--accent-strong)_52%,var(--line))] focus-visible:text-accent-strong';

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
	class="fixed inset-0 z-[10000] bg-canvas [animation:project-layer-in_260ms_ease_both] motion-reduce:animate-none"
	role="presentation"
>
	<div
		class="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas [animation:project-modal-in_520ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none"
		bind:this={shell}
		role="dialog"
		aria-modal="true"
		aria-labelledby="project-modal-title"
	>
		<nav
			class="pointer-events-none absolute bottom-[clamp(12px,2vw,28px)] left-1/2 z-20 flex translate-x-[-50%] items-center gap-px rounded-full bg-[color-mix(in_srgb,var(--surface-glass)_24%,transparent)] p-1 [backdrop-filter:blur(18px)_saturate(1.04)] max-[700px]:bottom-2"
			aria-label={locale === 'es' ? 'Navegar por el portfolio' : 'Navigate portfolio'}
		>
			{#if canNavigate}
				<button class={modalControlClass} type="button" onclick={onprevious} aria-label={copy.previous} title={copy.previous}>
					<ChevronLeft size={27} strokeWidth={1.5} />
				</button>
			{/if}
			<button class={modalControlClass} bind:this={closeButton} type="button" onclick={onclose} aria-label={copy.close} title={copy.close}>
				<XIcon size={27} strokeWidth={1.5} />
			</button>
			{#if canNavigate}
				<button class={modalControlClass} type="button" onclick={onnext} aria-label={copy.next} title={copy.next}>
					<ChevronRight size={27} strokeWidth={1.5} />
				</button>
			{/if}
		</nav>

		<div
			class="flex-1 overflow-y-auto [overscroll-behavior:contain] [scrollbar-gutter:stable]"
			bind:this={viewport}
		>
			<div
				class="mx-auto w-[min(100%_-_clamp(32px,7vw,112px),1380px)] pt-[clamp(64px,8vw,112px)] pb-[clamp(86px,11vw,150px)] max-[700px]:w-[min(100%_-_30px,680px)] max-[700px]:pt-[76px] max-[700px]:pb-[120px]"
			>
				<header
					class="grid min-h-[calc(100vh-190px)] grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] items-center gap-[clamp(40px,7vw,100px)] pb-[clamp(54px,8vw,110px)] max-[980px]:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)] max-[700px]:min-h-0 max-[700px]:grid-cols-1 max-[700px]:gap-[34px] max-[700px]:pb-[70px]"
				>
					<div class="intro-copy">
						<p class="meta text-accent-strong">{projectText(project.kicker, locale)}</p>
						<h2
							class="mt-[18px] mb-0 max-w-[10ch] text-[clamp(3.2rem,8vw,7.8rem)] leading-[.86] tracking-[-.045em] max-[700px]:text-[clamp(3rem,15vw,5.5rem)]"
							id="project-modal-title"
						>
							{projectText(project.title, locale)}
						</h2>
						<p class="mt-[30px] mb-0 max-w-[58ch] text-[clamp(.92rem,1.35vw,1.12rem)] leading-[1.55] text-ink-dim [&_b]:font-bold [&_em]:italic [&_i]:italic [&_strong]:font-bold">
							{@html renderInlineMarkup(projectText(project.summary, locale))}
						</p>
						<dl class="mt-[34px] mb-0 grid max-w-[620px] grid-cols-2 gap-x-[34px] gap-y-3.5 border-t border-rule pt-[18px] max-[700px]:grid-cols-1">
							<div class="grid gap-1"><dt class="meta text-ink-faint">{copy.status}</dt><dd class="m-0 text-[.78rem]">{projectText(project.status, locale)}</dd></div>
							<div class="grid gap-1"><dt class="meta text-ink-faint">{copy.period}</dt><dd class="m-0 text-[.78rem]">{project.year}</dd></div>
							{#if project.tags.length}
								<div class="col-span-full grid gap-1">
									<dt class="meta text-ink-faint">{copy.topics}</dt>
									<dd class="m-0 flex flex-wrap gap-x-[14px] gap-y-1.5 text-[.78rem] leading-[1.45] text-ink-dim">
										{#each project.tags as tag (tag)}
											<span class="after:pl-[14px] after:text-accent-strong after:content-['/'] last:after:content-none">{tag}</span>
										{/each}
									</dd>
								</div>
							{/if}
							{#if project.links?.length}
								<div class="col-span-full grid gap-1">
									<dt class="meta text-ink-faint">{copy.links}</dt>
									<dd class="m-0 flex flex-wrap gap-x-[18px] gap-y-[9px] text-[.78rem]">
										{#each project.links as link (link.url)}
											<a class="inline-flex items-center gap-1.5 text-ink no-underline [transition:color_180ms_ease] [&>svg]:text-accent-strong [&>svg]:[transition:transform_180ms_ease] hover:text-accent-strong hover:[&>svg]:translate-x-[3px] hover:[&>svg]:translate-y-[-3px] focus-visible:text-accent-strong focus-visible:[&>svg]:translate-x-[3px] focus-visible:[&>svg]:translate-y-[-3px]" href={link.url} target="_blank" rel="noreferrer">
												{projectText(link.label, locale)}
												<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
											</a>
										{/each}
									</dd>
								</div>
							{/if}
						</dl>
						{#if project.sectionNav?.length}
							<nav class="mt-[22px] grid max-w-[620px] gap-2.5 border-t border-rule-strong pt-3.5" aria-label={locale === 'es' ? 'Secciones de la ficha' : 'Entry sections'}>
								<span class="meta text-accent-strong">{copy.sectionMenu}</span>
								<div class="flex flex-wrap items-start gap-2">
									{#each project.sectionNav as item (item.label.es)}
										{#if item.children?.length}
											<details class="group relative">
												<summary class={`${sectionNavItemClass} cursor-pointer gap-[7px] list-none [&::-webkit-details-marker]:hidden [&>svg]:[transition:transform_180ms_ease] group-open:[&>svg]:rotate-180`}>
													{projectText(item.label, locale)}
													<ChevronDown size={14} strokeWidth={1.7} aria-hidden="true" />
												</summary>
												<div class="absolute top-[calc(100%+7px)] left-0 z-[5] grid min-w-max rounded-ui bg-[color-mix(in_srgb,var(--bg)_76%,transparent)] p-1.5 shadow-[0_16px_42px_color-mix(in_srgb,var(--fg)_10%,transparent)] [backdrop-filter:blur(16px)]">
													{#each item.children as child (child.href)}
														<a class={`${sectionNavItemClass} min-h-8 border-transparent`} href={child.href}>{projectText(child.label, locale)}</a>
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
						<div class="[animation:project-visual-in_620ms_100ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none">
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
					<section class="border-t border-rule-strong pt-[clamp(58px,8vw,110px)]">
						<header class="mb-10 grid grid-cols-[minmax(0,1fr)_minmax(260px,.65fr)] items-end gap-9 max-[700px]:grid-cols-1">
							<div>
								<h3 class="mt-3.5 mb-0 text-[clamp(2.2rem,5vw,4.8rem)] leading-[.92]">{copy.related}</h3>
							</div>
							<p class="m-0 text-[.8rem] text-ink-dim">{copy.relatedIntro}</p>
						</header>
						<ol class="m-0 list-none border-t border-rule p-0">
							{#each relatedItems as item, index (`${item.entity_type}-${item.entity_id}`)}
								<li class="relative grid grid-cols-[minmax(190px,.65fr)_minmax(0,1.35fr)] gap-[clamp(20px,4vw,60px)] border-b border-rule py-[clamp(20px,3vw,34px)] max-[700px]:grid-cols-1">
									<div class="meta grid grid-cols-[28px_1fr_40px] gap-3 text-ink-faint">
									<span class="grid content-start gap-[7px]">
										{String(index + 1).padStart(2, '0')}
										{#if item.featured}
											<span class="text-[.72rem] leading-none text-accent-strong" title={copy.featured} aria-label={copy.featured}>★</span>
										{/if}
									</span>
										<span class="grid gap-[5px]">
											<span class="text-accent-strong">{entityLabel(item.entity_type, locale)}</span>
											{#if subtypeLabel(item)}
												<span class="text-left text-[.62rem] leading-[1.3] text-ink-dim">{subtypeLabel(item)}</span>
											{/if}
										</span>
										<span class="text-right">{itemYear(item.sort_date)}</span>
									</div>
									<div>
										{#if item.url}
											<a class="group m-0 flex justify-between gap-[18px] font-title text-[clamp(1.15rem,2.2vw,1.8rem)] leading-[1.1] text-ink" href={item.url} target="_blank" rel="noreferrer">
												{item.title}
												<span class="grid h-[22px] w-[22px] flex-[0_0_22px] place-items-center text-accent-strong [transition:transform_180ms_ease] group-hover:translate-x-0.5 group-hover:translate-y-[-2px]" aria-hidden="true"><MoveUpRight size={22} strokeWidth={1.7} /></span>
											</a>
										{:else}
											<p class="m-0 flex justify-between gap-[18px] font-title text-[clamp(1.15rem,2.2vw,1.8rem)] leading-[1.1] text-ink">{item.title}</p>
										{/if}
										{#if item.metadata}<p class="mt-[9px] mb-0 max-w-[72ch] text-[.72rem] leading-[1.45] text-ink-faint"><EntryMetadata metadata={item.metadata} {locale} /></p>{/if}
										{#if item.links.length}
											<div class="mt-2.5 flex flex-wrap gap-1.5">
												{#each item.links as link (link.url)}
													<a class={`border px-[7px] py-1 text-[.64rem] no-underline hover:border-accent-strong hover:text-accent-strong focus-visible:border-accent-strong focus-visible:text-accent-strong ${link.is_primary ? 'border-accent-strong text-accent-strong' : 'border-rule text-ink-faint'}`} href={link.url} target="_blank" rel="noreferrer">
														{additionalLinkLabel(link)}
													</a>
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
