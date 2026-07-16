<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';

	let { links }: { links: Array<{ label: string; href: string }> } = $props();
</script>

<div class="tw:mt-[18px] tw:flex tw:flex-wrap tw:gap-x-[18px] tw:gap-y-2">
	{#each links as link (link.href)}
		<a
			class="meta tw:inline-flex tw:items-center tw:gap-1.5 tw:text-ink tw:transition-colors tw:duration-[180ms] tw:[&>svg]:text-accent-strong tw:[&>svg]:transition-transform tw:[&>svg]:duration-[180ms] tw:hover:text-accent-strong tw:hover:[&>svg]:translate-x-[3px] tw:hover:[&>svg]:translate-y-[-3px] tw:focus-visible:text-accent-strong tw:focus-visible:[&>svg]:translate-x-[3px] tw:focus-visible:[&>svg]:translate-y-[-3px]"
			href={link.href}
			target="_blank"
			rel="noreferrer"
		>
			{link.label}
			<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</a>
	{/each}
</div>
