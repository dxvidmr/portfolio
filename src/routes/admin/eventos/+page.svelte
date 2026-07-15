<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let query = $state('');
	const normalize = (value: string) =>
		value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	let filtered = $derived.by(() => {
		const q = normalize(query.trim());
		return data.events.filter((event) =>
			!q ? true : normalize(`${event.title} ${event.place ?? ''} ${event.year ?? ''}`).includes(q)
		);
	});
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
	Cada evento agrupa contribuciones, organización, evaluación y asistencia. Solo las entradas públicas
	aparecen en la web; el rol de oyente/asistente es siempre privado.
</p>

<label class="search">
	<span>Buscar por nombre, lugar o año</span>
	<input type="search" bind:value={query} placeholder="Filtrar eventos…" />
</label>

<p class="count">{filtered.length} de {data.events.length} eventos</p>

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
	.heading p { margin: 0; color: #737373; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; }
	h1 { margin: 0.25rem 0 0; color: #fafafa; font-size: 1.45rem; }
	.heading > a { border: 1px solid #00ff88; padding: 0.55rem 0.8rem; color: #00ff88; font-size: 0.75rem; }
	.intro { max-width: 78ch; color: #a3a3a3; line-height: 1.6; }
	.search { display: grid; max-width: 34rem; gap: 0.35rem; margin-top: 1.5rem; color: #737373; font-size: 0.68rem; text-transform: uppercase; }
	.search input { border: 1px solid #404040; background: #111; color: #e5e5e5; padding: 0.6rem; font: inherit; }
	.count { color: #737373; font-size: 0.7rem; }
	.events { margin: 1rem 0 0; padding: 0; border-top: 1px solid #262626; list-style: none; }
	.events a { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0.25rem; border-bottom: 1px solid #262626; color: #d4d4d4; }
	.events a:hover strong { color: #00ff88; }
	.events a > div:first-child { display: grid; gap: 0.3rem; min-width: 0; }
	.events strong { font-size: 0.82rem; line-height: 1.35; }
	.date, .events small { color: #737373; font-size: 0.65rem; }
	.roles { display: flex; flex: 0 0 auto; flex-wrap: wrap; justify-content: end; gap: 0.4rem; }
	.roles span { border: 1px solid #404040; padding: 0.25rem 0.4rem; color: #a3a3a3; font-size: 0.6rem; }
	.roles .private { color: #d6a84b; border-color: #6b532b; }
	@media (max-width: 650px) { .events a { align-items: start; flex-direction: column; } .roles { justify-content: start; } }
</style>
