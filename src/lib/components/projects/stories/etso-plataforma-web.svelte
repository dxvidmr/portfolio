<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import EtsoStory from '../EtsoStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<EtsoStory {locale} />
