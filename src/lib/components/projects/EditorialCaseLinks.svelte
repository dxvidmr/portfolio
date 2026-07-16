<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';

	let { links }: { links: Array<{ label: string; href: string }> } = $props();
</script>

<div class="mt-[18px] flex flex-wrap gap-x-[18px] gap-y-2">
	{#each links as link (link.href)}
		<a
			class="meta inline-flex items-center gap-1.5 text-ink transition-colors duration-[180ms] [&>svg]:text-accent-strong [&>svg]:transition-transform [&>svg]:duration-[180ms] hover:text-accent-strong hover:[&>svg]:translate-x-[3px] hover:[&>svg]:translate-y-[-3px] focus-visible:text-accent-strong focus-visible:[&>svg]:translate-x-[3px] focus-visible:[&>svg]:translate-y-[-3px]"
			href={link.href}
			target="_blank"
			rel="noreferrer"
		>
			{link.label}
			<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</a>
	{/each}
</div>
