<script lang="ts">
	import type { CanonicalEventValues } from '$lib/server/admin/events';
	import AdminField from './AdminField.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';

	let {
		values = {},
		errors = {}
	}: {
		values?: Partial<CanonicalEventValues>;
		errors?: Record<string, string>;
	} = $props();

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
			placeholder: 'AAAA-MM-DD',
			help: 'Duración general; cada comunicación o servicio conserva sus propias fechas'
		},
		{ name: 'date_end', label: 'Fin del evento', placeholder: 'AAAA-MM-DD' },
		{ name: 'year', label: 'Año', placeholder: 'AAAA' },
		{ name: 'institution', label: 'Institución o entidad organizadora' },
		{ name: 'city', label: 'Ciudad' },
		{ name: 'country', label: 'País' },
		{ name: 'modality', label: 'Modalidad', placeholder: 'Presencial, en línea, híbrida…' },
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
			<Input
				type={field.type ?? 'text'}
				name={field.name}
				value={values[field.name] ?? ''}
				placeholder={field.placeholder}
				required={field.required}
				aria-invalid={errors[field.name] ? 'true' : undefined}
			/>
		</AdminField>
	{/each}
	<AdminField
		label="Notas privadas"
		wide
		privateField
		help="No se muestran en la web pública."
	>
		<Textarea name="notes_private" rows={4} value={values.notes_private ?? ''} />
	</AdminField>
</div>
