<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
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
			empty: 'No hay resultados para esos filtros.',
			sectionLabels: {
				publications: 'Publicaciones',
				talks: 'Comunicaciones',
				teaching: 'Docencia',
				projects: 'Proyectos de investigación',
				technical_works: 'Experiencia técnica y profesional',
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
			empty: 'No results for those filters.',
			sectionLabels: {
				publications: 'Publications',
				talks: 'Talks',
				teaching: 'Teaching',
				projects: 'Research projects',
				technical_works: 'Technical and professional experience',
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
	const itemDetail = (item: CvItem) =>
		item.is_native
			? [
					(locale === 'en' ? item.detail_label_en : item.detail_label_es) ?? item.detail,
					locale === 'en' ? 'Native language' : 'Lengua materna'
				]
				.filter(Boolean)
				.join(' · ')
			: (locale === 'en' ? item.detail_label_en : item.detail_label_es) ?? item.detail;
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
					<ol class="m-0 list-none border-t border-rule p-0">
					{#each section.items as item (item.entity_id)}
						<li class="grid grid-cols-[minmax(130px,.36fr)_minmax(0,1fr)] gap-[clamp(18px,3vw,40px)] border-b border-rule py-[clamp(18px,2.6vw,28px)] max-[700px]:grid-cols-1 max-[700px]:gap-2">
							<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
								<span class="grid content-start justify-items-start gap-1.5">
									{#if typeLabel(item)}<span class="text-[.86rem] leading-[1.3] text-ink-dim">{typeLabel(item)}</span>{/if}
									{#if item.metadata?.kind === 'event' && item.metadata.invited}
										<span class="label bg-accent-wash px-1.5 py-0.5 text-accent-strong">{ui.invited}</span>
									{/if}
								</span>
								<span class="label text-right text-ink-faint">{item.hide_year ? '' : item.year ?? ui.noDate}</span>
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
								{#if item.metadata || itemDetail(item) || item.doi}
									<p class="mt-2 mb-0 max-w-[72ch] text-[.76rem] leading-[1.5] text-ink-faint">
										{#if item.metadata}
											<EntryMetadata metadata={item.metadata} {locale} hideInvitation />
										{:else if itemDetail(item)}
											{itemDetail(item)}
										{/if}
										{#if item.doi}
											<a class="ml-1 font-mono text-[.7rem] text-ink-faint hover:text-accent-strong focus-visible:text-accent-strong" href={item.doi_url ?? undefined} target="_blank" rel="noreferrer">DOI {item.doi} ↗</a>
										{/if}
									</p>
								{/if}
								{#if item.skillDetails}
									{#if item.skillDetails.resources.length}<p class="mt-2 mb-0 text-[.76rem] text-ink-faint">{item.skillDetails.resources.map((r) => (locale === 'en' ? r.labelEn : r.label)).join(', ')}</p>{/if}
									<ul class="mt-2 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
										{#each item.skillDetails.evidence as example}
											<li class="label">{#if example.url}<a href={example.url} class="text-accent-strong hover:text-ink">{locale === 'en' ? example.labelEn : example.label} ↗</a>{:else}{locale === 'en' ? example.labelEn : example.label}{/if}</li>
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
				</div>
			</section>
		{:else}
			<p class="text-ink-dim">{ui.empty}</p>
		{/each}
	</div>
</main>
</div>
