<script lang="ts">
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const created = $derived(page.url.searchParams.get('creada') === '1');

	const toast = $derived.by(() => {
		if (!form) return null;
		if (form.guardada) return { message: 'Cambios guardados.', success: true };
		if (form.visibilidad)
			return {
				message:
					form.visibilidad === 'publicada'
						? 'La entrada ahora es pública.'
						: 'La entrada ahora es privada.',
				success: true
			};
		if (form.portada !== undefined)
			return {
				message: form.portada ? 'Añadida a la portada.' : 'Retirada de la portada.',
				success: true
			};
		if (form.eliminarError) return { message: form.eliminarError, success: false };
		if (form.errors)
			return { message: 'Revisa los campos marcados; no se ha guardado.', success: false };
		return null;
	});
</script>

<svelte:head>
	<title>{data.heading} · cv/admin</title>
</svelte:head>

<a class="back" href="/admin/entradas" data-sveltekit-preload-data="off">← Volver</a>

<nav class="breadcrumb" aria-label="Ruta">
	<a href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
	<span aria-hidden="true">/</span>
	<span>#{data.entityId}</span>
</nav>

<div class="head">
	<h1>{data.heading}</h1>
	<span class="state" class:public={data.control.isPublic}>
		{data.control.isPublic ? 'Pública' : 'Privada'}
	</span>
	{#if data.control.showHome}
		<span class="state public">En portada</span>
	{/if}
</div>

{#if created}
	<AdminToast message="Entrada creada como privada. Publícala cuando esté lista." success={true} />
{/if}
{#if toast}
	{#key form}
		<AdminToast message={toast.message} success={toast.success} />
	{/key}
{/if}

<section aria-labelledby="contenido-title">
	<h2 id="contenido-title">Contenido</h2>
	<form method="POST" action="?/guardar">
		<EntityForm
			fields={data.fields}
			options={data.options}
			values={form?.raw ?? data.values}
			errors={form?.errors ?? {}}
		/>
		<div class="actions">
			<button type="submit">Guardar cambios</button>
		</div>
	</form>
</section>

<section aria-labelledby="visibilidad-title">
	<h2 id="visibilidad-title">Visibilidad y portada</h2>
	<div class="controls-row">
		<div class="control-block">
			{#if data.control.isPublic}
				<p>Visible en la web pública. Al pasarla a privada también se retira de la portada.</p>
				<form method="POST" action="?/despublicar">
					<button type="submit" class="secondary">Hacer privada</button>
				</form>
			{:else}
				<p>Entrada privada: no aparece en el CV ni en la portada.</p>
				<form method="POST" action="?/publicar">
					<button type="submit">Publicar</button>
				</form>
			{/if}
		</div>
		<div class="control-block">
			{#if data.control.showHome}
				<p>Seleccionada en la portada.</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="0" />
					<button type="submit" class="secondary">Quitar de portada</button>
				</form>
			{:else}
				<p>
					No aparece en la portada.
					{#if !data.control.isPublic}Mostrarla en portada también la hará pública.{/if}
				</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="1" />
					<button type="submit">Mostrar en portada</button>
				</form>
			{/if}
			<p class="hint">
				El orden de la portada se gestiona en <a href="/admin/portada">Portada</a>.
			</p>
		</div>
	</div>
</section>

<details class="danger">
	<summary>Zona peligrosa</summary>
	<p>
		Eliminar borra la entrada y sus relaciones (portfolio, etiquetas, enlaces y documentos). No se
		puede deshacer desde el dashboard.
	</p>
	<form method="POST" action="?/eliminar">
		<label class="confirm">
			<input type="checkbox" name="confirmar" value="1" />
			<span>Entiendo que la eliminación es definitiva</span>
		</label>
		<button type="submit" class="delete">Eliminar entrada</button>
	</form>
</details>

<style>
	.breadcrumb {
		display: flex;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: #737373;
		margin-bottom: 1.5rem;
	}

	.breadcrumb a {
		color: #a3a3a3;
	}

	.head {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
		margin-bottom: 1.25rem;
	}

	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fafafa;
		margin: 0;
		max-width: 60ch;
	}

	.state {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border: 1px solid #525252;
		color: #a3a3a3;
		padding: 0.15rem 0.5rem;
	}

	.state.public {
		border-color: #00ff88;
		color: #00ff88;
	}

	h2 {
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a3a3a3;
		margin: 0 0 1.25rem;
	}

	section {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #262626;
	}

	.back {
		display: inline-block;
		color: #a3a3a3;
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.back:hover {
		color: #00ff88;
	}

	.back:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.controls-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.control-block {
		border: 1px solid #262626;
		padding: 1rem 1.25rem;
		display: grid;
		gap: 0.75rem;
		align-content: start;
	}

	.control-block p {
		margin: 0;
	}

	@media (max-width: 720px) {
		.controls-row {
			grid-template-columns: 1fr;
		}
	}

	.actions {
		margin-top: 2rem;
	}

	button {
		font: inherit;
		background: none;
		border: 1px solid #00ff88;
		color: #00ff88;
		padding: 0.55rem 1rem;
		cursor: pointer;
	}

	button:hover {
		background: rgba(0, 255, 136, 0.08);
	}

	button:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	button.secondary {
		border-color: #525252;
		color: #d4d4d4;
	}

	button.secondary:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.hint {
		color: #737373;
		font-size: 0.8rem;
	}

	.hint a {
		color: #a3a3a3;
	}

	section p {
		color: #a3a3a3;
		max-width: 60ch;
		line-height: 1.6;
	}

	.danger {
		margin-top: 3rem;
		border: 1px solid #7f1d1d;
		padding: 1rem 1.25rem;
	}

	.danger summary {
		cursor: pointer;
		color: #f87171;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.danger p {
		color: #a3a3a3;
		max-width: 60ch;
	}

	.confirm {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: #d4d4d4;
		margin-bottom: 1rem;
	}

	.confirm input {
		width: 1.05rem;
		height: 1.05rem;
		accent-color: #f87171;
	}

	button.delete {
		border-color: #f87171;
		color: #f87171;
	}

	button.delete:hover {
		background: rgba(248, 113, 113, 0.08);
	}
</style>
