<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

	type Entry = {
		entityType: string;
		entityId: number;
		typeLabel: string;
		title: string;
		sortDate: string | null;
		isPublic: boolean;
	};
	type Relation = {
		portfolioSlug: string;
		entityType: string;
		entityId: number;
		featured: boolean;
	};

	let {
		portfolioSlug,
		entries,
		initialRelations
	}: {
		portfolioSlug: string;
		entries: Entry[];
		initialRelations: Relation[];
	} = $props();

	const initialData = untrack(() => ({ entries, initialRelations }));
	const entryMap = new Map(initialData.entries.map((entry) => [`${entry.entityType}:${entry.entityId}`, entry]));
	let relations = $state(initialData.initialRelations.map((relation) => ({ ...relation })));
	let query = $state('');
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
		return (b.sortDate ?? '').localeCompare(a.sortDate ?? '') || a.title.localeCompare(b.title, 'es');
	};

	let typeOptions = $derived.by(() => {
		const labels = new Map<string, string>();
		for (const entry of entries) labels.set(entry.entityType, entry.typeLabel);
		return [...labels].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label, 'es'));
	});
	let currentRelations = $derived.by(() =>
		relations
			.map((relation) => ({ relation, entry: entryMap.get(`${relation.entityType}:${relation.entityId}`) }))
			.filter((item): item is { relation: Relation; entry: Entry } => Boolean(item.entry))
			.sort((a, b) => compareEntries(a.entry, b.entry))
	);
	let availableEntries = $derived.by(() => {
		const normalizedQuery = normalize(query.trim());
		const related = new Set(relations.map((relation) => `${relation.entityType}:${relation.entityId}`));
		return entries
			.filter((entry) => !related.has(entryKey(entry)))
			.filter((entry) => !type || entry.entityType === type)
			.filter((entry) => !normalizedQuery || normalize(`${entry.title} ${entry.typeLabel}`).includes(normalizedQuery))
			.sort(compareEntries);
	});
	const entryRelationCount = (entry: Entry) =>
		relations.filter((relation) => relation.entityType === entry.entityType && relation.entityId === entry.entityId).length;
	const isPending = (operation: string, relation: Pick<Relation, 'portfolioSlug' | 'entityType' | 'entityId'>) =>
		pending.includes(`${operation}:${relationKey(relation)}`);

	const addSubmit = (entry: Entry): SubmitFunction =>
		({ formData }) => {
			const optimistic: Relation = {
				portfolioSlug: String(formData.get('portfolioSlug') ?? ''),
				entityType: entry.entityType,
				entityId: entry.entityId,
				featured: false
			};
			const key = `add:${relationKey(optimistic)}`;
			const existed = relations.some((relation) => relationKey(relation) === relationKey(optimistic));
			if (!existed) relations = [...relations, optimistic];
			pending = [...pending, key];
			return async ({ result, update }) => {
				if (result.type !== 'success' && !existed) relations = relations.filter((relation) => relationKey(relation) !== relationKey(optimistic));
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
</script>

<div class="grid grid-cols-2 items-start gap-8 max-[960px]:grid-cols-1">
	<section class="min-w-0 border-t border-rule" aria-labelledby="related-title">
		<header class="flex items-end justify-between gap-4 py-4">
			<div><p class="m-0 text-[0.68rem] uppercase tracking-[0.1em] text-ink-faint">Selección actual</p><h2 class="mt-1 mb-0 text-base text-ink" id="related-title">Trabajos relacionados</h2></div>
			<span class="text-[0.68rem] text-ink-faint">Orden cronológico</span>
		</header>
		{#if currentRelations.length === 0}
			<p class="m-0 border-t border-rule px-4 py-8 text-center text-xs text-ink-faint">Esta ficha todavía no tiene trabajos relacionados.</p>
		{:else}
			<ol class="m-0 list-none border-t border-rule p-0">
				{#each currentRelations as item (`${item.relation.entityType}:${item.relation.entityId}`)}
					<li class="flex min-w-0 items-center justify-between gap-4 border-b border-rule px-2 py-3 max-[620px]:flex-col max-[620px]:items-start">
						<div class="min-w-0"><div class="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.62rem] text-ink-faint"><span>{item.entry.typeLabel}</span><span>{item.entry.sortDate ?? 'sin fecha'}</span>{#if !item.entry.isPublic}<span class="text-warning">Privada</span>{/if}</div><strong class="block text-xs font-medium leading-snug text-ink">{item.entry.title}</strong></div>
						<div class="flex shrink-0 gap-1.5">
							<form method="POST" action="?/featured" use:enhance={featuredSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={portfolioSlug} /><input type="hidden" name="entityType" value={item.relation.entityType} /><input type="hidden" name="entityId" value={item.relation.entityId} />
								<Button type="submit" variant="ghost" size="icon" class={item.relation.featured ? 'text-warning hover:text-warning' : 'text-rule-strong'} disabled={isPending('featured', item.relation)} aria-label={`${item.relation.featured ? 'Desactivar destacado de' : 'Destacar'} ${item.entry.title}`} title={item.relation.featured ? 'Desactivar destacado' : 'Destacar en la ficha'}>★</Button>
							</form>
							<form method="POST" action="?/remove" use:enhance={removeSubmit(item.relation)}>
								<input type="hidden" name="portfolioSlug" value={portfolioSlug} /><input type="hidden" name="entityType" value={item.relation.entityType} /><input type="hidden" name="entityId" value={item.relation.entityId} />
								<Button type="submit" variant="danger" size="sm" disabled={isPending('remove', item.relation)}>Eliminar</Button>
							</form>
						</div>
					</li>
				{/each}
			</ol>
		{/if}
	</section>

	<section class="min-w-0 border-t border-rule" aria-labelledby="add-title">
		<header class="py-4"><p class="m-0 text-[0.68rem] uppercase tracking-[0.1em] text-ink-faint">Añadir resultados</p><h2 class="mt-1 mb-0 text-base text-ink" id="add-title">Buscar entradas</h2></header>
		<div class="grid grid-cols-[minmax(0,1fr)_10rem] gap-3 border-t border-rule pt-4 max-[620px]:grid-cols-1">
			<AdminField label="Buscar por título"><Input type="search" bind:value={query} placeholder="Escribe para filtrar…" /></AdminField>
			<AdminField label="Tipo"><Select bind:value={type}><option value="">Todos</option>{#each typeOptions as option (option.value)}<option value={option.value}>{option.label}</option>{/each}</Select></AdminField>
		</div>
		<p class="m-0 py-3 text-[0.68rem] text-ink-faint">{availableEntries.length} entradas disponibles</p>
		{#if availableEntries.length === 0}
			<p class="m-0 border-t border-rule px-4 py-8 text-center text-xs text-ink-faint">No hay entradas disponibles con estos filtros.</p>
		{:else}
			<ul class="m-0 max-h-[55rem] list-none overflow-y-auto border-t border-rule p-0">
				{#each availableEntries as entry (entryKey(entry))}
					<li class="flex min-w-0 items-center justify-between gap-4 border-b border-rule px-2 py-3 max-[620px]:flex-col max-[620px]:items-start">
						<div class="min-w-0"><div class="mb-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.62rem] text-ink-faint"><span>{entry.typeLabel}</span><span>{entry.sortDate ?? 'sin fecha'}</span>{#if !entry.isPublic}<span class="text-warning">Privada</span>{/if}{#if entryRelationCount(entry) > 0}<span>{entryRelationCount(entry)} {entryRelationCount(entry) === 1 ? 'ficha' : 'fichas'}</span>{/if}</div><strong class="block text-xs font-medium leading-snug text-ink">{entry.title}</strong></div>
						<form method="POST" action="?/add" use:enhance={addSubmit(entry)}><input type="hidden" name="portfolioSlug" value={portfolioSlug} /><input type="hidden" name="entityType" value={entry.entityType} /><input type="hidden" name="entityId" value={entry.entityId} /><Button type="submit" variant="primary" size="sm" class="min-w-24 max-[620px]:w-full" disabled={isPending('add', { portfolioSlug, entityType: entry.entityType, entityId: entry.entityId })}>+ Añadir</Button></form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
