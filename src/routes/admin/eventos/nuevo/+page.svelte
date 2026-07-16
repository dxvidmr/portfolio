<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// Roles marcados (decisión 23). Sin use:enhance, un fallo de validación
	// llega como página completa nueva, así que el valor inicial de `form`
	// es exactamente el estado a restaurar.
	// svelte-ignore state_referenced_locally
	let withTalk = $state(form?.raw?.rol_contribucion === '1');
	// svelte-ignore state_referenced_locally
	let withService = $state(form?.raw?.rol_servicio === '1');
	// svelte-ignore state_referenced_locally
	let withAttendance = $state(form?.raw?.rol_asistencia === '1');
</script>

<svelte:head><title>Nuevo evento · cv/admin</title></svelte:head>

<a class="back" href="/admin/eventos">← Volver a eventos</a>
<h1>Nuevo evento</h1>
<p>
	Registra una sola vez los datos comunes del evento y marca los papeles que quieras crear ahora.
	Las contribuciones y servicios nacen privados; podrás completarlos y publicarlos después.
</p>

{#if form?.errors}<AdminToast message="Revisa los campos marcados." success={false} />{/if}

<form method="POST" action="?/crear">
	<section>
		<h2>Datos del evento</h2>
		<CanonicalEventForm values={form?.raw ?? {}} errors={form?.errors ?? {}} />
	</section>

	<section>
		<h2>¿Cuál fue tu papel?</h2>
		<p class="hint">Puedes marcar varios; también puedes registrar solo el evento y añadir roles más tarde.</p>

		<label class="role">
			<input type="checkbox" name="rol_contribucion" value="1" bind:checked={withTalk} />
			<span>Contribución <small>comunicación, ponencia, póster…</small></span>
		</label>
		{#if withTalk}
			<fieldset>
				<legend>Contribución</legend>
				<EntityForm
					fields={data.talkFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="role">
			<input type="checkbox" name="rol_servicio" value="1" bind:checked={withService} />
			<span>Servicio <small>organización, comité, evaluación…</small></span>
		</label>
		{#if withService}
			<fieldset>
				<legend>Servicio</legend>
				<p class="hint">Si dejas el título vacío se usará el nombre del evento.</p>
				<EntityForm
					fields={data.serviceFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="role">
			<input type="checkbox" name="rol_asistencia" value="1" bind:checked={withAttendance} />
			<span>Asistencia como oyente <small>siempre privada; nunca llega a la web pública</small></span>
		</label>
		{#if withAttendance}
			<fieldset>
				<legend>Asistencia</legend>
				<div class="attendance-grid">
					<label>
						<span>Rol registrado</span>
						<input name="at_role_label" value={form?.raw?.at_role_label || 'Oyente/asistente'} />
					</label>
					<label>
						<span>Notas privadas</span>
						<textarea name="at_notes" rows="3">{form?.raw?.at_notes ?? ''}</textarea>
					</label>
				</div>
			</fieldset>
		{/if}
	</section>

	<div class="actions"><button type="submit">Crear evento</button><a href="/admin/eventos">Cancelar</a></div>
</form>

<style>
	.back { display: inline-block; margin-bottom: 1rem; color: #a3a3a3; }
	h1 { margin: 0 0 0.6rem; color: #fafafa; font-size: 1.3rem; }
	p { max-width: 70ch; color: #a3a3a3; line-height: 1.6; }
	form { margin-top: 1.5rem; display: grid; gap: 2rem; }
	section h2 { margin: 0 0 0.8rem; color: #e5e5e5; font-size: 1rem; }
	.hint { margin: 0 0 0.8rem; font-size: 0.78rem; color: #737373; }
	.role { display: flex; align-items: baseline; gap: 0.6rem; margin: 0.8rem 0 0.4rem; color: #d4d4d4; cursor: pointer; }
	.role input { width: 1.05rem; height: 1.05rem; accent-color: #00ff88; }
	.role small { color: #737373; margin-left: 0.4rem; }
	fieldset { margin: 0.4rem 0 1rem; padding: 1rem; border: 1px dashed #404040; }
	legend { padding: 0 0.5rem; color: #a3a3a3; font-size: 0.8rem; }
	.attendance-grid { display: grid; gap: 1rem; }
	.attendance-grid label { display: grid; gap: 0.35rem; color: #a3a3a3; font-size: 0.75rem; }
	.attendance-grid input, .attendance-grid textarea { border: 1px solid #404040; background: #111; color: #e5e5e5; padding: 0.55rem 0.65rem; font: inherit; }
	.attendance-grid input:focus-visible, .attendance-grid textarea:focus-visible { outline: 2px solid #00ff88; outline-offset: 2px; }
	.actions { display: flex; gap: 0.75rem; align-items: center; }
	button, .actions a { border: 1px solid #525252; background: transparent; color: #d4d4d4; padding: 0.55rem 0.8rem; font: inherit; cursor: pointer; }
	button { border-color: #00ff88; color: #00ff88; }
</style>
