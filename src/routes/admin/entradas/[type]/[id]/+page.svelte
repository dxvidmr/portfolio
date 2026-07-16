<script lang="ts">
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import FundingRelations from '$lib/components/admin/FundingRelations.svelte';
	import AdditionalLinks from '$lib/components/admin/AdditionalLinks.svelte';
	import DocumentsEditor from '$lib/components/admin/DocumentsEditor.svelte';
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
		if (form.relationMessage)
			return { message: form.relationMessage, success: form.relationSuccess === true };
		if (form.linkMessage)
			return { message: form.linkMessage, success: form.linkSuccess === true };
		if (form.documentMessage)
			return { message: form.documentMessage, success: form.documentSuccess === true };
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
					<button type="submit" class="remove">Eliminar de portada</button>
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

{#if data.hasStructuralRelations}
	<section aria-labelledby="structural-title">
		<h2 id="structural-title">Relaciones estructurales</h2>
		<p class="section-intro">
			Estas relaciones proceden de los campos del contenido relacionado. Para cambiarlas, edita
			la entrada correspondiente y modifica su selector.
		</p>
		<div class="relation-groups">
			{#each data.structuralRelations as group (group.entityType)}
				<article class="relation-group">
					<header>
						<div>
							<h3>{group.label}</h3>
							<p>{group.description}</p>
						</div>
						<strong>{group.items.length}</strong>
					</header>
					{#if group.items.length > 0}
						<ul class="structural-list">
							{#each group.items as item (`${item.entityType}:${item.entityId}`)}
								<li>
									<a href={`/admin/entradas/${item.entityType}/${item.entityId}`}>
										<span>{item.title}</span>
										<small>{item.sortDate ?? 'Sin fecha'}</small>
									</a>
									<span class="relation-state" class:public={item.isPublic}>
										{item.isPublic ? 'Pública' : 'Privada'}
									</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="empty-relation">No hay entradas vinculadas.</p>
					{/if}
				</article>
			{/each}
		</div>
	</section>
{/if}

{#if data.canonicalEvent}
	<section aria-labelledby="canonical-event-title">
		<h2 id="canonical-event-title">Evento compartido</h2>
		<p>
			Esta actividad pertenece a
			<a class="canonical-event-link" href={`/admin/eventos/${data.canonicalEvent.id}`}>
				{data.canonicalEvent.title}
			</a>.
			Desde su ficha puedes ver los demás roles, incluida la asistencia privada.
		</p>
	</section>
{/if}

{#if data.fundingRelations}
	<FundingRelations editor={data.fundingRelations} />
{/if}

<AdditionalLinks editor={data.links} />

<DocumentsEditor editor={data.documents} />

<section aria-labelledby="portfolio-title">
	<h2 id="portfolio-title">Fichas del portfolio</h2>
	{#if data.portfolioRelations.length > 0}
		<p>Esta entrada aparece en:</p>
		<ul class="portfolio-relations">
			{#each data.portfolioRelations as relation (relation.slug)}
				<li>
					<a href={`/admin/portfolio?ficha=${relation.slug}&q=${encodeURIComponent(data.heading)}`}>
						{relation.featured ? '★ ' : ''}{relation.title}
					</a>
					{#if relation.featured}<span>Destacada</span>{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p>No está relacionada con ninguna ficha narrativa.</p>
	{/if}
	<a class="manage-portfolio" href={`/admin/portfolio?q=${encodeURIComponent(data.heading)}`}>
		Gestionar relaciones del portfolio →
	</a>
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
		color: var(--fg-faint);
		margin-bottom: 1.5rem;
	}

	.breadcrumb a {
		color: var(--fg-dim);
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
		color: var(--fg);
		margin: 0;
		max-width: 60ch;
	}

	.state {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		border: 1px solid var(--line-strong);
		color: var(--fg-dim);
		padding: 0.15rem 0.5rem;
	}

	.state.public {
		border-color: var(--accent-strong);
		color: var(--accent-strong);
	}

	h2 {
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-dim);
		margin: 0 0 1.25rem;
	}

	section {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
	}

	.back {
		display: inline-block;
		color: var(--fg-dim);
		text-decoration: none;
		margin-bottom: 1rem;
	}

	.back:hover {
		color: var(--accent-strong);
	}

	.back:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	.controls-row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.5rem;
	}

	.control-block {
		border: 1px solid var(--line);
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
		border: 1px solid var(--accent-strong);
		color: var(--accent-strong);
		padding: 0.55rem 1rem;
		cursor: pointer;
	}

	button:hover {
		background: var(--accent-wash);
	}

	button:focus-visible {
		outline: 2px solid var(--accent-strong);
		outline-offset: 3px;
	}

	button.secondary {
		border-color: var(--line-strong);
		color: var(--fg);
	}

	button.secondary:hover {
		background: var(--surface-tint);
	}

	.hint {
		color: var(--fg-faint);
		font-size: 0.8rem;
	}

	.hint a {
		color: var(--fg-dim);
	}

	.portfolio-relations {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		list-style: none;
		padding: 0;
		margin: 0.75rem 0 1rem;
	}

	.portfolio-relations li {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--line);
		padding: 0.45rem 0.65rem;
	}

	.portfolio-relations a,
	.manage-portfolio {
		color: var(--fg);
	}

	.canonical-event-link {
		color: var(--accent-strong);
	}

	.portfolio-relations span {
		color: var(--tone-amber);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.manage-portfolio {
		display: inline-block;
		margin-top: 0.5rem;
		font-size: 0.78rem;
	}

	.section-intro {
		margin: -0.5rem 0 1rem;
	}

	.relation-groups {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.relation-group {
		min-width: 0;
		border: 1px solid var(--line);
		background: var(--admin-surface);
	}

	.relation-group > header {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border-bottom: 1px solid var(--line);
	}

	.relation-group h3 {
		margin: 0;
		color: var(--fg);
		font-size: 0.82rem;
	}

	.relation-group header p {
		margin: 0.35rem 0 0;
		color: var(--fg-faint);
		font-size: 0.7rem;
		line-height: 1.45;
	}

	.relation-group header strong {
		color: var(--accent-strong);
		font-size: 0.8rem;
		font-weight: 500;
	}

	.structural-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.structural-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--line);
	}

	.structural-list li:last-child {
		border-bottom: 0;
	}

	.structural-list a {
		display: grid;
		min-width: 0;
		gap: 0.25rem;
		color: var(--fg);
		font-size: 0.76rem;
		line-height: 1.35;
	}

	.structural-list a:hover {
		color: var(--accent-strong);
	}

	.structural-list small {
		color: var(--fg-faint);
		font-size: 0.65rem;
	}

	.relation-state {
		flex: 0 0 auto;
		color: var(--fg-dim);
		font-size: 0.6rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.relation-state.public {
		color: var(--accent-strong);
	}

	.empty-relation {
		margin: 0;
		padding: 1rem;
		color: var(--fg-faint);
		font-size: 0.75rem;
	}

	section p {
		color: var(--fg-dim);
		max-width: 60ch;
		line-height: 1.6;
	}

	@media (max-width: 720px) {
		.relation-groups {
			grid-template-columns: 1fr;
		}
	}

	.danger {
		margin-top: 3rem;
		border: 1px solid var(--admin-danger);
		padding: 1rem 1.25rem;
	}

	.danger summary {
		cursor: pointer;
		color: var(--admin-danger);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.danger p {
		color: var(--fg-dim);
		max-width: 60ch;
	}

	.confirm {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--fg);
		margin-bottom: 1rem;
	}

	.confirm input {
		width: 1.05rem;
		height: 1.05rem;
		accent-color: var(--admin-danger);
	}

	button.delete {
		border-color: var(--admin-danger);
		color: var(--admin-danger);
	}

	button.delete:hover {
		background: var(--admin-danger-soft);
	}
</style>
