<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import EventRoleCard from '$lib/components/admin/EventRoleCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const contributionItems = $derived(
		data.event.contributions.map((item) => ({
			id: item.entityId,
			title: item.title,
			meta: item.typeLabel,
			href: `/admin/entradas/${item.entityType}/${item.entityId}`,
			isPublic: item.isPublic,
			documentCount: item.documentCount,
			certificateCount: item.certificateCount
		}))
	);
	const serviceItems = $derived(
		data.event.serviceActivities.map((item) => ({
			id: item.entityId,
			title: item.title,
			meta: item.typeLabel,
			href: `/admin/entradas/${item.entityType}/${item.entityId}`,
			isPublic: item.isPublic,
			documentCount: item.documentCount,
			certificateCount: item.certificateCount
		}))
	);
	const attendanceItems = $derived(
		data.event.attendance
			? [{
					id: data.event.attendance.id,
					title: data.event.attendance.roleLabel,
					meta: 'Asistencia a este evento',
					href: `/admin/entradas/event_attendance/${data.event.attendance.id}`,
					isPublic: false,
					documentCount: data.event.attendance.documentCount,
					certificateCount: data.event.attendance.certificateCount
				}]
			: []
	);
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
		<CanonicalEventForm
			values={form?.raw ?? data.event.values}
			errors={form?.errors ?? {}}
			modalityOptions={data.eventOptions.modalities}
		/>
		<Button variant="primary" class="mt-5" type="submit">Guardar evento</Button>
	</form>
</section>

<section class="mt-8 border-t border-rule pt-6">
	<div class="mb-4 grid gap-2">
		<h2 class="m-0 text-base">Roles y actividades</h2>
		<p class="m-0 max-w-[70ch] text-xs leading-[1.5] text-ink-faint">
			Un mismo evento puede reunir varias entradas independientes. Cada una conserva su formulario,
			sus documentos y sus certificados.
		</p>
	</div>

	<div class="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-1">
		<EventRoleCard
			title="Comunicaciones"
			description="Ponencias, comunicaciones, pósteres y otras contribuciones."
			items={contributionItems}
			emptyText="Sin comunicaciones vinculadas."
			addHref={`/admin/entradas/nueva/talks?eventId=${data.event.id}`}
			addLabel="+ Comunicación"
		/>
		<EventRoleCard
			title="Servicio"
			description="Organización, comités, evaluación u otros servicios vinculados."
			items={serviceItems}
			emptyText="Sin actividades de servicio vinculadas."
			addHref={`/admin/entradas/nueva/service_activities?eventId=${data.event.id}`}
			addLabel="+ Servicio"
		/>
		<EventRoleCard
			title="Asistencia"
			description="Participación como oyente o asistente; siempre privada."
			items={attendanceItems}
			emptyText="Sin asistencia registrada."
			addHref={data.event.attendance
				? undefined
				: `/admin/entradas/nueva/event_attendance?eventId=${data.event.id}`}
			addLabel={data.event.attendance ? undefined : '+ Asistencia'}
		/>
	</div>
</section>

<details class="mt-10 rounded-ui border border-danger p-4 text-ink-dim">
	<summary class="cursor-pointer text-danger">Eliminar evento</summary>
	<p>Solo puede eliminarse cuando no tenga contribuciones, servicios ni asistencia asociados.</p>
	<form class="grid justify-items-start gap-3" method="POST" action="?/eliminar"><label class="flex items-center gap-2"><Checkbox name="confirmar" value="1" /> Confirmo la eliminación</label><Button variant="danger" type="submit">Eliminar</Button></form>
</details>
