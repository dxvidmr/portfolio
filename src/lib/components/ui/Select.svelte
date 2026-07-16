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
	class="tw:w-full tw:min-w-0 tw:rounded-ui-sm tw:border tw:border-rule tw:bg-[color-mix(in_srgb,var(--bg)_82%,var(--bg-panel))] tw:px-[0.68rem] tw:py-[0.58rem] tw:font-[inherit] tw:leading-[1.35] tw:text-ink tw:aria-[invalid=true]:border-danger tw:focus:border-accent-strong tw:focus:outline tw:focus:outline-accent-strong tw:focus:outline-offset-1 {className}"
>
	{@render children()}
</select>
