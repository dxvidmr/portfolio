<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import VersologiaStory from '../VersologiaStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<VersologiaStory {locale} />
