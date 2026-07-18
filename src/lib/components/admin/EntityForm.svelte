<script lang="ts">
	import FormField from './FormField.svelte';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	interface FieldSpec {
		name: string;
		label: string;
		kind: string;
		required?: boolean;
		help?: string;
		isPrivate?: boolean;
		showWhen?: {
			all?: Array<{ field: string; values?: string[]; notValues?: string[] }>;
			any?: Array<{ field: string; values?: string[]; notValues?: string[] }>;
		};
		wide?: boolean;
		advanced?: boolean;
	}

	interface FieldGroup {
		id: string;
		title: string;
		description?: string;
		advancedLabel?: string;
		fields: string[];
	}

	interface Option {
		value: string;
		label: string;
		meta?: string;
	}

	let {
		fields,
		groups = [],
		values = {},
		errors = {},
		options = {}
	}: {
		fields: FieldSpec[];
		groups?: FieldGroup[];
		values?: Record<string, string>;
		errors?: Record<string, string>;
		options?: Record<string, Option[]>;
	} = $props();

	// Aviso de cambios sin guardar (plan §11): activo desde la primera edición,
	// se desactiva al enviar el formulario que contiene los campos.
	let dirty = $state(false);
	let currentValues = $state<Record<string, string>>({});
	const valueFor = (name: string) => currentValues[name] ?? values[name] ?? '';

	const isVisible = (field: FieldSpec) => {
		const all = field.showWhen?.all ?? [];
		const any = field.showWhen?.any ?? [];
		const matches = (condition: { field: string; values?: string[]; notValues?: string[] }) => {
			const value = valueFor(condition.field);
			return (
				(condition.values == null || condition.values.includes(value)) &&
				(condition.notValues == null || !condition.notValues.includes(value))
			);
		};
		return all.every(matches) && (any.length === 0 || any.some(matches));
	};

	function trackDirty(node: HTMLElement) {
		const markDirty = (event: Event) => {
			dirty = true;
			const target = event.target;
			if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
			currentValues[target.name] = target instanceof HTMLInputElement && target.type === 'checkbox'
				? target.checked
					? '1'
					: ''
				: target.value;
		};
		const clearDirty = () => (dirty = false);
		const form = node.closest('form');
		node.addEventListener('input', markDirty);
		node.addEventListener('change', markDirty);
		form?.addEventListener('submit', clearDirty);
		const beforeUnload = (event: BeforeUnloadEvent) => {
			if (dirty) event.preventDefault();
		};
		window.addEventListener('beforeunload', beforeUnload);
		return {
			destroy() {
				node.removeEventListener('input', markDirty);
				node.removeEventListener('change', markDirty);
				form?.removeEventListener('submit', clearDirty);
				window.removeEventListener('beforeunload', beforeUnload);
			}
		};
	}

	const wide = (field: FieldSpec) => field.wide === true || field.kind === 'textarea';
	const fieldsFor = (group: FieldGroup) => {
		const byName = new Map(fields.map((field) => [field.name, field]));
		return group.fields.flatMap((name) => {
			const field = byName.get(name);
			return field ? [field] : [];
		});
	};
	const regularFieldsFor = (group: FieldGroup) =>
		fieldsFor(group).filter((field) => field.advanced !== true);
	const advancedFieldsFor = (group: FieldGroup) =>
		fieldsFor(group).filter((field) => field.advanced === true && isVisible(field));
	const visibleGroups = () =>
		groups.filter((group) => fieldsFor(group).some((field) => isVisible(field)));
</script>

<div use:trackDirty>
	{#if groups.length > 0}
		<div class="grid gap-10">
			{#each visibleGroups() as group, index (group.id)}
				<section
					class="scroll-mt-36 {index === 0 ? '' : 'border-t border-rule pt-7'}"
					id={group.id}
					aria-labelledby={`${group.id}-title`}
				>
					<header class="mb-5 grid gap-1">
						<p class="m-0 text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
							{String(index + 1).padStart(2, '0')}
						</p>
						<h3 class="m-0 text-base font-medium text-ink" id={`${group.id}-title`}>
							{group.title}
						</h3>
						{#if group.description}
							<p class="mt-1 mb-0 max-w-[72ch] text-[0.76rem] leading-relaxed text-ink-dim">
								{group.description}
							</p>
						{/if}
					</header>
					<div class="grid grid-cols-2 gap-x-6 gap-y-[1.1rem] max-[720px]:grid-cols-1">
						{#each regularFieldsFor(group) as field (field.name)}
							{#if isVisible(field)}
								<div class={wide(field) ? 'col-span-full' : ''}>
									<FormField
										{field}
										value={valueFor(field.name)}
										error={errors[field.name] ?? null}
										options={options[field.name] ?? []}
									/>
								</div>
							{/if}
						{/each}
					</div>
					{#if advancedFieldsFor(group).length > 0}
						<details
							class="mt-5 rounded-ui border border-rule bg-[var(--admin-surface)] px-4 py-3 [&[open]_.advanced-chevron]:rotate-180"
							open={advancedFieldsFor(group).some((field) => Boolean(errors[field.name]))}
						>
							<summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-[0.7rem] text-ink-dim marker:hidden hover:text-accent-strong">
								{group.advancedLabel ?? 'Opciones avanzadas'}
								<ChevronDown class="advanced-chevron shrink-0 transition-transform" size={14} strokeWidth={1.7} aria-hidden="true" />
							</summary>
							<div class="mt-4 grid gap-[1.1rem]">
								{#each advancedFieldsFor(group) as field (field.name)}
									<FormField
										{field}
										value={valueFor(field.name)}
										error={errors[field.name] ?? null}
										options={options[field.name] ?? []}
									/>
								{/each}
							</div>
						</details>
					{/if}
				</section>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-x-6 gap-y-[1.1rem] max-[720px]:grid-cols-1">
			{#each fields as field (field.name)}
				{#if isVisible(field)}
					<div class={wide(field) ? 'col-span-full' : ''}>
						<FormField
							{field}
							value={valueFor(field.name)}
							error={errors[field.name] ?? null}
							options={options[field.name] ?? []}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
