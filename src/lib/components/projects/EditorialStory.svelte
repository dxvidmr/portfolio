<script lang="ts">
	let { blocks }: { blocks: Array<{ label?: string; heading: string; body: string }> } = $props();
</script>

<section
	class="grid gap-[clamp(66px,10vw,140px)] border-t border-rule-strong py-[clamp(72px,10vw,140px)]"
>
	{#each blocks as block, index (block.heading)}
		<article
			class="grid w-[min(78%,900px)] grid-cols-[42px_minmax(0,720px)] gap-[clamp(20px,4vw,52px)] max-[700px]:w-full max-[700px]:grid-cols-[28px_minmax(0,1fr)] max-[700px]:gap-3.5 {index %
			2 ===
			1
				? 'justify-self-end'
				: ''}"
		>
			<div class="meta pt-2 text-accent-strong">{String(index + 1).padStart(2, '0')}</div>
			<div>
				{#if block.label}<p class="meta mt-0 mb-3.5 text-ink-faint">{block.label}</p>{/if}
				<h3
					class="m-0 text-[clamp(2rem,4.8vw,4.5rem)] font-[450] leading-[0.96] tracking-[-0.035em]"
				>
					{block.heading}
				</h3>
				<p
					class="mt-[22px] mb-0 max-w-[68ch] text-[clamp(0.84rem,1.1vw,0.96rem)] leading-[1.72] text-ink-dim"
				>
					{block.body}
				</p>
			</div>
		</article>
	{/each}
</section>
