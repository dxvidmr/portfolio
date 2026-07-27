<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
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
	let pendingMode = $state<'date' | 'manual' | null>(null);
	const entryKey = (entry: Entry) => `${entry.entityType}:${entry.entityId}`;
	const serializedOrder = $derived(
		JSON.stringify(entries.map((entry) => ({ entityType: entry.entityType, entityId: entry.entityId })))
	);

	const persistOrder = () => window.queueMicrotask(() => orderForm?.requestSubmit());
	const modeSubmit: SubmitFunction = ({ formData }) => {
		const requestedMode = formData.get('mode');
		pendingMode = requestedMode === 'manual' ? 'manual' : 'date';
		return async ({ update }) => {
			try {
				await update({ reset: false });
				entries = data.entries.map((entry) => ({ ...entry }));
			} finally {
				pendingMode = null;
			}
		};
	};
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

<section class="mb-6 flex items-center justify-between gap-4 border-y border-rule py-3 max-[620px]:items-start">
	<div>
		<h2 class="m-0 text-sm">Orden</h2>
		<p class="mt-1 mb-0 text-xs text-ink-faint" aria-live="polite">
			{pendingMode
				? 'Cambiando criterio…'
				: data.orderMode === 'date'
					? 'Más reciente primero.'
					: 'Orden editorial personalizado.'}
		</p>
	</div>
	<form class="flex gap-2" method="POST" action="?/orderMode" use:enhance={modeSubmit}>
		<Button
			type="submit"
			name="mode"
			value="date"
			size="sm"
			variant={data.orderMode === 'date' ? 'primary' : 'ghost'}
			aria-pressed={data.orderMode === 'date'}
			disabled={pendingMode !== null}
		>
			{#if pendingMode === 'date'}
				<LoaderCircle class="animate-spin" size={14} strokeWidth={1.8} aria-hidden="true" />
			{/if}
			Por fecha
		</Button>
		<Button
			type="submit"
			name="mode"
			value="manual"
			size="sm"
			variant={data.orderMode === 'manual' ? 'primary' : 'ghost'}
			aria-pressed={data.orderMode === 'manual'}
			disabled={pendingMode !== null}
		>
			{#if pendingMode === 'manual'}
				<LoaderCircle class="animate-spin" size={14} strokeWidth={1.8} aria-hidden="true" />
			{/if}
			Manual
		</Button>
	</form>
</section>

{#if data.orderMode === 'manual'}
	<form class="hidden" method="POST" action="?/reorder" use:enhance={reorderSubmit} bind:this={orderForm}>
		<input type="hidden" name="order" value={serializedOrder} />
	</form>
{/if}

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
		onreorder={data.orderMode === 'manual' ? persistOrder : undefined}
		reorderable={data.orderMode === 'manual'}
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
