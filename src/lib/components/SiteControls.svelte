<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Languages from '@lucide/svelte/icons/languages';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import { deLocalizeHref } from '$lib/paraglide/runtime';

	type Theme = 'light' | 'dark';

	let theme = $state<Theme>('light');
	const currentLocale = $derived(localeFromPathname(page.url.pathname));
	const targetLocale = $derived(currentLocale === 'es' ? 'en' : 'es');
	const currentHref = $derived(`${page.url.pathname}${page.url.search}${page.url.hash}`);
	const baseHref = $derived(deLocalizeHref(currentHref));
	const languageLabel = $derived(currentLocale === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish');
	const themeLabel = $derived(
		currentLocale === 'es'
			? theme === 'light'
				? 'Cambiar a oscuro'
				: 'Cambiar a claro'
			: theme === 'light'
				? 'Switch to dark'
				: 'Switch to light'
	);

	onMount(() => {
		const current = document.documentElement.dataset.theme;
		theme = current === 'dark' ? 'dark' : 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}
</script>

<div class="site-controls" aria-label={currentLocale === 'es' ? 'Controles del sitio' : 'Site controls'}>
	<a class="control" href={localizedPath(baseHref, targetLocale)} aria-label={languageLabel} title={languageLabel}>
		<Languages size={14} strokeWidth={1.8} aria-hidden="true" />
		<span>{targetLocale.toUpperCase()}</span>
	</a>
	<button class="control icon-only" type="button" aria-label={themeLabel} title={themeLabel} onclick={toggleTheme}>
		{#if theme === 'light'}
			<Moon size={14} strokeWidth={1.8} aria-hidden="true" />
		{:else}
			<Sun size={14} strokeWidth={1.8} aria-hidden="true" />
		{/if}
	</button>
</div>

<style>
	.site-controls {
		display: inline-flex;
		align-items: center;
		gap: 1px;
		padding-left: 10px;
		border-left: 1px solid var(--line-strong);
	}
	.control {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		min-width: 28px;
		height: 26px;
		padding: 0 7px;
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--fg-dim);
		font: inherit;
		font-size: var(--fs-meta);
		letter-spacing: 0.08em;
		line-height: 1;
		cursor: pointer;
	}
	.icon-only {
		width: 28px;
		padding: 0;
	}
	.control:hover {
		color: var(--accent-strong);
		background: var(--accent-wash);
	}
</style>
