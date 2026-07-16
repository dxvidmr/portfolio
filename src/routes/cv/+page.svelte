<script lang="ts">
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import SiteControls from '$lib/components/SiteControls.svelte';

	let { data } = $props();

	let selectedYear = $state('all');
	let selectedSection = $state('all');
	let selectedType = $state('all');
	const locale = $derived(localeFromPathname(page.url.pathname));
	const ui = $derived({
		es: {
			back: 'Volver',
			title: 'Currículum completo',
			intro: 'Vista web del CV con filtrado por sección, año y tipo.',
			filters: 'Filtros del CV',
			section: 'Sección',
			year: 'Año',
			type: 'Tipo',
			allFem: 'Todas',
			allMasc: 'Todos',
			noDate: 's/f',
			empty: 'No hay resultados para esos filtros.',
			sectionLabels: {
				publications: 'Publicaciones',
				talks: 'Eventos académicos',
				teaching: 'Docencia',
				projects: 'Proyectos de investigación',
				education: 'Formación',
				research_stays: 'Estancias',
				funding_awards: 'Financiación y premios',
				service_activities: 'Servicio académico'
			}
		},
		en: {
			back: 'Back',
			title: 'Full curriculum vitae',
			intro: 'Web CV view with filters by section, year, and type.',
			filters: 'CV filters',
			section: 'Section',
			year: 'Year',
			type: 'Type',
			allFem: 'All',
			allMasc: 'All',
			noDate: 'n.d.',
			empty: 'No results for those filters.',
			sectionLabels: {
				publications: 'Publications',
				talks: 'Academic events',
				teaching: 'Teaching',
				projects: 'Research projects',
				education: 'Education',
				research_stays: 'Research stays',
				funding_awards: 'Funding and awards',
				service_activities: 'Academic service'
			}
		}
	}[locale]);

	const sectionLabel = (key: string, fallback: string) =>
		ui.sectionLabels[key as keyof typeof ui.sectionLabels] ?? fallback;

	type CvItem = (typeof data.sections)[number]['items'][number];

	// Etiquetas de tipo desde type_vocab (decisión 16); el código queda de fallback.
	const typeLabel = (item: CvItem) =>
		(locale === 'en' ? item.type_label_en : item.type_label_es) ??
		item.type?.replaceAll('_', ' ') ??
		null;
	const linkLabel = (link: CvItem['links'][number]) =>
		locale === 'en' ? link.label_en : link.label_es;
	const documentLabel = (document: CvItem['documents'][number]) =>
		document.title ?? (locale === 'en' ? document.label_en : document.label_es);

	const types = $derived(
		Array.from(
			data.sections
				.flatMap((section) => section.items)
				.filter((item): item is CvItem & { type: string } => Boolean(item.type))
				.reduce((map, item) => {
					if (!map.has(item.type)) map.set(item.type, typeLabel(item) ?? item.type);
					return map;
				}, new Map<string, string>())
				.entries()
		)
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label, locale))
	);

	const visibleSections = $derived(
		data.sections
			.filter((section) => selectedSection === 'all' || section.key === selectedSection)
			.map((section) => ({
				...section,
				items: section.items.filter((item) => {
					const yearOk = selectedYear === 'all' || item.year === selectedYear;
					const typeOk = selectedType === 'all' || item.type === selectedType;
					return yearOk && typeOk;
				})
			}))
			.filter((section) => section.items.length > 0)
	);
</script>

<main class="wrap pt-[clamp(24px,5vh,56px)] pb-[88px]">
	<header class="grid min-h-[54vh] content-center gap-[18px] border-b border-rule">
		<div class="flex flex-wrap items-baseline justify-between gap-4">
			<a class="meta text-ink-dim" href={localizedPath('/', locale)}>{ui.back}</a>
			<SiteControls />
		</div>
		<span class="meta tag">CV</span>
		<h1 class="max-w-[10ch] text-[clamp(3rem,9vw,7rem)] leading-[0.95] uppercase">{ui.title}</h1>
		<p class="m-0 max-w-[72ch] text-ink-dim">{ui.intro}</p>
	</header>

	<section class="sticky top-0 z-[2] grid grid-cols-3 gap-3 border-b border-rule bg-canvas py-[18px] max-[840px]:grid-cols-1" aria-label={ui.filters}>
		<label class="grid gap-2">
			<span class="meta">{ui.section}</span>
			<select class="min-h-[38px] w-full rounded-ui-sm border border-rule-strong bg-panel px-[10px] py-[7px]" bind:value={selectedSection}>
				<option value="all">{ui.allFem}</option>
				{#each data.sections as section (section.key)}
					<option value={section.key}>{sectionLabel(section.key, section.title)}</option>
				{/each}
			</select>
		</label>
		<label class="grid gap-2">
			<span class="meta">{ui.year}</span>
			<select class="min-h-[38px] w-full rounded-ui-sm border border-rule-strong bg-panel px-[10px] py-[7px]" bind:value={selectedYear}>
				<option value="all">{ui.allMasc}</option>
				{#each data.years as year (year)}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</label>
		<label class="grid gap-2">
			<span class="meta">{ui.type}</span>
			<select class="min-h-[38px] w-full rounded-ui-sm border border-rule-strong bg-panel px-[10px] py-[7px]" bind:value={selectedType}>
				<option value="all">{ui.allMasc}</option>
				{#each types as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</label>
	</section>

	<div class="grid gap-[clamp(36px,6vw,72px)] pt-[clamp(36px,6vw,72px)]">
		{#each visibleSections as section (section.key)}
			<section class="grid grid-cols-[260px_minmax(0,1fr)] gap-[clamp(18px,4vw,48px)] max-[840px]:grid-cols-1">
				<div class="grid content-start gap-3">
					<span class="meta tag">{section.items.length}</span>
					<h2 class="text-[clamp(1.3rem,3vw,2rem)] leading-[1.1]">{sectionLabel(section.key, section.title)}</h2>
				</div>
				<ol class="m-0 list-none p-0">
					{#each section.items as item (section.key + item.title + item.year)}
						<li class="grid grid-cols-[minmax(0,1fr)_180px] gap-[18px] border-b border-rule py-[18px] max-[840px]:grid-cols-1">
							<div class="grid grid-cols-[64px_minmax(0,1fr)] gap-[18px] max-[840px]:grid-cols-1">
								<span class="tabular-nums text-ink-faint">{item.year ?? ui.noDate}</span>
								<div>
									<h3 class="text-base leading-[1.35]">
										{#if item.url}
											<a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
										{:else}
											{item.title}
										{/if}
									</h3>
									{#if item.detail}
										<p class="mt-[7px] mb-0 text-ink-dim">{item.detail}</p>
									{/if}
									{#if item.links.length}
										<div class="mt-2 flex flex-wrap gap-1.5">
											{#each item.links as link (link.url)}
												<a
													class={`border px-1.5 py-[3px] text-[0.68rem] ${
														link.is_primary
															? 'border-accent text-accent'
															: 'border-rule text-ink-dim hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent'
													}`}
													href={link.url}
													target="_blank"
													rel="noreferrer"
												>
													{linkLabel(link)}
												</a>
											{/each}
										</div>
									{/if}
									{#if item.documents.length}
										<div class="mt-2 flex flex-wrap gap-1.5">
											{#each item.documents as document (document.url)}
												<a class="text-[0.68rem] text-ink-dim hover:text-accent focus-visible:text-accent" href={document.url} target="_blank" rel="noreferrer">↓ {documentLabel(document)}</a>
											{/each}
										</div>
									{/if}
								</div>
							</div>
							{#if typeLabel(item)}
								<span class="meta justify-self-end text-right text-ink-dim max-[840px]:justify-self-start max-[840px]:text-left">{typeLabel(item)}</span>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{:else}
			<p class="text-ink-dim">{ui.empty}</p>
		{/each}
	</div>
</main>
