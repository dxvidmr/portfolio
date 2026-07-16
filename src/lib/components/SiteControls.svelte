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
	const controlClass =
		'inline-flex h-6.5 min-w-7 cursor-pointer items-center justify-center gap-[5px] rounded-ui-sm border-0 bg-transparent px-[7px] font-[inherit] text-meta leading-none tracking-[0.08em] text-ink-dim hover:bg-accent-wash hover:text-accent-strong';

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

<div
	class="inline-flex items-center gap-px border-l border-rule-strong pl-2.5"
	aria-label={currentLocale === 'es' ? 'Controles del sitio' : 'Site controls'}
>
	<a
		class={controlClass}
		href={localizedPath(baseHref, targetLocale)}
		aria-label={languageLabel}
		title={languageLabel}
	>
		<Languages size={14} strokeWidth={1.8} aria-hidden="true" />
		<span>{targetLocale.toUpperCase()}</span>
	</a>
	<button
		class="{controlClass} w-7 px-0"
		type="button"
		aria-label={themeLabel}
		title={themeLabel}
		onclick={toggleTheme}
	>
		{#if theme === 'light'}
			<Moon size={14} strokeWidth={1.8} aria-hidden="true" />
		{:else}
			<Sun size={14} strokeWidth={1.8} aria-hidden="true" />
		{/if}
	</button>
</div>
