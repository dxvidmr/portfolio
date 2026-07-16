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
	Vocabulario controlado de tipos (<code>type_vocab</code>). Los selectores del dashboard y las
	etiquetas de la web pública leen de aquí: añadir un tipo nuevo no requiere desplegar código.
	El código es inmutable una vez creado (lo referencian las entradas); un tipo solo puede
	eliminarse si ninguna entrada lo usa.
</p>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success ?? false} />
	{/key}
{/if}

{#each data.domains as group (group.domain)}
	<section aria-labelledby={`dominio-${group.domain}`}>
		<h2 id={`dominio-${group.domain}`}>{group.label} <code>{group.domain}</code></h2>

		{#if group.types.length > 0}
			<div class="rows" role="table" aria-label={group.label}>
				<div class="row head" role="row">
					<span role="columnheader">Código</span>
					<span role="columnheader">Etiqueta ES</span>
					<span role="columnheader">Etiqueta EN</span>
					<span role="columnheader">Orden</span>
					<span role="columnheader">Usos</span>
					<span role="columnheader" class="visually-hidden">Acciones</span>
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
		color: #fafafa;
		margin: 0 0 1rem;
	}

	.intro {
		max-width: 75ch;
		color: #a3a3a3;
		line-height: 1.6;
		margin: 0 0 2rem;
	}

	code {
		color: #00ff88;
		font-size: 0.85em;
		overflow-wrap: anywhere;
	}

	section {
		margin-bottom: 2.5rem;
	}

	h2 {
		font-size: 0.95rem;
		color: #e5e5e5;
		margin: 0 0 0.8rem;
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	h2 code {
		color: #737373;
		font-weight: 400;
	}

	.rows {
		display: grid;
		gap: 0.25rem;
		font-size: 0.82rem;
	}

	.row {
		display: grid;
		grid-template-columns: minmax(10rem, 0.9fr) 1.2fr 1.2fr 4.5rem 3rem auto auto;
		gap: 0.6rem;
		align-items: center;
		padding: 0.25rem 0;
		border-bottom: 1px solid #1a1a1a;
	}

	.row form {
		display: contents;
	}

	.row.head {
		color: #737373;
		border-bottom: 1px solid #262626;
		padding-bottom: 0.35rem;
	}

	input {
		font: inherit;
		width: 100%;
		background: #111;
		color: #e5e5e5;
		border: 1px solid #333;
		padding: 0.35rem 0.5rem;
	}

	input.order {
		width: 4.5rem;
	}

	input:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 2px;
	}

	.usage {
		color: #737373;
		text-align: center;
	}

	button {
		font: inherit;
		font-size: 0.78rem;
		background: none;
		border: 1px solid #404040;
		color: #d4d4d4;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		white-space: nowrap;
	}

	button:hover {
		border-color: #737373;
	}

	button:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		cursor: wait;
	}

	button.danger {
		border-color: #7f1d1d;
		color: #f87171;
	}

	button.danger:hover {
		border-color: #f87171;
	}

	.empty {
		color: #737373;
		font-size: 0.82rem;
	}

	.add {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.75rem;
		margin-top: 0.8rem;
		padding: 0.8rem;
		border: 1px dashed #333;
	}

	.add label {
		display: grid;
		gap: 0.3rem;
		font-size: 0.72rem;
		color: #737373;
		flex: 1 1 12rem;
	}

	.add .order-label {
		flex: 0 0 auto;
	}

	.add .order-label input {
		width: 4.5rem;
	}

	.add button {
		border-color: #00ff88;
		color: #00ff88;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}

	@media (max-width: 900px) {
		.row {
			grid-template-columns: 1fr 1fr;
			padding: 0.6rem 0;
		}

		.row.head {
			display: none;
		}
	}
</style>
