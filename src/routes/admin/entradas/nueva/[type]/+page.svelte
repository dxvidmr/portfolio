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

{#if data.entityType === 'talks' || data.entityType === 'service_activities'}
	<p class="event-hint">
		¿El evento aún no existe? <a href="/admin/eventos/nuevo">Créalo primero con su rol desde Eventos</a>:
		allí registras evento y contribución/servicio en un solo paso.
	</p>
{/if}

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
		color: var(--fg-dim);
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.back:hover {
		color: var(--accent-strong);
	}

	.back:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--fg-faint);
		margin-bottom: 1.5rem;
	}

	.breadcrumb a {
		color: var(--fg-dim);
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--fg);
		margin: 0 0 0.75rem;
	}

	.intro {
		color: var(--fg-faint);
		font-size: 0.85rem;
		margin: 0 0 1.5rem;
	}

	.event-hint {
		font-size: 0.8rem;
		color: var(--fg-dim);
		border: 1px dashed var(--line);
		padding: 0.6rem 0.8rem;
		margin: -0.5rem 0 1.5rem;
	}

	.event-hint a {
		color: var(--accent-strong);
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
		border: 1px solid var(--accent-strong);
		color: var(--accent-strong);
		padding: 0.55rem 1rem;
		cursor: pointer;
	}

	button:hover {
		background: var(--accent-wash);
	}

	button:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	.cancel {
		color: var(--fg-dim);
	}
</style>
