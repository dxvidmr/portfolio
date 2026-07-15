<script lang="ts">
	let { blocks }: { blocks: Array<{ label?: string; heading: string; body: string }> } = $props();
</script>

<section class="editorial-story">
	{#each blocks as block, index (block.heading)}
		<article class:is-offset={index % 2 === 1}>
			<div class="story-index meta">{String(index + 1).padStart(2, '0')}</div>
			<div class="story-copy">
				{#if block.label}<p class="meta story-label">{block.label}</p>{/if}
				<h3>{block.heading}</h3>
				<p>{block.body}</p>
			</div>
		</article>
	{/each}
</section>

<style>
	.editorial-story {
		display: grid;
		gap: clamp(66px, 10vw, 140px);
		padding-block: clamp(72px, 10vw, 140px);
		border-top: 1px solid var(--line-strong);
	}
	article {
		display: grid;
		grid-template-columns: 42px minmax(0, 720px);
		gap: clamp(20px, 4vw, 52px);
		width: min(78%, 900px);
	}
	article.is-offset { justify-self: end; }
	.story-index { padding-top: 8px; color: var(--accent-strong); }
	.story-label { margin: 0 0 14px; color: var(--fg-faint); }
	h3 {
		margin: 0;
		font-size: clamp(2rem, 4.8vw, 4.5rem);
		font-weight: 450;
		line-height: 0.96;
		letter-spacing: -0.035em;
	}
	.story-copy > p:last-child {
		max-width: 68ch;
		margin: 22px 0 0;
		color: var(--fg-dim);
		font-size: clamp(0.84rem, 1.1vw, 0.96rem);
		line-height: 1.72;
	}
	@media (max-width: 700px) {
		article,
		article.is-offset { width: 100%; }
		article { grid-template-columns: 28px minmax(0, 1fr); gap: 14px; }
	}
</style>
