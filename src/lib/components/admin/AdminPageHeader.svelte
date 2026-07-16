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
	class="tw:flex tw:items-end tw:justify-between tw:gap-4 tw:max-[620px]:flex-col tw:max-[620px]:items-start {description
		? ''
		: 'tw:mb-6'}"
>
	<div>
		{#if eyebrow}
			<p class="tw:m-0 tw:text-meta tw:tracking-[0.1em] tw:text-ink-faint tw:uppercase">{eyebrow}</p>
		{/if}
		<h1 class="tw:mt-1 tw:mb-0 tw:text-[clamp(1.7rem,3vw,2.45rem)]! tw:leading-[1.05]">{title}</h1>
	</div>
	{#if actions}
		<div class="tw:flex tw:items-center tw:gap-4">
			{@render actions()}
		</div>
	{/if}
</header>

{#if description}
	<p class="tw:mt-4 tw:mb-6 tw:max-w-[78ch] tw:leading-[1.6] tw:text-ink-dim">{description}</p>
{/if}
