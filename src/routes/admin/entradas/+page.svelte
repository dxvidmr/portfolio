<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type Entry = PageData['entries'][number];
	type Control = 'public' | 'home';

	const initialData = untrack(() => data);
	let entries = $state(initialData.entries.map((entry) => ({ ...entry })));
	let query = $state(initialData.filters.query);
	let type = $state(initialData.filters.type);
	let year = $state(initialData.filters.year);
	let visibility = $state(initialData.filters.visibility);
	let home = $state(initialData.filters.home);
	let relations = $state(initialData.filters.relations);
	let pending = $state<string[]>([]);

	const normalize = (value: string) => value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');

	let sortBy = $state<'fecha' | 'nombre' | 'actualizacion'>('fecha');
	let activeFilterCount = $derived(
		[query.trim(), type, year.trim(), visibility !== 'all', home !== 'all', relations !== 'all']
			.filter(Boolean).length
	);

	const comparators: Record<typeof sortBy, (a: Entry, b: Entry) => number> = {
		// Fecha transversal descendente, sin fecha al final (orden del servidor).
		fecha: (a, b) => {
			if (a.sortDate == null && b.sortDate == null) return a.title.localeCompare(b.title, 'es');
			if (a.sortDate == null) return 1;
			if (b.sortDate == null) return -1;
			return b.sortDate.localeCompare(a.sortDate);
		},
		nombre: (a, b) => a.title.localeCompare(b.title, 'es'),
		// Última actualización del control descendente; sin control al final.
		actualizacion: (a, b) => {
			if (a.updatedAt == null && b.updatedAt == null) return a.title.localeCompare(b.title, 'es');
			if (a.updatedAt == null) return 1;
			if (b.updatedAt == null) return -1;
			return b.updatedAt.localeCompare(a.updatedAt);
		}
	};

	let filteredEntries = $derived.by(() => {
		const normalizedQuery = normalize(query.trim());
		const validYear = /^\d{4}$/.test(year.trim()) ? year.trim() : '';
		return entries
			.filter((entry) => {
				if (normalizedQuery && !normalize(entry.title).includes(normalizedQuery)) return false;
				if (type && entry.entityType !== type) return false;
				if (validYear && entry.sortDate?.slice(0, 4) !== validYear) return false;
				if (visibility === 'public' && !entry.isPublic) return false;
				if (visibility === 'draft' && entry.isPublic) return false;
				if (home === 'yes' && !entry.showHome) return false;
				if (home === 'no' && entry.showHome) return false;
				if (relations === 'with' && entry.relationCount === 0) return false;
				if (relations === 'without' && entry.relationCount > 0) return false;
				return true;
			})
			.toSorted(comparators[sortBy]);
	});

	function resetFilters() {
		query = '';
		type = '';
		year = '';
		visibility = 'all';
		home = 'all';
		relations = 'all';
		sortBy = 'fecha';
	}

	const controlSubmit = (entry: Entry, control: Control): SubmitFunction =>
		({ formData }) => {
			const key = `${entry.entityType}:${entry.entityId}:${control}`;
			const previous = { ...entry };
			const enabled = control === 'public' ? !entry.isPublic : !entry.showHome;
			formData.set('enabled', enabled ? '1' : '0');
			pending = [...pending, key];

			if (control === 'public') {
				entry.isPublic = enabled;
				if (!enabled) {
					entry.showHome = false;
					entry.homeOrder = 0;
				}
			} else {
				entry.showHome = enabled;
				if (enabled) entry.isPublic = true;
				else entry.homeOrder = 0;
			}

			return async ({ result, update }) => {
				if (result.type === 'success' && result.data?.entry) {
					entry.isPublic = result.data.entry.isPublic;
					entry.showHome = result.data.entry.showHome;
					entry.homeOrder = result.data.entry.homeOrder;
					entry.updatedAt = result.data.entry.updatedAt;
				} else {
					Object.assign(entry, previous);
				}
				pending = pending.filter((item) => item !== key);
				await update({ reset: false, invalidateAll: false });
			};
		};

	const isPending = (entry: Entry, control: Control) =>
		pending.includes(`${entry.entityType}:${entry.entityId}:${control}`);
</script>

<svelte:head>
	<title>Entradas · cv/admin</title>
</svelte:head>

<div class="heading">
	<div>
		<p class="eyebrow">Índice transversal</p>
		<h1>Entradas</h1>
	</div>
	<div class="heading-side">
		<span>{filteredEntries.length} de {entries.length} entradas</span>
		<a class="new" href="/admin/entradas/nueva" data-sveltekit-preload-data="off">Nueva entrada</a>
	</div>
</div>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success} />
	{/key}
{/if}
{#if page.url.searchParams.get('eliminada') === '1'}
	<AdminToast message="Entrada eliminada." success={true} />
{/if}

<section class="filters" aria-label="Filtros de entradas">
	<div class="filter-search">
		<label>
			<span>Buscar entradas</span>
			<input type="search" bind:value={query} placeholder="Título de la entrada…" />
		</label>
		<div class="filter-summary" aria-live="polite">
			<strong>{filteredEntries.length}</strong>
			<span>resultados</span>
		</div>
	</div>

	<div class="filter-primary">
		<label>
			<span>Tipo</span>
			<select bind:value={type}>
				<option value="">Todos los tipos</option>
				{#each data.entityTypes as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</select>
		</label>
		<label>
			<span>Visibilidad</span>
			<select bind:value={visibility}>
				<option value="all">Públicas y privadas</option>
				<option value="public">Solo públicas</option>
				<option value="draft">Solo privadas</option>
			</select>
		</label>
		<label>
			<span>Orden</span>
			<select bind:value={sortBy}>
				<option value="fecha">Más recientes primero</option>
				<option value="nombre">Nombre A–Z</option>
				<option value="actualizacion">Última modificación</option>
			</select>
		</label>
	</div>

	<details class="filter-advanced" open={Boolean(year || home !== 'all' || relations !== 'all')}>
		<summary><ListFilter size={14} strokeWidth={1.8} aria-hidden="true" /> Más filtros</summary>
		<div>
			<label>
				<span>Año</span>
				<input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="AAAA" />
			</label>
			<label>
				<span>Portada</span>
				<select bind:value={home}>
					<option value="all">En cualquier estado</option>
					<option value="yes">En portada</option>
					<option value="no">Fuera de portada</option>
				</select>
			</label>
			<label>
				<span>Relaciones</span>
				<select bind:value={relations}>
					<option value="all">Con o sin relaciones</option>
					<option value="with">Con relaciones</option>
					<option value="without">Sin relaciones</option>
				</select>
			</label>
		</div>
	</details>

	<div class="filter-actions">
		<span>{activeFilterCount === 0 ? 'Sin filtros activos' : `${activeFilterCount} filtros activos`}</span>
		<button type="button" onclick={resetFilters} disabled={activeFilterCount === 0 && sortBy === 'fecha'}>
			Limpiar
		</button>
	</div>
</section>

<div class="table-wrap">
	<table>
		<thead>
			<tr>
				<th>Entrada</th>
				<th>Fecha</th>
				<th>Rel.</th>
				<th>Pública</th>
				<th>Portada</th>
				<th>Actualización</th>
			</tr>
		</thead>
		<tbody>
			{#each filteredEntries as entry (`${entry.entityType}:${entry.entityId}`)}
				<tr>
					<td>
						{#if data.editableTypes.includes(entry.entityType)}
							<a
								class="title-link"
								href={`/admin/entradas/${entry.entityType}/${entry.entityId}`}
								data-sveltekit-preload-data="off"
							>
								<strong>{entry.title}</strong>
							</a>
						{:else}
							<strong>{entry.title}</strong>
						{/if}
						<span>{entry.typeLabel} · #{entry.entityId}</span>
					</td>
					<td>{entry.sortDate ?? '—'}</td>
					<td>{entry.relationCount}</td>
					<td>
						<form method="POST" action="?/control" use:enhance={controlSubmit(entry, 'public')}>
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<input type="hidden" name="control" value="public" />
							<button
								type="submit"
								name="enabled"
								value={entry.isPublic ? '0' : '1'}
								class:active={entry.isPublic}
								disabled={isPending(entry, 'public')}
								aria-label={`${entry.isPublic ? 'Despublicar' : 'Publicar'} ${entry.title}`}
							>
								{entry.isPublic ? 'Sí' : 'No'}
							</button>
						</form>
					</td>
					<td>
						<form method="POST" action="?/control" use:enhance={controlSubmit(entry, 'home')}>
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<input type="hidden" name="control" value="home" />
							<button
								type="submit"
								name="enabled"
								value={entry.showHome ? '0' : '1'}
								class:active={entry.showHome}
								disabled={isPending(entry, 'home')}
								aria-label={`${entry.showHome ? 'Eliminar de' : 'Añadir a'} portada: ${entry.title}`}
							>
								{entry.showHome ? 'Sí' : 'No'}
							</button>
						</form>
					</td>
					<td class="updated">{entry.updatedAt ?? '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if filteredEntries.length === 0}
	<p class="empty">No hay entradas que coincidan con estos filtros.</p>
{/if}

<style>
	.heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.eyebrow,
	.filters label span {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--fg-faint);
	}

	h1 {
		font-size: 1.5rem;
		color: var(--fg);
	}

	.heading-side {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.heading-side > span {
		font-size: 0.75rem;
		color: var(--fg-faint);
	}

	.heading-side .new {
		border: 1px solid var(--accent-strong);
		color: var(--accent-strong);
		padding: 0.45rem 0.9rem;
		text-decoration: none;
	}

	.heading-side .new:hover {
		background: var(--accent-wash);
	}

	.heading-side .new:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	.title-link {
		color: inherit;
		text-decoration: none;
	}

	.title-link:hover strong {
		color: var(--accent-strong);
	}

	.title-link:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	.filters {
		display: grid;
		gap: 1rem;
		padding: clamp(0.8rem, 2vw, 1.15rem);
		border: 1px solid var(--line);
		background: var(--admin-surface);
		margin-bottom: 1.5rem;
	}

	.filters label,
	.filter-search {
		display: grid;
		gap: 0.35rem;
	}

	.filter-search {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
	}

	.filter-search label {
		max-width: 48rem;
	}

	.filter-summary {
		display: grid;
		min-width: 6rem;
		color: var(--fg-dim);
		text-align: right;
	}

	.filter-summary strong {
		color: var(--fg);
		font-family: var(--font-title);
		font-size: 1.35rem;
		font-weight: 500;
		line-height: 1;
	}

	.filter-summary span,
	.filter-actions > span {
		color: var(--fg-faint);
		font-size: 0.65rem;
	}

	.filter-primary,
	.filter-advanced > div {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.filter-advanced {
		padding: 0.75rem;
		border: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg) 45%, transparent);
	}

	.filter-advanced summary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--fg-dim);
		font-size: 0.7rem;
		cursor: pointer;
	}

	.filter-advanced[open] summary {
		margin-bottom: 0.75rem;
	}

	input,
	select {
		min-width: 0;
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.5rem;
		color: var(--fg);
	}

	.filter-actions {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.filter-actions button {
		border: 1px solid var(--line-strong);
		background: transparent;
		padding: 0.45rem 0.75rem;
		color: var(--fg);
		cursor: pointer;
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid var(--line);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.78rem;
	}

	th,
	td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--line);
		text-align: left;
		vertical-align: top;
	}

	th {
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-faint);
		background: var(--admin-surface);
	}

	td:first-child {
		min-width: 22rem;
	}

	td strong,
	td span {
		display: block;
	}

	td strong {
		font-weight: 500;
		color: var(--fg);
		margin-bottom: 0.25rem;
	}

	td span,
	.updated {
		font-size: 0.7rem;
		color: var(--fg-faint);
	}

	td form { margin: 0; }

	td button {
		min-width: 3rem;
		border: 1px solid var(--line);
		background: transparent;
		color: var(--fg-faint);
		padding: 0.3rem 0.55rem;
		cursor: pointer;
	}

	td button.active {
		border-color: var(--accent);
		color: var(--accent-strong);
	}

	td button:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: var(--fg-faint);
	}

	@media (max-width: 1100px) {
		.filter-primary,
		.filter-advanced > div { grid-template-columns: repeat(2, 1fr); }
	}

	@media (max-width: 640px) {
		.filter-search,
		.filter-primary,
		.filter-advanced > div { grid-template-columns: 1fr; }
		.filter-summary { display: none; }
		td:first-child { min-width: 16rem; }
	}
</style>
