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
		`m-0 min-w-0 ${portrait ? 'w-[min(100%,310px)]' : ''}`
	);
	const frameClasses = $derived(
		bare
			? 'relative overflow-visible bg-transparent'
			: 'relative overflow-hidden rounded-ui bg-[var(--visual-bg)]'
	);
</script>

<figure class={figureClasses}>
	<div class={frameClasses}>
		<img
			class="block h-auto w-full"
			{src}
			{alt}
			loading={priority ? 'eager' : 'lazy'}
			fetchpriority={priority ? 'high' : 'auto'}
			decoding="async"
		/>
		{#if !bare}
			<span
				class="pointer-events-none absolute inset-0 rounded-[inherit] border border-[color-mix(in_srgb,var(--fg)_8%,transparent)]"
				aria-hidden="true"
			></span>
		{/if}
	</div>
	<figcaption
		class="mt-[13px] grid max-w-[76ch] grid-cols-[28px_minmax(0,1fr)] gap-3 text-ink-faint"
	>
		<span class="meta pt-[3px]">{number}</span>
		<p class="m-0 text-[0.7rem] leading-[1.5]">{caption}</p>
	</figcaption>
</figure>
