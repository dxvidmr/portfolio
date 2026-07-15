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

<ul class="types">
	{#each data.typeOptions as option (option.value)}
		<li>
			<a href={`/admin/entradas/nueva/${option.value}`}>{option.label}</a>
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

	.types {
		list-style: none;
		margin: 2rem 0 0;
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

	.types a:hover {
		border-color: #00ff88;
		color: #00ff88;
	}

	.types a:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}
</style>
