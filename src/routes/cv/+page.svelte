<script lang="ts">
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';

	let { data } = $props();

	let selectedYear = $state('all');
	let selectedSection = $state('all');
	let selectedTypes = $state<Record<string, string>>({});
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
				talks: 'Comunicaciones',
				teaching: 'Docencia',
				projects: 'Proyectos de investigación',
				education: 'Formación',
				research_stays: 'Estancias',
				funding_awards: 'Financiación y premios',
				service_activities: 'Servicio académico',
				academic_works: 'Trabajos académicos',
				courses: 'Cursos y formación complementaria',
				memberships: 'Asociaciones científicas',
				skills: 'Competencias',
				languages: 'Idiomas'
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
				talks: 'Talks',
				teaching: 'Teaching',
				projects: 'Research projects',
				education: 'Education',
				research_stays: 'Research stays',
				funding_awards: 'Funding and awards',
				service_activities: 'Academic service',
				academic_works: 'Academic works',
				courses: 'Courses and further training',
				memberships: 'Scientific associations',
				skills: 'Skills',
				languages: 'Languages'
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
	const itemDetail = (item: CvItem) =>
		item.is_native
			? [item.detail, locale === 'en' ? 'Native language' : 'Lengua materna']
				.filter(Boolean)
				.join(' · ')
			: item.detail;
	const typeOptionsFor = (items: CvItem[]) =>
		Array.from(
			items
				.filter((item): item is CvItem & { type: string } => Boolean(item.type))
				.reduce((map, item) => {
					if (!map.has(item.type)) map.set(item.type, typeLabel(item) ?? item.type);
					return map;
				}, new Map<string, string>())
				.entries()
		)
			.map(([value, label]) => ({ value, label }))
			.sort((a, b) => a.label.localeCompare(b.label, locale));

	const setSectionType = (sectionKey: string, type: string) => {
		selectedTypes = { ...selectedTypes, [sectionKey]: type };
	};
	const setSection = (sectionKey: string) => {
		if (sectionKey === selectedSection) return;
		selectedSection = sectionKey;
		selectedTypes = {};
	};

	const visibleSections = $derived(
		data.sections
			.filter((section) => selectedSection === 'all' || section.key === selectedSection)
			.map((section) => {
				const yearItems = section.items.filter(
					(item) => selectedYear === 'all' || item.year === selectedYear
				);
				const typeOptions = typeOptionsFor(yearItems);
				const requestedType = selectedTypes[section.key] ?? 'all';
				const activeType = typeOptions.some((option) => option.value === requestedType)
					? requestedType
					: 'all';
				return {
					...section,
					typeOptions,
					activeType,
					items: yearItems.filter((item) => activeType === 'all' || item.type === activeType)
				};
			})
			.filter((section) => section.items.length > 0)
	);
</script>

<div class="cv-page relative isolate min-h-screen">
	<EditorialBackground />

<main class="wrap relative z-[1] pt-[clamp(24px,5vh,56px)] pb-[88px]" id="cv">
	<header class="grid min-h-[54vh] content-center gap-[18px] border-b border-rule">
		<div class="flex flex-wrap items-baseline justify-between gap-4">
			<a class="meta text-ink-dim" href={localizedPath('/', locale)}>{ui.back}</a>
			<SiteControls />
		</div>
		<span class="meta tag">CV</span>
		<h1 class="max-w-[10ch] text-[clamp(3rem,9vw,7rem)] leading-[0.95] uppercase">{ui.title}</h1>
		<p class="m-0 max-w-[72ch] text-ink-dim">{ui.intro}</p>
	</header>

	<section class="border-b border-rule py-[clamp(18px,3vw,28px)]" aria-label={ui.filters}>
		<div class="flex items-start justify-between gap-[clamp(24px,4vw,56px)] max-[840px]:hidden">
			<fieldset class="m-0 min-w-0 flex-1 border-0 p-0">
				<legend class="meta mb-2.5 p-0">{ui.section}</legend>
				<div class="flex flex-wrap gap-2">
				<FilterChip label={ui.allFem} active={selectedSection === 'all'} variant="all" onclick={() => setSection('all')} />
				{#each data.sections as section (section.key)}
					<FilterChip label={sectionLabel(section.key, section.title)} active={selectedSection === section.key} onclick={() => setSection(section.key)} />
				{/each}
				</div>
			</fieldset>
			<label class="block flex-[0_0_auto]">
				<span class="meta mb-2.5 block text-ink-faint">{ui.year}</span>
				<select class="min-h-[34px] min-w-[88px] border-0 border-b border-rule-strong bg-transparent py-1 pr-7 pl-0 text-[.76rem] text-ink-dim" bind:value={selectedYear}>
					<option value="all">{ui.allMasc}</option>
					{#each data.years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="hidden grid-cols-2 gap-3 max-[840px]:grid max-[520px]:grid-cols-1">
			<label class="grid gap-2">
				<span class="meta">{ui.section}</span>
				<select class="min-h-[38px] w-full rounded-ui-sm border border-rule-strong bg-panel px-[10px] py-[7px]" bind:value={selectedSection} onchange={() => (selectedTypes = {})}>
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
			</div>
	</section>

	<div class="grid gap-[clamp(36px,6vw,72px)] pt-[clamp(36px,6vw,72px)]">
		{#each visibleSections as section (section.key)}
			<section class="grid grid-cols-[260px_minmax(0,1fr)] gap-[clamp(18px,4vw,48px)] max-[840px]:grid-cols-1">
				<div class="sticky top-6 grid self-start content-start gap-3 max-[840px]:static">
					<span class="meta tag">{section.items.length}</span>
					<h2 class="text-[clamp(1.3rem,3vw,2rem)] leading-[1.1]">{sectionLabel(section.key, section.title)}</h2>
				</div>
				<div class="min-w-0">
					{#if section.typeOptions.length > 1}
						<fieldset class="m-0 mb-3 grid gap-2 border-0 p-0">
							<legend class="meta mb-2 p-0 text-ink-faint">{ui.type}</legend>
							<div class="flex flex-wrap gap-1.5">
								<FilterChip label={ui.allMasc} active={section.activeType === 'all'} variant="all" onclick={() => setSectionType(section.key, 'all')} />
								{#each section.typeOptions as type (type.value)}
									<FilterChip label={type.label} active={section.activeType === type.value} onclick={() => setSectionType(section.key, type.value)} />
								{/each}
							</div>
						</fieldset>
					{/if}
					<ol class="m-0 list-none p-0">
					{#each section.items as item (section.key + item.title + item.year)}
						<li class="grid grid-cols-[minmax(0,1fr)_180px] gap-[18px] border-b border-rule py-[18px] max-[840px]:grid-cols-1">
							<div class="grid grid-cols-[64px_minmax(0,1fr)] gap-[18px] max-[840px]:grid-cols-1">
								<span class="tabular-nums text-ink-faint">{item.hide_year ? '' : item.year ?? ui.noDate}</span>
								<div>
									<h3 class="text-base leading-[1.35]">
										{#if item.target_url}
											<a class="group flex items-start justify-between gap-4" href={item.target_url} target="_blank" rel="noreferrer">
												<span>{item.title}</span>
												<span class="mt-px grid h-5 w-5 flex-[0_0_20px] place-items-center text-accent-strong [transition:transform_180ms_ease] group-hover:translate-x-0.5 group-hover:translate-y-[-2px] group-focus-visible:translate-x-0.5 group-focus-visible:translate-y-[-2px] motion-reduce:transition-none" aria-hidden="true">
													<MoveUpRight size={19} strokeWidth={1.7} />
												</span>
											</a>
										{:else}
											{item.title}
										{/if}
									</h3>
									{#if item.metadata || itemDetail(item) || item.doi}
										<p class="mt-[7px] mb-0 text-ink-dim">
											{#if item.metadata}
												<EntryMetadata metadata={item.metadata} {locale} />
											{:else if itemDetail(item)}
												{itemDetail(item)}
											{/if}
											{#if item.doi}
												<a class={item.metadata || itemDetail(item) ? 'ml-1 text-ink-faint hover:text-accent focus-visible:text-accent' : 'text-ink-faint hover:text-accent focus-visible:text-accent'} href={item.doi_url ?? undefined} target="_blank" rel="noreferrer">DOI: {item.doi}</a>
											{/if}
										</p>
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
								</div>
							</div>
							{#if typeLabel(item)}
								<span class="meta justify-self-end text-right text-ink-dim max-[840px]:justify-self-start max-[840px]:text-left">{typeLabel(item)}</span>
							{/if}
						</li>
					{/each}
					</ol>
				</div>
			</section>
		{:else}
			<p class="text-ink-dim">{ui.empty}</p>
		{/each}
	</div>
</main>
</div>
