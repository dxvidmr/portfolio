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

<section class="my-6 grid gap-4 rounded-ui border border-rule bg-[var(--admin-surface)] p-[clamp(0.8rem,2vw,1.15rem)]" aria-label="Filtros de eventos">
	<div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-[650px]:grid-cols-1">
		<AdminField class="max-w-3xl" label="Buscar eventos">
			<Input type="search" bind:value={query} placeholder="Nombre, lugar o año…" />
		</AdminField>
		<div class="grid min-w-24 text-right text-ink-dim max-[650px]:hidden" aria-live="polite">
			<strong class="font-title text-[1.35rem] font-medium leading-none text-ink">{filtered.length}</strong>
			<span class="text-[0.65rem] text-ink-faint">resultados</span>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-3 max-[650px]:grid-cols-1">
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

	<details class="rounded-ui border border-rule bg-[color-mix(in_srgb,var(--bg)_45%,transparent)] p-3 [&[open]>summary]:mb-3" open={Boolean(year)}>
		<summary class="inline-flex cursor-pointer items-center gap-1.5 text-[0.7rem] text-ink-dim"><ListFilter size={14} strokeWidth={1.8} aria-hidden="true" /> Más filtros</summary>
		<div class="grid grid-cols-[minmax(8rem,12rem)]">
			<AdminField label="Año">
				<Input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength={4} placeholder="AAAA" />
			</AdminField>
		</div>
	</details>

	<div class="flex items-center justify-end gap-3">
		<span class="text-[0.65rem] text-ink-faint">{activeFilterCount === 0 ? 'Sin filtros activos' : `${activeFilterCount} filtros activos`}</span>
		<Button onclick={resetFilters} disabled={activeFilterCount === 0 && sortBy === 'date'}>Limpiar</Button>
	</div>
</section>

<ul class="mt-4 mb-0 list-none border-t border-rule p-0">
	{#each filtered as event (event.id)}
		<li>
			<a class="group flex items-center justify-between gap-4 border-b border-rule px-1 py-4 text-ink max-[650px]:flex-col max-[650px]:items-start" href={`/admin/eventos/${event.id}`}>
				<div class="grid min-w-0 gap-[0.3rem]">
					<span class="text-[0.65rem] text-ink-faint">{event.sortDate ?? 'Sin fecha'}</span>
					<strong class="text-[0.82rem] leading-[1.35] group-hover:text-accent-strong">{event.title}</strong>
					{#if event.place}<small class="text-[0.65rem] text-ink-faint">{event.place}</small>{/if}
				</div>
				<div class="flex flex-none flex-wrap justify-end gap-1.5 max-[650px]:justify-start">
					{#if event.contributionCount}<span class="border border-rule px-1.5 py-1 text-[0.6rem] text-ink-dim">{event.contributionCount} contrib.</span>{/if}
					{#if event.serviceCount}<span class="border border-rule px-1.5 py-1 text-[0.6rem] text-ink-dim">{event.serviceCount} servicio</span>{/if}
					{#if event.hasAttendance}<span class="border border-warning px-1.5 py-1 text-[0.6rem] text-warning">Oyente · privado</span>{/if}
				</div>
			</a>
		</li>
	{/each}
</ul>
