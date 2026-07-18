<script lang="ts">
	import { untrack } from 'svelte';
	import Search from '@lucide/svelte/icons/search';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Input from '$lib/components/ui/Input.svelte';

	type Option = { value: string; label: string; meta?: string };

	let {
		id,
		name,
		value = '',
		options = [],
		required = false,
		describedBy,
		invalid = false
	}: {
		id: string;
		name: string;
		value?: string;
		options?: Option[];
		required?: boolean;
		describedBy?: string;
		invalid?: boolean;
	} = $props();

	const listId = $derived(`${id}-options`);
	const initial = untrack(() => ({ value, label: options.find((option) => option.value === value)?.label ?? '' }));
	let selectedValue = $state(initial.value);
	let query = $state(initial.label);
	const selectedOption = $derived(options.find((option) => option.value === selectedValue));

	const syncSelection = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement;
		query = target.value;
		selectedValue = options.find((option) => option.label === query)?.value ?? '';
	};
</script>

<div>
	<div class="relative">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
			size={15}
			strokeWidth={1.7}
			aria-hidden="true"
		/>
		<Input
			class="pl-9 {invalid ? 'border-danger!' : ''}"
			{id}
			type="search"
			list={listId}
			value={query}
			placeholder="Escribe para buscar…"
			autocomplete="off"
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={describedBy}
			aria-required={required || undefined}
			{required}
			oninput={syncSelection}
		/>
	</div>
	{#if selectedOption?.meta}
		<p class="mt-2 mb-0 flex items-center gap-1.5 text-[0.68rem] text-ink-faint">
			<CalendarDays size={13} strokeWidth={1.7} aria-hidden="true" />
			{selectedOption.meta}
		</p>
	{/if}
	<input type="hidden" {name} value={selectedValue} />
	<datalist id={listId}>
		{#each options as option (option.value)}
			<option value={option.label}>{option.label}</option>
		{/each}
	</datalist>
</div>
