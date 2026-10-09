<script lang="ts">
	import { plainInlineTitle } from '$lib/content/inline-markup';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import PortfolioProjectForm from '$lib/components/admin/PortfolioProjectForm.svelte';
	import PortfolioRelationsEditor from '$lib/components/admin/PortfolioRelationsEditor.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>{plainInlineTitle(data.project.title.es)} · Portfolio · cv/admin</title></svelte:head>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success} />{/key}
{/if}

<AdminPageHeader
	title={data.project.title.es}
	eyebrow="Portfolio"
	description={`${data.project.kind.es} · ${data.hasNarrative ? 'Ficha con diseño propio' : 'Ficha estándar'}`}
>
	{#snippet actions()}
		<ButtonLink href="/admin/portfolio">← Portfolio</ButtonLink>
		{#if data.project.publicationStatus === 'published'}
			<ButtonLink href={`/es/portfolio/${data.project.slug}`} target="_blank" rel="noreferrer">Ver ficha ↗</ButtonLink>
		{/if}
	{/snippet}
</AdminPageHeader>
{#if data.skillUses.length}<aside class="my-5 text-xs"><p>Este trabajo ejemplifica:</p><div class="flex flex-wrap gap-3">{#each data.skillUses as skill}<a href={`/admin/meritos/skills/${skill.id}`} class="text-accent-strong underline">{skill.name}</a>{/each}</div></aside>{/if}

<details class="mb-8 rounded-ui border border-rule bg-surface px-4 py-3">
	<summary class="cursor-pointer font-mono text-xs text-ink">Datos básicos y publicación</summary>
		<div class="mt-5">
			<PortfolioProjectForm
				project={data.project}
				kindOptions={data.taxonomy.kinds}
				tagOptions={data.taxonomy.tags}
				action="?/update"
				submitLabel="Guardar datos"
			/>
		</div>
</details>

<PortfolioRelationsEditor
	portfolioSlug={data.project.slug}
	entries={data.entries}
	initialRelations={data.relations}
/>
