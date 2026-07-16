<script lang="ts">
	import { onMount } from 'svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

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

<button class="theme-toggle" type="button" aria-label={label} title={label} onclick={toggleTheme}>
	{#if theme === 'light'}
		<Moon size={15} strokeWidth={1.7} aria-hidden="true" />
	{:else}
		<Sun size={15} strokeWidth={1.7} aria-hidden="true" />
	{/if}
	<span>{theme === 'light' ? 'Oscuro' : 'Claro'}</span>
</button>

