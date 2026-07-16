<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import NetworksStory from '../NetworksStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<NetworksStory {locale} />
