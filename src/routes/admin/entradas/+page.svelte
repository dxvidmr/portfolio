<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
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

<div class="filters" aria-label="Filtros de entradas">
	<label>
		<span>Buscar</span>
		<input type="search" bind:value={query} placeholder="Título…" />
	</label>
	<label>
		<span>Tipo</span>
		<select bind:value={type}>
			<option value="">Todos</option>
			{#each data.entityTypes as type (type.value)}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</label>
	<label>
		<span>Año</span>
		<input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength="4" />
	</label>
	<label>
		<span>Estado</span>
		<select bind:value={visibility}>
			<option value="all">Todos</option>
			<option value="public">Públicas</option>
			<option value="draft">Privadas</option>
		</select>
	</label>
	<label>
		<span>Portada</span>
		<select bind:value={home}>
			<option value="all">Todas</option>
			<option value="yes">Activas</option>
			<option value="no">Inactivas</option>
		</select>
	</label>
	<label>
		<span>Relaciones</span>
		<select bind:value={relations}>
			<option value="all">Todas</option>
			<option value="with">Con relaciones</option>
			<option value="without">Sin relaciones</option>
		</select>
	</label>
	<label>
		<span>Ordenar por</span>
		<select bind:value={sortBy}>
			<option value="fecha">Fecha</option>
			<option value="nombre">Nombre</option>
			<option value="actualizacion">Actualización</option>
		</select>
	</label>
	<div class="filter-actions">
		<button type="button" onclick={resetFilters}>Limpiar filtros</button>
	</div>
</div>

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
								aria-label={`${entry.showHome ? 'Quitar de' : 'Añadir a'} portada: ${entry.title}`}
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
		color: #737373;
	}

	h1 {
		font-size: 1.5rem;
		color: #fafafa;
	}

	.heading-side {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.heading-side > span {
		font-size: 0.75rem;
		color: #737373;
	}

	.heading-side .new {
		border: 1px solid #00ff88;
		color: #00ff88;
		padding: 0.45rem 0.9rem;
		text-decoration: none;
	}

	.heading-side .new:hover {
		background: rgba(0, 255, 136, 0.08);
	}

	.heading-side .new:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.title-link {
		color: inherit;
		text-decoration: none;
	}

	.title-link:hover strong {
		color: #00ff88;
	}

	.title-link:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.filters {
		display: grid;
		grid-template-columns: minmax(12rem, 2fr) repeat(6, minmax(7rem, 1fr));
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #262626;
		background: #111;
		margin-bottom: 1.5rem;
	}

	.filters label {
		display: grid;
		gap: 0.35rem;
	}

	input,
	select {
		min-width: 0;
		background: #0a0a0a;
		border: 1px solid #404040;
		padding: 0.5rem;
		color: #d4d4d4;
	}

	.filter-actions {
		grid-column: 1 / -1;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		align-items: center;
	}

	.filter-actions button {
		border: 1px solid #525252;
		background: transparent;
		padding: 0.45rem 0.75rem;
		color: #d4d4d4;
		cursor: pointer;
	}

	.table-wrap {
		overflow-x: auto;
		border: 1px solid #262626;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.78rem;
	}

	th,
	td {
		padding: 0.75rem;
		border-bottom: 1px solid #262626;
		text-align: left;
		vertical-align: top;
	}

	th {
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #737373;
		background: #111;
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
		color: #e5e5e5;
		margin-bottom: 0.25rem;
	}

	td span,
	.updated {
		font-size: 0.7rem;
		color: #737373;
	}

	td form { margin: 0; }

	td button {
		min-width: 3rem;
		border: 1px solid #404040;
		background: transparent;
		color: #737373;
		padding: 0.3rem 0.55rem;
		cursor: pointer;
	}

	td button.active {
		border-color: #00a85a;
		color: #00ff88;
	}

	td button:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	.empty {
		padding: 2rem;
		text-align: center;
		color: #737373;
	}

	@media (max-width: 1100px) {
		.filters { grid-template-columns: repeat(3, 1fr); }
	}

	@media (max-width: 640px) {
		.filters { grid-template-columns: 1fr; }
		td:first-child { min-width: 16rem; }
	}
</style>
