<script lang="ts">
	import type { ProjectVisual } from '$lib/content/projects';
	import EditionsVisual from './project-visuals/EditionsVisual.svelte';
	import EtsoVisual from './project-visuals/EtsoVisual.svelte';
	import MetricsVisual from './project-visuals/MetricsVisual.svelte';
	import NetworksVisual from './project-visuals/NetworksVisual.svelte';
	import ReceptionVisual from './project-visuals/ReceptionVisual.svelte';
	import StageVisual from './project-visuals/StageVisual.svelte';

	let {
		visual,
		label,
		period,
		compact = false
	}: { visual: ProjectVisual; label: string; period: string; compact?: boolean } = $props();

	const visualTone: Record<ProjectVisual, string> = {
		fuenteovejuna: 'tw:bg-[#ddd7d6] tw:text-[#383634]',
		versologia: 'tw:bg-[color-mix(in_srgb,#d4aa42_8%,var(--visual-bg))] tw:text-ink',
		etso: 'tw:bg-[color-mix(in_srgb,#003a92_8%,var(--visual-bg))] tw:text-ink',
		networks: 'tw:bg-[color-mix(in_srgb,#aaa0bd_14%,var(--visual-bg))] tw:text-ink',
		editions: 'tw:bg-[color-mix(in_srgb,#2f7f7a_13%,var(--visual-bg))] tw:text-ink',
		stage: 'tw:bg-[color-mix(in_srgb,#68495f_20%,var(--visual-bg))] tw:text-ink'
	};
</script>

<div
	class={`tw:relative tw:isolate tw:w-full tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:before:absolute tw:before:inset-0 tw:before:z-[-2] tw:before:bg-[linear-gradient(90deg,var(--visual-grid)_1px,transparent_1px),linear-gradient(0deg,var(--visual-grid)_1px,transparent_1px)] tw:before:[background-size:28px_28px] tw:before:opacity-[.55] tw:before:content-[''] tw:after:pointer-events-none tw:after:absolute tw:after:inset-0 tw:after:z-[8] tw:after:[background-image:var(--visual-grain)] tw:after:opacity-[.12] tw:after:[mix-blend-mode:multiply] tw:after:content-[''] ${compact ? 'tw:aspect-[4/5] tw:max-[840px]:aspect-[16/11]' : 'tw:aspect-[16/11]'} ${visualTone[visual]}`}
	aria-hidden="true"
>
	<div class="meta tw:absolute tw:top-4 tw:right-[18px] tw:left-[18px] tw:z-10 tw:flex tw:justify-between tw:gap-4 tw:text-current">
		<span>{label}</span>
		<span>{period}</span>
	</div>

	{#if visual === 'fuenteovejuna'}
		<ReceptionVisual {compact} />
	{:else if visual === 'versologia'}
		<MetricsVisual {compact} />
	{:else if visual === 'etso'}
		<EtsoVisual {compact} />
	{:else if visual === 'networks'}
		<NetworksVisual {compact} />
	{:else if visual === 'editions'}
		<EditionsVisual />
	{:else}
		<StageVisual />
	{/if}
</div>
