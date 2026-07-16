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

<main class="wrap tw:pt-[clamp(24px,5vh,56px)] tw:pb-[88px]">
	<header class="tw:grid tw:min-h-[54vh] tw:content-center tw:gap-[18px] tw:border-b tw:border-rule">
		<div class="tw:flex tw:flex-wrap tw:items-baseline tw:justify-between tw:gap-4">
			<a class="meta tw:text-ink-dim" href={localizedPath('/', locale)}>{ui.back}</a>
			<SiteControls />
		</div>
		<span class="meta tag">CV</span>
		<h1 class="tw:max-w-[10ch] tw:text-[clamp(3rem,9vw,7rem)] tw:leading-[0.95] tw:uppercase">{ui.title}</h1>
		<p class="tw:m-0 tw:max-w-[72ch] tw:text-ink-dim">{ui.intro}</p>
	</header>

	<section class="tw:sticky tw:top-0 tw:z-[2] tw:grid tw:grid-cols-3 tw:gap-3 tw:border-b tw:border-rule tw:bg-canvas tw:py-[18px] tw:max-[840px]:grid-cols-1" aria-label={ui.filters}>
		<label class="tw:grid tw:gap-2">
			<span class="meta">{ui.section}</span>
			<select class="tw:min-h-[38px] tw:w-full tw:rounded-ui-sm tw:border tw:border-rule-strong tw:bg-panel tw:px-[10px] tw:py-[7px]" bind:value={selectedSection}>
				<option value="all">{ui.allFem}</option>
				{#each data.sections as section (section.key)}
					<option value={section.key}>{sectionLabel(section.key, section.title)}</option>
				{/each}
			</select>
		</label>
		<label class="tw:grid tw:gap-2">
			<span class="meta">{ui.year}</span>
			<select class="tw:min-h-[38px] tw:w-full tw:rounded-ui-sm tw:border tw:border-rule-strong tw:bg-panel tw:px-[10px] tw:py-[7px]" bind:value={selectedYear}>
				<option value="all">{ui.allMasc}</option>
				{#each data.years as year (year)}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</label>
		<label class="tw:grid tw:gap-2">
			<span class="meta">{ui.type}</span>
			<select class="tw:min-h-[38px] tw:w-full tw:rounded-ui-sm tw:border tw:border-rule-strong tw:bg-panel tw:px-[10px] tw:py-[7px]" bind:value={selectedType}>
				<option value="all">{ui.allMasc}</option>
				{#each types as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</label>
	</section>

	<div class="tw:grid tw:gap-[clamp(36px,6vw,72px)] tw:pt-[clamp(36px,6vw,72px)]">
		{#each visibleSections as section (section.key)}
			<section class="tw:grid tw:grid-cols-[260px_minmax(0,1fr)] tw:gap-[clamp(18px,4vw,48px)] tw:max-[840px]:grid-cols-1">
				<div class="tw:grid tw:content-start tw:gap-3">
					<span class="meta tag">{section.items.length}</span>
					<h2 class="tw:text-[clamp(1.3rem,3vw,2rem)] tw:leading-[1.1]">{sectionLabel(section.key, section.title)}</h2>
				</div>
				<ol class="tw:m-0 tw:list-none tw:p-0">
					{#each section.items as item (section.key + item.title + item.year)}
						<li class="tw:grid tw:grid-cols-[minmax(0,1fr)_180px] tw:gap-[18px] tw:border-b tw:border-rule tw:py-[18px] tw:max-[840px]:grid-cols-1">
							<div class="tw:grid tw:grid-cols-[64px_minmax(0,1fr)] tw:gap-[18px] tw:max-[840px]:grid-cols-1">
								<span class="tw:tabular-nums tw:text-ink-faint">{item.year ?? ui.noDate}</span>
								<div>
									<h3 class="tw:text-base tw:leading-[1.35]">
										{#if item.url}
											<a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
										{:else}
											{item.title}
										{/if}
									</h3>
									{#if item.detail}
										<p class="tw:mt-[7px] tw:mb-0 tw:text-ink-dim">{item.detail}</p>
									{/if}
									{#if item.links.length}
										<div class="tw:mt-2 tw:flex tw:flex-wrap tw:gap-1.5">
											{#each item.links as link (link.url)}
												<a
													class={`tw:border tw:px-1.5 tw:py-[3px] tw:text-[0.68rem] ${
														link.is_primary
															? 'tw:border-accent tw:text-accent'
															: 'tw:border-rule tw:text-ink-dim tw:hover:border-accent tw:hover:text-accent tw:focus-visible:border-accent tw:focus-visible:text-accent'
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
										<div class="tw:mt-2 tw:flex tw:flex-wrap tw:gap-1.5">
											{#each item.documents as document (document.url)}
												<a class="tw:text-[0.68rem] tw:text-ink-dim tw:hover:text-accent tw:focus-visible:text-accent" href={document.url} target="_blank" rel="noreferrer">↓ {documentLabel(document)}</a>
											{/each}
										</div>
									{/if}
								</div>
							</div>
							{#if typeLabel(item)}
								<span class="meta tw:justify-self-end tw:text-right tw:text-ink-dim tw:max-[840px]:justify-self-start tw:max-[840px]:text-left">{typeLabel(item)}</span>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{:else}
			<p class="tw:text-ink-dim">{ui.empty}</p>
		{/each}
	</div>
</main>
