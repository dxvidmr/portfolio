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
		`grid gap-[0.35rem] text-xs text-ink-dim ${wide ? 'col-span-full max-[700px]:col-span-1' : ''} ${privateField ? 'border border-dashed border-rule p-3' : ''} ${className}`
	);
</script>

<label class={classes}>
	<span class="font-mono text-meta font-medium tracking-meta text-ink-dim uppercase">
		{label}{#if required}<span class="ml-1 text-accent-strong" aria-hidden="true">*</span>{/if}
	</span>
	{@render children()}
	{#if error}<small class="text-danger">{error}</small>{/if}
	{#if help}<small class="leading-[1.4] text-ink-faint">{help}</small>{/if}
</label>
