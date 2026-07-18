<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminFormNav from '$lib/components/admin/AdminFormNav.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Plus from '@lucide/svelte/icons/plus';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const hasGroupedForm = $derived(data.groups.length > 0);
	const navItems = $derived(data.groups.map((group) => ({ href: `#${group.id}`, label: group.title })));
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
		allí registras evento y comunicación/servicio en un solo paso.
	</p>
{/if}

{#if form?.errors}
	{#key form}
		<AdminToast message="Revisa los campos marcados; la entrada no se ha creado." success={false} />
	{/key}
{/if}

<div class={hasGroupedForm ? 'grid items-start gap-10 min-[1100px]:grid-cols-[12rem_minmax(0,1fr)]' : ''}>
	{#if hasGroupedForm}
		<AdminFormNav items={navItems} formId="new-entry-form" submitLabel="Crear entrada" submitKind="create" />
	{/if}
	<form id="new-entry-form" class="min-w-0" method="POST" action="?/crear">
		<EntityForm
			fields={data.fields}
			groups={data.groups}
			options={data.options}
			values={form?.raw ?? data.initialValues}
			errors={form?.errors ?? {}}
		/>
		<div class="mt-8 flex items-center gap-4 border-t border-rule pt-6">
			<Button variant="primary" type="submit"><Plus size={15} strokeWidth={1.7} aria-hidden="true" />Crear entrada</Button>
			<ButtonLink href="/admin/entradas">Cancelar</ButtonLink>
		</div>
	</form>
</div>
