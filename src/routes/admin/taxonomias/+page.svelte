<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import AdminToast from '$lib/components/AdminToast.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let pending = $state<string[]>([]);

	// Igual que en los editores de enlaces/documentos: sin reset del formulario
	// al terminar (el reset dejaría vacíos los campos, cuyo valor por defecto
	// en cliente es ''); la recarga de `data` tras la acción pinta el estado real.
	const enhancedSubmit = (key: string, reset = false): SubmitFunction =>
		() => {
			pending = [...pending, key];
			return async ({ update }) => {
				try {
					await update({ reset });
				} finally {
					pending = pending.filter((item) => item !== key);
				}
			};
		};
</script>

<svelte:head><title>Taxonomías · cv/admin</title></svelte:head>

<h1>Taxonomías</h1>
<p class="intro">
	Edita las etiquetas y el orden de los tipos. Los que están en uso se pueden modificar, pero no eliminar.
</p>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success ?? false} />
	{/key}
{/if}

{#each data.domains as group (group.domain)}
	<section class="taxonomy-group" aria-labelledby={`dominio-${group.domain}`}>
		<h2 id={`dominio-${group.domain}`}>{group.label} <code>{group.domain}</code></h2>

		{#if group.types.length > 0}
			<div class="rows" role="table" aria-label={group.label}>
				<div class="row head" role="row">
					<span role="columnheader">Código</span>
					<span role="columnheader">Etiqueta ES</span>
					<span role="columnheader">Etiqueta EN</span>
					<span role="columnheader">Orden</span>
					<span role="columnheader">Usos</span>
					<span role="columnheader" class="visually-hidden">Guardar</span>
					<span role="columnheader" class="visually-hidden">Eliminar</span>
				</div>
				{#each group.types as type (type.code)}
					<div class="row" role="row">
						<form method="POST" action="?/guardar" use:enhance={enhancedSubmit(`save:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							<span role="cell"><code>{type.code}</code></span>
							<span role="cell">
								<input name="label_es" value={type.labelEs} aria-label={`Etiqueta en español de ${type.code}`} />
							</span>
							<span role="cell">
								<input name="label_en" value={type.labelEn} aria-label={`Etiqueta en inglés de ${type.code}`} />
							</span>
							<span role="cell">
								<input name="sort_order" value={String(type.sortOrder)} inputmode="numeric" class="order" aria-label={`Orden de ${type.code}`} />
							</span>
							<span role="cell" class="usage">{type.usageCount}</span>
							<span role="cell">
								<button type="submit" disabled={pending.includes(`save:${type.code}`)}>Guardar</button>
							</span>
						</form>
						<form method="POST" action="?/eliminar" use:enhance={enhancedSubmit(`del:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							{#if type.usageCount === 0}
								<button type="submit" class="danger" disabled={pending.includes(`del:${type.code}`)}>
									Eliminar
								</button>
							{:else}
								<span class="action-placeholder" aria-hidden="true">En uso</span>
							{/if}
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty">Sin tipos todavía.</p>
		{/if}

		<form class="add" method="POST" action="?/crear" use:enhance={enhancedSubmit(`add:${group.domain}`, true)}>
			<input type="hidden" name="domain" value={group.domain} />
			<label>
				<span>Código nuevo</span>
				<input
					name="code"
					placeholder="minusculas_y_guion_bajo"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.code ?? '') : ''}
				/>
			</label>
			<label>
				<span>Etiqueta ES</span>
				<input
					name="label_es"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.label_es ?? '') : ''}
				/>
			</label>
			<label>
				<span>Etiqueta EN</span>
				<input
					name="label_en"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.label_en ?? '') : ''}
				/>
			</label>
			<label class="order-label">
				<span>Orden</span>
				<input
					name="sort_order"
					inputmode="numeric"
					class="order"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.sort_order ?? '') : ''}
				/>
			</label>
			<button type="submit" disabled={pending.includes(`add:${group.domain}`)}>Añadir tipo</button>
		</form>
	</section>
{/each}

<style>
	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--fg);
		margin: 0 0 1rem;
	}

	.intro {
		max-width: 75ch;
		color: var(--fg-dim);
		line-height: 1.6;
		margin: 0 0 2rem;
	}

	code {
		color: var(--accent-strong);
		font-size: 0.85em;
		overflow-wrap: anywhere;
	}

	.taxonomy-group {
		margin-bottom: 2rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
	}

	h2 {
		font-size: 0.95rem;
		color: var(--fg);
		margin: 0 0 0.8rem;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	h2 code {
		color: var(--fg-faint);
		font-weight: 400;
	}

	.rows {
		display: grid;
		gap: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		font-size: 0.82rem;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(9rem, 0.9fr) 1.2fr 1.2fr 4.5rem 3rem 6rem 6rem;
		gap: 0.6rem;
		align-items: center;
		padding: 0.55rem 0.65rem;
		border-bottom: 1px solid var(--line);
	}

	.row:last-child {
		border-bottom: 0;
	}

	.row form {
		display: contents;
	}

	.row.head {
		color: var(--fg-faint);
		border-bottom: 1px solid var(--line);
		padding-block: 0.5rem;
		background: var(--admin-surface-raised);
	}

	input {
		font: inherit;
		width: 100%;
		background: var(--admin-surface);
		color: var(--fg);
		border: 1px solid var(--line);
		padding: 0.35rem 0.5rem;
	}

	input.order {
		width: 4.5rem;
	}

	input:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 2px;
	}

	.usage {
		color: var(--fg-faint);
		text-align: center;
	}

	button {
		font: inherit;
		font-size: 0.78rem;
		background: none;
		border: 1px solid var(--line);
		color: var(--fg);
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		white-space: nowrap;
	}

	.row button,
	.action-placeholder {
		width: 6rem;
	}

	.action-placeholder {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 2.25rem;
		color: var(--fg-faint);
		font-size: 0.65rem;
	}

	button:hover {
		border-color: var(--fg-faint);
	}

	button:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	button.danger {
		border-color: var(--admin-danger);
		color: var(--admin-danger);
	}

	button.danger:hover {
		border-color: var(--admin-danger);
	}

	.empty {
		color: var(--fg-faint);
		font-size: 0.82rem;
	}

	.add {
		display: grid;
		grid-template-columns: repeat(3, minmax(9rem, 1fr)) 5rem auto;
		align-items: end;
		gap: 0.75rem;
		margin-top: 0.65rem;
		padding: 0.85rem;
		border: 1px dashed var(--line);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--bg-panel) 45%, transparent);
	}

	.add label {
		display: grid;
		gap: 0.3rem;
		font-size: 0.72rem;
		color: var(--fg-faint);
	}

	.add .order-label {
		flex: 0 0 auto;
	}

	.add .order-label input {
		width: 4.5rem;
	}

	.add button {
		border-color: var(--accent-strong);
		color: var(--accent-strong);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	@media (max-width: 900px) {
		.rows {
			gap: 0.75rem;
			border: 0;
			border-radius: 0;
			overflow: visible;
			background: transparent;
		}

		.row {
			display: block;
			padding: 0.85rem;
			border: 1px solid var(--line);
			border-radius: var(--radius);
			background: var(--admin-surface);
		}

		.row.head {
			display: none;
		}

		.row form:first-of-type {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.7rem;
		}

		.row form:first-of-type > span[role='cell'] {
			display: grid;
			align-content: end;
			gap: 0.3rem;
		}

		.row form:first-of-type > span[role='cell']::before {
			color: var(--fg-faint);
			font-size: 0.58rem;
			letter-spacing: 0.1em;
			text-transform: uppercase;
		}

		.row form:first-of-type > span[role='cell']:nth-of-type(1) {
			grid-column: 1 / -1;
		}

		.row form:first-of-type > span[role='cell']:nth-of-type(1)::before { content: 'Código'; }
		.row form:first-of-type > span[role='cell']:nth-of-type(2)::before { content: 'Etiqueta ES'; }
		.row form:first-of-type > span[role='cell']:nth-of-type(3)::before { content: 'Etiqueta EN'; }
		.row form:first-of-type > span[role='cell']:nth-of-type(4)::before { content: 'Orden'; }
		.row form:first-of-type > span[role='cell']:nth-of-type(5)::before { content: 'Usos'; }

		.row form:last-of-type {
			display: flex;
			justify-content: flex-end;
			margin-top: 0.7rem;
			padding-top: 0.7rem;
			border-top: 1px solid var(--line);
		}

		.row button,
		.action-placeholder {
			width: 100%;
		}

		.add {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.add button {
			width: 100%;
		}
	}

	@media (max-width: 560px) {
		.row form:first-of-type,
		.add {
			grid-template-columns: 1fr;
		}

		.add .order-label input,
		input.order {
			width: 100%;
		}
	}
</style>
