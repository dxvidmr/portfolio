<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'class' | 'type'> & { class?: string };
	let { class: className = '', checked = $bindable(), ...attributes }: Props = $props();
</script>

<input {...attributes} type="checkbox" bind:checked class="size-[1.05rem] accent-accent-strong {className}" />
