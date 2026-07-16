<script lang="ts">
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import PortfolioProjectForm from '$lib/components/admin/PortfolioProjectForm.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Nuevo proyecto · cv/admin</title></svelte:head>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success} />{/key}
{/if}

<AdminPageHeader
	title="Nuevo proyecto"
	eyebrow="Portfolio"
	description="La ficha básica se genera desde estos datos. El proyecto nace como borrador salvo que elijas publicarlo."
>
	{#snippet actions()}<ButtonLink href="/admin/portfolio">← Portfolio</ButtonLink>{/snippet}
</AdminPageHeader>

<section class="border-t border-rule pt-5">
	<PortfolioProjectForm action="?/create" submitLabel="Crear proyecto" />
</section>
