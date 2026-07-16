<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type {
		FundingRelation,
		FundingRelationCandidate,
		FundingRelationEditor
	} from '$lib/server/admin/funding-relations';

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

<section aria-labelledby="funding-relations-title">
	<h2 id="funding-relations-title">
		{editor.mode === 'funding' ? 'Actividad relacionada' : 'Financiación y premios'}
	</h2>
	<p class="intro">
		{editor.mode === 'funding'
			? 'Vincula esta ayuda, contrato o premio con las actividades académicas a las que da soporte o reconoce.'
			: 'Vincula esta entrada con las ayudas, contratos o premios relacionados.'}
	</p>

	<div class="workspace">
		<div class="current-panel">
			<header>
				<strong>Relaciones actuales</strong>
				<span>{editor.relations.length}</span>
			</header>
			{#if editor.relations.length === 0}
				<p class="empty">Todavía no hay financiación o premios relacionados.</p>
			{:else}
				<ul class="relation-list">
					{#each editor.relations as relation (relationKey(relation))}
						<li>
							<div class="relation-copy">
								<div class="meta">
									<span>{relationType(relation)}</span>
									<span>{relationDate(relation) ?? 'Sin fecha'}</span>
									<span class:public={relationPublic(relation)}>
										{relationPublic(relation) ? 'Pública' : 'Privada'}
									</span>
								</div>
								<a href={relationHref(relation)}>{relationTitle(relation)}</a>
							</div>
							<div class="relation-actions">
								<form
									method="POST"
									action="?/tipoFinanciacion"
									use:enhance={enhancedSubmit(`kind:${relationKey(relation)}`)}
								>
									<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
									<input type="hidden" name="entityType" value={relation.entityType} />
									<input type="hidden" name="entityId" value={relation.entityId} />
									<label>
										<span class="sr-only">Tipo de relación con {relationTitle(relation)}</span>
										<select name="relationKind" value={relation.relationKind}>
											{#each editor.kinds as kind (kind.value)}
												<option value={kind.value}>{kind.label}</option>
											{/each}
										</select>
									</label>
									<button
										type="submit"
										disabled={pending.includes(`kind:${relationKey(relation)}`)}
									>Guardar tipo</button>
								</form>
								<form
									method="POST"
									action="?/quitarFinanciacion"
									use:enhance={enhancedSubmit(`remove:${relationKey(relation)}`)}
								>
									<input type="hidden" name="fundingAwardId" value={relation.fundingAwardId} />
									<input type="hidden" name="entityType" value={relation.entityType} />
									<input type="hidden" name="entityId" value={relation.entityId} />
									<button
										type="submit"
										class="remove"
										disabled={pending.includes(`remove:${relationKey(relation)}`)}
									>Eliminar</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="add-panel">
			<header><strong>Añadir relación</strong></header>
			<div class="filters">
				<label>
					<span>Buscar</span>
					<input type="search" bind:value={query} placeholder="Título o tipo…" />
				</label>
				{#if editor.mode === 'funding'}
					<label>
						<span>Tipo</span>
						<select bind:value={type}>
							<option value="">Todos</option>
							{#each typeOptions as option (option.value)}
								<option value={option.value}>{option.label}</option>
							{/each}
						</select>
					</label>
				{/if}
			</div>
			<p class="count">{availableCandidates.length} disponibles</p>
			{#if availableCandidates.length === 0}
				<p class="empty">No hay entradas disponibles con estos filtros.</p>
			{:else}
				<ul class="relation-list candidates">
					{#each availableCandidates as candidate (relationKey(candidate))}
						<li>
							<div class="relation-copy">
								<div class="meta">
									<span>{candidateType(candidate)}</span>
									<span>{candidateDate(candidate) ?? 'Sin fecha'}</span>
									<span class:public={candidatePublic(candidate)}>
										{candidatePublic(candidate) ? 'Pública' : 'Privada'}
									</span>
								</div>
								<strong>{candidateTitle(candidate)}</strong>
								<small>{kindLabel(candidate.suggestedKind)}</small>
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
								<button
									type="submit"
									disabled={pending.includes(`add:${relationKey(candidate)}`)}
								>+ Añadir</button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</section>

<style>
	section { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); }
	h2 { margin: 0 0 1rem; color: var(--fg-dim); font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; }
	.intro { max-width: 68ch; margin: 0 0 1rem; color: var(--fg-dim); line-height: 1.6; }
	.workspace { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
	.current-panel, .add-panel { min-width: 0; border: 1px solid var(--line); background: var(--admin-surface); }
	.current-panel > header, .add-panel > header { display: flex; justify-content: space-between; padding: 0.9rem 1rem; border-bottom: 1px solid var(--line); color: var(--fg); font-size: 0.78rem; }
	.current-panel > header span { color: var(--accent-strong); }
	.relation-list { margin: 0; padding: 0; list-style: none; }
	.relation-list > li { display: flex; align-items: center; justify-content: space-between; gap: 0.9rem; padding: 0.85rem 1rem; border-bottom: 1px solid var(--line); }
	.relation-list > li:last-child { border-bottom: 0; }
	.relation-copy { min-width: 0; }
	.relation-copy > a, .relation-copy > strong { display: block; color: var(--fg); font-size: 0.76rem; line-height: 1.35; }
	.relation-copy > a:hover { color: var(--accent-strong); }
	.relation-copy > small { display: block; margin-top: 0.3rem; color: var(--fg-faint); font-size: 0.62rem; }
	.meta { display: flex; flex-wrap: wrap; gap: 0.35rem 0.65rem; margin-bottom: 0.3rem; color: var(--fg-faint); font-size: 0.61rem; }
	.meta .public { color: var(--accent-strong); }
	.relation-actions { display: flex; flex: 0 0 auto; gap: 0.35rem; align-items: end; }
	.relation-actions form { display: flex; gap: 0.3rem; align-items: end; }
	.filters { display: grid; grid-template-columns: minmax(0, 1fr) 10rem; gap: 0.65rem; padding: 0.9rem 1rem 0; }
	.filters label { display: grid; gap: 0.3rem; }
	.filters label > span { color: var(--fg-faint); font-size: 0.62rem; letter-spacing: 0.06em; text-transform: uppercase; }
	input, select { min-width: 0; border: 1px solid var(--line); background: var(--bg); color: var(--fg); padding: 0.48rem; font: inherit; font-size: 0.68rem; }
	button { flex: 0 0 auto; border: 1px solid var(--line-strong); background: transparent; color: var(--fg); padding: 0.42rem 0.55rem; font: inherit; font-size: 0.65rem; cursor: pointer; }
	button:hover:not(:disabled) { border-color: var(--accent-strong); color: var(--accent-strong); }
	button.remove:hover:not(:disabled) { border-color: var(--admin-danger); color: var(--admin-danger); }
	button:disabled { opacity: 0.4; cursor: wait; }
	.count { margin: 0; padding: 0.55rem 1rem 0.85rem; color: var(--fg-faint); font-size: 0.65rem; }
	.empty { margin: 0; padding: 1rem; color: var(--fg-faint); font-size: 0.75rem; }
	.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }

	@media (max-width: 900px) {
		.workspace { grid-template-columns: 1fr; }
	}

	@media (max-width: 620px) {
		.filters { grid-template-columns: 1fr; }
		.relation-list > li, .relation-actions { align-items: stretch; flex-direction: column; }
		.relation-actions form { width: 100%; }
		.relation-actions select { flex: 1; }
	}
</style>
