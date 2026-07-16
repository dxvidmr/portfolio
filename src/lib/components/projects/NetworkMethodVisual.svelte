<script lang="ts">
	let { index }: { index: number } = $props();
	const matrix = [0, 3, 1, 0, 2, 0, 4, 1, 0, 2, 0, 5, 1, 0, 3, 0];
	const graphNodes = [
		{ cx: 18, cy: 42, r: 7, fill: 'tw:fill-accent' },
		{ cx: 55, cy: 18, r: 10, fill: 'tw:fill-[#aaa0bd]' },
		{ cx: 58, cy: 66, r: 6, fill: 'tw:fill-[#7baea0]' },
		{ cx: 101, cy: 36, r: 12, fill: 'tw:fill-[#d1be5c]' }
	];
</script>

<div class="tw:grid tw:min-h-[120px] tw:place-items-center tw:text-ink-dim" aria-hidden="true">
	{#if index === 0}
		<div class="tw:grid tw:w-[min(100%,112px)] tw:gap-1.5 tw:font-mono tw:text-[0.46rem]">
			<b class="tw:font-semibold tw:tracking-[0.08em]">DON JUAN</b>
			<i class="tw:h-0.5 tw:rounded-[2px] tw:bg-rule-strong"></i>
			<i class="tw:h-0.5 tw:w-[78%] tw:rounded-[2px] tw:bg-rule-strong"></i>
			<b class="tw:mt-[5px] tw:font-semibold tw:tracking-[0.08em] tw:text-accent-strong">INÉS</b>
			<i class="tw:h-0.5 tw:rounded-[2px] tw:bg-rule-strong"></i>
		</div>
	{:else if index === 1}
		<div class="tw:grid tw:aspect-square tw:w-[min(100%,105px)] tw:grid-cols-4 tw:gap-0.5">
			{#each matrix as value}
				<i class={`tw:grid tw:place-items-center tw:border tw:border-rule tw:font-mono tw:text-[0.42rem] tw:not-italic ${value > 0 ? 'tw:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] tw:text-ink' : 'tw:text-ink-faint'}`}>{value || ''}</i>
			{/each}
		</div>
	{:else if index === 2}
		<svg class="tw:w-[min(100%,126px)] tw:overflow-visible" viewBox="0 0 120 82" role="presentation">
			<path class="tw:fill-none tw:stroke-ink-faint tw:[stroke-width:1.2]" d="M18 42 55 18M18 42 58 66M55 18 101 36M58 66 101 36M55 18 58 66" />
			{#each graphNodes as node}
				<circle class="{node.fill} tw:stroke-ink-dim tw:[stroke-width:.8]" cx={node.cx} cy={node.cy} r={node.r} />
			{/each}
		</svg>
	{:else}
		<div class="tw:grid tw:w-[min(100%,128px)] tw:grid-cols-2 tw:gap-2">
			<svg class="tw:w-full" viewBox="0 0 60 76" role="presentation">
				<path class="tw:fill-none tw:stroke-ink-faint tw:[stroke-width:1.2]" d="M8 40 27 16 48 34 35 63 8 40Z" />
				<circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="8" cy="40" r="4" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="27" cy="16" r="6" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="48" cy="34" r="5" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="35" cy="63" r="4" />
			</svg>
			<svg class="tw:w-full" viewBox="0 0 60 76" role="presentation">
				<path class="tw:fill-none tw:stroke-ink-faint tw:[stroke-width:1.2]" d="M9 24 48 24 48 58 9 58 9 24ZM9 24 48 58M48 24 9 58" />
				<circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="9" cy="24" r="5" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="48" cy="24" r="5" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="48" cy="58" r="5" /><circle class="tw:fill-[var(--visual-bg)] tw:stroke-accent-strong tw:[stroke-width:1.2]" cx="9" cy="58" r="5" />
			</svg>
		</div>
	{/if}
</div>
