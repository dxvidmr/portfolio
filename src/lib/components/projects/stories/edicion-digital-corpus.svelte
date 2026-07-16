<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import DigitalEditionsStory from '../DigitalEditionsStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<DigitalEditionsStory {locale} />
