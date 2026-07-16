<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
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
	const tableHeadingClass =
		'border-b border-rule bg-[var(--admin-surface)] p-3 text-left align-top text-[0.68rem] tracking-[0.08em] text-ink-faint uppercase';
	const tableCellClass = 'border-b border-rule p-3 text-left align-top';
</script>

<svelte:head>
	<title>Entradas · cv/admin</title>
</svelte:head>

<AdminPageHeader title="Entradas" eyebrow="Índice transversal">
	{#snippet actions()}
		<span class="text-xs text-ink-faint">{filteredEntries.length} de {entries.length} entradas</span>
		<ButtonLink variant="primary" href="/admin/entradas/nueva" data-sveltekit-preload-data="off"
			>Nueva entrada</ButtonLink
		>
	{/snippet}
</AdminPageHeader>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success} />
	{/key}
{/if}
{#if page.url.searchParams.get('eliminada') === '1'}
	<AdminToast message="Entrada eliminada." success={true} />
{/if}

<section class="mb-6 grid gap-4 rounded-ui border border-rule bg-[var(--admin-surface)] p-[clamp(0.8rem,2vw,1.15rem)]" aria-label="Filtros de entradas">
	<div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-[640px]:grid-cols-1">
		<AdminField class="max-w-3xl" label="Buscar entradas">
			<Input type="search" bind:value={query} placeholder="Título de la entrada…" />
		</AdminField>
		<div class="grid min-w-24 text-right text-ink-dim max-[640px]:hidden" aria-live="polite">
			<strong class="font-title text-[1.35rem] font-medium leading-none text-ink">{filteredEntries.length}</strong>
			<span class="text-[0.65rem] text-ink-faint">resultados</span>
		</div>
	</div>

	<div class="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
		<AdminField label="Tipo">
			<Select bind:value={type}>
				<option value="">Todos los tipos</option>
				{#each data.entityTypes as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</Select>
		</AdminField>
		<AdminField label="Visibilidad">
			<Select bind:value={visibility}>
				<option value="all">Públicas y privadas</option>
				<option value="public">Solo públicas</option>
				<option value="draft">Solo privadas</option>
			</Select>
		</AdminField>
		<AdminField label="Orden">
			<Select bind:value={sortBy}>
				<option value="fecha">Más recientes primero</option>
				<option value="nombre">Nombre A–Z</option>
				<option value="actualizacion">Última modificación</option>
			</Select>
		</AdminField>
	</div>

	<details class="rounded-ui border border-rule bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] p-3 [&[open]>summary]:mb-3" open={Boolean(year || home !== 'all' || relations !== 'all')}>
		<summary class="inline-flex cursor-pointer items-center gap-1.5 text-[0.7rem] text-ink-dim"><ListFilter size={14} strokeWidth={1.8} aria-hidden="true" /> Más filtros</summary>
		<div class="grid grid-cols-3 gap-3 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
			<AdminField label="Año">
				<Input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength={4} placeholder="AAAA" />
			</AdminField>
			<AdminField label="Portada">
				<Select bind:value={home}>
					<option value="all">En cualquier estado</option>
					<option value="yes">En portada</option>
					<option value="no">Fuera de portada</option>
				</Select>
			</AdminField>
			<AdminField label="Relaciones">
				<Select bind:value={relations}>
					<option value="all">Con o sin relaciones</option>
					<option value="with">Con relaciones</option>
					<option value="without">Sin relaciones</option>
				</Select>
			</AdminField>
		</div>
	</details>

	<div class="flex items-center justify-end gap-3">
		<span class="text-[0.65rem] text-ink-faint">{activeFilterCount === 0 ? 'Sin filtros activos' : `${activeFilterCount} filtros activos`}</span>
		<Button onclick={resetFilters} disabled={activeFilterCount === 0 && sortBy === 'fecha'}>Limpiar</Button>
	</div>
</section>

<div class="overflow-x-auto rounded-ui border border-rule">
	<table class="w-full border-collapse text-[0.78rem]">
		<thead>
			<tr>
				<th class={tableHeadingClass}>Entrada</th>
				<th class={tableHeadingClass}>Fecha</th>
				<th class={tableHeadingClass}>Rel.</th>
				<th class={tableHeadingClass}>Pública</th>
				<th class={tableHeadingClass}>Portada</th>
				<th class={tableHeadingClass}>Actualización</th>
			</tr>
		</thead>
		<tbody>
			{#each filteredEntries as entry (`${entry.entityType}:${entry.entityId}`)}
				<tr>
					<td class="{tableCellClass} min-w-[22rem] max-[640px]:min-w-[16rem]">
						{#if data.editableTypes.includes(entry.entityType)}
							<a
								class="group text-inherit focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong"
								href={`/admin/entradas/${entry.entityType}/${entry.entityId}`}
								data-sveltekit-preload-data="off"
							>
								<strong class="mb-1 block font-medium text-ink group-hover:text-accent-strong">{entry.title}</strong>
							</a>
						{:else}
							<strong class="mb-1 block font-medium text-ink">{entry.title}</strong>
						{/if}
						<span class="block text-[0.7rem] text-ink-faint">{entry.typeLabel} · #{entry.entityId}</span>
					</td>
					<td class={tableCellClass}>{entry.sortDate ?? '—'}</td>
					<td class={tableCellClass}>{entry.relationCount}</td>
					<td class={tableCellClass}>
						<form method="POST" action="?/control" use:enhance={controlSubmit(entry, 'public')}>
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<input type="hidden" name="control" value="public" />
							<Button
								variant={entry.isPublic ? 'primary' : 'secondary'}
								size="sm"
								class="min-w-12"
								type="submit"
								name="enabled"
								value={entry.isPublic ? '0' : '1'}
								disabled={isPending(entry, 'public')}
								aria-label={`${entry.isPublic ? 'Despublicar' : 'Publicar'} ${entry.title}`}
							>
								{entry.isPublic ? 'Sí' : 'No'}
							</Button>
						</form>
					</td>
					<td class={tableCellClass}>
						<form method="POST" action="?/control" use:enhance={controlSubmit(entry, 'home')}>
							<input type="hidden" name="entityType" value={entry.entityType} />
							<input type="hidden" name="entityId" value={entry.entityId} />
							<input type="hidden" name="control" value="home" />
							<Button
								variant={entry.showHome ? 'primary' : 'secondary'}
								size="sm"
								class="min-w-12"
								type="submit"
								name="enabled"
								value={entry.showHome ? '0' : '1'}
								disabled={isPending(entry, 'home')}
								aria-label={`${entry.showHome ? 'Eliminar de' : 'Añadir a'} portada: ${entry.title}`}
							>
								{entry.showHome ? 'Sí' : 'No'}
							</Button>
						</form>
					</td>
					<td class="{tableCellClass} text-[0.7rem] text-ink-faint">{entry.updatedAt ?? '—'}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if filteredEntries.length === 0}
	<p class="p-8 text-center text-ink-faint">No hay entradas que coincidan con estos filtros.</p>
{/if}
