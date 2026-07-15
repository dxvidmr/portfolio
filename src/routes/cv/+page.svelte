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
				academic_events: 'Eventos académicos',
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
				academic_events: 'Academic events',
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

<main class="cv-page wrap">
	<header class="cv-head">
		<div class="page-nav">
			<a class="meta back" href={localizedPath('/', locale)}>{ui.back}</a>
			<SiteControls />
		</div>
		<span class="meta tag">CV</span>
		<h1>{ui.title}</h1>
		<p>{ui.intro}</p>
	</header>

	<section class="filters" aria-label={ui.filters}>
		<label>
			<span class="meta">{ui.section}</span>
			<select bind:value={selectedSection}>
				<option value="all">{ui.allFem}</option>
				{#each data.sections as section (section.key)}
					<option value={section.key}>{sectionLabel(section.key, section.title)}</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="meta">{ui.year}</span>
			<select bind:value={selectedYear}>
				<option value="all">{ui.allMasc}</option>
				{#each data.years as year (year)}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="meta">{ui.type}</span>
			<select bind:value={selectedType}>
				<option value="all">{ui.allMasc}</option>
				{#each types as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</label>
	</section>

	<div class="cv-sections">
		{#each visibleSections as section (section.key)}
			<section class="cv-section">
				<div class="section-title">
					<span class="meta tag">{section.items.length}</span>
					<h2>{sectionLabel(section.key, section.title)}</h2>
				</div>
				<ol>
					{#each section.items as item (section.key + item.title + item.year)}
						<li>
							<div class="item-main">
								<span class="year dense">{item.year ?? ui.noDate}</span>
								<div>
									<h3>
										{#if item.url}
											<a href={item.url} target="_blank" rel="noreferrer">{item.title}</a>
										{:else}
											{item.title}
										{/if}
									</h3>
									{#if item.detail}
										<p>{item.detail}</p>
									{/if}
								</div>
							</div>
							{#if typeLabel(item)}
								<span class="type meta">{typeLabel(item)}</span>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{:else}
			<p class="empty">{ui.empty}</p>
		{/each}
	</div>
</main>

<style>
	.cv-page {
		padding-block: clamp(24px, 5vh, 56px) 88px;
	}
	.back {
		color: var(--fg-dim);
	}
	.page-nav {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
		flex-wrap: wrap;
	}
	.cv-head {
		min-height: 54vh;
		display: grid;
		align-content: center;
		gap: 18px;
		border-bottom: 1px solid var(--line);
	}
	.cv-head h1 {
		max-width: 10ch;
		font-size: clamp(3rem, 9vw, 7rem);
		line-height: 0.95;
		text-transform: uppercase;
	}
	.cv-head p {
		max-width: 72ch;
		margin: 0;
		color: var(--fg-dim);
	}
	.filters {
		position: sticky;
		top: 0;
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 12px;
		padding-block: 18px;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}
	label {
		display: grid;
		gap: 8px;
	}
	select {
		width: 100%;
		min-height: 38px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-sm);
		background: var(--bg-panel);
		padding: 7px 10px;
	}
	.cv-sections {
		display: grid;
		gap: clamp(36px, 6vw, 72px);
		padding-top: clamp(36px, 6vw, 72px);
	}
	.cv-section {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		gap: clamp(18px, 4vw, 48px);
	}
	.section-title {
		display: grid;
		align-content: start;
		gap: 12px;
	}
	.section-title h2 {
		font-size: clamp(1.3rem, 3vw, 2rem);
		line-height: 1.1;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 180px;
		gap: 18px;
		padding: 18px 0;
		border-bottom: 1px solid var(--line);
	}
	.item-main {
		display: grid;
		grid-template-columns: 64px minmax(0, 1fr);
		gap: 18px;
	}
	.year {
		color: var(--fg-faint);
	}
	h3 {
		font-size: 1rem;
		line-height: 1.35;
	}
	p {
		margin: 7px 0 0;
		color: var(--fg-dim);
	}
	.type {
		justify-self: end;
		text-align: right;
		color: var(--fg-dim);
	}
	.empty {
		color: var(--fg-dim);
	}
	@media (max-width: 840px) {
		.filters,
		.cv-section,
		li,
		.item-main {
			grid-template-columns: 1fr;
		}
		.type {
			justify-self: start;
			text-align: left;
		}
	}
</style>
