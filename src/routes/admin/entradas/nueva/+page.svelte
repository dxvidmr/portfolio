<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva entrada · cv/admin</title>
</svelte:head>

<a class="back" href="/admin/entradas" data-sveltekit-preload-data="off">← Volver</a>

<nav class="breadcrumb" aria-label="Ruta">
	<a href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>Nueva</span>
</nav>

<h1>Nueva entrada</h1>
<p class="intro">
	Elige el tipo. La entrada se creará como <strong>privada</strong>: no aparecerá en la web
	pública hasta que la publiques.
</p>

<a class="event-card" href="/admin/eventos/nuevo">
	<strong>Evento académico</strong>
	<span>
		Congreso, seminario, jornada… Crea el evento y, en el mismo paso, tu contribución,
		servicio o asistencia. Es el camino recomendado para comunicaciones y organización.
	</span>
</a>

<ul class="types">
	{#each data.typeOptions as option (option.value)}
		<li>
			<a href={`/admin/entradas/nueva/${option.value}`}>
				{option.label}
				{#if option.value === 'talks' || option.value === 'service_activities'}
					<small>si el evento ya existe</small>
				{/if}
			</a>
		</li>
	{/each}
</ul>

<style>
	.back {
		display: inline-block;
		color: #a3a3a3;
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.back:hover {
		color: #00ff88;
	}

	.back:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #737373;
		margin-bottom: 1.5rem;
	}

	.breadcrumb a {
		color: #a3a3a3;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fafafa;
		margin: 0 0 1rem;
	}

	.intro {
		max-width: 60ch;
		color: #a3a3a3;
		line-height: 1.6;
	}

	.event-card {
		display: grid;
		gap: 0.4rem;
		margin-top: 2rem;
		border: 1px solid #00ff88;
		padding: 1rem 1.1rem;
		color: #fafafa;
		text-decoration: none;
	}

	.event-card strong {
		color: #00ff88;
	}

	.event-card span {
		font-size: 0.82rem;
		color: #a3a3a3;
		line-height: 1.5;
		max-width: 70ch;
	}

	.event-card:hover {
		background: rgba(0, 255, 136, 0.06);
	}

	.event-card:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.types {
		list-style: none;
		margin: 1.5rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 0.75rem;
	}

	.types a {
		display: block;
		border: 1px solid #404040;
		padding: 0.9rem 1rem;
		color: #fafafa;
		text-decoration: none;
	}

	.types small {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.7rem;
		color: #737373;
	}

	.types a:hover {
		border-color: #00ff88;
		color: #00ff88;
	}

	.types a:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}
</style>
