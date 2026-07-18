<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type {
		FundingRelation,
		FundingRelationCandidate,
		FundingRelationEditor
	} from '$lib/server/admin/funding-relations';
	import AdminField from './AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

	let { editor }: { editor: FundingRelationEditor } = $props();

	let query = $state('');
	let type = $state('');
	let pending = $state<string[]>([]);

	const normalize = (value: string) =>
		value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const relationKey = (item: Pick<FundingRelation, 'fundingAwardId' | 'entityType' | 'entityId'>) =>
		`${item.fundingAwardId}:${item.entityType}:${item.entityId}`;
	const kindLabel = (kind: FundingRelation['relationKind']) =>
		editor.kinds.find((option) => option.value === kind)?.label ?? kind;
	const candidateTitle = (candidate: FundingRelationCandidate) =>
		editor.mode === 'funding' ? candidate.entityTitle : candidate.fundingTitle;
	const candidateType = (candidate: FundingRelationCandidate) =>
		editor.mode === 'funding' ? candidate.typeLabel : 'Financiación y premios';
	const candidatePublic = (candidate: FundingRelationCandidate) =>
		editor.mode === 'funding' ? candidate.entityIsPublic : candidate.fundingIsPublic;
	const candidateDate = (candidate: FundingRelationCandidate) =>
		editor.mode === 'funding' ? candidate.entitySortDate : candidate.fundingSortDate;
	const relationTitle = (relation: FundingRelation) =>
		editor.mode === 'funding' ? relation.entityTitle : relation.fundingTitle;
	const relationType = (relation: FundingRelation) =>
		editor.mode === 'funding' ? relation.typeLabel : 'Financiación y premios';
	const relationPublic = (relation: FundingRelation) =>
		editor.mode === 'funding' ? relation.entityIsPublic : relation.fundingIsPublic;
	const relationDate = (relation: FundingRelation) =>
		editor.mode === 'funding' ? relation.entitySortDate : relation.fundingSortDate;
	const relationHref = (relation: FundingRelation) =>
		editor.mode === 'funding'
			? `/admin/entradas/${relation.entityType}/${relation.entityId}`
			: `/admin/entradas/funding_awards/${relation.fundingAwardId}`;

	let typeOptions = $derived.by(() => {
		const labels = new Map<string, string>();
		for (const candidate of editor.candidates) labels.set(candidate.entityType, candidate.typeLabel);
		return [...labels].map(([value, label]) => ({ value, label })).sort((a, b) =>
			a.label.localeCompare(b.label, 'es')
		);
	});

	let availableCandidates = $derived.by(() => {
		const related = new Set(editor.relations.map(relationKey));
		const normalizedQuery = normalize(query.trim());
		return editor.candidates
			.filter((candidate) => !related.has(relationKey(candidate)))
			.filter((candidate) => editor.mode !== 'funding' || !type || candidate.entityType === type)
			.filter((candidate) =>
				!normalizedQuery
					? true
					: normalize(`${candidateTitle(candidate)} ${candidateType(candidate)}`).includes(normalizedQuery)
			);
	});

	const enhancedSubmit = (key: string): SubmitFunction =>
		() => {
			pending = [...pending, key];
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					pending = pending.filter((item) => item !== key);
				}
			};
		};
</script>

<section id="funding-section" class="scroll-mt-36 mt-10 border-t border-rule pt-6" aria-labelledby="funding-relations-title">
	<h2 class="mt-0 mb-5 text-sm font-medium tracking-[0.08em] text-ink-dim uppercase" id="funding-relations-title">
		{editor.mode === 'funding' ? 'Actividad relacionada' : 'Financiación y premios'}
	</h2>
	<p class="mt-0 mb-4 max-w-[68ch] leading-[1.6] text-ink-dim">
		{editor.mode === 'funding'
			? 'Vincula esta ayuda, contrato o premio con las actividades académicas a las que da soporte o reconoce.'
			: 'Vincula esta entrada con las ayudas, contratos o premios relacionados.'}
	</p>

	{#if editor.relations.length === 0}
		<p class="m-0 rounded-ui border border-dashed border-rule px-4 py-3 text-xs text-ink-faint">
			No hay financiación ni premios relacionados.
		</p>
	{:else}
		<div class="min-w-0 overflow-hidden rounded-ui border border-rule bg-[var(--admin-surface)]">
			<header class="flex justify-between border-b border-rule px-4 py-[0.9rem] text-[0.78rem] text-ink">
				<strong>Relaciones actuales</strong>
				<span class="text-accent-strong">{editor.relations.length}</span>
			</header>
			<ul class="m-0 list-none p-0">
				{#each editor.relations as relation (relationKey(relation))}
					<li class="flex items-center justify-between gap-[0.9rem] border-b border-rule px-4 py-[0.85rem] last:border-b-0 max-[620px]:flex-col max-[620px]:items-stretch">
						<div class="min-w-0">
							<div class="mb-[0.3rem] flex flex-wrap gap-x-[0.65rem] gap-y-[0.35rem] text-[0.61rem] text-ink-faint">
								<span>{relationType(relation)}</span>
								<span>{relationDate(relation) ?? 'Sin fecha'}</span>
								<span class={relationPublic(relation) ? 'text-accent-strong' : ''}>
									{relationPublic(relation) ? 'Pública' : 'Privada'}
								</span>
							</div>
							<a class="block text-[0.76rem] leading-[1.35] text-ink hover:text-accent-strong" href={relationHref(relation)}>{relationTitle(relation)}</a>
						</div>
						<div class="flex flex-none items-end gap-1.5 max-[620px]:flex-col max-[620px]:items-stretch">
							<form class="flex items-end gap-1.5 max-[620px]:w-full" method="POST" action="?/tipoFinanciacion" use:enhance={enhancedSubmit(`kind:${relationKey(relation)}`)}>
								<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
								<input type="hidden" name="entityType" value={relation.entityType} />
								<input type="hidden" name="entityId" value={relation.entityId} />
								<label>
									<span class="sr-only">Tipo de relación con {relationTitle(relation)}</span>
									<Select class="text-[0.68rem]" name="relationKind" value={relation.relationKind}>
										{#each editor.kinds as kind (kind.value)}
											<option value={kind.value}>{kind.label}</option>
										{/each}
									</Select>
								</label>
								<Button size="sm" type="submit" disabled={pending.includes(`kind:${relationKey(relation)}`)}><Save size={13} strokeWidth={1.7} aria-hidden="true" />Guardar tipo</Button>
							</form>
							<form method="POST" action="?/quitarFinanciacion" use:enhance={enhancedSubmit(`remove:${relationKey(relation)}`)}>
								<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
								<input type="hidden" name="entityType" value={relation.entityType} />
								<input type="hidden" name="entityId" value={relation.entityId} />
								<Button variant="danger" size="sm" type="submit" disabled={pending.includes(`remove:${relationKey(relation)}`)}><Trash2 size={13} strokeWidth={1.7} aria-hidden="true" />Eliminar</Button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<details class="mt-4 overflow-hidden rounded-ui border border-rule bg-[var(--admin-surface)]">
		<summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-[0.76rem] text-accent-strong marker:hidden">
			<span class="inline-flex items-center gap-1.5"><Plus size={14} strokeWidth={1.7} aria-hidden="true" />Añadir relación</span>
			<span class="text-[0.62rem] text-ink-faint">{availableCandidates.length} disponibles</span>
		</summary>
		<div class="border-t border-rule">
			<div class="grid grid-cols-[minmax(0,1fr)_10rem] gap-[0.65rem] px-4 pt-[0.9rem] max-[620px]:grid-cols-1">
				<AdminField label="Buscar">
					<Input type="search" bind:value={query} placeholder="Título o tipo…" />
				</AdminField>
				{#if editor.mode === 'funding'}
					<AdminField label="Tipo">
						<Select bind:value={type}>
							<option value="">Todos</option>
							{#each typeOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</Select>
					</AdminField>
				{/if}
			</div>
			<p class="m-0 px-4 pt-[0.55rem] pb-[0.85rem] text-[0.65rem] text-ink-faint">{availableCandidates.length} disponibles</p>
			{#if availableCandidates.length === 0}
				<p class="m-0 p-4 text-xs text-ink-faint">No hay entradas disponibles con estos filtros.</p>
			{:else}
				<ul class="m-0 max-h-[32rem] list-none overflow-y-auto border-t border-rule p-0">
					{#each availableCandidates as candidate (relationKey(candidate))}
						<li class="flex items-center justify-between gap-[0.9rem] border-b border-rule px-4 py-[0.85rem] last:border-b-0 max-[620px]:flex-col max-[620px]:items-stretch">
							<div class="min-w-0">
								<div class="mb-[0.3rem] flex flex-wrap gap-x-[0.65rem] gap-y-[0.35rem] text-[0.61rem] text-ink-faint">
									<span>{candidateType(candidate)}</span>
									<span>{candidateDate(candidate) ?? 'Sin fecha'}</span>
									<span class={candidatePublic(candidate) ? 'text-accent-strong' : ''}>
										{candidatePublic(candidate) ? 'Pública' : 'Privada'}
									</span>
								</div>
								<strong class="block text-[0.76rem] leading-[1.35] text-ink">{candidateTitle(candidate)}</strong>
								<small class="mt-[0.3rem] block text-[0.62rem] text-ink-faint">{kindLabel(candidate.suggestedKind)}</small>
							</div>
							<form
								method="POST"
								action="?/relacionarFinanciacion"
								use:enhance={enhancedSubmit(`add:${relationKey(candidate)}`)}
							>
								<input type="hidden" name="fundingAwardId" value={candidate.fundingAwardId} />
								<input type="hidden" name="entityType" value={candidate.entityType} />
								<input type="hidden" name="entityId" value={candidate.entityId} />
								<input type="hidden" name="relationKind" value={candidate.suggestedKind} />
								<Button
									variant="primary"
									size="sm"
									type="submit"
									disabled={pending.includes(`add:${relationKey(candidate)}`)}
								><Plus size={13} strokeWidth={1.7} aria-hidden="true" />Añadir</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</details>
</section>
