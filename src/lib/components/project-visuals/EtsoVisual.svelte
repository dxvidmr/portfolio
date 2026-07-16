<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div
	class={`tw:absolute ${compact ? 'tw:top-[17%] tw:right-[9%] tw:left-[9%] tw:h-[42%]' : 'tw:top-[16%] tw:right-[7%] tw:left-[7%] tw:h-[48%]'}`}
>
	<svg
		class={`tw:absolute tw:top-0 tw:left-0 tw:h-full tw:overflow-visible ${compact ? 'tw:w-full' : 'tw:w-[61%]'}`}
		viewBox="0 0 360 180"
		role="presentation"
	>
		<g class="tw:fill-none tw:stroke-[#003a92] tw:stroke-[1.35] tw:opacity-[.72]">
			<path d="M92 28H142M92 67H142M142 28V67M142 47.5H218" />
			<path d="M92 113H170M92 152H170M170 113V152M170 132.5H218" />
			<path d="M218 47.5V132.5M218 90H310" />
		</g>
		<g class="tw:fill-[#003a92]">
			<circle cx="142" cy="47.5" r="4" /><circle cx="170" cy="132.5" r="4" /><circle cx="218" cy="90" r="5" />
		</g>
		<g class="tw:fill-ink-dim tw:font-mono tw:text-[10px] tw:tracking-[.08em]">
			<text x="5" y="32">LOPE</text><text x="5" y="71">MORETO</text>
			<text x="5" y="117">TIRSO</text><text x="5" y="156">CALDERÓN</text>
		</g>
	</svg>
	<div
		class={`meta tw:absolute tw:top-[1%] tw:left-[49%] tw:rotate-[-4deg] tw:gap-[7px] tw:text-ink-faint ${compact ? 'tw:hidden' : 'tw:grid'}`}
	>
		<span>HONOR</span><span class="tw:ml-6 tw:text-[1.35em] tw:text-[#003a92]">MERCED</span><span
			class="tw:ml-2">AMOR</span
		><span class="tw:ml-9 tw:text-[#003a92]">SEÑOR</span>
	</div>
	<div
		class={`tw:absolute tw:right-0 tw:grid tw:aspect-square tw:rotate-2 tw:grid-cols-4 tw:gap-[3px] ${compact ? 'tw:top-auto tw:bottom-[-8%] tw:w-[31%]' : 'tw:top-[12%] tw:w-[24%]'}`}
		aria-hidden="true"
	>
		{#each [8, 28, 63, 45, 28, 8, 52, 74, 63, 52, 8, 34, 45, 74, 34, 8] as tone}
			<i
				class="tw:rounded-[2px] tw:bg-[color-mix(in_srgb,#003a92_var(--distance),var(--visual-bg))]"
				style={`--distance: ${tone}%`}
			></i>
		{/each}
	</div>
	{#if !compact}
		<span class="meta tw:absolute tw:right-0 tw:bottom-0 tw:w-[24%] tw:text-center tw:text-ink-faint">DISTANCIA LÉXICA</span>
	{/if}
</div>

<div
	class={`tw:absolute tw:grid tw:items-center tw:gap-x-3.5 tw:gap-y-[7px] tw:rounded-ui tw:bg-[color-mix(in_srgb,#003a92_8%,var(--bg))] tw:p-[clamp(12px,2vw,20px)] tw:shadow-[9px_9px_0_color-mix(in_srgb,#003a92_16%,transparent)] ${compact ? 'tw:right-[9%] tw:bottom-[9%] tw:left-[9%] tw:grid-cols-1 tw:max-[520px]:left-[8%]' : 'tw:right-[7%] tw:bottom-[9%] tw:left-[22%] tw:grid-cols-[auto_1fr_auto] tw:max-[520px]:left-[8%]'}`}
>
	<span class="meta tw:col-span-full tw:text-[#003a92]">TEXORO</span>
	<strong class="tw:font-title tw:text-[clamp(1.2rem,3vw,2.5rem)] tw:font-[450]">«constancia»</strong>
	<i class={`tw:h-px tw:bg-rule-strong ${compact ? 'tw:hidden' : ''}`}></i>
	<em
		class={`meta tw:whitespace-nowrap tw:not-italic tw:text-ink-faint tw:max-[520px]:hidden ${compact ? 'tw:text-[.42rem]' : ''}`}
		>1.407 OCURRENCIAS</em
	>
</div>
