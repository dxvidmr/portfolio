<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { untrack } from 'svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const initialProjects = untrack(() => data.projects);
	let projects = $state(initialProjects.map((project) => ({ ...project })));
	let draggedSlug = $state<string | null>(null);
	let orderForm = $state<HTMLFormElement | null>(null);
	const orderValue = $derived(JSON.stringify(projects.map((project) => project.slug)));

	const saveOrder = () => window.queueMicrotask(() => orderForm?.requestSubmit());
	const moveProject = (slug: string, targetIndex: number) => {
		const fromIndex = projects.findIndex((project) => project.slug === slug);
		if (fromIndex < 0) return;
		const boundedIndex = Math.max(0, Math.min(targetIndex, projects.length - 1));
		if (fromIndex === boundedIndex) return;
		const next = [...projects];
		const [project] = next.splice(fromIndex, 1);
		next.splice(boundedIndex, 0, project);
		projects = next;
		saveOrder();
	};
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
	<ol class="m-0 list-none border-t border-rule p-0">
		{#each projects as project, index (project.slug)}
			<li
				class={`grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-rule py-4 max-[700px]:grid-cols-[2rem_minmax(0,1fr)] ${draggedSlug === project.slug ? 'opacity-45' : ''}`}
				ondragover={(event) => event.preventDefault()}
				ondrop={(event) => { event.preventDefault(); if (draggedSlug) moveProject(draggedSlug, index); draggedSlug = null; }}
			>
				<button
					type="button"
					class="flex cursor-grab items-center gap-1 border-0 bg-transparent p-0 text-ink-faint active:cursor-grabbing"
					draggable="true"
					ondragstart={() => (draggedSlug = project.slug)}
					ondragend={() => (draggedSlug = null)}
					aria-label={`Arrastrar ${project.title.es} para reordenar`}
					title="Arrastrar para reordenar"
				>
					<GripVertical size={16} strokeWidth={1.6} aria-hidden="true" />
					<span class="font-mono text-[0.65rem]">{String(index + 1).padStart(2, '0')}</span>
				</button>
				<a class="group grid min-w-0 gap-1 text-inherit no-underline" href={`/admin/portfolio/${project.slug}`}>
					<span class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<strong class="font-title text-lg font-medium text-ink group-hover:text-accent-strong">{project.title.es}</strong>
						<span class="font-mono text-[0.62rem] text-ink-faint">{project.period}</span>
					</span>
					<span class="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.62rem]">
						<span class={statusClass[project.publicationStatus]}>{statusLabel[project.publicationStatus]}</span>
						<span class="text-ink-faint">{project.showHome ? 'En portada' : 'Fuera de portada'}</span>
						<span class="text-ink-faint">{project.relationCount} relacionados</span>
						<span class={project.hasNarrative ? 'text-accent-strong' : 'text-ink-faint'}>{project.hasNarrative ? 'Narrativa especial' : 'Plantilla básica'}</span>
					</span>
				</a>
				<div class="flex items-center gap-2 max-[700px]:col-start-2 max-[700px]:justify-end">
					<div class="flex gap-px">
						<Button type="button" variant="ghost" size="icon" disabled={index === 0} onclick={() => moveProject(project.slug, index - 1)} aria-label={`Subir ${project.title.es}`} title="Subir"><ChevronUp size={16} /></Button>
						<Button type="button" variant="ghost" size="icon" disabled={index === projects.length - 1} onclick={() => moveProject(project.slug, index + 1)} aria-label={`Bajar ${project.title.es}`} title="Bajar"><ChevronDown size={16} /></Button>
					</div>
					{#if project.publicationStatus === 'published'}
						<form method="POST" action="?/visibility" use:enhance>
							<input type="hidden" name="portfolioSlug" value={project.slug} />
							<input type="hidden" name="showHome" value={project.showHome ? '0' : '1'} />
							<Button type="submit" variant={project.showHome ? 'danger' : 'secondary'} size="sm">
								{project.showHome ? 'Ocultar' : 'Mostrar'}
							</Button>
						</form>
					{/if}
					<ButtonLink href={`/admin/portfolio/${project.slug}`} size="sm">Editar</ButtonLink>
				</div>
			</li>
		{/each}
	</ol>
{/if}
