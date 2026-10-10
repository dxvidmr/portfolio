<script lang="ts">
	import type { ProjectVisual } from '$lib/content/projects';
	import MinimalIllustration, {
		type MinimalMotif
	} from './project-visuals/MinimalIllustration.svelte';

	let {
		visual,
		label,
		period,
		compact = false,
		mobileTall = false,
		showMeta = true
	}: {
		visual: ProjectVisual;
		label: string;
		period: string;
		compact?: boolean;
		mobileTall?: boolean;
		// La portada ya muestra el tipo sobre el título: la imagen va sin tipo ni fecha.
		showMeta?: boolean;
	} = $props();

	const visualTone: Record<ProjectVisual, string> = {
		generic: 'bg-[color-mix(in_srgb,var(--accent)_7%,var(--visual-bg))] text-ink',
		fuenteovejuna: 'bg-[color-mix(in_srgb,#8f4142_5%,var(--visual-bg))] text-ink',
		versologia: 'bg-[color-mix(in_srgb,#a96c13_5%,var(--visual-bg))] text-ink',
		etso: 'bg-[color-mix(in_srgb,#164f96_5%,var(--visual-bg))] text-ink',
		networks: 'bg-[color-mix(in_srgb,#815b86_5%,var(--visual-bg))] text-ink',
		editions: 'bg-[color-mix(in_srgb,#287b73_5%,var(--visual-bg))] text-ink',
		stage: 'bg-[color-mix(in_srgb,#74445f_5%,var(--visual-bg))] text-ink'
	};

	const minimalVisuals: Record<
		Exclude<ProjectVisual, 'generic'>,
		{ motif: MinimalMotif; accent: string }
	> = {
		fuenteovejuna: { motif: 'reception', accent: '#8f4142' },
		versologia: { motif: 'metrics', accent: '#a96c13' },
		etso: { motif: 'etso', accent: '#164f96' },
		networks: { motif: 'networks', accent: '#815b86' },
		editions: { motif: 'edition', accent: '#287b73' },
		stage: { motif: 'stage', accent: '#74445f' }
	};

	const minimalVisual = $derived(visual === 'generic' ? null : minimalVisuals[visual]);
</script>

<div
	class={`relative isolate w-full overflow-hidden rounded-ui border border-rule before:absolute before:inset-0 before:z-[-2] before:bg-[linear-gradient(90deg,var(--visual-grid)_1px,transparent_1px),linear-gradient(0deg,var(--visual-grid)_1px,transparent_1px)] before:[background-size:28px_28px] before:opacity-[.55] before:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-[8] after:[background-image:var(--visual-grain)] after:opacity-[.12] after:[mix-blend-mode:multiply] after:content-[''] ${compact ? 'aspect-[4/5] max-[840px]:aspect-[16/11]' : mobileTall ? 'aspect-[16/11] max-[700px]:aspect-[5/4]' : 'aspect-[16/11]'} ${visualTone[visual]}`}
	aria-hidden="true"
>
	{#if showMeta}
		<div class="meta absolute top-4 right-[18px] left-[18px] z-10 flex justify-between gap-4 text-current">
			<span>{label}</span>
			<span>{period}</span>
		</div>
	{/if}

	{#if minimalVisual}
		<div
			class={`absolute text-[var(--cover-accent)] ${compact ? 'inset-[14%_4%_8%]' : 'inset-[13%_5%_7%]'}`}
			style={`--cover-accent:${minimalVisual.accent};--cover-paper:var(--visual-bg);`}
		>
			<MinimalIllustration motif={minimalVisual.motif} style="line" />
		</div>
	{:else}
		<div class="absolute inset-[22%_12%_14%] grid place-items-center border-y border-current/20">
			<span class="font-title text-[clamp(2rem,5vw,5rem)] leading-none text-current/70">{label}</span>
		</div>
	{/if}
</div>
