<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	type Props = Omit<HTMLSelectAttributes, 'children' | 'class'> & {
		children: Snippet;
		class?: string;
	};

	let { children, class: className = '', value = $bindable(), ...attributes }: Props = $props();
</script>

<select
	{...attributes}
	bind:value
	class="w-full min-w-0 rounded-ui-sm border border-rule bg-[color-mix(in_srgb,var(--bg)_82%,var(--bg-panel))] px-[0.68rem] py-[0.58rem] font-[inherit] leading-[1.35] text-ink aria-[invalid=true]:border-danger focus:border-accent-strong focus:outline focus:outline-accent-strong focus:outline-offset-1 {className}"
>
	{@render children()}
</select>
