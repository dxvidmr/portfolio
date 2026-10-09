<script lang="ts">
	import type { CanonicalEventValues } from '$lib/server/admin/events';
	import AdminField from './AdminField.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import GeoNamesLocationField from './GeoNamesLocationField.svelte';

	let {
		values = {},
		errors = {},
		modalityOptions = []
	}: {
		values?: Partial<CanonicalEventValues>;
		errors?: Record<string, string>;
		modalityOptions?: Array<{ value: string; label: string }>;
	} = $props();

	// svelte-ignore state_referenced_locally
	let modality = $state(values.modality ?? '');

	interface EventField {
		name: keyof CanonicalEventValues;
		label: string;
		required?: boolean;
		wide?: boolean;
		placeholder?: string;
		type?: 'url';
		help?: string;
	}

	const fields: EventField[] = [
		{ name: 'title', label: 'Nombre del evento', required: true, wide: true },
		{
			name: 'date_start',
			label: 'Inicio del evento',
			required: true,
			placeholder: 'AAAA, AAAA-MM o AAAA-MM-DD'
		},
		{ name: 'date_end', label: 'Fin del evento', placeholder: 'AAAA, AAAA-MM o AAAA-MM-DD' },
		{ name: 'institution', label: 'Institución o entidad organizadora' },
		{ name: 'modality', label: 'Modalidad', required: true },
		{ name: 'url', label: 'URL del evento', type: 'url', wide: true }
	];
</script>

<div class="grid grid-cols-2 gap-x-5 gap-y-4 max-[700px]:grid-cols-1">
	{#each fields as field (field.name)}
		<AdminField
			label={field.label}
			required={field.required}
			wide={field.wide}
			error={errors[field.name]}
			help={field.help}
		>
			{#if field.name === 'modality'}
				<Select name="modality" bind:value={modality} required aria-invalid={errors.modality ? 'true' : undefined}>
					<option value="">—</option>
					{#each modalityOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</Select>
			{:else}
				<Input
					type={field.type ?? 'text'}
					name={field.name}
					value={values[field.name] ?? ''}
					placeholder={field.placeholder}
					required={field.required}
					aria-invalid={errors[field.name] ? 'true' : undefined}
				/>
			{/if}
		</AdminField>
	{/each}
	{#if modality !== 'event_online'}
	<AdminField label="Localización" required wide error={errors.location}>
		<GeoNamesLocationField
			id="evento-localizacion"
			values={{
				city: values.city,
				country: values.country,
				country_code: values.country_code,
				geoname_id: values.geoname_id,
				latitude: values.latitude,
				longitude: values.longitude
			}}
			invalid={Boolean(errors.location)}
		/>
	</AdminField>
	{/if}
	<AdminField
		label="Notas privadas"
		wide
		privateField
		help="No se muestran en la web pública."
	>
		<Textarea name="notes_private" rows={4} value={values.notes_private ?? ''} />
	</AdminField>
</div>
