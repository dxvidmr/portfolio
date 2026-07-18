<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import CanonicalEventForm from '$lib/components/admin/CanonicalEventForm.svelte';
	import EntityForm from '$lib/components/admin/EntityForm.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

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

<ButtonLink variant="ghost" size="sm" href="/admin/eventos" class="mb-4 px-0"
	>← Volver a eventos</ButtonLink
>
<AdminPageHeader
	title="Nuevo evento"
	eyebrow="Identidad académica compartida"
	description="Registra una sola vez los datos comunes del evento y marca los papeles que quieras crear ahora. Las contribuciones y servicios nacen privados; podrás completarlos y publicarlos después."
/>

{#if form?.errors}<AdminToast message="Revisa los campos marcados." success={false} />{/if}

<form class="mt-6 grid gap-8" method="POST" action="?/crear">
	<section>
		<h2 class="mt-0 mb-3 text-base">Datos del evento</h2>
		<CanonicalEventForm values={form?.raw ?? {}} errors={form?.errors ?? {}} />
	</section>

	<section>
		<h2 class="mt-0 mb-3 text-base">¿Cuál fue tu papel?</h2>
		<p class="mt-0 mb-3 text-[0.78rem] text-ink-faint">Puedes marcar varios; también puedes registrar solo el evento y añadir roles más tarde.</p>

		<label class="mt-3 mb-1.5 flex cursor-pointer items-baseline gap-2.5 text-ink">
			<Checkbox name="rol_contribucion" value="1" bind:checked={withTalk} />
			<span>Comunicación <small class="ml-1.5 text-ink-faint">comunicación, ponencia, póster…</small></span>
		</label>
		{#if withTalk}
			<fieldset class="mt-1.5 mb-4 rounded-ui border border-dashed border-rule p-4">
				<legend class="px-2 text-[0.8rem] text-ink-dim">Comunicación</legend>
				<EntityForm
					fields={data.talkFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="mt-3 mb-1.5 flex cursor-pointer items-baseline gap-2.5 text-ink">
			<Checkbox name="rol_servicio" value="1" bind:checked={withService} />
			<span>Servicio <small class="ml-1.5 text-ink-faint">organización, comité, evaluación…</small></span>
		</label>
		{#if withService}
			<fieldset class="mt-1.5 mb-4 rounded-ui border border-dashed border-rule p-4">
				<legend class="px-2 text-[0.8rem] text-ink-dim">Servicio</legend>
				<p class="mt-0 mb-3 text-[0.78rem] text-ink-faint">Si dejas el título vacío se usará el nombre del evento.</p>
				<EntityForm
					fields={data.serviceFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="mt-3 mb-1.5 flex cursor-pointer items-baseline gap-2.5 text-ink">
			<Checkbox name="rol_asistencia" value="1" bind:checked={withAttendance} />
			<span>Asistencia como oyente <small class="ml-1.5 text-ink-faint">siempre privada; nunca llega a la web pública</small></span>
		</label>
		{#if withAttendance}
			<fieldset class="mt-1.5 mb-4 rounded-ui border border-dashed border-rule p-4">
				<legend class="px-2 text-[0.8rem] text-ink-dim">Asistencia</legend>
				<div class="grid gap-4">
					<AdminField label="Rol registrado">
						<Input name="at_role_label" value={form?.raw?.at_role_label || 'Oyente/asistente'} />
					</AdminField>
					<AdminField label="Notas privadas">
						<Textarea name="at_notes" rows={3} value={form?.raw?.at_notes ?? ''} />
					</AdminField>
				</div>
			</fieldset>
		{/if}
	</section>

	<div class="flex items-center gap-3">
		<Button variant="primary" type="submit">Crear evento</Button>
		<ButtonLink href="/admin/eventos">Cancelar</ButtonLink>
	</div>
</form>
