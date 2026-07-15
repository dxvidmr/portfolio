<script lang="ts">
	import type { ActionData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Nuevo evento · cv/admin</title></svelte:head>

<a class="back" href="/admin/eventos">← Volver a eventos</a>
<h1>Nuevo evento</h1>
<p>Primero crea la identidad común; después podrás añadir contribuciones, servicio o asistencia privada.</p>

{#if form?.errors}<AdminToast message="Revisa los campos del evento." success={false} />{/if}

<form method="POST" action="?/crear">
	<CanonicalEventForm values={form?.raw ?? {}} errors={form?.errors ?? {}} />
	<div class="actions"><button type="submit">Crear evento</button><a href="/admin/eventos">Cancelar</a></div>
</form>

<style>
	.back { display: inline-block; margin-bottom: 1rem; color: #a3a3a3; }
	h1 { margin: 0 0 0.6rem; color: #fafafa; font-size: 1.3rem; }
	p { max-width: 70ch; color: #a3a3a3; line-height: 1.6; }
	form { margin-top: 1.5rem; }
	.actions { display: flex; gap: 0.75rem; align-items: center; margin-top: 1.5rem; }
	button, .actions a { border: 1px solid #525252; background: transparent; color: #d4d4d4; padding: 0.55rem 0.8rem; font: inherit; cursor: pointer; }
	button { border-color: #00ff88; color: #00ff88; }
</style>
