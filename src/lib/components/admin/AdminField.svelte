<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children,
		required = false,
		help,
		error,
		wide = false,
		privateField = false,
		class: className = ''
	}: {
		label: string;
		children: Snippet;
		required?: boolean;
		help?: string;
		error?: string;
		wide?: boolean;
		privateField?: boolean;
		class?: string;
	} = $props();

	const classes = $derived(
		`tw:grid tw:gap-[0.35rem] tw:text-xs tw:text-ink-dim ${wide ? 'tw:col-span-full tw:max-[700px]:col-span-1' : ''} ${privateField ? 'tw:border tw:border-dashed tw:border-rule tw:p-3' : ''} ${className}`
	);
</script>

<label class={classes}>
	<span class="tw:font-mono tw:text-meta tw:font-medium tw:tracking-meta tw:text-ink-dim tw:uppercase">
		{label}{#if required}<span class="tw:ml-1 tw:text-accent-strong" aria-hidden="true">*</span>{/if}
	</span>
	{@render children()}
	{#if error}<small class="tw:text-danger">{error}</small>{/if}
	{#if help}<small class="tw:leading-[1.4] tw:text-ink-faint">{help}</small>{/if}
</label>
