<script lang="ts">
	import { onMount } from 'svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import Button from '$lib/components/ui/Button.svelte';

	type Theme = 'light' | 'dark';

	let theme = $state<Theme>('light');
	let label = $derived(theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');

	onMount(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}
</script>

<Button size="sm" aria-label={label} title={label} onclick={toggleTheme}>
	{#if theme === 'light'}
		<Moon size={15} strokeWidth={1.7} aria-hidden="true" />
	{:else}
		<Sun size={15} strokeWidth={1.7} aria-hidden="true" />
	{/if}
	<span class="max-[620px]:hidden">{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
</Button>
