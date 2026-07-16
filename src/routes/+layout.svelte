<script lang="ts">
	import '../app.css';
	import '$lib/styles/tailwind.css';
	import { page } from '$app/state';
	import { localizedPath } from '$lib/i18n';
	import { deLocalizeHref, locales } from '$lib/paraglide/runtime';
	import EditorialCursor from '$lib/components/EditorialCursor.svelte';

	let { children } = $props();
	const canonicalHref = $derived(deLocalizeHref(`${page.url.pathname}${page.url.search}${page.url.hash}`));
</script>

{@render children()}

<EditorialCursor />

<!-- Enlaces de idioma ocultos para rastreadores (hreflang lo añadiremos luego) -->
<div class="tw:hidden" aria-hidden="true">
	{#each locales as locale (locale)}
		<a href={localizedPath(canonicalHref, locale)}>{locale}</a>
	{/each}
</div>
