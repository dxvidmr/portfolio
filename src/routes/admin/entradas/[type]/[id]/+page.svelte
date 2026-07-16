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
	const sectionClass = 'mt-10 border-t border-rule pt-6';
	const sectionTitleClass =
		'mt-0 mb-5 text-sm font-medium uppercase tracking-[0.08em] text-ink-dim';

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
	class="mb-4 px-0"
	data-sveltekit-preload-data="off">← Volver</ButtonLink
>

<nav class="mb-6 flex gap-2 text-[0.8rem] text-ink-faint" aria-label="Ruta">
	<a class="text-ink-dim hover:text-accent" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
	<span aria-hidden="true">/</span>
	<span>#{data.entityId}</span>
</nav>

<AdminPageHeader title={data.heading} eyebrow={data.typeLabel}>
	{#snippet actions()}
		<span
			class={`border px-2 py-1 text-[0.7rem] uppercase tracking-[0.08em] ${
				data.control.isPublic ? 'border-accent text-accent' : 'border-rule-strong text-ink-dim'
			}`}
		>
			{data.control.isPublic ? 'Pública' : 'Privada'}
		</span>
		{#if data.control.showHome}
			<span class="border border-accent px-2 py-1 text-[0.7rem] uppercase tracking-[0.08em] text-accent">
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
		<div class="mt-8">
			<Button type="submit">Guardar cambios</Button>
		</div>
	</form>
</section>

<section class={sectionClass} aria-labelledby="visibilidad-title">
	<h2 class={sectionTitleClass} id="visibilidad-title">Visibilidad y portada</h2>
	<div class="grid gap-6 md:grid-cols-2">
		<div class="grid content-start gap-3 border border-rule p-5">
			{#if data.control.isPublic}
				<p class="m-0 max-w-[60ch] leading-relaxed text-ink-dim">
					Visible en la web pública. Al pasarla a privada también se retira de la portada.
				</p>
				<form method="POST" action="?/despublicar">
					<Button type="submit" variant="secondary">Hacer privada</Button>
				</form>
			{:else}
				<p class="m-0 max-w-[60ch] leading-relaxed text-ink-dim">
					Entrada privada: no aparece en el CV ni en la portada.
				</p>
				<form method="POST" action="?/publicar">
					<Button type="submit">Publicar</Button>
				</form>
			{/if}
		</div>
		<div class="grid content-start gap-3 border border-rule p-5">
			{#if data.control.showHome}
				<p class="m-0 text-ink-dim">Seleccionada en la portada.</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="0" />
					<Button type="submit" variant="danger">Eliminar de portada</Button>
				</form>
			{:else}
				<p class="m-0 max-w-[60ch] leading-relaxed text-ink-dim">
					No aparece en la portada.
					{#if !data.control.isPublic}Mostrarla en portada también la hará pública.{/if}
				</p>
				<form method="POST" action="?/portada">
					<input type="hidden" name="enabled" value="1" />
					<Button type="submit">Mostrar en portada</Button>
				</form>
			{/if}
			<p class="m-0 text-xs text-ink-faint">
				El orden de la portada se gestiona en
				<a class="text-ink-dim hover:text-accent" href="/admin/portada">Portada</a>.
			</p>
		</div>
	</div>
</section>

{#if data.hasStructuralRelations}
	<section class={sectionClass} aria-labelledby="structural-title">
		<h2 class={sectionTitleClass} id="structural-title">Relaciones estructurales</h2>
		<p class="-mt-2 mb-4 max-w-[60ch] leading-relaxed text-ink-dim">
			Estas relaciones proceden de los campos del contenido relacionado. Para cambiarlas, edita
			la entrada correspondiente y modifica su selector.
		</p>
		<div class="grid gap-4 md:grid-cols-2">
			{#each data.structuralRelations as group (group.entityType)}
				<article class="min-w-0 border border-rule bg-admin-surface">
					<header class="flex justify-between gap-4 border-b border-rule p-4">
						<div>
							<h3 class="m-0 text-sm text-ink">{group.label}</h3>
							<p class="mt-1 mb-0 text-xs leading-relaxed text-ink-faint">
								{group.description}
							</p>
						</div>
						<strong class="text-sm font-medium text-accent">{group.items.length}</strong>
					</header>
					{#if group.items.length > 0}
						<ul class="m-0 list-none p-0">
							{#each group.items as item (`${item.entityType}:${item.entityId}`)}
								<li class="flex items-center justify-between gap-3 border-b border-rule px-4 py-3 last:border-b-0">
									<a
										class="grid min-w-0 gap-1 text-xs leading-snug text-ink hover:text-accent"
										href={`/admin/entradas/${item.entityType}/${item.entityId}`}
									>
										<span>{item.title}</span>
										<small class="text-[0.65rem] text-ink-faint">{item.sortDate ?? 'Sin fecha'}</small>
									</a>
									<span
										class={`shrink-0 text-[0.6rem] uppercase tracking-[0.05em] ${
											item.isPublic ? 'text-accent' : 'text-ink-dim'
										}`}
									>
										{item.isPublic ? 'Pública' : 'Privada'}
									</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="m-0 p-4 text-xs text-ink-faint">No hay entradas vinculadas.</p>
					{/if}
				</article>
			{/each}
		</div>
	</section>
{/if}

{#if data.canonicalEvent}
	<section class={sectionClass} aria-labelledby="canonical-event-title">
		<h2 class={sectionTitleClass} id="canonical-event-title">Evento compartido</h2>
		<p class="max-w-[60ch] leading-relaxed text-ink-dim">
			Esta actividad pertenece a
			<a class="text-accent hover:underline" href={`/admin/eventos/${data.canonicalEvent.id}`}>
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
		<p class="max-w-[60ch] leading-relaxed text-ink-dim">Esta entrada aparece en:</p>
		<ul class="my-3 flex list-none flex-wrap gap-2 p-0">
			{#each data.portfolioRelations as relation (relation.slug)}
				<li class="flex items-center gap-2 border border-rule px-3 py-2">
					<a
						class="text-ink hover:text-accent"
						href={`/admin/portfolio/${relation.slug}`}
					>
						{relation.featured ? '★ ' : ''}{relation.title}
					</a>
					{#if relation.featured}
						<span class="text-[0.65rem] uppercase tracking-[0.06em] text-warning">Destacada</span>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="max-w-[60ch] leading-relaxed text-ink-dim">
			No está relacionada con ninguna ficha narrativa.
		</p>
	{/if}
	<a
		class="mt-2 inline-block text-xs text-ink hover:text-accent"
		href="/admin/portfolio"
	>
		Gestionar relaciones del portfolio →
	</a>
</section>

<details class="mt-12 border border-danger p-5 [&[open]>summary]:mb-3">
	<summary class="cursor-pointer text-sm uppercase tracking-[0.08em] text-danger">
		Zona peligrosa
	</summary>
	<p class="max-w-[60ch] leading-relaxed text-ink-dim">
		Eliminar borra la entrada y sus relaciones (portfolio, etiquetas, enlaces y documentos). No se
		puede deshacer desde el dashboard.
	</p>
	<form method="POST" action="?/eliminar">
		<label class="mb-4 flex items-center gap-2 text-ink">
			<Checkbox name="confirmar" value="1" class="accent-danger" />
			<span>Entiendo que la eliminación es definitiva</span>
		</label>
		<Button type="submit" variant="danger">Eliminar entrada</Button>
	</form>
</details>
