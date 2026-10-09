<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { CV_SEPARATOR } from '$lib/content/cv-format';
	import { plainInlineTitle } from '$lib/content/inline-markup';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';

	let { data } = $props();

	let selectedYear = $state('all');
	let selectedSection = $state('all');
	let selectedTypes = $state<Record<string, string>>({});
	const locale = $derived(localeFromPathname(page.url.pathname));
	const ui = $derived({
		es: {
			back: 'Volver',
			invited: 'Por invitación',
			title: 'Currículum completo',
			intro: '',
			filters: 'Filtros del CV',
			section: 'Sección',
			year: 'Año',
			type: 'Tipo',
			allFem: 'Todas',
			allMasc: 'Todos',
			noDate: 's/f',
			expected: 'Prevista',
			inPortfolio: 'En el portfolio',
			empty: 'No hay resultados para esos filtros.',
			sectionLabels: {
				publications: 'Publicaciones',
				talks: 'Comunicaciones',
				teaching: 'Docencia',
				projects: 'Proyectos de investigación',
				technical_works: 'Trabajos técnicos',
				education: 'Formación',
				research_stays: 'Estancias',
				funding_awards: 'Financiación y premios',
				service_activities: 'Servicio académico',
				academic_works: 'Trabajos académicos',
				courses: 'Cursos y formación complementaria',
				memberships: 'Asociaciones científicas',
				skills: 'Competencias técnicas y metodológicas',
				languages: 'Idiomas'
			}
		},
		en: {
			back: 'Back',
			invited: 'Invited',
			title: 'Full curriculum vitae',
			intro: '',
			filters: 'CV filters',
			section: 'Section',
			year: 'Year',
			type: 'Type',
			allFem: 'All',
			allMasc: 'All',
			noDate: 'n.d.',
			expected: 'Expected',
			inPortfolio: 'In the portfolio',
			empty: 'No results for those filters.',
			sectionLabels: {
				publications: 'Publications',
				talks: 'Talks',
				teaching: 'Teaching',
				projects: 'Research projects',
				technical_works: 'Technical work',
				education: 'Education',
				research_stays: 'Research stays',
				funding_awards: 'Funding and awards',
				service_activities: 'Academic service',
				academic_works: 'Academic works',
				courses: 'Courses and further training',
				memberships: 'Scientific associations',
				skills: 'Technical and methodological capabilities',
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
	const itemTitle = (item: CvItem) =>
		(locale === 'en' ? item.title_label_en : item.title_label_es) ?? item.title;
	// Horas de docencia o de curso: distinguen un taller de una asignatura semestral.
	const hoursText = (item: CvItem) =>
		item.hours ? `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(item.hours)} h` : '';
	const itemDetail = (item: CvItem) =>
		item.hours
			? [(locale === 'en' ? item.detail_label_en : item.detail_label_es) ?? item.detail, hoursText(item)].filter(Boolean).join(CV_SEPARATOR)
			: item.is_native
			? [
					(locale === 'en' ? item.detail_label_en : item.detail_label_es) ?? item.detail,
					locale === 'en' ? 'Native language' : 'Lengua materna'
				]
				.filter(Boolean)
				.join(CV_SEPARATOR)
			: (locale === 'en' ? item.detail_label_en : item.detail_label_es) ?? item.detail;
	const foldText = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').replace(/[.\s]+$/, '').trim();
	// Detalle que no repite el nombre del mérito (servicios y conferencias con el mismo título).
	const detailText = (item: CvItem) => {
		const detail = itemDetail(item);
		return detail && foldText(detail) !== foldText(plainInlineTitle(itemTitle(item))) ? detail : '';
	};
	const yearLabel = (item: CvItem) =>
		item.hide_year ? '' : item.year_label ? item.year_label : item.year ? (item.expected ? `${ui.expected} ${item.year}` : item.year) : ui.noDate;
	// Competencias: como ejemplos, solo las fichas del portfolio; los méritos ya están en su sección.
	const portfolioExamples = (item: CvItem) =>
		(item.skillDetails?.evidence ?? []).filter((example) => example.key.startsWith('portfolio:'));
	// Competencias en la web: una fila por área con los nombres, las herramientas y las fichas
	// del portfolio de esa área. Las descripciones quedan para el CV exportado.
	const skillAreas = (items: CvItem[]) => {
		const areas = new Map<string, { key: string; label: string; items: CvItem[] }>();
		for (const item of items) {
			const key = item.type ?? 'other';
			if (!areas.has(key)) areas.set(key, { key, label: typeLabel(item) ?? '', items: [] });
			areas.get(key)!.items.push(item);
		}
		return [...areas.values()].map((area) => {
			const unique = <T,>(values: T[], id: (value: T) => string) => [...new Map(values.map((value) => [id(value), value])).values()];
			const resources = unique(area.items.flatMap((item) => item.skillDetails?.resources ?? []), (resource) => resource.key)
				.map((resource) => (locale === 'en' ? resource.labelEn : resource.label))
				.sort((a, b) => a.localeCompare(b, locale));
			return { ...area, resources, examples: unique(area.items.flatMap(portfolioExamples), (example) => example.key) };
		});
	};
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

{#snippet tab(label: string, active: boolean, onselect: () => void)}
	<button
		type="button"
		role="tab"
		aria-selected={active}
		class={`label cursor-pointer border-0 border-b bg-transparent p-0 pb-1 [transition:color_200ms_ease,border-color_200ms_ease] ${active ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint hover:text-ink-dim'}`}
		onclick={onselect}
	>{label}</button>
{/snippet}

<div class="cv-page relative isolate min-h-screen">
	<EditorialBackground />
	<SiteHeader {locale} current="cv" />

<main class="wrap relative z-[1] pt-[calc(72px+clamp(40px,8vw,120px))] pb-[clamp(80px,12vw,160px)]" id="cv">
	<header class="mb-[clamp(48px,7vw,104px)]">
		<h1 class="section-title m-0 max-w-[12ch] text-[clamp(3.4rem,11vw,9rem)] font-medium leading-[.9] tracking-[-0.05em]">{ui.title}</h1>
		{#if ui.intro}<p class="mt-6 mb-0 max-w-[62ch] text-[.9rem] leading-[1.6] text-ink-dim">{ui.intro}</p>{/if}
	</header>

	<section class="mb-[clamp(48px,7vw,96px)]" aria-label={ui.filters}>
		<div class="flex items-end justify-between gap-[clamp(24px,4vw,56px)] max-[840px]:hidden">
			<div class="flex flex-wrap gap-x-5 gap-y-2.5" role="tablist" aria-label={ui.section}>
				{@render tab(ui.allFem, selectedSection === 'all', () => setSection('all'))}
				{#each data.sections as section (section.key)}
					{@render tab(sectionLabel(section.key, section.title), selectedSection === section.key, () => setSection(section.key))}
				{/each}
			</div>
			<label class="flex flex-[0_0_auto] items-baseline gap-3">
				<span class="label text-ink-faint">{ui.year}</span>
				<select class="min-h-[30px] min-w-[88px] border-0 border-b border-rule-strong bg-transparent py-1 pr-7 pl-0 font-mono text-[.72rem] text-ink-dim" bind:value={selectedYear}>
					<option value="all">{ui.allMasc}</option>
					{#each data.years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="hidden grid-cols-2 gap-3 max-[840px]:grid max-[520px]:grid-cols-1">
			<label class="grid gap-2">
				<span class="label">{ui.section}</span>
				<select class="min-h-[38px] w-full border-0 border-b border-rule-strong bg-transparent py-[7px] font-mono text-[.78rem]" bind:value={selectedSection} onchange={() => (selectedTypes = {})}>
					<option value="all">{ui.allFem}</option>
					{#each data.sections as section (section.key)}
						<option value={section.key}>{sectionLabel(section.key, section.title)}</option>
					{/each}
				</select>
			</label>
			<label class="grid gap-2">
				<span class="label">{ui.year}</span>
				<select class="min-h-[38px] w-full border-0 border-b border-rule-strong bg-transparent py-[7px] font-mono text-[.78rem]" bind:value={selectedYear}>
					<option value="all">{ui.allMasc}</option>
					{#each data.years as year (year)}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</label>
		</div>
	</section>

	<div class="grid gap-[clamp(72px,10vw,140px)]">
		{#each visibleSections as section (section.key)}
			<!-- Ordenador: el título de la sección se queda fijo a la izquierda. Pantallas estrechas: encima. -->
			<section class="grid grid-cols-[minmax(240px,320px)_minmax(0,1fr)] gap-[clamp(24px,5vw,72px)] max-[1100px]:grid-cols-1 max-[1100px]:gap-6">
				<div class="sticky top-[96px] grid self-start content-start gap-3 max-[1100px]:static">
					<span class="label text-ink-faint">{section.items.length}</span>
					<h2 class="section-title m-0 text-[clamp(1.7rem,2.3vw,2.4rem)] font-medium leading-[1.02] tracking-[-0.03em] hyphens-auto max-[1100px]:text-[clamp(1.9rem,6vw,3rem)]">{sectionLabel(section.key, section.title)}</h2>
				</div>
				<div class="min-w-0">
					{#if section.typeOptions.length > 1}
						<div class="mb-5 flex flex-wrap gap-x-4 gap-y-2" role="tablist" aria-label={ui.type}>
							{@render tab(ui.allMasc, section.activeType === 'all', () => setSectionType(section.key, 'all'))}
							{#each section.typeOptions as type (type.value)}
								{@render tab(type.label, section.activeType === type.value, () => setSectionType(section.key, type.value))}
							{/each}
						</div>
					{/if}
					{#if section.key === 'skills'}
					<ol class="m-0 list-none border-t border-rule p-0">
						{#each skillAreas(section.items) as area (area.key)}
							<li class="grid grid-cols-[minmax(130px,.36fr)_minmax(0,1fr)] gap-[clamp(18px,3vw,40px)] border-b border-rule py-[clamp(18px,2.6vw,28px)] max-[700px]:grid-cols-1 max-[700px]:gap-2">
								<span class="text-[.86rem] leading-[1.3] text-ink-dim">{area.label}</span>
								<div class="min-w-0">
									<ul class="m-0 grid list-none gap-1.5 p-0">
										{#each area.items as item (item.entity_id)}
											<li class="text-[clamp(1.05rem,1.5vw,1.3rem)] font-medium leading-[1.25] tracking-[-0.01em]"><InlineTitle text={itemTitle(item)} /></li>
										{/each}
									</ul>
									{#if area.resources.length}<p class="mt-3 mb-0 max-w-[72ch] text-[.76rem] leading-[1.5] text-ink-faint">{area.resources.join(', ')}</p>{/if}
									{#if area.examples.length}
										<ul class="mt-2.5 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
											{#each area.examples as example (example.key)}
												<li><a href={localizedPath(`/portfolio/${example.key.slice('portfolio:'.length)}`, locale)} class="label text-accent-strong hover:text-ink">{locale === 'en' ? example.labelEn : example.label} →</a></li>
											{/each}
										</ul>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
					{:else}
					<ol class="m-0 list-none border-t border-rule p-0">
					{#each section.items as item (item.entity_id)}
						<li class="grid {section.items.some((entry) => typeLabel(entry)) ? 'grid-cols-[minmax(130px,.36fr)_minmax(0,1fr)]' : 'grid-cols-[minmax(64px,auto)_minmax(0,1fr)]'} gap-[clamp(18px,3vw,40px)] border-b border-rule py-[clamp(18px,2.6vw,28px)] max-[700px]:grid-cols-1 max-[700px]:gap-2">
							<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
								<span class="grid content-start justify-items-start gap-1.5">
									{#if typeLabel(item)}<span class="text-[.86rem] leading-[1.3] text-ink-dim">{typeLabel(item)}</span>{/if}
									{#if item.metadata?.kind === 'event' && item.metadata.invited}
										<span class="label bg-accent-wash px-1.5 py-0.5 text-accent-strong">{ui.invited}</span>
									{/if}
								</span>
								<span class="label text-right text-ink-faint">{yearLabel(item)}</span>
							</div>
							<div class="min-w-0">
								<h3 class="m-0 text-[clamp(1.05rem,1.5vw,1.3rem)] font-medium leading-[1.2] tracking-[-0.01em]">
									{#if item.target_url}
										<a class="group flex items-start justify-between gap-4" href={item.target_url} target="_blank" rel="noreferrer">
											<span><InlineTitle text={itemTitle(item)} /></span>
											<span class="mt-px grid h-5 w-5 flex-[0_0_20px] place-items-center text-accent-strong [transition:transform_180ms_ease] group-hover:translate-x-0.5 group-hover:translate-y-[-2px] group-focus-visible:translate-x-0.5 group-focus-visible:translate-y-[-2px] motion-reduce:transition-none" aria-hidden="true">
												<MoveUpRight size={19} strokeWidth={1.7} />
											</span>
										</a>
									{:else}
										<InlineTitle text={itemTitle(item)} />
									{/if}
								</h3>
								{#if item.metadata || detailText(item) || item.doi}
									<p class="mt-2 mb-0 max-w-[72ch] text-[.76rem] leading-[1.5] text-ink-faint">
										{#if item.metadata}
											<EntryMetadata metadata={item.metadata} {locale} hideInvitation title={itemTitle(item)} />
										{:else if detailText(item)}
											{detailText(item)}
										{/if}
										{#if item.doi}
											<a class="ml-1 font-mono text-[.7rem] text-ink-faint hover:text-accent-strong focus-visible:text-accent-strong" href={item.doi_url ?? undefined} target="_blank" rel="noreferrer">DOI {item.doi} ↗</a>
										{/if}
									</p>
								{/if}
								{#if item.skillDetails}
									{#if item.skillDetails.resources.length}<p class="mt-2 mb-0 text-[.76rem] text-ink-faint">{item.skillDetails.resources.map((r) => (locale === 'en' ? r.labelEn : r.label)).join(', ')}</p>{/if}
									{#if portfolioExamples(item).length}
										<ul class="mt-2.5 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
											{#each portfolioExamples(item) as example (example.key)}
												<li><a href={localizedPath(`/portfolio/${example.key.slice('portfolio:'.length)}`, locale)} class="label text-accent-strong hover:text-ink">{locale === 'en' ? example.labelEn : example.label} →</a></li>
											{/each}
										</ul>
									{/if}
								{/if}
								{#if item.portfolio.length}
									<ul class="mt-2.5 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
										{#each item.portfolio as ficha (ficha.slug)}
											<li><a href={localizedPath(`/portfolio/${ficha.slug}`, locale)} class="label text-accent-strong hover:text-ink">{ui.inPortfolio}: {locale === 'en' ? ficha.title_en : ficha.title_es} →</a></li>
										{/each}
									</ul>
								{/if}
								{#if item.links.length}
									<div class="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
										{#each item.links as link (link.url)}
											<a class={`label hover:text-ink ${link.is_primary ? 'text-accent-strong' : 'text-ink-dim'}`} href={link.url} target="_blank" rel="noreferrer">{linkLabel(link)} ↗</a>
										{/each}
									</div>
								{/if}
							</div>
						</li>
					{/each}
					</ol>
					{/if}
				</div>
			</section>
		{:else}
			<p class="text-ink-dim">{ui.empty}</p>
		{/each}
	</div>
</main>
</div>
