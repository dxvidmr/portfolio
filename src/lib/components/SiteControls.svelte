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
		'tw:inline-flex tw:h-6.5 tw:min-w-7 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-[5px] tw:rounded-ui-sm tw:border-0 tw:bg-transparent tw:px-[7px] tw:font-[inherit] tw:text-meta tw:leading-none tw:tracking-[0.08em] tw:text-ink-dim tw:hover:bg-accent-wash tw:hover:text-accent-strong';

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
	class="tw:inline-flex tw:items-center tw:gap-px tw:border-l tw:border-rule-strong tw:pl-2.5"
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
		class="{controlClass} tw:w-7 tw:px-0"
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
