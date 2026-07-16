<script lang="ts">
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type { PortfolioProjectMetadata } from '$lib/types/portfolio';
	import { untrack } from 'svelte';

	let {
		project = null,
		action,
		submitLabel
	}: {
		project?: PortfolioProjectMetadata | null;
		action: string;
		submitLabel: string;
	} = $props();

	const initialProject = untrack(() => project);
	let publicationStatus = $state(initialProject?.publicationStatus ?? 'draft');
	let showHome = $state(initialProject?.showHome ?? false);
	const tags = initialProject?.tags.join(', ') ?? '';
	const primaryLink = initialProject?.links[0];

	$effect(() => {
		if (publicationStatus !== 'published') showHome = false;
	});
</script>

<form class="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1" method="POST" {action}>
	{#if project}
		<input type="hidden" name="slug" value={project.slug} />
		<AdminField label="Slug"><Input value={project.slug} disabled /></AdminField>
	{:else}
		<AdminField label="Slug">
			<Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="mi-proyecto" />
		</AdminField>
	{/if}

	<AdminField label="Estado editorial">
		<Select name="publicationStatus" bind:value={publicationStatus}>
			<option value="draft">Borrador · solo dashboard</option>
			<option value="published">Publicado · URL pública</option>
			<option value="archived">Archivado · retirado</option>
		</Select>
	</AdminField>
	<AdminField label="Título (ES)"><Input name="titleEs" required value={project?.title.es ?? ''} /></AdminField>
	<AdminField label="Título (EN)"><Input name="titleEn" value={project?.title.en ?? ''} /></AdminField>
	<AdminField label="Tipo (ES)"><Input name="kindEs" required value={project?.kind.es ?? ''} placeholder="Proyecto digital" /></AdminField>
	<AdminField label="Tipo (EN)"><Input name="kindEn" value={project?.kind.en ?? ''} /></AdminField>
	<AdminField label="Línea superior (ES)"><Input name="kickerEs" value={project?.kicker.es ?? ''} /></AdminField>
	<AdminField label="Línea superior (EN)"><Input name="kickerEn" value={project?.kicker.en ?? ''} /></AdminField>
	<AdminField label="Estado mostrado (ES)"><Input name="statusEs" value={project?.status.es ?? ''} placeholder="En desarrollo" /></AdminField>
	<AdminField label="Estado mostrado (EN)"><Input name="statusEn" value={project?.status.en ?? ''} /></AdminField>
	<AdminField label="Periodo"><Input name="period" required value={project?.period ?? ''} placeholder="2026—" /></AdminField>
	<AdminField label="Orden"><Input name="sortOrder" type="number" min="0" value={project?.sortOrder ?? ''} /></AdminField>
	<div class="col-span-full"><AdminField label="Descripción (ES)"><Textarea name="summaryEs" required rows={3} value={project?.summary.es ?? ''} /></AdminField></div>
	<div class="col-span-full"><AdminField label="Descripción (EN)"><Textarea name="summaryEn" rows={3} value={project?.summary.en ?? ''} /></AdminField></div>
	<div class="col-span-full"><AdminField label="Etiquetas · separadas por comas"><Input name="tags" value={tags} /></AdminField></div>
	<AdminField label="Enlace principal"><Input name="linkUrl" type="url" value={primaryLink?.url ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (ES)"><Input name="linkLabelEs" value={primaryLink?.label.es ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (EN)"><Input name="linkLabelEn" value={primaryLink?.label.en ?? ''} /></AdminField>
	<label class="flex items-center gap-2 self-end pb-2 font-mono text-xs text-ink-dim">
		<input name="showHome" type="checkbox" value="1" bind:checked={showHome} disabled={publicationStatus !== 'published'} />
		Visible en portada
	</label>
	{#if publicationStatus !== 'published'}
		<p class="col-span-full m-0 text-[0.68rem] text-ink-faint">Solo los proyectos publicados pueden aparecer en portada.</p>
	{/if}
	<div class="col-span-full flex justify-end"><Button type="submit" variant="primary">{submitLabel}</Button></div>
</form>
