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

<ButtonLink variant="ghost" size="sm" href="/admin/entradas/nueva" data-sveltekit-preload-data="off" class="tw:mb-4 tw:px-0">← Volver</ButtonLink>

<nav class="tw:mb-6 tw:flex tw:gap-2 tw:text-[0.8rem] tw:text-ink-faint" aria-label="Ruta">
	<a class="tw:text-ink-dim" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<a class="tw:text-ink-dim" href="/admin/entradas/nueva">Nueva</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
</nav>

<AdminPageHeader
	title={`Nueva entrada: ${data.typeLabel}`}
	eyebrow="Índice transversal"
	description="Se creará como privada; podrás publicarla desde su ficha."
/>

{#if data.entityType === 'talks' || data.entityType === 'service_activities'}
	<p class="tw:-mt-2 tw:mb-6 tw:border tw:border-dashed tw:border-rule tw:px-3 tw:py-2.5 tw:text-[0.8rem] tw:text-ink-dim">
		¿El evento aún no existe? <a class="tw:text-accent-strong" href="/admin/eventos/nuevo">Créalo primero con su rol desde Eventos</a>:
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
	<div class="tw:mt-8 tw:flex tw:items-center tw:gap-4">
		<Button variant="primary" type="submit">Crear entrada</Button>
		<ButtonLink href="/admin/entradas">Cancelar</ButtonLink>
	</div>
</form>
