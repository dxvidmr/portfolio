<script lang="ts">
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import type { PortfolioTaxonomyOption } from '$lib/types/portfolio';

	let {
		label,
		name,
		options,
		selected = [],
		help
	}: {
		label: string;
		name: string;
		options: PortfolioTaxonomyOption[];
		selected?: string[];
		help?: string;
	} = $props();

	const selectedCodes = $derived(new Set(selected));
</script>

<fieldset class="col-span-full grid gap-2.5">
	<legend class="font-mono text-meta font-medium tracking-meta text-ink-dim uppercase">{label}</legend>
	<div class="grid grid-cols-[repeat(auto-fit,minmax(13rem,1fr))] gap-2">
		{#each options as option (option.code)}
			<label class="flex cursor-pointer items-start gap-2.5 rounded-ui-sm border border-rule bg-[color-mix(in_srgb,var(--bg)_82%,var(--bg-panel))] px-3 py-2.5 text-xs text-ink-dim hover:border-accent-strong">
				<Checkbox {name} value={option.code} checked={selectedCodes.has(option.code)} />
				<span class="grid gap-0.5">
					<strong class="font-medium text-ink">{option.labelEs}</strong>
					<span class="text-[0.68rem] text-ink-faint">{option.labelEn}</span>
				</span>
			</label>
		{/each}
	</div>
	{#if help}<small class="leading-[1.4] text-ink-faint">{help}</small>{/if}
</fieldset>
