<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Entry = PageData['entries'][number];
	type Relation = PageData['relations'][number];

	const initialData = untrack(() => data);
	const entries = initialData.entries;
	const entryMap = new Map(entries.map((entry) => [`${entry.entityType}:${entry.entityId}`, entry]));
	let relations = $state(initialData.relations.map((relation) => ({ ...relation })));
	let selectedSlug = $state(initialData.selectedSlug);
	let query = $state(initialData.initialQuery);
	let type = $state('');
	let pending = $state<string[]>([]);

	const normalize = (value: string) =>
		value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	const relationKey = (relation: Pick<Relation, 'portfolioSlug' | 'entityType' | 'entityId'>) =>
		`${relation.portfolioSlug}:${relation.entityType}:${relation.entityId}`;

	const entryKey = (entry: Entry) => `${entry.entityType}:${entry.entityId}`;

	const compareEntries = (a: Entry, b: Entry) => {
		if (a.sortDate == null && b.sortDate != null) return 1;
		if (a.sortDate != null && b.sortDate == null) return -1;
		const byDate = (b.sortDate ?? '').localeCompare(a.sortDate ?? '');
		return byDate || a.title.localeCompare(b.title, 'es');
	};

	let selectedProject = $derived(
		data.projects.find((project) => project.slug === selectedSlug) ?? data.projects[0]
	);

	let typeOptions = $derived.by(() => {
		const labels = new Map<string, string>();
		for (const entry of entries) labels.set(entry.entityType, entry.typeLabel);
		return [...labels].map(([value, label]) => ({ value, label })).sort((a, b) =>
			a.label.localeCompare(b.label, 'es')
		);
	});

	let currentRelations = $derived.by(() =>
		relations
			.filter((relation) => relation.portfolioSlug === selectedSlug)
			.map((relation) => ({ relation, entry: entryMap.get(`${relation.entityType}:${relation.entityId}`) }))
			.filter((item): item is { relation: Relation; entry: Entry } => Boolean(item.entry))
			.sort((a, b) => compareEntries(a.entry, b.entry))
	);

	let availableEntries = $derived.by(() => {
		const normalizedQuery = normalize(query.trim());
		const related = new Set(
			relations
				.filter((relation) => relation.portfolioSlug === selectedSlug)
				.map((relation) => `${relation.entityType}:${relation.entityId}`)
		);
		return entries
			.filter((entry) => !related.has(entryKey(entry)))
			.filter((entry) => !type || entry.entityType === type)
			.filter((entry) =>
				!normalizedQuery
					? true
					: normalize(`${entry.title} ${entry.typeLabel}`).includes(normalizedQuery)
			)
			.sort(compareEntries);
	});

	const projectCount = (slug: string) =>
		relations.filter((relation) => relation.portfolioSlug === slug).length;

	const entryRelationCount = (entry: Entry) =>
		relations.filter(
			(relation) => relation.entityType === entry.entityType && relation.entityId === entry.entityId
		).length;

	const addSubmit = (entry: Entry): SubmitFunction =>
		({ formData }) => {
			const portfolioSlug = String(formData.get('portfolioSlug') ?? '');
			const optimistic: Relation = {
				portfolioSlug,
				entityType: entry.entityType,
				entityId: entry.entityId,
				featured: false
			};
			const key = `add:${relationKey(optimistic)}`;
			const existed = relations.some((relation) => relationKey(relation) === relationKey(optimistic));
			if (!existed) relations = [...relations, optimistic];
			pending = [...pending, key];

			return async ({ result, update }) => {
				if (result.type !== 'success' && !existed) {
					relations = relations.filter((relation) => relationKey(relation) !== relationKey(optimistic));
				}
				pending = pending.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};

	const removeSubmit = (relation: Relation): SubmitFunction =>
		() => {
			const previous = { ...relation };
			const key = `remove:${relationKey(relation)}`;
			relations = relations.filter((item) => relationKey(item) !== relationKey(relation));
			pending = [...pending, key];

			return async ({ result, update }) => {
				if (result.type !== 'success') relations = [...relations, previous];
				pending = pending.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};

	const featuredSubmit = (relation: Relation): SubmitFunction =>
		({ formData }) => {
			const previous = relation.featured;
			const next = !relation.featured;
			const key = `featured:${relationKey(relation)}`;
			formData.set('featured', next ? '1' : '0');
			relation.featured = next;
			pending = [...pending, key];

			return async ({ result, update }) => {
				if (result.type !== 'success') relation.featured = previous;
				pending = pending.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};

	const isPending = (operation: string, relation: Pick<Relation, 'portfolioSlug' | 'entityType' | 'entityId'>) =>
		pending.includes(`${operation}:${relationKey(relation)}`);
</script>

<svelte:head>
	<title>Portfolio · cv/admin</title>
</svelte:head>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success} />
	{/key}
{/if}

<div class="heading">
	<div>
		<p class="eyebrow">Curación editorial</p>
		<h1>Fichas del portfolio</h1>
	</div>
	{#if selectedProject}
		<a href={`/es/proyectos/${selectedProject.slug}`} target="_blank" rel="noreferrer">Ver ficha pública ↗</a>
	{/if}
</div>

<p class="intro">
	Relaciona cada ficha narrativa con resultados del CV. La lista pública se ordena automáticamente por fecha.
</p>

<nav class="project-tabs" aria-label="Fichas del portfolio">
	{#each data.projects as project (project.slug)}
		<button
			type="button"
			class:active={selectedSlug === project.slug}
			onclick={() => (selectedSlug = project.slug)}
		>
			<span>{project.title}</span>
			<small>{projectCount(project.slug)}</small>
		</button>
	{/each}
</nav>

{#if selectedProject}
	<section class="project-context" aria-live="polite">
		<div>
			<span>Ficha seleccionada</span>
			<h2>{selectedProject.title}</h2>
			<p>{selectedProject.kind}</p>
		</div>
		<strong>{currentRelations.length} relacionados</strong>
	</section>
{/if}

<div class="workspace">
	<section class="related-panel" aria-labelledby="related-title">
		<header>
			<div>
				<p class="eyebrow">Selección actual</p>
				<h2 id="related-title">Trabajos relacionados</h2>
			</div>
			<span>Orden cronológico</span>
		</header>

		{#if currentRelations.length === 0}
			<p class="empty">Esta ficha todavía no tiene trabajos relacionados.</p>
		{:else}
			<ol class="entry-list selected-list">
				{#each currentRelations as item (`${item.relation.entityType}:${item.relation.entityId}`)}
					<li class:featured={item.relation.featured}>
						<div class="entry-copy">
							<div class="entry-meta">
								<span>{item.entry.typeLabel}</span>
								<span>{item.entry.sortDate ?? 'sin fecha'}</span>
								{#if !item.entry.isPublic}<span class="private">Privada</span>{/if}
							</div>
							<strong>{item.entry.title}</strong>
						</div>
						<div class="row-actions">
							<form method="POST" action="?/featured" use:enhance={featuredSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={item.relation.portfolioSlug} />
								<input type="hidden" name="entityType" value={item.relation.entityType} />
								<input type="hidden" name="entityId" value={item.relation.entityId} />
								<button
									type="submit"
									class="star"
									class:active={item.relation.featured}
									disabled={isPending('featured', item.relation)}
									aria-label={`${item.relation.featured ? 'Quitar destacado de' : 'Destacar'} ${item.entry.title}`}
									title={item.relation.featured ? 'Quitar destacado' : 'Destacar en la ficha'}
								>★</button>
							</form>
							<form method="POST" action="?/remove" use:enhance={removeSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={item.relation.portfolioSlug} />
								<input type="hidden" name="entityType" value={item.relation.entityType} />
								<input type="hidden" name="entityId" value={item.relation.entityId} />
								<button
									type="submit"
									class="remove"
									disabled={isPending('remove', item.relation)}
								>Quitar</button>
							</form>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</section>

	<section class="add-panel" aria-labelledby="add-title">
		<header>
			<p class="eyebrow">Añadir resultados</p>
			<h2 id="add-title">Buscar entradas</h2>
		</header>
		<div class="filters">
			<label>
				<span>Buscar por título</span>
				<input type="search" bind:value={query} placeholder="Escribe para filtrar…" />
			</label>
			<label>
				<span>Tipo</span>
				<select bind:value={type}>
					<option value="">Todos</option>
					{#each typeOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
		</div>
		<p class="results-count">{availableEntries.length} entradas disponibles</p>

		{#if availableEntries.length === 0}
			<p class="empty">No hay entradas disponibles con estos filtros.</p>
		{:else}
			<ul class="entry-list candidate-list">
				{#each availableEntries as entry (entryKey(entry))}
					<li>
						<div class="entry-copy">
							<div class="entry-meta">
								<span>{entry.typeLabel}</span>
								<span>{entry.sortDate ?? 'sin fecha'}</span>
								{#if !entry.isPublic}<span class="private">Privada</span>{/if}
								{#if entryRelationCount(entry) > 0}
									<span>{entryRelationCount(entry)} {entryRelationCount(entry) === 1 ? 'ficha' : 'fichas'}</span>
								{/if}
							</div>
							<strong>{entry.title}</strong>
						</div>
						<form method="POST" action="?/add" use:enhance={addSubmit(entry)}>
							<input type="hidden" name="portfolioSlug" value={selectedSlug} />
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<button
								type="submit"
								disabled={isPending('add', { portfolioSlug: selectedSlug, entityType: entry.entityType, entityId: entry.entityId })}
							>+ Añadir</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>

<style>
	.heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
	.heading h1 { margin: 0.2rem 0 0; font-size: 1.5rem; color: #fafafa; }
	.heading a { border: 1px solid #525252; padding: 0.5rem 0.75rem; color: #d4d4d4; font-size: 0.75rem; }
	.eyebrow, label span { margin: 0; color: #737373; font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; }
	.intro { max-width: 76ch; margin: 1rem 0 1.5rem; color: #a3a3a3; line-height: 1.6; }

	.project-tabs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; padding: 1px; background: #262626; }
	.project-tabs button { display: flex; justify-content: space-between; gap: 0.75rem; border: 0; background: #111; color: #a3a3a3; padding: 0.8rem; text-align: left; cursor: pointer; }
	.project-tabs button:hover, .project-tabs button.active { background: #171717; color: #fafafa; }
	.project-tabs button.active { box-shadow: inset 0 -2px #00ff88; }
	.project-tabs small { color: #737373; }

	.project-context { display: flex; align-items: end; justify-content: space-between; gap: 1rem; padding: 1.1rem; border: 1px solid #262626; border-top: 0; }
	.project-context span { color: #737373; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; }
	.project-context h2 { margin: 0.35rem 0 0.2rem; color: #fafafa; font-size: 1rem; }
	.project-context p { margin: 0; color: #737373; font-size: 0.72rem; }
	.project-context strong { color: #00ff88; font-size: 0.75rem; font-weight: 500; }

	.workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.25rem; margin-top: 1.5rem; align-items: start; }
	.related-panel, .add-panel { min-width: 0; border: 1px solid #262626; background: #0d0d0d; }
	.related-panel > header, .add-panel > header { display: flex; justify-content: space-between; align-items: end; gap: 1rem; padding: 1rem; border-bottom: 1px solid #262626; }
	h2 { margin: 0.25rem 0 0; color: #e5e5e5; font-size: 0.9rem; }
	.related-panel > header > span { color: #737373; font-size: 0.68rem; }

	.filters { display: grid; grid-template-columns: minmax(0, 1fr) 10rem; gap: 0.75rem; padding: 1rem 1rem 0; }
	.filters label { display: grid; gap: 0.35rem; }
	input, select { min-width: 0; border: 1px solid #404040; background: #0a0a0a; color: #d4d4d4; padding: 0.55rem; }
	.results-count { margin: 0; padding: 0.65rem 1rem 1rem; color: #737373; font-size: 0.68rem; }

	.entry-list { list-style: none; margin: 0; padding: 0; }
	.entry-list li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-width: 0; padding: 0.85rem 1rem; border-bottom: 1px solid #262626; }
	.entry-list li:last-child { border-bottom: 0; }
	.selected-list li.featured { box-shadow: inset 3px 0 #d6a84b; }
	.entry-copy { min-width: 0; }
	.entry-copy strong { display: block; color: #e5e5e5; font-size: 0.78rem; font-weight: 500; line-height: 1.35; }
	.entry-meta { display: flex; flex-wrap: wrap; gap: 0.45rem 0.7rem; margin-bottom: 0.35rem; color: #737373; font-size: 0.62rem; }
	.entry-meta .private { color: #d6a84b; }
	.row-actions { display: flex; flex: 0 0 auto; gap: 0.35rem; }
	.entry-list form { margin: 0; }
	.entry-list button { border: 1px solid #404040; background: transparent; color: #a3a3a3; padding: 0.38rem 0.55rem; font: inherit; font-size: 0.68rem; cursor: pointer; }
	.entry-list button:hover:not(:disabled) { border-color: #737373; color: #fafafa; }
	.entry-list button:disabled { opacity: 0.4; cursor: wait; }
	.entry-list .star { min-width: 2rem; color: #525252; font-size: 0.9rem; }
	.entry-list .star.active { border-color: #9b7934; color: #d6a84b; }
	.entry-list .remove { color: #ff8b8b; }
	.candidate-list { max-height: 55rem; overflow-y: auto; border-top: 1px solid #262626; }
	.empty { margin: 0; padding: 2rem 1rem; color: #737373; text-align: center; font-size: 0.75rem; }

	@media (max-width: 960px) {
		.workspace { grid-template-columns: 1fr; }
		.project-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}

	@media (max-width: 620px) {
		.heading, .project-context { align-items: flex-start; flex-direction: column; }
		.project-tabs, .filters { grid-template-columns: 1fr; }
		.entry-list li { align-items: flex-start; flex-direction: column; }
	}
</style>
