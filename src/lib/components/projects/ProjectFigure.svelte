<script lang="ts">
	let {
		src,
		alt,
		caption,
		number,
		portrait = false,
		priority = false,
		bare = false
	}: {
		src: string;
		alt: string;
		caption: string;
		number: string;
		portrait?: boolean;
		priority?: boolean;
		bare?: boolean;
	} = $props();
</script>

<figure class:is-portrait={portrait} class:is-bare={bare}>
	<div class="image-frame">
		<img
			{src}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : 'auto'}
			decoding="async"
		/>
	</div>
	<figcaption>
		<span class="meta">{number}</span>
		<p>{caption}</p>
	</figcaption>
</figure>

<style>
	figure { min-width: 0; margin: 0; }
	.image-frame {
		position: relative;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--visual-bg);
	}
	.image-frame::after {
		position: absolute;
		inset: 0;
		border: 1px solid color-mix(in srgb, var(--fg) 8%, transparent);
		border-radius: inherit;
		content: '';
		pointer-events: none;
	}
	.is-bare .image-frame { overflow: visible; background: transparent; }
	.is-bare .image-frame::after { display: none; }
	img { display: block; width: 100%; height: auto; }
	.is-portrait { width: min(100%, 310px); }
	figcaption {
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr);
		gap: 12px;
		max-width: 76ch;
		margin-top: 13px;
		color: var(--fg-faint);
	}
	figcaption span { padding-top: 3px; }
	figcaption p { margin: 0; font-size: 0.7rem; line-height: 1.5; }
</style>
