<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<div
	class={`absolute ${compact ? 'top-[17%] right-[9%] left-[9%] h-[42%]' : 'top-[16%] right-[7%] left-[7%] h-[48%]'}`}
>
	<svg
		class={`absolute top-0 left-0 h-full overflow-visible ${compact ? 'w-full' : 'w-[61%]'}`}
		viewBox="0 0 360 180"
		role="presentation"
	>
		<g class="fill-none stroke-[#003a92] stroke-[1.35] opacity-[.72]">
			<path d="M92 28H142M92 67H142M142 28V67M142 47.5H218" />
			<path d="M92 113H170M92 152H170M170 113V152M170 132.5H218" />
			<path d="M218 47.5V132.5M218 90H310" />
		</g>
		<g class="fill-[#003a92]">
			<circle cx="142" cy="47.5" r="4" /><circle cx="170" cy="132.5" r="4" /><circle cx="218" cy="90" r="5" />
		</g>
		<g class="fill-ink-dim font-mono text-[10px] tracking-[.08em]">
			<text x="5" y="32">LOPE</text><text x="5" y="71">MORETO</text>
			<text x="5" y="117">TIRSO</text><text x="5" y="156">CALDERÓN</text>
		</g>
	</svg>
	<div
		class={`meta absolute top-[1%] left-[49%] rotate-[-4deg] gap-[7px] text-ink-faint ${compact ? 'hidden' : 'grid'}`}
	>
		<span>HONOR</span><span class="ml-6 text-[1.35em] text-[#003a92]">MERCED</span><span
			class="ml-2">AMOR</span
		><span class="ml-9 text-[#003a92]">SEÑOR</span>
	</div>
	<div
		class={`absolute right-0 grid aspect-square rotate-2 grid-cols-4 gap-[3px] ${compact ? 'top-auto bottom-[-8%] w-[31%]' : 'top-[12%] w-[24%]'}`}
		aria-hidden="true"
	>
		{#each [8, 28, 63, 45, 28, 8, 52, 74, 63, 52, 8, 34, 45, 74, 34, 8] as tone}
			<i
				class="rounded-[2px] bg-[color-mix(in_srgb,#003a92_var(--distance),var(--visual-bg))]"
				style={`--distance: ${tone}%`}
			></i>
		{/each}
	</div>
	{#if !compact}
		<span class="meta absolute right-0 bottom-0 w-[24%] text-center text-ink-faint">DISTANCIA LÉXICA</span>
	{/if}
</div>

<div
	class={`absolute grid items-center gap-x-3.5 gap-y-[7px] rounded-ui bg-[color-mix(in_srgb,#003a92_8%,var(--bg))] p-[clamp(12px,2vw,20px)] shadow-[9px_9px_0_color-mix(in_srgb,#003a92_16%,transparent)] ${compact ? 'right-[9%] bottom-[9%] left-[9%] grid-cols-1 max-[520px]:left-[8%]' : 'right-[7%] bottom-[9%] left-[22%] grid-cols-[auto_1fr_auto] max-[520px]:left-[8%]'}`}
>
	<span class="meta col-span-full text-[#003a92]">TEXORO</span>
	<strong class="font-title text-[clamp(1.2rem,3vw,2.5rem)] font-[450]">«constancia»</strong>
	<i class={`h-px bg-rule-strong ${compact ? 'hidden' : ''}`}></i>
	<em
		class={`meta whitespace-nowrap not-italic text-ink-faint max-[520px]:hidden ${compact ? 'text-[.42rem]' : ''}`}
		>1.407 OCURRENCIAS</em
	>
</div>
