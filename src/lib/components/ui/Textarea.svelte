<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = Omit<HTMLTextareaAttributes, 'class'> & { class?: string };
	let { class: className = '', value = $bindable(), ...attributes }: Props = $props();
</script>

<textarea
	{...attributes}
	bind:value
	class="tw:min-h-28 tw:w-full tw:min-w-0 tw:resize-y tw:rounded-ui-sm tw:border tw:border-rule tw:bg-[color-mix(in_srgb,var(--bg)_82%,var(--bg-panel))] tw:px-[0.68rem] tw:py-[0.58rem] tw:font-[inherit] tw:leading-[1.35] tw:text-ink tw:aria-[invalid=true]:border-danger tw:focus:border-accent-strong tw:focus:outline tw:focus:outline-accent-strong tw:focus:outline-offset-1 {className}"
></textarea>
