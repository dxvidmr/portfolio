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

<section class="tw:mt-10 tw:border-t tw:border-rule tw:pt-6" aria-labelledby="funding-relations-title">
	<h2 class="tw:mt-0 tw:mb-4 tw:text-base" id="funding-relations-title">
		{editor.mode === 'funding' ? 'Actividad relacionada' : 'Financiación y premios'}
	</h2>
	<p class="tw:mt-0 tw:mb-4 tw:max-w-[68ch] tw:leading-[1.6] tw:text-ink-dim">
		{editor.mode === 'funding'
			? 'Vincula esta ayuda, contrato o premio con las actividades académicas a las que da soporte o reconoce.'
			: 'Vincula esta entrada con las ayudas, contratos o premios relacionados.'}
	</p>

	<div class="tw:grid tw:grid-cols-2 tw:items-start tw:gap-4 tw:max-[900px]:grid-cols-1">
		<div class="tw:min-w-0 tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:bg-[var(--admin-surface)]">
			<header class="tw:flex tw:justify-between tw:border-b tw:border-rule tw:px-4 tw:py-[0.9rem] tw:text-[0.78rem] tw:text-ink">
				<strong>Relaciones actuales</strong>
				<span class="tw:text-accent-strong">{editor.relations.length}</span>
			</header>
			{#if editor.relations.length === 0}
				<p class="tw:m-0 tw:p-4 tw:text-xs tw:text-ink-faint">Todavía no hay financiación o premios relacionados.</p>
			{:else}
				<ul class="tw:m-0 tw:list-none tw:p-0">
					{#each editor.relations as relation (relationKey(relation))}
						<li class="tw:flex tw:items-center tw:justify-between tw:gap-[0.9rem] tw:border-b tw:border-rule tw:px-4 tw:py-[0.85rem] tw:last:border-b-0 tw:max-[620px]:flex-col tw:max-[620px]:items-stretch">
							<div class="tw:min-w-0">
								<div class="tw:mb-[0.3rem] tw:flex tw:flex-wrap tw:gap-x-[0.65rem] tw:gap-y-[0.35rem] tw:text-[0.61rem] tw:text-ink-faint">
									<span>{relationType(relation)}</span>
									<span>{relationDate(relation) ?? 'Sin fecha'}</span>
									<span class={relationPublic(relation) ? 'tw:text-accent-strong' : ''}>
										{relationPublic(relation) ? 'Pública' : 'Privada'}
									</span>
								</div>
								<a class="tw:block tw:text-[0.76rem] tw:leading-[1.35] tw:text-ink tw:hover:text-accent-strong" href={relationHref(relation)}>{relationTitle(relation)}</a>
							</div>
							<div class="tw:flex tw:flex-none tw:items-end tw:gap-1.5 tw:max-[620px]:flex-col tw:max-[620px]:items-stretch">
								<form
									class="tw:flex tw:items-end tw:gap-1.5 tw:max-[620px]:w-full"
									method="POST"
									action="?/tipoFinanciacion"
									use:enhance={enhancedSubmit(`kind:${relationKey(relation)}`)}
								>
									<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
									<input type="hidden" name="entityType" value={relation.entityType} />
									<input type="hidden" name="entityId" value={relation.entityId} />
									<label>
										<span class="tw:sr-only">Tipo de relación con {relationTitle(relation)}</span>
										<Select class="tw:text-[0.68rem]" name="relationKind" value={relation.relationKind}>
											{#each editor.kinds as kind (kind.value)}
												<option value={kind.value}>{kind.label}</option>
											{/each}
										</Select>
									</label>
									<Button
										size="sm"
										type="submit"
										disabled={pending.includes(`kind:${relationKey(relation)}`)}
									>Guardar tipo</Button>
								</form>
								<form
									method="POST"
									action="?/quitarFinanciacion"
									use:enhance={enhancedSubmit(`remove:${relationKey(relation)}`)}
								>
									<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
									<input type="hidden" name="entityType" value={relation.entityType} />
									<input type="hidden" name="entityId" value={relation.entityId} />
									<Button
										variant="danger"
										size="sm"
										type="submit"
										disabled={pending.includes(`remove:${relationKey(relation)}`)}
									>Eliminar</Button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="tw:min-w-0 tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:bg-[var(--admin-surface)]">
			<header class="tw:flex tw:justify-between tw:border-b tw:border-rule tw:px-4 tw:py-[0.9rem] tw:text-[0.78rem] tw:text-ink"><strong>Añadir relación</strong></header>
			<div class="tw:grid tw:grid-cols-[minmax(0,1fr)_10rem] tw:gap-[0.65rem] tw:px-4 tw:pt-[0.9rem] tw:max-[620px]:grid-cols-1">
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
			<p class="tw:m-0 tw:px-4 tw:pt-[0.55rem] tw:pb-[0.85rem] tw:text-[0.65rem] tw:text-ink-faint">{availableCandidates.length} disponibles</p>
			{#if availableCandidates.length === 0}
				<p class="tw:m-0 tw:p-4 tw:text-xs tw:text-ink-faint">No hay entradas disponibles con estos filtros.</p>
			{:else}
				<ul class="tw:m-0 tw:list-none tw:p-0">
					{#each availableCandidates as candidate (relationKey(candidate))}
						<li class="tw:flex tw:items-center tw:justify-between tw:gap-[0.9rem] tw:border-b tw:border-rule tw:px-4 tw:py-[0.85rem] tw:last:border-b-0 tw:max-[620px]:flex-col tw:max-[620px]:items-stretch">
							<div class="tw:min-w-0">
								<div class="tw:mb-[0.3rem] tw:flex tw:flex-wrap tw:gap-x-[0.65rem] tw:gap-y-[0.35rem] tw:text-[0.61rem] tw:text-ink-faint">
									<span>{candidateType(candidate)}</span>
									<span>{candidateDate(candidate) ?? 'Sin fecha'}</span>
									<span class={candidatePublic(candidate) ? 'tw:text-accent-strong' : ''}>
										{candidatePublic(candidate) ? 'Pública' : 'Privada'}
									</span>
								</div>
								<strong class="tw:block tw:text-[0.76rem] tw:leading-[1.35] tw:text-ink">{candidateTitle(candidate)}</strong>
								<small class="tw:mt-[0.3rem] tw:block tw:text-[0.62rem] tw:text-ink-faint">{kindLabel(candidate.suggestedKind)}</small>
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
								>+ Añadir</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>
