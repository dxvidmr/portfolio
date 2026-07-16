<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Entry = PageData['entries'][number];

	const initialEntries = untrack(() => data.entries);
	let entries = $state(initialEntries.map((entry) => ({ ...entry })));
	let dirty = $state(false);
	let saving = $state(false);
	let removing = $state<string[]>([]);

	let serializedOrder = $derived(
		JSON.stringify(
			entries.map((entry) => ({ entityType: entry.entityType, entityId: entry.entityId }))
		)
	);

	function entryKey(entry: Entry) {
		return `${entry.entityType}:${entry.entityId}`;
	}

	function move(index: number, offset: -1 | 1) {
		const destination = index + offset;
		if (destination < 0 || destination >= entries.length) return;
		[entries[index], entries[destination]] = [entries[destination], entries[index]];
		dirty = true;
	}

	const saveOrder: SubmitFunction = () => {
		saving = true;
		return async ({ result, update }) => {
			if (result.type === 'success') dirty = false;
			saving = false;
			await update({ reset: false, invalidateAll: false });
		};
	};

	const removeEntry = (entry: Entry): SubmitFunction =>
		() => {
			const previousEntries = [...entries];
			const previousDirty = dirty;
			const key = entryKey(entry);
			const currentIndex = entries.findIndex((item) => entryKey(item) === key);
			if (currentIndex !== -1) entries.splice(currentIndex, 1);
			removing = [...removing, key];

			return async ({ result, update }) => {
				if (result.type !== 'success') {
					entries = previousEntries;
					dirty = previousDirty;
				}
				removing = removing.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};
</script>

<svelte:head>
	<title>Portada · cv/admin</title>
</svelte:head>

<AdminPageHeader
	title="Actividad reciente"
	eyebrow="Curación editorial"
	description="Reordena las entradas en pantalla y guarda el conjunto de cambios cuando hayas terminado."
>
	{#snippet actions()}
		<ButtonLink href="/admin/entradas?portada=no" data-sveltekit-preload-data="off"
			>Añadir desde entradas</ButtonLink
		>
	{/snippet}
</AdminPageHeader>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success} />
	{/key}
{/if}

{#if entries.length === 0}
	<div class="border border-warning bg-admin-surface px-4 py-3 text-ink" role="alert">
		<strong class="mb-1 block">No hay entradas seleccionadas.</strong>
		La web pública utilizará automáticamente el fallback de actividad reciente.
	</div>
{:else}
	<div class="flex items-center justify-between gap-4 border border-rule border-b-0 bg-admin-surface px-4 py-3 max-[680px]:flex-col max-[680px]:items-start">
		<span class={dirty ? 'text-xs text-warning' : 'text-xs text-ink-faint'}>
			{dirty ? 'Hay cambios de orden sin guardar' : 'El orden está guardado'}
		</span>
		<form method="POST" action="?/saveOrder" use:enhance={saveOrder}>
			<input type="hidden" name="order" value={serializedOrder} />
			<Button variant="primary" type="submit" disabled={!dirty || saving}>
				{saving ? 'Guardando…' : 'Guardar orden'}
			</Button>
		</form>
	</div>

	<ol class="m-0 list-none border border-rule p-0">
		{#each entries as entry, index (entryKey(entry))}
			<li class="grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-rule bg-admin-surface p-4 last:border-b-0 max-[680px]:grid-cols-[2rem_1fr]">
				<span class="text-lg text-rule-strong">{String(index + 1).padStart(2, '0')}</span>
				<div>
					<strong class="block font-medium text-ink">{entry.title}</strong>
					<span class="mt-1 block text-xs text-ink-faint">{entry.typeLabel} · {entry.sortDate ?? 'sin fecha'}</span>
				</div>
				<div class="flex gap-1.5 max-[680px]:col-start-2">
					<Button
						variant="secondary"
						size="icon"
						type="button"
						disabled={index === 0}
						onclick={() => move(index, -1)}
						aria-label={`Subir ${entry.title}`}
					>↑</Button>
					<Button
						variant="secondary"
						size="icon"
						type="button"
						disabled={index === entries.length - 1}
						onclick={() => move(index, 1)}
						aria-label={`Bajar ${entry.title}`}
					>↓</Button>
					<form method="POST" action="?/remove" use:enhance={removeEntry(entry)}>
						<input type="hidden" name="entityType" value={entry.entityType} />
						<input type="hidden" name="entityId" value={entry.entityId} />
						<Button
							type="submit"
							variant="danger"
							size="sm"
							disabled={removing.includes(entryKey(entry))}
							aria-label={`Eliminar ${entry.title} de portada`}
						>
							Eliminar
						</Button>
					</form>
				</div>
			</li>
		{/each}
	</ol>
{/if}
