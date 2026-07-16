<script lang="ts">
	let {
		src,
		alt,
		caption,
		number,
		masonry = false,
		class: className = ''
	}: {
		src: string;
		alt: string;
		caption: string;
		number: string;
		masonry?: boolean;
		class?: string;
	} = $props();

	const classes = $derived(
		`m-0 min-w-0 ${masonry ? 'max-[620px]:mb-2 max-[620px]:inline-block max-[620px]:w-full max-[620px]:break-inside-avoid' : ''} ${className}`
	);
</script>

<figure class={classes}>
	<img
		class="block h-auto w-full rounded-ui-sm bg-[var(--visual-bg)]"
		{src}
		{alt}
		loading="lazy"
		decoding="async"
	/>
	<figcaption class="mt-[11px] grid grid-cols-[28px_minmax(0,1fr)] gap-3 text-ink-faint">
		<span class="meta pt-[3px]">{number}</span>
		<p class="m-0 text-[0.7rem] leading-[1.5]">{caption}</p>
	</figcaption>
</figure>
