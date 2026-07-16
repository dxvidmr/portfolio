<script lang="ts">
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import FundingRelations from '$lib/components/admin/FundingRelations.svelte';
	import AdditionalLinks from '$lib/components/admin/AdditionalLinks.svelte';
	import DocumentsEditor from '$lib/components/admin/DocumentsEditor.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const created = $derived(page.url.searchParams.get('creada') === '1');
	const sectionClass = 'tw:mt-10 tw:border-t tw:border-rule tw:pt-6';
	const sectionTitleClass =
		'tw:mt-0 tw:mb-5 tw:text-sm tw:font-medium tw:uppercase tw:tracking-[0.08em] tw:text-ink-dim';

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

<ButtonLink
	variant="ghost"
	size="sm"
	href="/admin/entradas"
	class="tw:mb-4 tw:px-0"
	data-sveltekit-preload-data="off">← Volver</ButtonLink
>

<nav class="tw:mb-6 tw:flex tw:gap-2 tw:text-[0.8rem] tw:text-ink-faint" aria-label="Ruta">
	<a class="tw:text-ink-dim tw:hover:text-accent" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
	<span aria-hidden="true">/</span>
	<span>#{data.entityId}</span>
</nav>

<AdminPageHeader title={data.heading} eyebrow={data.typeLabel}>
	{#snippet actions()}
		<span
			class={`tw:border tw:px-2 tw:py-1 tw:text-[0.7rem] tw:uppercase tw:tracking-[0.08em] ${
				data.control.isPublic ? 'tw:border-accent tw:text-accent' : 'tw:border-rule-strong tw:text-ink-dim'
			}`}
		>
			{data.control.isPublic ? 'Pública' : 'Privada'}
		</span>
		{#if data.control.showHome}
			<span class="tw:border tw:border-accent tw:px-2 tw:py-1 tw:text-[0.7rem] tw:uppercase tw:tracking-[0.08em] tw:text-accent">
				En portada
			</span>
		{/if}
	{/snippet}
</AdminPageHeader>

{#if created}
	<AdminToast message="Entrada creada como privada. Publícala cuando esté lista." success={true} />
{/if}
{#if toast}
	{#key form}
		<AdminToast message={toast.message} success={toast.success} />
	{/key}
{/if}

<section class={sectionClass} aria-labelledby="contenido-title">
	<h2 class={sectionTitleClass} id="contenido-title">Contenido</h2>
	<form method="POST" action="?/guardar">
		<EntityForm
			fields={data.fields}
			options={data.options}
			values={form?.raw ?? data.values}
			errors={form?.errors ?? {}}
		/>
		<div class="tw:mt-8">
			<Button type="submit">Guardar cambios</Button>
		</div>
	</form>
</section>

<section class={sectionClass} aria-labelledby="visibilidad-title">
	<h2 class={sectionTitleClass} id="visibilidad-title">Visibilidad y portada</h2>
	<div class="tw:grid tw:gap-6 md:tw:grid-cols-2">
		<div class="tw:grid tw:content-start tw:gap-3 tw:border tw:border-rule tw:p-5">
			{#if data.control.isPublic}
				<p class="tw:m-0 tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
					Visible en la web pública. Al pasarla a privada también se retira de la portada.
				</p>
				<form method="POST" action="?/despublicar">
					<Button type="submit" variant="secondary">Hacer privada</Button>
				</form>
			{:else}
				<p class="tw:m-0 tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
					Entrada privada: no aparece en el CV ni en la portada.
				</p>
				<form method="POST" action="?/publicar">
					<Button type="submit">Publicar</Button>
				</form>
			{/if}
		</div>
		<div class="tw:grid tw:content-start tw:gap-3 tw:border tw:border-rule tw:p-5">
			{#if data.control.showHome}
				<p class="tw:m-0 tw:text-ink-dim">Seleccionada en la portada.</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="0" />
					<Button type="submit" variant="danger">Eliminar de portada</Button>
				</form>
			{:else}
				<p class="tw:m-0 tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
					No aparece en la portada.
					{#if !data.control.isPublic}Mostrarla en portada también la hará pública.{/if}
				</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="1" />
					<Button type="submit">Mostrar en portada</Button>
				</form>
			{/if}
			<p class="tw:m-0 tw:text-xs tw:text-ink-faint">
				El orden de la portada se gestiona en
				<a class="tw:text-ink-dim tw:hover:text-accent" href="/admin/portada">Portada</a>.
			</p>
		</div>
	</div>
</section>

{#if data.hasStructuralRelations}
	<section class={sectionClass} aria-labelledby="structural-title">
		<h2 class={sectionTitleClass} id="structural-title">Relaciones estructurales</h2>
		<p class="tw:-mt-2 tw:mb-4 tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
			Estas relaciones proceden de los campos del contenido relacionado. Para cambiarlas, edita
			la entrada correspondiente y modifica su selector.
		</p>
		<div class="tw:grid tw:gap-4 md:tw:grid-cols-2">
			{#each data.structuralRelations as group (group.entityType)}
				<article class="tw:min-w-0 tw:border tw:border-rule tw:bg-admin-surface">
					<header class="tw:flex tw:justify-between tw:gap-4 tw:border-b tw:border-rule tw:p-4">
						<div>
							<h3 class="tw:m-0 tw:text-sm tw:text-ink">{group.label}</h3>
							<p class="tw:mt-1 tw:mb-0 tw:text-xs tw:leading-relaxed tw:text-ink-faint">
								{group.description}
							</p>
						</div>
						<strong class="tw:text-sm tw:font-medium tw:text-accent">{group.items.length}</strong>
					</header>
					{#if group.items.length > 0}
						<ul class="tw:m-0 tw:list-none tw:p-0">
							{#each group.items as item (`${item.entityType}:${item.entityId}`)}
								<li class="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:border-b tw:border-rule tw:px-4 tw:py-3 last:tw:border-b-0">
									<a
										class="tw:grid tw:min-w-0 tw:gap-1 tw:text-xs tw:leading-snug tw:text-ink tw:hover:text-accent"
										href={`/admin/entradas/${item.entityType}/${item.entityId}`}
									>
										<span>{item.title}</span>
										<small class="tw:text-[0.65rem] tw:text-ink-faint">{item.sortDate ?? 'Sin fecha'}</small>
									</a>
									<span
										class={`tw:shrink-0 tw:text-[0.6rem] tw:uppercase tw:tracking-[0.05em] ${
											item.isPublic ? 'tw:text-accent' : 'tw:text-ink-dim'
										}`}
									>
										{item.isPublic ? 'Pública' : 'Privada'}
									</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="tw:m-0 tw:p-4 tw:text-xs tw:text-ink-faint">No hay entradas vinculadas.</p>
					{/if}
				</article>
			{/each}
		</div>
	</section>
{/if}

{#if data.canonicalEvent}
	<section class={sectionClass} aria-labelledby="canonical-event-title">
		<h2 class={sectionTitleClass} id="canonical-event-title">Evento compartido</h2>
		<p class="tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
			Esta actividad pertenece a
			<a class="tw:text-accent tw:hover:underline" href={`/admin/eventos/${data.canonicalEvent.id}`}>
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

<section class={sectionClass} aria-labelledby="portfolio-title">
	<h2 class={sectionTitleClass} id="portfolio-title">Fichas del portfolio</h2>
	{#if data.portfolioRelations.length > 0}
		<p class="tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">Esta entrada aparece en:</p>
		<ul class="tw:my-3 tw:flex tw:list-none tw:flex-wrap tw:gap-2 tw:p-0">
			{#each data.portfolioRelations as relation (relation.slug)}
				<li class="tw:flex tw:items-center tw:gap-2 tw:border tw:border-rule tw:px-3 tw:py-2">
					<a
						class="tw:text-ink tw:hover:text-accent"
						href={`/admin/portfolio?ficha=${relation.slug}&q=${encodeURIComponent(data.heading)}`}
					>
						{relation.featured ? '★ ' : ''}{relation.title}
					</a>
					{#if relation.featured}
						<span class="tw:text-[0.65rem] tw:uppercase tw:tracking-[0.06em] tw:text-amber">Destacada</span>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
			No está relacionada con ninguna ficha narrativa.
		</p>
	{/if}
	<a
		class="tw:mt-2 tw:inline-block tw:text-xs tw:text-ink tw:hover:text-accent"
		href={`/admin/portfolio?q=${encodeURIComponent(data.heading)}`}
	>
		Gestionar relaciones del portfolio →
	</a>
</section>

<details class="tw:mt-12 tw:border tw:border-danger tw:p-5 tw:[&[open]>summary]:mb-3">
	<summary class="tw:cursor-pointer tw:text-sm tw:uppercase tw:tracking-[0.08em] tw:text-danger">
		Zona peligrosa
	</summary>
	<p class="tw:max-w-[60ch] tw:leading-relaxed tw:text-ink-dim">
		Eliminar borra la entrada y sus relaciones (portfolio, etiquetas, enlaces y documentos). No se
		puede deshacer desde el dashboard.
	</p>
	<form method="POST" action="?/eliminar">
		<label class="tw:mb-4 tw:flex tw:items-center tw:gap-2 tw:text-ink">
			<Checkbox name="confirmar" value="1" class="tw:accent-danger" />
			<span>Entiendo que la eliminación es definitiva</span>
		</label>
		<Button type="submit" variant="danger">Eliminar entrada</Button>
	</form>
</details>
