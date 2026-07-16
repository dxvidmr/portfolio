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
		generic: 'bg-[color-mix(in_srgb,var(--accent)_7%,var(--visual-bg))] text-ink',
		fuenteovejuna: 'bg-[#ddd7d6] text-[#383634]',
		versologia: 'bg-[color-mix(in_srgb,#d4aa42_8%,var(--visual-bg))] text-ink',
		etso: 'bg-[color-mix(in_srgb,#003a92_8%,var(--visual-bg))] text-ink',
		networks: 'bg-[color-mix(in_srgb,#aaa0bd_14%,var(--visual-bg))] text-ink',
		editions: 'bg-[color-mix(in_srgb,#2f7f7a_13%,var(--visual-bg))] text-ink',
		stage: 'bg-[color-mix(in_srgb,#68495f_20%,var(--visual-bg))] text-ink'
	};
</script>

<div
	class={`relative isolate w-full overflow-hidden rounded-ui border border-rule before:absolute before:inset-0 before:z-[-2] before:bg-[linear-gradient(90deg,var(--visual-grid)_1px,transparent_1px),linear-gradient(0deg,var(--visual-grid)_1px,transparent_1px)] before:[background-size:28px_28px] before:opacity-[.55] before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-[8] after:[background-image:var(--visual-grain)] after:opacity-[.12] after:[mix-blend-mode:multiply] after:content-[''] ${compact ? 'aspect-[4/5] max-[840px]:aspect-[16/11]' : 'aspect-[16/11]'} ${visualTone[visual]}`}
	aria-hidden="true"
>
	<div class="meta absolute top-4 right-[18px] left-[18px] z-10 flex justify-between gap-4 text-current">
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
	{:else if visual === 'stage'}
		<StageVisual />
	{:else}
		<div class="absolute inset-[22%_12%_14%] grid place-items-center border-y border-current/20">
			<span class="font-title text-[clamp(2rem,5vw,5rem)] leading-none text-current/70">{label}</span>
		</div>
	{/if}
</div>
