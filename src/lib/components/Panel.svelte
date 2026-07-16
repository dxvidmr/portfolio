<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		children,
		padded = true,
		class: klass = ''
	}: { children: Snippet; padded?: boolean; class?: string } = $props();

	const panelClasses = $derived(
		`relative overflow-hidden rounded-ui border border-rule bg-panel ${padded ? 'p-[clamp(16px,2.4vw,26px)]' : ''} ${klass}`
	);
	const corner = 'pointer-events-none absolute size-[9px]';
</script>

<div class={panelClasses}>
	<span
		class="{corner} -top-px -left-px rounded-tl-ui-sm border-t border-l border-ink"
	></span>
	<span
		class="{corner} -top-px -right-px rounded-tr-ui-sm border-t border-r border-ink"
	></span>
	<span
		class="{corner} -bottom-px -left-px rounded-bl-ui-sm border-b border-l border-ink"
	></span>
	<span
		class="{corner} -right-px -bottom-px rounded-br-ui-sm border-r border-b border-ink"
	></span>
	{@render children()}
</div>
