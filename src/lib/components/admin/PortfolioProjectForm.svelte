<script lang="ts">
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import TaxonomyCheckboxGroup from '$lib/components/admin/TaxonomyCheckboxGroup.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import type {
		PortfolioProjectMetadata,
		PortfolioTaxonomyOption
	} from '$lib/types/portfolio';
	import { untrack } from 'svelte';

	let {
		project = null,
		kindOptions,
		tagOptions,
		action,
		submitLabel
	}: {
		project?: PortfolioProjectMetadata | null;
		kindOptions: PortfolioTaxonomyOption[];
		tagOptions: PortfolioTaxonomyOption[];
		action: string;
		submitLabel: string;
	} = $props();

	const initialProject = untrack(() => project);
	let publicationStatus = $state(initialProject?.publicationStatus ?? 'draft');
	const primaryLink = initialProject?.links[0];
</script>

<form class="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1" method="POST" {action}>
	{#if project}
		<input type="hidden" name="slug" value={project.slug} />
		<AdminField label="Dirección (URL)"><Input value={`/portfolio/${project.slug}`} disabled /></AdminField>
	{:else}
		<AdminField label="Dirección (URL)" help="Solo minúsculas, números y guiones. No se puede cambiar después.">
			<Input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="mi-proyecto" />
		</AdminField>
	{/if}

	<AdminField label="Estado editorial">
		<Select name="publicationStatus" bind:value={publicationStatus}>
			<option value="draft">Borrador · solo en el panel</option>
			<option value="published">Publicado · visible en la web</option>
			<option value="archived">Archivado · retirado</option>
		</Select>
	</AdminField>
	<AdminField label="Título (ES)" help="Títulos de obras en cursiva con asteriscos: *Fuenteovejuna*"><Input name="titleEs" required value={project?.title.es ?? ''} /></AdminField>
	<AdminField label="Título (EN)"><Input name="titleEn" value={project?.title.en ?? ''} /></AdminField>
	<AdminField label="Tipo estructural" required help="Indica si la ficha representa un proyecto concreto, una línea de trabajo o una infraestructura.">
		<Select name="kindCode" required value={project?.kind.code ?? ''}>
			<option value="" disabled>Selecciona un tipo</option>
			{#each kindOptions as option (option.code)}
				<option value={option.code}>{option.labelEs}</option>
			{/each}
		</Select>
	</AdminField>
	<AdminField label="Estado mostrado (ES)"><Input name="statusEs" value={project?.status.es ?? ''} placeholder="En desarrollo" /></AdminField>
	<AdminField label="Estado mostrado (EN)"><Input name="statusEn" value={project?.status.en ?? ''} /></AdminField>
	<AdminField label="Periodo"><Input name="period" required value={project?.period ?? ''} placeholder="2026—" /></AdminField>
	<AdminField label="Orden"><Input name="sortOrder" type="number" min="0" value={project?.sortOrder ?? ''} /></AdminField>
	<div class="col-span-full"><AdminField label="Descripción (ES)" help="Formato permitido: <i>/<em> para cursiva y <b>/<strong> para negrita."><Textarea name="summaryEs" required rows={3} value={project?.summary.es ?? ''} /></AdminField></div>
	<div class="col-span-full"><AdminField label="Descripción (EN)" help="Formato permitido: <i>/<em> para cursiva y <b>/<strong> para negrita."><Textarea name="summaryEn" rows={3} value={project?.summary.en ?? ''} /></AdminField></div>
	<TaxonomyCheckboxGroup
		label="Etiquetas"
		name="tagCodes"
		options={tagOptions}
		selected={project?.tags.map((tag) => tag.code) ?? []}
		help="Las traducciones se editan en Taxonomías."
	/>
	<AdminField label="Enlace principal"><Input name="linkUrl" type="url" value={primaryLink?.url ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (ES)"><Input name="linkLabelEs" value={primaryLink?.label.es ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (EN)"><Input name="linkLabelEn" value={primaryLink?.label.en ?? ''} /></AdminField>
	<div class="col-span-full flex justify-end"><Button type="submit" variant="primary">{submitLabel}</Button></div>
</form>
