<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
	const segmentColors = ['bg-[#c41b22]', 'bg-[#e56e08]', 'bg-[#ff9e38]', 'bg-[#1979a3]'];
</script>

<div
	class={`absolute grid gap-[clamp(14px,2vw,24px)] ${compact ? 'top-[18%] right-[9%] left-[9%] w-auto' : 'top-[20%] left-[7%] w-[62%] max-[520px]:right-[8%] max-[520px]:left-[8%] max-[520px]:w-auto'}`}
>
	<div class="meta flex items-center gap-[9px] text-ink-faint">
		<span>OBRA</span><i class="h-px w-[clamp(16px,3vw,42px)] bg-[#d4aa42]"></i><span
			>JORNADA</span
		><i class="h-px w-[clamp(16px,3vw,42px)] bg-[#d4aa42]"></i><span
			>CUADRO</span
		>
	</div>
	<div class="flex h-[clamp(24px,4vw,44px)] overflow-hidden rounded-ui-sm">
		{#each [18, 9, 14, 5, 21, 8, 12, 4, 9] as width, index}
			<i
				class={`min-w-[3px] [flex-grow:var(--segment)] ${segmentColors[index % 4]}`}
				style={`--segment: ${width}`}
			></i>
		{/each}
	</div>
	<div
		class={`meta grid border-t border-rule-strong ${compact ? 'grid-cols-[26px_1fr]' : 'grid-cols-[30px_1fr_auto]'} gap-x-3`}
	>
		<span class="border-b border-rule py-[7px] text-ink-faint">001</span><b
			class="border-b border-rule py-[7px] font-medium">QUINTILLA</b
		><em class={`border-b border-rule py-[7px] not-italic text-ink-faint ${compact ? 'hidden' : ''}`}>1—235</em>
		<span class="border-b border-rule py-[7px] text-ink-faint">002</span><b
			class="border-b border-rule py-[7px] font-medium">ROMANCE</b
		><em class={`border-b border-rule py-[7px] not-italic text-ink-faint ${compact ? 'hidden' : ''}`}>236—399</em>
		<span class="border-b border-rule py-[7px] text-ink-faint">003</span><b
			class="border-b border-rule py-[7px] font-medium">REDONDILLA</b
		><em class={`border-b border-rule py-[7px] not-italic text-ink-faint ${compact ? 'hidden' : ''}`}>400—614</em>
	</div>
</div>

<div
	class={`absolute right-[7%] bottom-[17%] aspect-square w-[17%] rotate-2 grid-cols-4 gap-0.5 ${compact ? 'hidden' : 'grid max-[520px]:hidden'}`}
>
	{#each [12, 36, 67, 24, 36, 14, 45, 78, 67, 45, 10, 52, 24, 78, 52, 8] as tone}
		<i
			class="rounded-[2px] bg-[color-mix(in_srgb,#d4aa42_var(--tone),var(--visual-bg))]"
			style={`--tone: ${tone}%`}
		></i>
	{/each}
</div>

<div
	class={`meta absolute bottom-[8%] text-ink-faint ${compact ? 'right-[9%] left-[9%]' : 'right-[7%]'}`}
>
	SECUENCIAS → PERFIL → DISTANCIA
</div>
