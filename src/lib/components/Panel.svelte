<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		children,
		padded = true,
		class: klass = ''
	}: { children: Snippet; padded?: boolean; class?: string } = $props();

	const panelClasses = $derived(
		`tw:relative tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:bg-panel ${padded ? 'tw:p-[clamp(16px,2.4vw,26px)]' : ''} ${klass}`
	);
	const corner = 'tw:pointer-events-none tw:absolute tw:size-[9px]';
</script>

<div class={panelClasses}>
	<span
		class="{corner} tw:-top-px tw:-left-px tw:rounded-tl-ui-sm tw:border-t tw:border-l tw:border-ink"
	></span>
	<span
		class="{corner} tw:-top-px tw:-right-px tw:rounded-tr-ui-sm tw:border-t tw:border-r tw:border-ink"
	></span>
	<span
		class="{corner} tw:-bottom-px tw:-left-px tw:rounded-bl-ui-sm tw:border-b tw:border-l tw:border-ink"
	></span>
	<span
		class="{corner} tw:-right-px tw:-bottom-px tw:rounded-br-ui-sm tw:border-r tw:border-b tw:border-ink"
	></span>
	{@render children()}
</div>
