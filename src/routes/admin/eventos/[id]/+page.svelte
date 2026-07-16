<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import DocumentsEditor from '$lib/components/admin/DocumentsEditor.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let pendingAttendance = $state(false);
	const enhanceAttendance: SubmitFunction = () => {
		pendingAttendance = true;
		return async ({ update }) => {
			try { await update({ reset: false }); }
			finally { pendingAttendance = false; }
		};
	};
</script>

<svelte:head><title>{data.event.values.title} · Eventos · cv/admin</title></svelte:head>

<ButtonLink variant="ghost" size="sm" href="/admin/eventos" class="mb-4 px-0"
	>← Volver a eventos</ButtonLink
>
<AdminPageHeader title={data.event.values.title} eyebrow={`Evento canónico #${data.event.id}`}>
	{#snippet actions()}
		<span class="text-[0.68rem] text-ink-faint">La visibilidad pertenece a cada actividad</span>
	{/snippet}
</AdminPageHeader>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success === true} />{/key}
{/if}

<section class="mt-8 border-t border-rule pt-6">
	<h2 class="mt-0 mb-4 text-base">Datos comunes del evento</h2>
	<form method="POST" action="?/guardar">
		<CanonicalEventForm values={form?.raw ?? data.event.values} errors={form?.errors ?? {}} />
		<Button variant="primary" class="mt-5" type="submit">Guardar evento</Button>
	</form>
</section>

<section class="mt-8 border-t border-rule pt-6">
	<div class="flex items-start justify-between gap-4 max-[750px]:flex-col">
		<div><h2 class="mt-0 mb-4 text-base">Roles y actividades</h2><p class="-mt-2.5 mb-4 max-w-[70ch] text-xs leading-[1.5] text-ink-faint">Un mismo evento puede reunir varios roles independientes.</p></div>
		<div class="flex flex-wrap gap-2">
			<ButtonLink href={`/admin/entradas/nueva/talks?eventId=${data.event.id}`}>+ Contribución</ButtonLink>
			<ButtonLink href={`/admin/entradas/nueva/service_activities?eventId=${data.event.id}`}>+ Servicio</ButtonLink>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-4 max-[750px]:grid-cols-1">
		<article class="overflow-hidden rounded-ui border border-rule">
			<header class="flex justify-between border-b border-rule px-4 py-[0.85rem] text-xs"><strong>Contribuciones</strong><span class="text-accent-strong">{data.event.contributions.length}</span></header>
			{#if data.event.contributions.length}
				<ul class="m-0 list-none p-0">
					{#each data.event.contributions as item (item.entityId)}
						<li class="grid gap-[0.3rem] border-b border-rule px-4 py-3 last:border-b-0"><a class="text-xs leading-[1.35] text-ink hover:text-accent-strong" href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small class="text-[0.62rem] text-ink-faint">{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="m-0 p-4 text-[0.72rem] text-ink-faint">Sin contribuciones.</p>{/if}
		</article>
		<article class="overflow-hidden rounded-ui border border-rule">
			<header class="flex justify-between border-b border-rule px-4 py-[0.85rem] text-xs"><strong>Organización y evaluación</strong><span class="text-accent-strong">{data.event.serviceActivities.length}</span></header>
			{#if data.event.serviceActivities.length}
				<ul class="m-0 list-none p-0">
					{#each data.event.serviceActivities as item (item.entityId)}
						<li class="grid gap-[0.3rem] border-b border-rule px-4 py-3 last:border-b-0"><a class="text-xs leading-[1.35] text-ink hover:text-accent-strong" href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small class="text-[0.62rem] text-ink-faint">{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="m-0 p-4 text-[0.72rem] text-ink-faint">Sin actividades de servicio.</p>{/if}
		</article>
	</div>
</section>

<section class="mt-8 rounded-ui border border-warning p-5">
	<div class="flex items-start justify-between gap-4 max-[750px]:flex-col">
		<div><h2 class="mt-0 mb-4 text-base">Asistencia como oyente</h2><p class="-mt-2.5 mb-4 max-w-[70ch] text-xs leading-[1.5] text-ink-faint">Este rol y sus futuros certificados son siempre privados y nunca se envían a la web pública.</p></div>
		<span class="border border-warning px-2 py-1 text-[0.62rem] text-warning uppercase">Privado</span>
	</div>
	<form class="grid gap-[0.8rem]" method="POST" action="?/asistencia" use:enhance={enhanceAttendance}>
		<AdminField label="Rol registrado"><Input name="roleLabel" value={data.event.attendance?.roleLabel ?? 'Oyente/asistente'} /></AdminField>
		<AdminField label="Notas privadas"><Textarea name="notesPrivate" rows={3} value={data.event.attendance?.notesPrivate ?? ''} /></AdminField>
		<Button variant="primary" type="submit" disabled={pendingAttendance}>
			{data.event.attendance ? 'Actualizar asistencia' : 'Registrar asistencia'}
		</Button>
	</form>
	{#if data.event.attendance}
		<form class="mt-2.5" method="POST" action="?/quitarAsistencia" use:enhance={enhanceAttendance}>
			<Button variant="danger" type="submit" disabled={pendingAttendance}>Eliminar rol de oyente y sus certificados</Button>
		</form>
	{/if}
</section>

{#if data.attendanceDocuments}
	<DocumentsEditor editor={data.attendanceDocuments} />
{/if}

<details class="mt-10 rounded-ui border border-danger p-4 text-ink-dim">
	<summary class="cursor-pointer text-danger">Eliminar evento</summary>
	<p>Solo puede eliminarse cuando no tenga contribuciones, servicios ni asistencia asociados.</p>
	<form class="grid justify-items-start gap-3" method="POST" action="?/eliminar"><label class="flex items-center gap-2"><Checkbox name="confirmar" value="1" /> Confirmo la eliminación</label><Button variant="danger" type="submit">Eliminar</Button></form>
</details>
