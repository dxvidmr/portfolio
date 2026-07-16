<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import DocumentsEditor from '$lib/components/admin/DocumentsEditor.svelte';

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

<a class="back" href="/admin/eventos">← Volver a eventos</a>
<div class="heading">
	<div><p>Evento canónico #{data.event.id}</p><h1>{data.event.values.title}</h1></div>
	<span>La visibilidad pertenece a cada actividad</span>
</div>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success === true} />{/key}
{/if}

<section>
	<h2>Datos comunes del evento</h2>
	<form method="POST" action="?/guardar">
		<CanonicalEventForm values={form?.raw ?? data.event.values} errors={form?.errors ?? {}} />
		<button type="submit">Guardar evento</button>
	</form>
</section>

<section>
	<div class="section-heading">
		<div><h2>Roles y actividades</h2><p>Un mismo evento puede reunir varios roles independientes.</p></div>
		<div class="new-links">
			<a href={`/admin/entradas/nueva/talks?eventId=${data.event.id}`}>+ Contribución</a>
			<a href={`/admin/entradas/nueva/service_activities?eventId=${data.event.id}`}>+ Servicio</a>
		</div>
	</div>

	<div class="activity-grid">
		<article>
			<header><strong>Contribuciones</strong><span>{data.event.contributions.length}</span></header>
			{#if data.event.contributions.length}
				<ul>
					{#each data.event.contributions as item (item.entityId)}
						<li><a href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small>{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="empty">Sin contribuciones.</p>{/if}
		</article>
		<article>
			<header><strong>Organización y evaluación</strong><span>{data.event.serviceActivities.length}</span></header>
			{#if data.event.serviceActivities.length}
				<ul>
					{#each data.event.serviceActivities as item (item.entityId)}
						<li><a href={`/admin/entradas/${item.entityType}/${item.entityId}`}>{item.title}</a><small>{item.typeLabel} · {item.isPublic ? 'Pública' : 'Privada'}</small></li>
					{/each}
				</ul>
			{:else}<p class="empty">Sin actividades de servicio.</p>{/if}
		</article>
	</div>
</section>

<section class="attendance">
	<div class="private-heading">
		<div><h2>Asistencia como oyente</h2><p>Este rol y sus futuros certificados son siempre privados y nunca se envían a la web pública.</p></div>
		<span>Privado</span>
	</div>
	<form method="POST" action="?/asistencia" use:enhance={enhanceAttendance}>
		<label><span>Rol registrado</span><input name="roleLabel" value={data.event.attendance?.roleLabel ?? 'Oyente/asistente'} /></label>
		<label><span>Notas privadas</span><textarea name="notesPrivate" rows="3">{data.event.attendance?.notesPrivate ?? ''}</textarea></label>
		<button type="submit" disabled={pendingAttendance}>
			{data.event.attendance ? 'Actualizar asistencia' : 'Registrar asistencia'}
		</button>
	</form>
	{#if data.event.attendance}
		<form method="POST" action="?/quitarAsistencia" use:enhance={enhanceAttendance}>
			<button type="submit" class="secondary" disabled={pendingAttendance}>Quitar rol de oyente y sus certificados</button>
		</form>
	{/if}
</section>

{#if data.attendanceDocuments}
	<DocumentsEditor editor={data.attendanceDocuments} />
{/if}

<details class="danger">
	<summary>Eliminar evento</summary>
	<p>Solo puede eliminarse cuando no tenga contribuciones, servicios ni asistencia asociados.</p>
	<form method="POST" action="?/eliminar"><label><input type="checkbox" name="confirmar" value="1" /> Confirmo la eliminación</label><button type="submit">Eliminar</button></form>
</details>

<style>
	.back { display: inline-block; margin-bottom: 1rem; color: #a3a3a3; }
	.heading { display: flex; justify-content: space-between; gap: 1rem; align-items: end; }
	.heading p { margin: 0; color: #737373; font-size: 0.68rem; text-transform: uppercase; }
	h1 { max-width: 70ch; margin: 0.3rem 0 0; color: #fafafa; font-size: 1.2rem; }
	.heading > span { color: #737373; font-size: 0.68rem; }
	section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #262626; }
	h2 { margin: 0 0 1rem; color: #a3a3a3; font-size: 0.82rem; letter-spacing: 0.07em; text-transform: uppercase; }
	section > form > button { margin-top: 1.25rem; }
	button, .new-links a { border: 1px solid #525252; background: transparent; color: #d4d4d4; padding: 0.5rem 0.7rem; font: inherit; font-size: 0.7rem; cursor: pointer; }
	button:hover, .new-links a:hover { border-color: #00ff88; color: #00ff88; }
	button:disabled { opacity: 0.45; }
	.section-heading, .private-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: start; }
	.section-heading p, .private-heading p { margin: -0.6rem 0 1rem; max-width: 70ch; color: #737373; font-size: 0.75rem; line-height: 1.5; }
	.new-links { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.activity-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
	.activity-grid article { border: 1px solid #262626; }
	.activity-grid header { display: flex; justify-content: space-between; padding: 0.85rem 1rem; border-bottom: 1px solid #262626; font-size: 0.75rem; }
	.activity-grid header span { color: #00ff88; }
	.activity-grid ul { margin: 0; padding: 0; list-style: none; }
	.activity-grid li { display: grid; gap: 0.3rem; padding: 0.75rem 1rem; border-bottom: 1px solid #262626; }
	.activity-grid li:last-child { border-bottom: 0; }
	.activity-grid a { color: #d4d4d4; font-size: 0.75rem; line-height: 1.35; }
	.activity-grid small { color: #737373; font-size: 0.62rem; }
	.empty { margin: 0; padding: 1rem; color: #737373; font-size: 0.72rem; }
	.attendance { padding: 1.2rem; border: 1px solid #6b532b; }
	.private-heading > span { border: 1px solid #6b532b; padding: 0.25rem 0.45rem; color: #d6a84b; font-size: 0.62rem; text-transform: uppercase; }
	.attendance form { display: grid; gap: 0.8rem; }
	.attendance label { display: grid; gap: 0.35rem; color: #a3a3a3; font-size: 0.7rem; }
	.attendance input, .attendance textarea { border: 1px solid #404040; background: #111; color: #e5e5e5; padding: 0.5rem; font: inherit; }
	.attendance form + form { margin-top: 0.6rem; }
	.secondary { justify-self: start; }
	.danger { margin-top: 2.5rem; padding: 1rem; border: 1px solid #7f1d1d; color: #a3a3a3; }
	.danger summary { color: #f87171; cursor: pointer; }
	.danger form { display: grid; justify-items: start; gap: 0.8rem; }
	.danger button { border-color: #f87171; color: #f87171; }
	@media (max-width: 750px) { .activity-grid { grid-template-columns: 1fr; } .heading, .section-heading, .private-heading { align-items: start; flex-direction: column; } }
</style>
