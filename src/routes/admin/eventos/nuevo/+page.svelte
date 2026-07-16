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

<ButtonLink variant="ghost" size="sm" href="/admin/eventos" class="tw:mb-4 tw:px-0"
	>← Volver a eventos</ButtonLink
>
<AdminPageHeader
	title="Nuevo evento"
	eyebrow="Identidad académica compartida"
	description="Registra una sola vez los datos comunes del evento y marca los papeles que quieras crear ahora. Las contribuciones y servicios nacen privados; podrás completarlos y publicarlos después."
/>

{#if form?.errors}<AdminToast message="Revisa los campos marcados." success={false} />{/if}

<form class="tw:mt-6 tw:grid tw:gap-8" method="POST" action="?/crear">
	<section>
		<h2 class="tw:mt-0 tw:mb-3 tw:text-base">Datos del evento</h2>
		<CanonicalEventForm values={form?.raw ?? {}} errors={form?.errors ?? {}} />
	</section>

	<section>
		<h2 class="tw:mt-0 tw:mb-3 tw:text-base">¿Cuál fue tu papel?</h2>
		<p class="tw:mt-0 tw:mb-3 tw:text-[0.78rem] tw:text-ink-faint">Puedes marcar varios; también puedes registrar solo el evento y añadir roles más tarde.</p>

		<label class="tw:mt-3 tw:mb-1.5 tw:flex tw:cursor-pointer tw:items-baseline tw:gap-2.5 tw:text-ink">
			<Checkbox name="rol_contribucion" value="1" bind:checked={withTalk} />
			<span>Contribución <small class="tw:ml-1.5 tw:text-ink-faint">comunicación, ponencia, póster…</small></span>
		</label>
		{#if withTalk}
			<fieldset class="tw:mt-1.5 tw:mb-4 tw:rounded-ui tw:border tw:border-dashed tw:border-rule tw:p-4">
				<legend class="tw:px-2 tw:text-[0.8rem] tw:text-ink-dim">Contribución</legend>
				<EntityForm
					fields={data.talkFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="tw:mt-3 tw:mb-1.5 tw:flex tw:cursor-pointer tw:items-baseline tw:gap-2.5 tw:text-ink">
			<Checkbox name="rol_servicio" value="1" bind:checked={withService} />
			<span>Servicio <small class="tw:ml-1.5 tw:text-ink-faint">organización, comité, evaluación…</small></span>
		</label>
		{#if withService}
			<fieldset class="tw:mt-1.5 tw:mb-4 tw:rounded-ui tw:border tw:border-dashed tw:border-rule tw:p-4">
				<legend class="tw:px-2 tw:text-[0.8rem] tw:text-ink-dim">Servicio</legend>
				<p class="tw:mt-0 tw:mb-3 tw:text-[0.78rem] tw:text-ink-faint">Si dejas el título vacío se usará el nombre del evento.</p>
				<EntityForm
					fields={data.serviceFields}
					values={form?.raw ?? {}}
					errors={form?.errors ?? {}}
					options={data.options}
				/>
			</fieldset>
		{/if}

		<label class="tw:mt-3 tw:mb-1.5 tw:flex tw:cursor-pointer tw:items-baseline tw:gap-2.5 tw:text-ink">
			<Checkbox name="rol_asistencia" value="1" bind:checked={withAttendance} />
			<span>Asistencia como oyente <small class="tw:ml-1.5 tw:text-ink-faint">siempre privada; nunca llega a la web pública</small></span>
		</label>
		{#if withAttendance}
			<fieldset class="tw:mt-1.5 tw:mb-4 tw:rounded-ui tw:border tw:border-dashed tw:border-rule tw:p-4">
				<legend class="tw:px-2 tw:text-[0.8rem] tw:text-ink-dim">Asistencia</legend>
				<div class="tw:grid tw:gap-4">
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

	<div class="tw:flex tw:items-center tw:gap-3">
		<Button variant="primary" type="submit">Crear evento</Button>
		<ButtonLink href="/admin/eventos">Cancelar</ButtonLink>
	</div>
</form>
