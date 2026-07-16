<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
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

<div class="heading">
	<div>
		<p>Curación editorial</p>
		<h1>Actividad reciente</h1>
	</div>
	<a href="/admin/entradas?portada=no" data-sveltekit-preload-data="off">Añadir desde entradas</a>
</div>

<p class="intro">
	Reordena las entradas en pantalla y guarda el conjunto de cambios cuando hayas terminado.
</p>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success} />
	{/key}
{/if}

{#if entries.length === 0}
	<div class="warning" role="alert">
		<strong>No hay entradas seleccionadas.</strong>
		La web pública utilizará automáticamente el fallback de actividad reciente.
	</div>
{:else}
	<div class="order-toolbar">
		<span class:pending-order={dirty}>
			{dirty ? 'Hay cambios de orden sin guardar' : 'El orden está guardado'}
		</span>
		<form method="POST" action="?/saveOrder" use:enhance={saveOrder}>
			<input type="hidden" name="order" value={serializedOrder} />
			<button type="submit" disabled={!dirty || saving}>
				{saving ? 'Guardando…' : 'Guardar orden'}
			</button>
		</form>
	</div>

	<ol class="home-list">
		{#each entries as entry, index (entryKey(entry))}
			<li>
				<span class="position">{String(index + 1).padStart(2, '0')}</span>
				<div class="entry">
					<strong>{entry.title}</strong>
					<span>{entry.typeLabel} · {entry.sortDate ?? 'sin fecha'}</span>
				</div>
				<div class="controls">
					<button
						type="button"
						disabled={index === 0}
						onclick={() => move(index, -1)}
						aria-label={`Subir ${entry.title}`}
					>↑</button>
					<button
						type="button"
						disabled={index === entries.length - 1}
						onclick={() => move(index, 1)}
						aria-label={`Bajar ${entry.title}`}
					>↓</button>
					<form method="POST" action="?/remove" use:enhance={removeEntry(entry)}>
						<input type="hidden" name="entityType" value={entry.entityType} />
						<input type="hidden" name="entityId" value={entry.entityId} />
						<button
							type="submit"
							class="remove"
							disabled={removing.includes(entryKey(entry))}
							aria-label={`Eliminar ${entry.title} de portada`}
						>
							Eliminar
						</button>
					</form>
				</div>
			</li>
		{/each}
	</ol>
{/if}

<style>
	.heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
	}

	.heading p {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	h1 {
		font-size: 1.5rem;
		color: var(--fg);
	}

	.heading a {
		border: 1px solid var(--line-strong);
		padding: 0.5rem 0.75rem;
		color: var(--fg);
		font-size: 0.78rem;
	}

	.intro {
		color: var(--fg-dim);
		max-width: 70ch;
		line-height: 1.6;
		margin: 1rem 0 1.5rem;
	}

	.warning {
		padding: 0.8rem 1rem;
		background: var(--admin-surface);
		border-left: 2px solid;
	}

	.warning { border-color: var(--tone-amber); color: var(--fg); }
	.warning strong { display: block; margin-bottom: 0.35rem; }

	.order-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border: 1px solid var(--line);
		border-bottom: 0;
		background: var(--admin-surface);
	}

	.order-toolbar span {
		font-size: 0.75rem;
		color: var(--fg-faint);
	}

	.order-toolbar .pending-order { color: var(--tone-amber); }
	.order-toolbar form { margin: 0; }

	.order-toolbar button {
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent-strong);
		padding: 0.45rem 0.8rem;
		cursor: pointer;
	}

	.order-toolbar button:disabled {
		border-color: var(--line);
		color: var(--fg-faint);
		cursor: not-allowed;
	}

	.home-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--line);
	}

	.home-list li {
		display: grid;
		grid-template-columns: 3rem minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid var(--line);
		background: var(--admin-surface);
	}

	.home-list li:last-child { border-bottom: 0; }

	.position {
		font-size: 1.1rem;
		color: var(--line-strong);
	}

	.entry strong,
	.entry span { display: block; }
	.entry strong { color: var(--fg); font-weight: 500; }
	.entry span { color: var(--fg-faint); font-size: 0.72rem; margin-top: 0.3rem; }

	.controls {
		display: flex;
		gap: 0.4rem;
	}

	.controls form { margin: 0; }

	.controls button {
		border: 1px solid var(--line);
		background: transparent;
		color: var(--fg);
		padding: 0.35rem 0.6rem;
		cursor: pointer;
	}

	.controls button:hover:not(:disabled) { border-color: var(--fg-faint); }
	.controls button:disabled { opacity: 0.25; cursor: not-allowed; }
	.controls .remove { color: var(--admin-danger); }

	@media (max-width: 680px) {
		.heading { align-items: flex-start; flex-direction: column; }
		.order-toolbar { align-items: flex-start; flex-direction: column; }
		.home-list li { grid-template-columns: 2rem 1fr; }
		.controls { grid-column: 2; }
	}
</style>
