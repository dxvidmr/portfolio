<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	type Entry = PageData['entries'][number];

	const initialEntries = untrack(() => data.entries);
	let entries = $state(initialEntries.map((entry) => ({ ...entry })));
	let orderForm = $state<HTMLFormElement | null>(null);
	let removing = $state<string[]>([]);
	const entryKey = (entry: Entry) => `${entry.entityType}:${entry.entityId}`;
	const serializedOrder = $derived(
		JSON.stringify(entries.map((entry) => ({ entityType: entry.entityType, entityId: entry.entityId })))
	);

	const persistOrder = () => window.queueMicrotask(() => orderForm?.requestSubmit());
	const reorderSubmit: SubmitFunction = () =>
		async ({ result, update }) => {
			if (result.type !== 'success') entries = initialEntries.map((entry) => ({ ...entry }));
			await update({ reset: false });
		};
	const removeEntry = (entry: Entry): SubmitFunction =>
		() => {
			const previousEntries = [...entries];
			const key = entryKey(entry);
			entries = entries.filter((item) => entryKey(item) !== key);
			removing = [...removing, key];
			return async ({ result, update }) => {
				if (result.type !== 'success') entries = previousEntries;
				removing = removing.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};
</script>

<svelte:head><title>Actividad · cv/admin</title></svelte:head>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success} />{/key}
{/if}

<AdminPageHeader
	title="Actividad reciente"
	eyebrow="Gestión de entradas"
	description="Entradas del CV a mostrar en la Actividad reciente."
>
	{#snippet actions()}
		<ButtonLink href="/admin/entradas?actividad=no" data-sveltekit-preload-data="off">Añadir desde entradas</ButtonLink>
	{/snippet}
</AdminPageHeader>

<form class="hidden" method="POST" action="?/reorder" use:enhance={reorderSubmit} bind:this={orderForm}>
	<input type="hidden" name="order" value={serializedOrder} />
</form>

{#if entries.length === 0}
	<div class="border border-warning bg-admin-surface px-4 py-3 text-ink" role="alert">
		<strong class="mb-1 block">No hay entradas seleccionadas.</strong>
		La web pública utilizará automáticamente el fallback de actividad reciente.
	</div>
{:else}
	<SortableList
		bind:items={entries}
		getKey={entryKey}
		getLabel={(entry) => entry.title}
		onreorder={persistOrder}
	>
		{#snippet children(entry)}
			<strong class="block font-title text-lg font-medium text-ink">{entry.title}</strong>
			<span class="mt-1 block font-mono text-[0.62rem] text-ink-faint">{entry.typeLabel} · {entry.sortDate ?? 'sin fecha'}</span>
		{/snippet}
		{#snippet actions(entry)}
			<form method="POST" action="?/remove" use:enhance={removeEntry(entry)}>
				<input type="hidden" name="entityType" value={entry.entityType} />
				<input type="hidden" name="entityId" value={entry.entityId} />
				<Button type="submit" variant="danger" size="sm" disabled={removing.includes(entryKey(entry))} aria-label={`Eliminar ${entry.title} de actividad`}>Eliminar</Button>
			</form>
		{/snippet}
	</SortableList>
{/if}
