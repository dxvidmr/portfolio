<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import SortableList from '$lib/components/admin/SortableList.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const initialProjects = untrack(() => data.projects);
	let projects = $state(initialProjects.map((project) => ({ ...project })));
	let orderForm = $state<HTMLFormElement | null>(null);
	const orderValue = $derived(JSON.stringify(projects.map((project) => project.slug)));

	const persistOrder = () => window.queueMicrotask(() => orderForm?.requestSubmit());
	const reorderSubmit: SubmitFunction = () =>
		async ({ result, update }) => {
			if (result.type !== 'success') projects = initialProjects.map((project) => ({ ...project }));
			await update({ reset: false });
		};

	const statusLabel = {
		draft: 'Borrador',
		published: 'Publicado',
		archived: 'Archivado'
	} as const;
	const statusClass = {
		draft: 'text-warning',
		published: 'text-accent-strong',
		archived: 'text-ink-faint'
	} as const;
</script>

<svelte:head><title>Portfolio · cv/admin</title></svelte:head>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success} />{/key}
{/if}

<AdminPageHeader
	title="Portfolio"
	eyebrow="Proyectos públicos"
	description="Gestiona el estado editorial, el orden y las relaciones de cada ficha."
>
	{#snippet actions()}<ButtonLink href="/admin/portfolio/nuevo" variant="primary">+ Nuevo proyecto</ButtonLink>{/snippet}
</AdminPageHeader>

<form class="hidden" method="POST" action="?/reorder" use:enhance={reorderSubmit} bind:this={orderForm}>
	<input type="hidden" name="order" value={orderValue} />
</form>

{#if projects.length === 0}
	<p class="m-0 border-y border-rule px-4 py-10 text-center text-xs text-ink-faint">Todavía no hay proyectos.</p>
{:else}
	<SortableList
		bind:items={projects}
		getKey={(project) => project.slug}
		getLabel={(project) => project.title.es}
		onreorder={persistOrder}
	>
		{#snippet children(project)}
			<a class="group grid min-w-0 gap-1 text-inherit no-underline" href={`/admin/portfolio/${project.slug}`}>
				<span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<strong class="font-title text-lg font-medium text-ink group-hover:text-accent-strong">{project.title.es}</strong>
					<span class="font-mono text-[0.62rem] text-ink-faint">{project.period}</span>
				</span>
				<span class="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.62rem]">
					<span class={statusClass[project.publicationStatus]}>{statusLabel[project.publicationStatus]}</span>
					<span class="text-ink-faint">{project.relationCount} relacionados</span>
					<span class={project.hasNarrative ? 'text-accent-strong' : 'text-ink-faint'}>{project.hasNarrative ? 'Narrativa especial' : 'Plantilla básica'}</span>
				</span>
			</a>
		{/snippet}
		{#snippet actions(project)}
			<ButtonLink href={`/admin/portfolio/${project.slug}`} size="sm">Editar</ButtonLink>
		{/snippet}
	</SortableList>
{/if}
