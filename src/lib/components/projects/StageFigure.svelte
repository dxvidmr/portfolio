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
		`tw:m-0 tw:min-w-0 ${masonry ? 'tw:max-[620px]:mb-2 tw:max-[620px]:inline-block tw:max-[620px]:w-full tw:max-[620px]:break-inside-avoid' : ''} ${className}`
	);
</script>

<figure class={classes}>
	<img
		class="tw:block tw:h-auto tw:w-full tw:rounded-ui-sm tw:bg-[var(--visual-bg)]"
		{src}
		{alt}
		loading="lazy"
		decoding="async"
	/>
	<figcaption class="tw:mt-[11px] tw:grid tw:grid-cols-[28px_minmax(0,1fr)] tw:gap-3 tw:text-ink-faint">
		<span class="meta tw:pt-[3px]">{number}</span>
		<p class="tw:m-0 tw:text-[0.7rem] tw:leading-[1.5]">{caption}</p>
	</figcaption>
</figure>
