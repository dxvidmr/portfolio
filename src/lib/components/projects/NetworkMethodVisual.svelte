<script lang="ts">
	let { index }: { index: number } = $props();
	const matrix = [0, 3, 1, 0, 2, 0, 4, 1, 0, 2, 0, 5, 1, 0, 3, 0];
	const graphNodes = [
		{ cx: 18, cy: 42, r: 7, fill: 'fill-accent' },
		{ cx: 55, cy: 18, r: 10, fill: 'fill-[#aaa0bd]' },
		{ cx: 58, cy: 66, r: 6, fill: 'fill-[#7baea0]' },
		{ cx: 101, cy: 36, r: 12, fill: 'fill-[#d1be5c]' }
	];
</script>

<div class="grid min-h-[120px] place-items-center text-ink-dim" aria-hidden="true">
	{#if index === 0}
		<div class="grid w-[min(100%,112px)] gap-1.5 font-mono text-[0.46rem]">
			<b class="font-semibold tracking-[0.08em]">DON JUAN</b>
			<i class="h-0.5 rounded-[2px] bg-rule-strong"></i>
			<i class="h-0.5 w-[78%] rounded-[2px] bg-rule-strong"></i>
			<b class="mt-[5px] font-semibold tracking-[0.08em] text-accent-strong">INÉS</b>
			<i class="h-0.5 rounded-[2px] bg-rule-strong"></i>
		</div>
	{:else if index === 1}
		<div class="grid aspect-square w-[min(100%,105px)] grid-cols-4 gap-0.5">
			{#each matrix as value}
				<i class={`grid place-items-center border border-rule font-mono text-[0.42rem] not-italic ${value > 0 ? 'bg-[color-mix(in_srgb,var(--accent)_22%,transparent)] text-ink' : 'text-ink-faint'}`}>{value || ''}</i>
			{/each}
		</div>
	{:else if index === 2}
		<svg class="w-[min(100%,126px)] overflow-visible" viewBox="0 0 120 82" role="presentation">
			<path class="fill-none stroke-ink-faint [stroke-width:1.2]" d="M18 42 55 18M18 42 58 66M55 18 101 36M58 66 101 36M55 18 58 66" />
			{#each graphNodes as node}
				<circle class="{node.fill} stroke-ink-dim [stroke-width:.8]" cx={node.cx} cy={node.cy} r={node.r} />
			{/each}
		</svg>
	{:else}
		<div class="grid w-[min(100%,128px)] grid-cols-2 gap-2">
			<svg class="w-full" viewBox="0 0 60 76" role="presentation">
				<path class="fill-none stroke-ink-faint [stroke-width:1.2]" d="M8 40 27 16 48 34 35 63 8 40Z" />
				<circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="8" cy="40" r="4" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="27" cy="16" r="6" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="48" cy="34" r="5" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="35" cy="63" r="4" />
			</svg>
			<svg class="w-full" viewBox="0 0 60 76" role="presentation">
				<path class="fill-none stroke-ink-faint [stroke-width:1.2]" d="M9 24 48 24 48 58 9 58 9 24ZM9 24 48 58M48 24 9 58" />
				<circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="9" cy="24" r="5" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="48" cy="24" r="5" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="48" cy="58" r="5" /><circle class="fill-[var(--visual-bg)] stroke-accent-strong [stroke-width:1.2]" cx="9" cy="58" r="5" />
			</svg>
		</div>
	{/if}
</div>
