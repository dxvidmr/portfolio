<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
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

<AdminPageHeader
	title="Fichas del portfolio"
	eyebrow="Curación editorial"
	description="Relaciona cada ficha narrativa con resultados del CV. La lista pública se ordena automáticamente por fecha."
>
	{#snippet actions()}
		{#if selectedProject}
			<ButtonLink href={`/es/proyectos/${selectedProject.slug}`} target="_blank" rel="noreferrer"
				>Ver ficha pública ↗</ButtonLink
			>
		{/if}
	{/snippet}
</AdminPageHeader>

<section class="tw:grid tw:grid-cols-[minmax(16rem,34rem)_minmax(0,1fr)] tw:items-end tw:gap-4 tw:border-b tw:border-rule tw:pb-5 tw:max-[620px]:grid-cols-1" aria-label="Seleccionar ficha del portfolio">
	<AdminField label="Ficha del portfolio · orden público">
		<Select bind:value={selectedSlug}>
			{#each data.projects as project, index (project.slug)}
				<option value={project.slug}>
					{String(index + 1).padStart(2, '0')} · {project.title} · {project.year}
				</option>
			{/each}
		</Select>
	</AdminField>
	{#if selectedProject}
		<p class="tw:mb-2 tw:text-[0.68rem] tw:text-ink-faint">
			{selectedProject.kind} · {currentRelations.length} relacionados
		</p>
	{/if}
</section>

<div class="tw:mt-6 tw:grid tw:grid-cols-2 tw:items-start tw:gap-8 tw:max-[960px]:grid-cols-1">
	<section class="tw:min-w-0 tw:border-t tw:border-rule" aria-labelledby="related-title">
		<header class="tw:flex tw:items-end tw:justify-between tw:gap-4 tw:py-4">
			<div>
				<p class="tw:m-0 tw:text-[0.68rem] tw:uppercase tw:tracking-[0.1em] tw:text-ink-faint">Selección actual</p>
				<h2 class="tw:mt-1 tw:mb-0 tw:text-base tw:text-ink" id="related-title">Trabajos relacionados</h2>
			</div>
			<span class="tw:text-[0.68rem] tw:text-ink-faint">Orden cronológico</span>
		</header>

		{#if currentRelations.length === 0}
			<p class="tw:m-0 tw:border-t tw:border-rule tw:px-4 tw:py-8 tw:text-center tw:text-xs tw:text-ink-faint">Esta ficha todavía no tiene trabajos relacionados.</p>
		{:else}
			<ol class="tw:m-0 tw:list-none tw:border-t tw:border-rule tw:p-0">
				{#each currentRelations as item (`${item.relation.entityType}:${item.relation.entityId}`)}
					<li class="tw:flex tw:min-w-0 tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-rule tw:px-2 tw:py-3 tw:max-[620px]:flex-col tw:max-[620px]:items-start">
						<div class="tw:min-w-0">
							<div class="tw:mb-1 tw:flex tw:flex-wrap tw:gap-x-3 tw:gap-y-1 tw:text-[0.62rem] tw:text-ink-faint">
								<span>{item.entry.typeLabel}</span>
								<span>{item.entry.sortDate ?? 'sin fecha'}</span>
								{#if !item.entry.isPublic}<span class="tw:text-warning">Privada</span>{/if}
							</div>
							<strong class="tw:block tw:text-xs tw:font-medium tw:leading-snug tw:text-ink">{item.entry.title}</strong>
						</div>
						<div class="tw:flex tw:shrink-0 tw:gap-1.5">
							<form method="POST" action="?/featured" use:enhance={featuredSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={item.relation.portfolioSlug} />
								<input type="hidden" name="entityType" value={item.relation.entityType} />
								<input type="hidden" name="entityId" value={item.relation.entityId} />
								<Button
									type="submit"
									variant="ghost"
									size="icon"
									class={item.relation.featured ? 'tw:text-warning tw:hover:text-warning' : 'tw:text-rule-strong'}
									disabled={isPending('featured', item.relation)}
									aria-label={`${item.relation.featured ? 'Desactivar destacado de' : 'Destacar'} ${item.entry.title}`}
									title={item.relation.featured ? 'Desactivar destacado' : 'Destacar en la ficha'}
								>★</Button>
							</form>
							<form method="POST" action="?/remove" use:enhance={removeSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={item.relation.portfolioSlug} />
								<input type="hidden" name="entityType" value={item.relation.entityType} />
								<input type="hidden" name="entityId" value={item.relation.entityId} />
								<Button
									type="submit"
									variant="danger"
									size="sm"
									disabled={isPending('remove', item.relation)}
								>Eliminar</Button>
							</form>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</section>

	<section class="tw:min-w-0 tw:border-t tw:border-rule" aria-labelledby="add-title">
		<header class="tw:py-4">
			<p class="tw:m-0 tw:text-[0.68rem] tw:uppercase tw:tracking-[0.1em] tw:text-ink-faint">Añadir resultados</p>
			<h2 class="tw:mt-1 tw:mb-0 tw:text-base tw:text-ink" id="add-title">Buscar entradas</h2>
		</header>
		<div class="tw:grid tw:grid-cols-[minmax(0,1fr)_10rem] tw:gap-3 tw:border-t tw:border-rule tw:pt-4 tw:max-[620px]:grid-cols-1">
			<AdminField label="Buscar por título">
				<Input type="search" bind:value={query} placeholder="Escribe para filtrar…" />
			</AdminField>
			<AdminField label="Tipo">
				<Select bind:value={type}>
					<option value="">Todos</option>
					{#each typeOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</Select>
			</AdminField>
		</div>
		<p class="tw:m-0 tw:px-0 tw:py-3 tw:text-[0.68rem] tw:text-ink-faint">{availableEntries.length} entradas disponibles</p>

		{#if availableEntries.length === 0}
			<p class="tw:m-0 tw:border-t tw:border-rule tw:px-4 tw:py-8 tw:text-center tw:text-xs tw:text-ink-faint">No hay entradas disponibles con estos filtros.</p>
		{:else}
			<ul class="tw:m-0 tw:max-h-[55rem] tw:list-none tw:overflow-y-auto tw:border-t tw:border-rule tw:p-0">
				{#each availableEntries as entry (entryKey(entry))}
					<li class="tw:flex tw:min-w-0 tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-rule tw:px-2 tw:py-3 tw:max-[620px]:flex-col tw:max-[620px]:items-start">
						<div class="tw:min-w-0">
							<div class="tw:mb-1 tw:flex tw:flex-wrap tw:gap-x-3 tw:gap-y-1 tw:text-[0.62rem] tw:text-ink-faint">
								<span>{entry.typeLabel}</span>
								<span>{entry.sortDate ?? 'sin fecha'}</span>
								{#if !entry.isPublic}<span class="tw:text-warning">Privada</span>{/if}
								{#if entryRelationCount(entry) > 0}
									<span>{entryRelationCount(entry)} {entryRelationCount(entry) === 1 ? 'ficha' : 'fichas'}</span>
								{/if}
							</div>
							<strong class="tw:block tw:text-xs tw:font-medium tw:leading-snug tw:text-ink">{entry.title}</strong>
						</div>
						<form method="POST" action="?/add" use:enhance={addSubmit(entry)}>
							<input type="hidden" name="portfolioSlug" value={selectedSlug} />
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<Button
								type="submit"
								variant="primary"
								size="sm"
								class="tw:min-w-24 tw:max-[620px]:w-full"
								disabled={isPending('add', { portfolioSlug: selectedSlug, entityType: entry.entityType, entityId: entry.entityId })}
							>+ Añadir</Button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
