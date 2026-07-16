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

	const figureClasses = $derived(
		`tw:m-0 tw:min-w-0 ${portrait ? 'tw:w-[min(100%,310px)]' : ''}`
	);
	const frameClasses = $derived(
		bare
			? 'tw:relative tw:overflow-visible tw:bg-transparent'
			: 'tw:relative tw:overflow-hidden tw:rounded-ui tw:bg-[var(--visual-bg)]'
	);
</script>

<figure class={figureClasses}>
	<div class={frameClasses}>
		<img
			class="tw:block tw:h-auto tw:w-full"
			{src}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : 'auto'}
			decoding="async"
		/>
		{#if !bare}
			<span
				class="tw:pointer-events-none tw:absolute tw:inset-0 tw:rounded-[inherit] tw:border tw:border-[color-mix(in_srgb,var(--fg)_8%,transparent)]"
				aria-hidden="true"
			></span>
		{/if}
	</div>
	<figcaption
		class="tw:mt-[13px] tw:grid tw:max-w-[76ch] tw:grid-cols-[28px_minmax(0,1fr)] tw:gap-3 tw:text-ink-faint"
	>
		<span class="meta tw:pt-[3px]">{number}</span>
		<p class="tw:m-0 tw:text-[0.7rem] tw:leading-[1.5]">{caption}</p>
	</figcaption>
</figure>
