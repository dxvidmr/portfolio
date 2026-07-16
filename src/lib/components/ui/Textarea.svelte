<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	type Props = Omit<HTMLTextareaAttributes, 'class'> & { class?: string };
	let { class: className = '', value = $bindable(), ...attributes }: Props = $props();
</script>

<textarea
	{...attributes}
	bind:value
	class="min-h-28 w-full min-w-0 resize-y rounded-ui-sm border border-rule bg-[color-mix(in_srgb,var(--bg)_82%,var(--bg-panel))] px-[0.68rem] py-[0.58rem] font-[inherit] leading-[1.35] text-ink aria-[invalid=true]:border-danger focus:border-accent-strong focus:outline focus:outline-accent-strong focus:outline-offset-1 {className}"
></textarea>
