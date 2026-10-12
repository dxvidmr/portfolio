<script lang="ts">
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
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
		researchLineOptions,
		skillAreas,
		action,
		submitLabel
	}: {
		project?: PortfolioProjectMetadata | null;
		kindOptions: PortfolioTaxonomyOption[];
		researchLineOptions: PortfolioTaxonomyOption[];
		skillAreas: Array<{ code: string; label: string; skills: PortfolioTaxonomyOption[] }>;
		action: string;
		submitLabel: string;
	} = $props();

	const initialProject = untrack(() => project);
	let publicationStatus = $state(initialProject?.publicationStatus ?? 'draft');
	const primaryLink = initialProject?.links[0];
	const selectedSkills = new Set(initialProject?.skills.map((skill) => String(skill.id)) ?? []);
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
	<div class="col-span-full"><AdminField label="Descripción (ES)" help="Títulos de obras en cursiva con asteriscos: *Fuenteovejuna*"><Textarea name="summaryEs" required rows={3} value={project?.summary.es ?? ''} /></AdminField></div>
	<div class="col-span-full"><AdminField label="Descripción (EN)" help="Títulos de obras en cursiva con asteriscos: *Fuenteovejuna*"><Textarea name="summaryEn" rows={3} value={project?.summary.en ?? ''} /></AdminField></div>
	<AdminField label="Línea de investigación" help="El tema de la ficha. Las líneas se editan en Taxonomías y son también las de «Sobre mí».">
		<Select name="researchLine" value={project?.researchLine?.code ?? ''}>
			<option value="">Sin línea</option>
			{#each researchLineOptions as option (option.code)}
				<option value={option.code}>{option.labelEs}</option>
			{/each}
		</Select>
	</AdminField>
	<div class="col-span-full grid gap-4">
		<p class="m-0 font-mono text-meta font-medium tracking-meta text-ink-dim uppercase">Competencias</p>
		<small class="-mt-2 leading-[1.4] text-ink-faint">Los métodos de la ficha. Es la misma relación que se ve en cada competencia: se puede marcar desde aquí o desde Competencias.</small>
		<div class="grid grid-cols-2 gap-x-8 gap-y-5 max-[760px]:grid-cols-1">
			{#each skillAreas as area (area.code)}
				<fieldset class="m-0 grid content-start gap-1.5 border-0 p-0">
					<legend class="mb-1.5 p-0 text-xs font-medium text-ink">{area.label}</legend>
					{#each area.skills as skill (skill.code)}
						<label class="flex cursor-pointer items-start gap-2.5 text-xs leading-[1.35] text-ink-dim hover:text-ink">
							<Checkbox name="skillIds" value={skill.code} checked={selectedSkills.has(skill.code)} />
							<span>{skill.labelEs}</span>
						</label>
					{/each}
				</fieldset>
			{/each}
		</div>
	</div>
	<AdminField label="Enlace principal"><Input name="linkUrl" type="url" value={primaryLink?.url ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (ES)"><Input name="linkLabelEs" value={primaryLink?.label.es ?? ''} /></AdminField>
	<AdminField label="Etiqueta del enlace (EN)"><Input name="linkLabelEn" value={primaryLink?.label.en ?? ''} /></AdminField>
	<div class="col-span-full flex justify-end"><Button type="submit" variant="primary">{submitLabel}</Button></div>
</form>
