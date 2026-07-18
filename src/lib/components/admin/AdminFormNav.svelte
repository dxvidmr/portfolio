<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Save from '@lucide/svelte/icons/save';
	import Plus from '@lucide/svelte/icons/plus';

	type NavItem = {
		href: string;
		label: string;
		meta?: string | number;
		group?: 'content' | 'management';
	};

	let {
		items,
		formId,
		submitLabel = 'Guardar cambios',
		submitKind = 'save'
	}: {
		items: NavItem[];
		formId?: string;
		submitLabel?: string;
		submitKind?: 'save' | 'create';
	} = $props();

	const contentItems = $derived(items.filter((item) => item.group !== 'management'));
	const managementItems = $derived(items.filter((item) => item.group === 'management'));
</script>

<aside class="sticky top-32 hidden self-start min-[1100px]:block" aria-label="Secciones de la ficha">
	<div class="border-l border-rule pl-4">
		<p class="mt-0 mb-3 text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">En esta ficha</p>
		<nav>
			<ul class="m-0 grid list-none gap-0.5 p-0">
				{#each contentItems as item (item.href)}
					<li>
						<a
							class="flex items-baseline justify-between gap-3 border-l border-transparent py-1.5 pr-1 pl-3 text-[0.68rem] leading-snug text-ink-dim hover:border-accent-strong hover:text-accent-strong"
							href={item.href}
						>
							<span>{item.label}</span>
							{#if item.meta !== undefined}<span class="text-[0.58rem] text-ink-faint">{item.meta}</span>{/if}
						</a>
					</li>
				{/each}
			</ul>
			{#if managementItems.length > 0}
				<p class="mt-5 mb-2 text-[0.58rem] tracking-[0.1em] text-ink-faint uppercase">Gestión</p>
				<ul class="m-0 grid list-none gap-0.5 p-0">
					{#each managementItems as item (item.href)}
						<li>
							<a
								class="flex items-baseline justify-between gap-3 border-l border-transparent py-1.5 pr-1 pl-3 text-[0.68rem] leading-snug text-ink-dim hover:border-accent-strong hover:text-accent-strong"
								href={item.href}
							>
								<span>{item.label}</span>
								{#if item.meta !== undefined}<span class="text-[0.58rem] text-ink-faint">{item.meta}</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</nav>
		{#if formId}
			<Button class="mt-5 w-full" variant="primary" type="submit" form={formId}>
				{#if submitKind === 'create'}
					<Plus size={14} strokeWidth={1.7} aria-hidden="true" />
				{:else}
					<Save size={14} strokeWidth={1.7} aria-hidden="true" />
				{/if}
				{submitLabel}
			</Button>
		{/if}
	</div>
</aside>
