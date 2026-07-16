<script lang="ts">
	let { blocks }: { blocks: Array<{ label?: string; heading: string; body: string }> } = $props();
</script>

<section
	class="tw:grid tw:gap-[clamp(66px,10vw,140px)] tw:border-t tw:border-rule-strong tw:py-[clamp(72px,10vw,140px)]"
>
	{#each blocks as block, index (block.heading)}
		<article
			class="tw:grid tw:w-[min(78%,900px)] tw:grid-cols-[42px_minmax(0,720px)] tw:gap-[clamp(20px,4vw,52px)] tw:max-[700px]:w-full tw:max-[700px]:grid-cols-[28px_minmax(0,1fr)] tw:max-[700px]:gap-3.5 {index %
			2 ===
			1
				? 'tw:justify-self-end'
				: ''}"
		>
			<div class="meta tw:pt-2 tw:text-accent-strong">{String(index + 1).padStart(2, '0')}</div>
			<div>
				{#if block.label}<p class="meta tw:mt-0 tw:mb-3.5 tw:text-ink-faint">{block.label}</p>{/if}
				<h3
					class="tw:m-0 tw:text-[clamp(2rem,4.8vw,4.5rem)] tw:font-[450] tw:leading-[0.96] tw:tracking-[-0.035em]"
				>
					{block.heading}
				</h3>
				<p
					class="tw:mt-[22px] tw:mb-0 tw:max-w-[68ch] tw:text-[clamp(0.84rem,1.1vw,0.96rem)] tw:leading-[1.72] tw:text-ink-dim"
				>
					{block.body}
				</p>
			</div>
		</article>
	{/each}
</section>
