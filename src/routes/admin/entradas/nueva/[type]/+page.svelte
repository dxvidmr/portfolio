<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Nueva: {data.typeLabel} · cv/admin</title>
</svelte:head>

<ButtonLink variant="ghost" size="sm" href="/admin/entradas/nueva" data-sveltekit-preload-data="off" class="mb-4 px-0">← Volver</ButtonLink>

<nav class="mb-6 flex gap-2 text-[0.8rem] text-ink-faint" aria-label="Ruta">
	<a class="text-ink-dim" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<a class="text-ink-dim" href="/admin/entradas/nueva">Nueva</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
</nav>

<AdminPageHeader
	title={`Nueva entrada: ${data.typeLabel}`}
	eyebrow="Índice transversal"
	description="Se creará como privada; podrás publicarla desde su ficha."
/>

{#if data.entityType === 'talks' || data.entityType === 'service_activities'}
	<p class="-mt-2 mb-6 border border-dashed border-rule px-3 py-2.5 text-[0.8rem] text-ink-dim">
		¿El evento aún no existe? <a class="text-accent-strong" href="/admin/eventos/nuevo">Créalo primero con su rol desde Eventos</a>:
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
	<div class="mt-8 flex items-center gap-4">
		<Button variant="primary" type="submit">Crear entrada</Button>
		<ButtonLink href="/admin/entradas">Cancelar</ButtonLink>
	</div>
</form>
