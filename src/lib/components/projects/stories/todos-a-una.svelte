<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import TodosAUnaStory from '../TodosAUnaStory.svelte';
	let { locale }: { locale: Locale } = $props();
</script>

<TodosAUnaStory {locale} />
