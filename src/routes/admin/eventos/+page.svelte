<script lang="ts">
	import ListFilter from '@lucide/svelte/icons/list-filter';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let query = $state('');
	let year = $state('');
	let activity = $state<'all' | 'contribution' | 'service' | 'attendance' | 'empty'>('all');
	let sortBy = $state<'date' | 'name'>('date');
	const normalize = (value: string) =>
		value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	let activeFilterCount = $derived(
		[query.trim(), year.trim(), activity !== 'all'].filter(Boolean).length
	);

	let filtered = $derived.by(() => {
		const q = normalize(query.trim());
		const validYear = /^\d{4}$/.test(year.trim()) ? year.trim() : '';
		return data.events
			.filter((event) => !q || normalize(`${event.title} ${event.place ?? ''} ${event.year ?? ''}`).includes(q))
			.filter((event) => !validYear || String(event.year ?? event.sortDate?.slice(0, 4) ?? '') === validYear)
			.filter((event) => {
				if (activity === 'contribution') return event.contributionCount > 0;
				if (activity === 'service') return event.serviceCount > 0;
				if (activity === 'attendance') return event.hasAttendance;
				if (activity === 'empty') {
					return event.contributionCount === 0 && event.serviceCount === 0 && !event.hasAttendance;
				}
				return true;
			})
			.toSorted((a, b) => {
				if (sortBy === 'name') return a.title.localeCompare(b.title, 'es');
				if (a.sortDate == null && b.sortDate == null) return a.title.localeCompare(b.title, 'es');
				if (a.sortDate == null) return 1;
				if (b.sortDate == null) return -1;
				return b.sortDate.localeCompare(a.sortDate) || a.title.localeCompare(b.title, 'es');
			});
	});

	function resetFilters() {
		query = '';
		year = '';
		activity = 'all';
		sortBy = 'date';
	}
</script>

<svelte:head><title>Eventos · cv/admin</title></svelte:head>

<AdminPageHeader
	title="Eventos"
	eyebrow="Identidad académica compartida"
	description="Un evento puede reunir varias contribuciones y roles. Las fechas de cada actividad se editan dentro de su ficha."
>
	{#snippet actions()}
		<ButtonLink variant="primary" href="/admin/eventos/nuevo">+ Nuevo evento</ButtonLink>
	{/snippet}
</AdminPageHeader>

<section class="tw:my-6 tw:grid tw:gap-4 tw:rounded-ui tw:border tw:border-rule tw:bg-[var(--admin-surface)] tw:p-[clamp(0.8rem,2vw,1.15rem)]" aria-label="Filtros de eventos">
	<div class="tw:grid tw:grid-cols-[minmax(0,1fr)_auto] tw:items-end tw:gap-4 tw:max-[650px]:grid-cols-1">
		<AdminField class="tw:max-w-3xl" label="Buscar eventos">
			<Input type="search" bind:value={query} placeholder="Nombre, lugar o año…" />
		</AdminField>
		<div class="tw:grid tw:min-w-24 tw:text-right tw:text-ink-dim tw:max-[650px]:hidden" aria-live="polite">
			<strong class="tw:font-title tw:text-[1.35rem] tw:font-medium tw:leading-none tw:text-ink">{filtered.length}</strong>
			<span class="tw:text-[0.65rem] tw:text-ink-faint">resultados</span>
		</div>
	</div>

	<div class="tw:grid tw:grid-cols-2 tw:gap-3 tw:max-[650px]:grid-cols-1">
		<AdminField label="Actividad">
			<Select bind:value={activity}>
				<option value="all">Cualquier actividad</option>
				<option value="contribution">Con contribuciones</option>
				<option value="service">Con servicio</option>
				<option value="attendance">Con asistencia</option>
				<option value="empty">Sin actividad asociada</option>
			</Select>
		</AdminField>
		<AdminField label="Orden">
			<Select bind:value={sortBy}>
				<option value="date">Más recientes primero</option>
				<option value="name">Nombre A–Z</option>
			</Select>
		</AdminField>
	</div>

	<details class="tw:rounded-ui tw:border tw:border-rule tw:bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] tw:p-3 tw:open:[&>summary]:mb-3" open={Boolean(year)}>
		<summary class="tw:inline-flex tw:cursor-pointer tw:items-center tw:gap-1.5 tw:text-[0.7rem] tw:text-ink-dim"><ListFilter size={14} strokeWidth={1.8} aria-hidden="true" /> Más filtros</summary>
		<div class="tw:grid tw:grid-cols-[minmax(8rem,12rem)]">
			<AdminField label="Año">
				<Input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength={4} placeholder="AAAA" />
			</AdminField>
		</div>
	</details>

	<div class="tw:flex tw:items-center tw:justify-end tw:gap-3">
		<span class="tw:text-[0.65rem] tw:text-ink-faint">{activeFilterCount === 0 ? 'Sin filtros activos' : `${activeFilterCount} filtros activos`}</span>
		<Button onclick={resetFilters} disabled={activeFilterCount === 0 && sortBy === 'date'}>Limpiar</Button>
	</div>
</section>

<ul class="tw:mt-4 tw:mb-0 tw:list-none tw:border-t tw:border-rule tw:p-0">
	{#each filtered as event (event.id)}
		<li>
			<a class="tw:group tw:flex tw:items-center tw:justify-between tw:gap-4 tw:border-b tw:border-rule tw:px-1 tw:py-4 tw:text-ink tw:max-[650px]:flex-col tw:max-[650px]:items-start" href={`/admin/eventos/${event.id}`}>
				<div class="tw:grid tw:min-w-0 tw:gap-[0.3rem]">
					<span class="tw:text-[0.65rem] tw:text-ink-faint">{event.sortDate ?? 'Sin fecha'}</span>
					<strong class="tw:text-[0.82rem] tw:leading-[1.35] tw:group-hover:text-accent-strong">{event.title}</strong>
					{#if event.place}<small class="tw:text-[0.65rem] tw:text-ink-faint">{event.place}</small>{/if}
				</div>
				<div class="tw:flex tw:flex-none tw:flex-wrap tw:justify-end tw:gap-1.5 tw:max-[650px]:justify-start">
					{#if event.contributionCount}<span class="tw:border tw:border-rule tw:px-1.5 tw:py-1 tw:text-[0.6rem] tw:text-ink-dim">{event.contributionCount} contrib.</span>{/if}
					{#if event.serviceCount}<span class="tw:border tw:border-rule tw:px-1.5 tw:py-1 tw:text-[0.6rem] tw:text-ink-dim">{event.serviceCount} servicio</span>{/if}
					{#if event.hasAttendance}<span class="tw:border tw:border-warning tw:px-1.5 tw:py-1 tw:text-[0.6rem] tw:text-warning">Oyente · privado</span>{/if}
				</div>
			</a>
		</li>
	{/each}
</ul>
