<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	interface RoleItem {
		id: number;
		title: string;
		meta: string;
		href: string;
		isPublic: boolean;
		documentCount: number;
		certificateCount: number;
	}

	let {
		title,
		description,
		items,
		emptyText,
		addHref,
		addLabel
	}: {
		title: string;
		description: string;
		items: RoleItem[];
		emptyText: string;
		addHref?: string;
		addLabel?: string;
	} = $props();
</script>

<article class="flex min-w-0 flex-col overflow-hidden rounded-ui border border-rule bg-admin-surface">
	<header class="grid gap-3 border-b border-rule px-4 py-4">
		<div class="flex items-start justify-between gap-4">
			<div class="grid gap-1.5">
				<h3 class="m-0 text-sm font-medium text-ink">{title}</h3>
				<p class="m-0 text-xs leading-[1.55] text-ink-faint">{description}</p>
			</div>
			<strong class="shrink-0 text-sm font-medium text-accent-strong">{items.length}</strong>
		</div>
		{#if addHref && addLabel}
			<ButtonLink href={addHref} size="sm">{addLabel}</ButtonLink>
		{/if}
	</header>

	{#if items.length > 0}
		<ul class="m-0 list-none p-0">
			{#each items as item (item.id)}
				<li class="border-b border-rule last:border-b-0">
					<a class="group grid gap-2 px-4 py-3.5 text-ink" href={item.href}>
						<div class="flex items-start justify-between gap-3">
							<strong class="text-xs leading-[1.4] group-hover:text-accent-strong"><InlineTitle text={item.title} /></strong>
							<span class={`shrink-0 text-[0.6rem] uppercase ${item.isPublic ? 'text-accent-strong' : 'text-ink-faint'}`}>
								{item.isPublic ? 'Pública' : 'Privada'}
							</span>
						</div>
						<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.62rem] text-ink-faint">
							<span>{item.meta}</span>
							{#if item.certificateCount > 0}<span>{item.certificateCount} cert.</span>{/if}
							{#if item.documentCount > item.certificateCount}
								<span>{item.documentCount - item.certificateCount} doc.</span>
							{/if}
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="m-0 p-4 text-xs leading-[1.55] text-ink-faint">{emptyText}</p>
	{/if}
</article>
