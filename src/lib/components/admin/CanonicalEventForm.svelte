<script lang="ts">
	import type { CanonicalEventValues } from '$lib/server/admin/events';

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
	}

	const fields: EventField[] = [
		{ name: 'title', label: 'Nombre del evento', required: true, wide: true },
		{ name: 'date_start', label: 'Fecha de inicio', placeholder: 'AAAA-MM-DD' },
		{ name: 'date_end', label: 'Fecha de fin', placeholder: 'AAAA-MM-DD' },
		{ name: 'year', label: 'Año', placeholder: 'AAAA' },
		{ name: 'institution', label: 'Institución o entidad organizadora' },
		{ name: 'city', label: 'Ciudad' },
		{ name: 'country', label: 'País' },
		{ name: 'modality', label: 'Modalidad', placeholder: 'Presencial, en línea, híbrida…' },
		{ name: 'url', label: 'URL del evento', type: 'url', wide: true }
	];
</script>

<div class="grid">
	{#each fields as field (field.name)}
		<label class:wide={field.wide}>
			<span>{field.label}{field.required ? ' *' : ''}</span>
			<input
				type={field.type ?? 'text'}
				name={field.name}
				value={values[field.name] ?? ''}
				placeholder={field.placeholder}
				required={field.required}
				aria-invalid={errors[field.name] ? 'true' : undefined}
			/>
			{#if errors[field.name]}<small class="error">{errors[field.name]}</small>{/if}
		</label>
	{/each}
	<label class="wide private">
		<span>Notas privadas</span>
		<textarea name="notes_private" rows="4">{values.notes_private ?? ''}</textarea>
		<small>No se muestran en la web pública.</small>
	</label>
</div>

<style>
	.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.25rem; }
	label { display: grid; gap: 0.35rem; color: #a3a3a3; font-size: 0.75rem; }
	.wide { grid-column: 1 / -1; }
	input, textarea { min-width: 0; border: 1px solid #404040; background: #111; color: #e5e5e5; padding: 0.55rem 0.65rem; font: inherit; }
	textarea { resize: vertical; }
	input:focus-visible, textarea:focus-visible { outline: 2px solid #00ff88; outline-offset: 2px; }
	input[aria-invalid='true'] { border-color: #f87171; }
	.error { color: #f87171; }
	.private { padding: 0.8rem; border: 1px dashed #404040; }
	.private small { color: #737373; }
	@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .wide { grid-column: auto; } }
</style>
