<script lang="ts">
	import ListFilter from '@lucide/svelte/icons/list-filter';
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

<div class="heading">
	<div>
		<p>Identidad académica compartida</p>
		<h1>Eventos</h1>
	</div>
	<a href="/admin/eventos/nuevo">+ Nuevo evento</a>
</div>

<p class="intro">
	Un evento puede reunir varias contribuciones y roles. Las fechas de cada actividad se editan dentro de su ficha.
</p>

<section class="filters" aria-label="Filtros de eventos">
	<div class="filter-search">
		<label>
			<span>Buscar eventos</span>
			<input type="search" bind:value={query} placeholder="Nombre, lugar o año…" />
		</label>
		<div class="filter-summary" aria-live="polite">
			<strong>{filtered.length}</strong>
			<span>resultados</span>
		</div>
	</div>

	<div class="filter-primary">
		<label>
			<span>Actividad</span>
			<select bind:value={activity}>
				<option value="all">Cualquier actividad</option>
				<option value="contribution">Con contribuciones</option>
				<option value="service">Con servicio</option>
				<option value="attendance">Con asistencia</option>
				<option value="empty">Sin actividad asociada</option>
			</select>
		</label>
		<label>
			<span>Orden</span>
			<select bind:value={sortBy}>
				<option value="date">Más recientes primero</option>
				<option value="name">Nombre A–Z</option>
			</select>
		</label>
	</div>

	<details class="filter-advanced" open={Boolean(year)}>
		<summary><ListFilter size={14} strokeWidth={1.8} aria-hidden="true" /> Más filtros</summary>
		<div>
			<label>
				<span>Año</span>
				<input bind:value={year} inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="AAAA" />
			</label>
		</div>
	</details>

	<div class="filter-actions">
		<span>{activeFilterCount === 0 ? 'Sin filtros activos' : `${activeFilterCount} filtros activos`}</span>
		<button type="button" onclick={resetFilters} disabled={activeFilterCount === 0 && sortBy === 'date'}>Limpiar</button>
	</div>
</section>

<ul class="events">
	{#each filtered as event (event.id)}
		<li>
			<a href={`/admin/eventos/${event.id}`}>
				<div>
					<span class="date">{event.sortDate ?? 'Sin fecha'}</span>
					<strong>{event.title}</strong>
					{#if event.place}<small>{event.place}</small>{/if}
				</div>
				<div class="roles">
					{#if event.contributionCount}<span>{event.contributionCount} contrib.</span>{/if}
					{#if event.serviceCount}<span>{event.serviceCount} servicio</span>{/if}
					{#if event.hasAttendance}<span class="private">Oyente · privado</span>{/if}
				</div>
			</a>
		</li>
	{/each}
</ul>

<style>
	.heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
	.heading p { margin: 0; color: var(--fg-faint); font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
	h1 { margin: 0.25rem 0 0; color: var(--fg); font-size: 1.45rem; }
	.heading > a { border: 1px solid var(--accent-strong); padding: 0.55rem 0.8rem; color: var(--accent-strong); font-size: 0.75rem; }
	.intro { max-width: 78ch; color: var(--fg-dim); line-height: 1.6; }
	.filters { display: grid; gap: 1rem; margin: 1.5rem 0; padding: clamp(0.8rem, 2vw, 1.15rem); border: 1px solid var(--line); background: var(--admin-surface); }
	.filters label { display: grid; gap: 0.35rem; }
	.filter-search { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 1rem; }
	.filter-search label { max-width: 48rem; }
	.filter-primary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
	.filter-summary { display: grid; min-width: 6rem; color: var(--fg-dim); text-align: right; }
	.filter-summary strong { color: var(--fg); font-family: var(--font-title); font-size: 1.35rem; font-weight: 500; line-height: 1; }
	.filter-summary span, .filter-actions > span { color: var(--fg-faint); font-size: 0.65rem; }
	.filter-advanced { padding: 0.75rem; border: 1px solid var(--line); background: color-mix(in srgb, var(--bg) 45%, transparent); }
	.filter-advanced summary { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--fg-dim); font-size: 0.7rem; cursor: pointer; }
	.filter-advanced[open] summary { margin-bottom: 0.75rem; }
	.filter-advanced > div { display: grid; grid-template-columns: minmax(8rem, 12rem); }
	.filter-actions { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; }
	.events { margin: 1rem 0 0; padding: 0; border-top: 1px solid var(--line); list-style: none; }
	.events a { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0.25rem; border-bottom: 1px solid var(--line); color: var(--fg); }
	.events a:hover strong { color: var(--accent-strong); }
	.events a > div:first-child { display: grid; gap: 0.3rem; min-width: 0; }
	.events strong { font-size: 0.82rem; line-height: 1.35; }
	.date, .events small { color: var(--fg-faint); font-size: 0.65rem; }
	.roles { display: flex; flex: 0 0 auto; flex-wrap: wrap; justify-content: end; gap: 0.4rem; }
	.roles span { border: 1px solid var(--line); padding: 0.25rem 0.4rem; color: var(--fg-dim); font-size: 0.6rem; }
	.roles .private { color: var(--tone-amber); border-color: var(--tone-amber); }
	@media (max-width: 650px) { .filter-search, .filter-primary { grid-template-columns: 1fr; } .filter-summary { display: none; } .events a { align-items: start; flex-direction: column; } .roles { justify-content: start; } }
</style>
