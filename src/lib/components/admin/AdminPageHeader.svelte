<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		eyebrow,
		description,
		actions
	}: {
		title: string;
		eyebrow?: string;
		description?: string;
		actions?: Snippet;
	} = $props();
</script>

<header
	class="flex items-end justify-between gap-4 max-[620px]:flex-col max-[620px]:items-start {description
		? ''
		: 'mb-6'}"
>
	<div>
		{#if eyebrow}
			<p class="m-0 text-meta tracking-[0.1em] text-ink-faint uppercase">{eyebrow}</p>
		{/if}
		<h1 class="mt-1 mb-0 text-[clamp(1.7rem,3vw,2.45rem)]! leading-[1.05]">{title}</h1>
	</div>
	{#if actions}
		<div class="flex items-center gap-4">
			{@render actions()}
		</div>
	{/if}
</header>

{#if description}
	<p class="mt-4 mb-6 max-w-[78ch] leading-[1.6] text-ink-dim">{description}</p>
{/if}
