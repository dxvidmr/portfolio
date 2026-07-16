<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import StageStory from '../StageStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<StageStory {locale} />
