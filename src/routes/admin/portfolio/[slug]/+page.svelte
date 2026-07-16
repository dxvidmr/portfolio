<script lang="ts">
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import PortfolioProjectForm from '$lib/components/admin/PortfolioProjectForm.svelte';
	import PortfolioRelationsEditor from '$lib/components/admin/PortfolioRelationsEditor.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>{data.project.title.es} · Portfolio · cv/admin</title></svelte:head>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success} />{/key}
{/if}

<AdminPageHeader
	title={data.project.title.es}
	eyebrow="Portfolio"
	description={`${data.project.kind.es} · ${data.hasNarrative ? 'Narrativa especial detectada' : 'Plantilla básica'}`}
>
	{#snippet actions()}
		<ButtonLink href="/admin/portfolio">← Portfolio</ButtonLink>
		{#if data.project.publicationStatus === 'published'}
			<ButtonLink href={`/es/proyectos/${data.project.slug}`} target="_blank" rel="noreferrer">Ver ficha ↗</ButtonLink>
		{/if}
	{/snippet}
</AdminPageHeader>

<details class="mb-8 rounded-ui border border-rule bg-surface px-4 py-3">
	<summary class="cursor-pointer font-mono text-xs text-ink">Datos básicos y publicación</summary>
	<div class="mt-5"><PortfolioProjectForm project={data.project} action="?/update" submitLabel="Guardar datos" /></div>
</details>

<PortfolioRelationsEditor
	portfolioSlug={data.project.slug}
	entries={data.entries}
	initialRelations={data.relations}
/>
