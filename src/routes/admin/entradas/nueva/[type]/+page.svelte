<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Nueva: {data.typeLabel} · cv/admin</title>
</svelte:head>

<a class="back" href="/admin/entradas/nueva" data-sveltekit-preload-data="off">← Volver</a>

<nav class="breadcrumb" aria-label="Ruta">
	<a href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<a href="/admin/entradas/nueva">Nueva</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
</nav>

<h1>Nueva entrada: {data.typeLabel}</h1>
<p class="intro">Se creará como privada; podrás publicarla desde su ficha.</p>

{#if form?.errors}
	{#key form}
		<AdminToast message="Revisa los campos marcados; la entrada no se ha creado." success={false} />
	{/key}
{/if}

<form method="POST" action="?/crear">
	<EntityForm
		fields={data.fields}
		options={data.options}
		values={form?.raw ?? data.initialValues}
		errors={form?.errors ?? {}}
	/>
	<div class="actions">
		<button type="submit">Crear entrada</button>
		<a class="cancel" href="/admin/entradas">Cancelar</a>
	</div>
</form>

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
		margin: 0 0 0.75rem;
	}

	.intro {
		color: #737373;
		font-size: 0.85rem;
		margin: 0 0 1.5rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	button {
		font: inherit;
		background: none;
		border: 1px solid #00ff88;
		color: #00ff88;
		padding: 0.55rem 1rem;
		cursor: pointer;
	}

	button:hover {
		background: rgba(0, 255, 136, 0.08);
	}

	button:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.cancel {
		color: #a3a3a3;
	}
</style>
