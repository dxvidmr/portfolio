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

<ButtonLink variant="ghost" size="sm" href="/admin/eventos" class="tw:mb-4 tw:px-0"
	>← Volver a eventos</ButtonLink
>
<AdminPageHeader title={data.event.values.title} eyebrow={`Evento canónico #${data.event.id}`}>
	{#snippet actions()}
		<span class="tw:text-[0.68rem] tw:text-ink-faint">La visibilidad pertenece a cada actividad</span>
	{/snippet}
</AdminPageHeader>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success === true} />{/key}
{/if}

<section class="tw:mt-8 tw:border-t tw:border-rule tw:pt-6">
	<h2 class="tw:mt-0 tw:mb-4 tw:text-base">Datos comunes del evento</h2>
	<form method="POST" action="?/guardar">
		<CanonicalEventForm values={form?.raw ?? data.event.values} errors={form?.errors ?? {}} />
		<Button variant="primary" class="tw:mt-5" type="submit">Guardar evento</Button>
	</form>
</section>

<section class="tw:mt-8 tw:border-t tw:border-rule tw:pt-6">
	<div class="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:max-[750px]:flex-col">
		<div><h2 class="tw:mt-0 tw:mb-4 tw:text-base">Roles y actividades</h2><p class="tw:-mt-2.5 tw:mb-4 tw:max-w-[70ch] tw:text-xs tw:leading-[1.5] tw:text-ink-faint">Un mismo evento puede reunir varios roles independientes.</p></div>
		<div class="tw:flex tw:flex-wrap tw:gap-2">
			<ButtonLink href={`/admin/entradas/nueva/talks?eventId=${data.event.id}`}>+ Contribución</ButtonLink>
			<ButtonLink href={`/admin/entradas/nueva/service_activities?eventId=${data.event.id}`}>+ Servicio</ButtonLink>
		</div>
	</div>

	<div class="tw:grid tw:grid-cols-2 tw:gap-4 tw:max-[750px]:grid-cols-1">
		<article class="tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule">
			<header class="tw:flex tw:justify-between tw:border-b tw:border-rule tw:px-4 tw:py-[0.85rem] tw:text-xs"><strong>Contribuciones</strong><span class="tw:text-accent-strong">{data.event.contributions.length}</span></header>
			{#if data.event.contributions.length}
				<ul class="tw:m-0 tw:list-none tw:p-0">
					{#each data.event.contributions as item (item.entityId)}
						<li class="tw:grid tw:gap-[0.3rem] tw:border-b tw:border-rule tw:px-4 tw:py-3 tw:last:border-b-0"><a class="tw:text-xs tw:leading-[1.35] tw:text-ink tw:hover:text-accent-strong" href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small class="tw:text-[0.62rem] tw:text-ink-faint">{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="tw:m-0 tw:p-4 tw:text-[0.72rem] tw:text-ink-faint">Sin contribuciones.</p>{/if}
		</article>
		<article class="tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule">
			<header class="tw:flex tw:justify-between tw:border-b tw:border-rule tw:px-4 tw:py-[0.85rem] tw:text-xs"><strong>Organización y evaluación</strong><span class="tw:text-accent-strong">{data.event.serviceActivities.length}</span></header>
			{#if data.event.serviceActivities.length}
				<ul class="tw:m-0 tw:list-none tw:p-0">
					{#each data.event.serviceActivities as item (item.entityId)}
						<li class="tw:grid tw:gap-[0.3rem] tw:border-b tw:border-rule tw:px-4 tw:py-3 tw:last:border-b-0"><a class="tw:text-xs tw:leading-[1.35] tw:text-ink tw:hover:text-accent-strong" href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small class="tw:text-[0.62rem] tw:text-ink-faint">{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="tw:m-0 tw:p-4 tw:text-[0.72rem] tw:text-ink-faint">Sin actividades de servicio.</p>{/if}
		</article>
	</div>
</section>

<section class="tw:mt-8 tw:rounded-ui tw:border tw:border-warning tw:p-5">
	<div class="tw:flex tw:items-start tw:justify-between tw:gap-4 tw:max-[750px]:flex-col">
		<div><h2 class="tw:mt-0 tw:mb-4 tw:text-base">Asistencia como oyente</h2><p class="tw:-mt-2.5 tw:mb-4 tw:max-w-[70ch] tw:text-xs tw:leading-[1.5] tw:text-ink-faint">Este rol y sus futuros certificados son siempre privados y nunca se envían a la web pública.</p></div>
		<span class="tw:border tw:border-warning tw:px-2 tw:py-1 tw:text-[0.62rem] tw:text-warning tw:uppercase">Privado</span>
	</div>
	<form class="tw:grid tw:gap-[0.8rem]" method="POST" action="?/asistencia" use:enhance={enhanceAttendance}>
		<AdminField label="Rol registrado"><Input name="roleLabel" value={data.event.attendance?.roleLabel ?? 'Oyente/asistente'} /></AdminField>
		<AdminField label="Notas privadas"><Textarea name="notesPrivate" rows={3} value={data.event.attendance?.notesPrivate ?? ''} /></AdminField>
		<Button variant="primary" type="submit" disabled={pendingAttendance}>
			{data.event.attendance ? 'Actualizar asistencia' : 'Registrar asistencia'}
		</Button>
	</form>
	{#if data.event.attendance}
		<form class="tw:mt-2.5" method="POST" action="?/quitarAsistencia" use:enhance={enhanceAttendance}>
			<Button variant="danger" type="submit" disabled={pendingAttendance}>Eliminar rol de oyente y sus certificados</Button>
		</form>
	{/if}
</section>

{#if data.attendanceDocuments}
	<DocumentsEditor editor={data.attendanceDocuments} />
{/if}

<details class="tw:mt-10 tw:rounded-ui tw:border tw:border-danger tw:p-4 tw:text-ink-dim">
	<summary class="tw:cursor-pointer tw:text-danger">Eliminar evento</summary>
	<p>Solo puede eliminarse cuando no tenga contribuciones, servicios ni asistencia asociados.</p>
	<form class="tw:grid tw:justify-items-start tw:gap-3" method="POST" action="?/eliminar"><label class="tw:flex tw:items-center tw:gap-2"><Checkbox name="confirmar" value="1" /> Confirmo la eliminación</label><Button variant="danger" type="submit">Eliminar</Button></form>
</details>
