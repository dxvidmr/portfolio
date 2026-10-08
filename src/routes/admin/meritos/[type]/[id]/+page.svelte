<script lang="ts">
	import { page } from '$app/state';
	import type { ActionData, PageData } from './$types';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import FundingRelations from '$lib/components/admin/FundingRelations.svelte';
	import AdditionalLinks from '$lib/components/admin/AdditionalLinks.svelte';
	import DocumentsEditor from '$lib/components/admin/DocumentsEditor.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminFormNav from '$lib/components/admin/AdminFormNav.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Save from '@lucide/svelte/icons/save';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Plus from '@lucide/svelte/icons/plus';
	import X from '@lucide/svelte/icons/x';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const created = $derived(page.url.searchParams.get('creada') === '1');
	const sectionClass = 'mt-10 border-t border-rule pt-6';
	const sectionTitleClass =
		'mt-0 mb-5 text-sm font-medium uppercase tracking-[0.08em] text-ink-dim';
	const isPublication = $derived(data.entityType === 'publications');
	const hasStructuralRelationItems = $derived(
		data.structuralRelations.some((group) => group.items.length > 0)
	);
	const navItems = $derived.by(() => {
		const items: Array<{
			href: string;
			label: string;
			meta?: string | number;
			group?: 'content' | 'management';
		}> = data.groups.length > 0
			? data.groups.map((group) => ({ href: `#${group.id}`, label: group.title }))
			: [{ href: '#content-section', label: 'Contenido' }];

		items.push({
			href: '#presence-section',
			label: data.capabilities.canPublish ? 'Presencia pública' : 'Privacidad',
			group: 'management'
		});
		if (hasStructuralRelationItems)
			items.push({ href: '#structural-section', label: 'Relaciones estructurales', group: 'management' });
		if (data.fundingRelations)
			items.push({
				href: '#funding-section',
				label: 'Financiación y premios',
				meta: data.fundingRelations.relations.length,
				group: 'management'
			});
		if (data.links) {
			items.push({
				href: '#links-section',
				label: 'Recursos y archivos',
				meta: data.links.links.length + data.documents.documents.length,
				group: 'management'
			});
		} else {
			items.push({
				href: '#documents-section',
				label: 'Documentos',
				meta: data.documents.documents.length,
				group: 'management'
			});
		}
		return items;
	});

	const toast = $derived.by(() => {
		if (!form) return null;
		if (form.guardada) return { message: 'Cambios guardados.', success: true };
		if (form.visibilidad)
			return {
				message:
					form.visibilidad === 'publicada'
						? 'El mérito ahora es público.'
						: 'El mérito ahora es privado.',
				success: true
			};
		if (form.actividad !== undefined)
			return {
				message: form.actividad ? 'Añadido a la portada.' : 'Retirado de la portada.',
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
	href="/admin/meritos"
	class="mb-4 px-0"
	data-sveltekit-preload-data="off">← Volver</ButtonLink
>

<nav class="mb-6 flex gap-2 text-[0.8rem] text-ink-faint" aria-label="Ruta">
	<a class="text-ink-dim hover:text-accent" href="/admin/meritos">Méritos</a>
	<span aria-hidden="true">/</span>
	<span>{data.typeLabel}</span>
	<span aria-hidden="true">/</span>
	<span>#{data.entityId}</span>
</nav>

{#if data.skillUses.length}<aside class="mb-5 border-b border-rule pb-4 text-xs"><p>Este trabajo ejemplifica:</p><div class="flex flex-wrap gap-3">{#each data.skillUses as skill}<a href={`/admin/meritos/skills/${skill.id}`} class="text-accent-strong underline">{skill.name}</a>{/each}</div></aside>{/if}
<AdminPageHeader title={data.heading} eyebrow={data.typeLabel}>
	{#snippet actions()}
		<span
			class={`rounded-ui-sm border px-2 py-1 text-[0.7rem] uppercase tracking-[0.08em] ${
				data.control.isPublic ? 'border-accent text-accent' : 'border-rule-strong text-ink-dim'
			}`}
		>
			{data.capabilities.canPublish && data.control.isPublic ? 'Público' : 'Privado'}
		</span>
		{#if data.control.showHome}
			<span class="rounded-ui-sm border border-accent px-2 py-1 text-[0.7rem] uppercase tracking-[0.08em] text-accent">
				En portada
			</span>
		{/if}
	{/snippet}
</AdminPageHeader>

{#if created}
	<AdminToast
		message={data.capabilities.canPublish
			? 'Mérito creado como privado. Publícalo cuando esté listo.'
			: 'Asistencia creada. Las asistencias son siempre privadas.'}
		success={true}
	/>
{/if}
{#if toast}
	{#key form}
		<AdminToast message={toast.message} success={toast.success} />
	{/key}
{/if}

<div class="grid items-start gap-10 min-[1100px]:grid-cols-[12rem_minmax(0,1fr)]">
	<AdminFormNav items={navItems} formId="entry-content-form" />
	<div class="min-w-0">
<section class="scroll-mt-36 {sectionClass}" id="content-section" aria-labelledby="contenido-title">
	<h2 class={sectionTitleClass} id="contenido-title">
		{isPublication ? 'Información bibliográfica' : 'Contenido'}
	</h2>
	<form id="entry-content-form" method="POST" action="?/guardar">
		<EntityForm
			fields={data.fields}
			groups={data.groups}
			options={data.options}
			values={form?.raw ?? data.values}
			errors={form?.errors ?? {}}
		/>
		<div class="mt-8">
			<Button type="submit"><Save size={15} strokeWidth={1.7} aria-hidden="true" />Guardar cambios</Button>
		</div>
	</form>
</section>

<section class="scroll-mt-36 {sectionClass}" id="presence-section" aria-labelledby="presence-title">
	<h2 class={sectionTitleClass} id="presence-title">
		{data.capabilities.canPublish ? 'Presencia pública' : 'Privacidad'}
	</h2>
	{#if data.capabilities.canPublish}
	<div class="grid gap-4 lg:grid-cols-3">
		<div class="grid content-start gap-3 rounded-ui border border-rule p-5">
			<div>
				<p class="m-0 text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">Publicación</p>
				<h3 class="mt-1 mb-0 text-sm font-medium text-ink">Web pública</h3>
			</div>
			{#if data.control.isPublic}
				<p class="m-0 max-w-[60ch] text-sm leading-relaxed text-ink-dim">
					Visible en la web. Si lo haces privado, también sale de la portada.
				</p>
				<form method="POST" action="?/despublicar">
					<Button type="submit" variant="secondary"><EyeOff size={15} strokeWidth={1.7} aria-hidden="true" />Hacer privado</Button>
				</form>
			{:else}
				<p class="m-0 max-w-[60ch] text-sm leading-relaxed text-ink-dim">
					Privado: no aparece en la web.
				</p>
				<form method="POST" action="?/publicar">
					<Button type="submit"><Eye size={15} strokeWidth={1.7} aria-hidden="true" />Publicar</Button>
				</form>
			{/if}
		</div>
		<div class="grid content-start gap-3 rounded-ui border border-rule p-5">
			<div>
				<p class="m-0 text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">Selección</p>
				<h3 class="mt-1 mb-0 text-sm font-medium text-ink">Portada</h3>
			</div>
			{#if data.control.showHome}
				<p class="m-0 text-sm leading-relaxed text-ink-dim">Seleccionado para «Actividad reciente» en la portada.</p>
				<form method="POST" action="?/actividad">
					<input type="hidden" name="enabled" value="0" />
					<Button type="submit" variant="danger"><X size={15} strokeWidth={1.7} aria-hidden="true" />Quitar de la portada</Button>
				</form>
			{:else}
				<p class="m-0 max-w-[60ch] text-sm leading-relaxed text-ink-dim">
					No aparece en la portada.
					{#if !data.control.isPublic}Mostrarlo en la portada también lo hará público.{/if}
				</p>
				<form method="POST" action="?/actividad">
					<input type="hidden" name="enabled" value="1" />
					<Button type="submit"><Plus size={15} strokeWidth={1.7} aria-hidden="true" />Mostrar en portada</Button>
				</form>
			{/if}
		</div>
		<div class="grid content-start gap-3 rounded-ui border border-rule p-5">
			<div>
				<p class="m-0 text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">Relación</p>
				<h3 class="mt-1 mb-0 text-sm font-medium text-ink">Fichas del portfolio</h3>
			</div>
			{#if data.portfolioRelations.length > 0}
				<ul class="m-0 grid list-none gap-2 p-0">
					{#each data.portfolioRelations as relation (relation.slug)}
						<li>
							<a class="text-xs leading-snug text-ink hover:text-accent" href={`/admin/portfolio/${relation.slug}`}>
								{relation.featured ? '★ ' : ''}{relation.title}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="m-0 text-sm leading-relaxed text-ink-dim">No aparece en ninguna ficha del portfolio.</p>
			{/if}
			<a class="mt-auto inline-flex items-center gap-1.5 pt-2 text-xs text-ink hover:text-accent" href="/admin/portfolio">
				Gestionar en Portfolio <ExternalLink size={13} strokeWidth={1.7} aria-hidden="true" />
			</a>
		</div>
	</div>
	{:else}
		<div class="grid max-w-[48rem] gap-3 rounded-ui border border-warning p-5">
			<div>
				<p class="m-0 text-[0.6rem] tracking-[0.1em] text-warning uppercase">Mérito privado</p>
				<h3 class="mt-1 mb-0 text-sm font-medium text-ink">Asistencia a evento</h3>
			</div>
			<p class="m-0 max-w-[65ch] text-sm leading-relaxed text-ink-dim">
				Las asistencias no aparecen en la web ni en Mis CV. Sirven para guardar el certificado.
			</p>
		</div>
	{/if}
</section>

{#if hasStructuralRelationItems}
	<section class="scroll-mt-36 {sectionClass}" id="structural-section" aria-labelledby="structural-title">
		<h2 class={sectionTitleClass} id="structural-title">Méritos que apuntan a este</h2>
		<p class="-mt-2 mb-6 max-w-[82ch] text-sm leading-[1.7] text-ink-dim">
			Para cambiar estas relaciones, edita esos méritos.
		</p>
		<div class="grid max-w-[76rem] gap-5 md:grid-cols-2">
			{#each data.structuralRelations as group (group.entityType)}
				{#if group.items.length > 0}
				<article class="min-w-0 overflow-hidden rounded-ui border border-rule bg-admin-surface">
					<header class="flex justify-between gap-6 border-b border-rule px-5 py-4">
						<div>
							<h3 class="m-0 text-sm font-medium text-ink">{group.label}</h3>
							<p class="mt-1.5 mb-0 max-w-[58ch] text-xs leading-[1.6] text-ink-faint">
								{group.description}
							</p>
						</div>
						<strong class="shrink-0 text-sm font-medium text-accent">{group.items.length}</strong>
					</header>
					<ul class="m-0 list-none p-0">
							{#each group.items as item (`${item.entityType}:${item.entityId}`)}
								<li class="flex items-center justify-between gap-4 border-b border-rule px-5 py-4 last:border-b-0">
									<a
										class="grid min-w-0 gap-1 text-xs leading-snug text-ink hover:text-accent"
										href={`/admin/meritos/${item.entityType}/${item.entityId}`}
									>
										<span>{item.title}</span>
										<small class="text-[0.65rem] text-ink-faint">{item.sortDate ?? 'Sin fecha'}</small>
									</a>
									<span
										class={`shrink-0 text-[0.6rem] uppercase tracking-[0.05em] ${
											item.isPublic ? 'text-accent' : 'text-ink-dim'
										}`}
									>
										{item.isPublic ? 'Público' : 'Privado'}
									</span>
								</li>
							{/each}
					</ul>
				</article>
				{/if}
			{/each}
		</div>
	</section>
{/if}

{#if data.fundingRelations}
	<FundingRelations editor={data.fundingRelations} />
{/if}

{#if data.links}
	<AdditionalLinks editor={data.links} />
{/if}

<DocumentsEditor editor={data.documents} />

<details id="danger-section" class="scroll-mt-36 mt-12 border border-danger p-5 [&[open]>summary]:mb-3">
	<summary class="cursor-pointer text-sm uppercase tracking-[0.08em] text-danger">
		Zona peligrosa
	</summary>
	<p class="max-w-[60ch] leading-relaxed text-ink-dim">
		Borra el mérito con sus enlaces, documentos, etiquetas y relaciones con el portfolio. No se
		puede deshacer.
	</p>
	<form method="POST" action="?/eliminar">
		<label class="mb-4 flex items-center gap-2 text-ink">
			<Checkbox name="confirmar" value="1" class="accent-danger" />
			<span>Entiendo que la eliminación es definitiva</span>
		</label>
		<Button type="submit" variant="danger"><Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />Eliminar mérito</Button>
	</form>
</details>
	</div>
</div>
