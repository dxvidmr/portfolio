<script lang="ts">
	import FormField from './FormField.svelte';

	interface FieldSpec {
		name: string;
		label: string;
		kind: string;
		required?: boolean;
		help?: string;
		isPrivate?: boolean;
	}

	interface Option {
		value: string;
		label: string;
	}

	let {
		fields,
		values = {},
		errors = {},
		options = {}
	}: {
		fields: FieldSpec[];
		values?: Record<string, string>;
		errors?: Record<string, string>;
		options?: Record<string, Option[]>;
	} = $props();

	// Aviso de cambios sin guardar (plan §11): activo desde la primera edición,
	// se desactiva al enviar el formulario que contiene los campos.
	let dirty = $state(false);

	function trackDirty(node: HTMLElement) {
		const markDirty = () => (dirty = true);
		const clearDirty = () => (dirty = false);
		const form = node.closest('form');
		node.addEventListener('input', markDirty);
		form?.addEventListener('submit', clearDirty);
		const beforeUnload = (event: BeforeUnloadEvent) => {
			if (dirty) event.preventDefault();
		};
		window.addEventListener('beforeunload', beforeUnload);
		return {
			destroy() {
				node.removeEventListener('input', markDirty);
				form?.removeEventListener('submit', clearDirty);
				window.removeEventListener('beforeunload', beforeUnload);
			}
		};
	}

	const wide = (kind: string) => kind === 'textarea';
</script>

<div
	class="grid grid-cols-2 gap-x-6 gap-y-[1.1rem] max-[720px]:grid-cols-1"
	use:trackDirty
>
	{#each fields as field (field.name)}
		<div class={wide(field.kind) ? 'col-span-full' : ''}>
			<FormField
				{field}
				value={values[field.name] ?? ''}
				error={errors[field.name] ?? null}
				options={options[field.name] ?? []}
			/>
		</div>
	{/each}
</div>
