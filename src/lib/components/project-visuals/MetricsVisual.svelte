<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
	const segmentColors = ['tw:bg-[#c41b22]', 'tw:bg-[#e56e08]', 'tw:bg-[#ff9e38]', 'tw:bg-[#1979a3]'];
</script>

<div
	class={`tw:absolute tw:grid tw:gap-[clamp(14px,2vw,24px)] ${compact ? 'tw:top-[18%] tw:right-[9%] tw:left-[9%] tw:w-auto' : 'tw:top-[20%] tw:left-[7%] tw:w-[62%] tw:max-[520px]:right-[8%] tw:max-[520px]:left-[8%] tw:max-[520px]:w-auto'}`}
>
	<div class="meta tw:flex tw:items-center tw:gap-[9px] tw:text-ink-faint">
		<span>OBRA</span><i class="tw:h-px tw:w-[clamp(16px,3vw,42px)] tw:bg-[#d4aa42]"></i><span
			>JORNADA</span
		><i class="tw:h-px tw:w-[clamp(16px,3vw,42px)] tw:bg-[#d4aa42]"></i><span
			>CUADRO</span
		>
	</div>
	<div class="tw:flex tw:h-[clamp(24px,4vw,44px)] tw:overflow-hidden tw:rounded-ui-sm">
		{#each [18, 9, 14, 5, 21, 8, 12, 4, 9] as width, index}
			<i
				class={`tw:min-w-[3px] tw:[flex-grow:var(--segment)] ${segmentColors[index % 4]}`}
				style={`--segment: ${width}`}
			></i>
		{/each}
	</div>
	<div
		class={`meta tw:grid tw:border-t tw:border-rule-strong ${compact ? 'tw:grid-cols-[26px_1fr]' : 'tw:grid-cols-[30px_1fr_auto]'} tw:gap-x-3`}
	>
		<span class="tw:border-b tw:border-rule tw:py-[7px] tw:text-ink-faint">001</span><b
			class="tw:border-b tw:border-rule tw:py-[7px] tw:font-medium">QUINTILLA</b
		><em class={`tw:border-b tw:border-rule tw:py-[7px] tw:not-italic tw:text-ink-faint ${compact ? 'tw:hidden' : ''}`}>1—235</em>
		<span class="tw:border-b tw:border-rule tw:py-[7px] tw:text-ink-faint">002</span><b
			class="tw:border-b tw:border-rule tw:py-[7px] tw:font-medium">ROMANCE</b
		><em class={`tw:border-b tw:border-rule tw:py-[7px] tw:not-italic tw:text-ink-faint ${compact ? 'tw:hidden' : ''}`}>236—399</em>
		<span class="tw:border-b tw:border-rule tw:py-[7px] tw:text-ink-faint">003</span><b
			class="tw:border-b tw:border-rule tw:py-[7px] tw:font-medium">REDONDILLA</b
		><em class={`tw:border-b tw:border-rule tw:py-[7px] tw:not-italic tw:text-ink-faint ${compact ? 'tw:hidden' : ''}`}>400—614</em>
	</div>
</div>

<div
	class={`tw:absolute tw:right-[7%] tw:bottom-[17%] tw:aspect-square tw:w-[17%] tw:rotate-2 tw:grid-cols-4 tw:gap-0.5 ${compact ? 'tw:hidden' : 'tw:grid tw:max-[520px]:hidden'}`}
>
	{#each [12, 36, 67, 24, 36, 14, 45, 78, 67, 45, 10, 52, 24, 78, 52, 8] as tone}
		<i
			class="tw:rounded-[2px] tw:bg-[color-mix(in_srgb,#d4aa42_var(--tone),var(--visual-bg))]"
			style={`--tone: ${tone}%`}
		></i>
	{/each}
</div>

<div
	class={`meta tw:absolute tw:bottom-[8%] tw:text-ink-faint ${compact ? 'tw:right-[9%] tw:left-[9%]' : 'tw:right-[7%]'}`}
>
	SECUENCIAS → PERFIL → DISTANCIA
</div>
