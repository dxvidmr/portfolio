<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import { loadProjectStory } from '$lib/content/project-story-registry';

	let { slug, locale }: { slug: string; locale: Locale } = $props();
	const story = $derived(loadProjectStory(slug));
</script>

{#if story}
	{#await story then storyModule}
		{@const Story = storyModule.default}
		<Story {locale} />
	{/await}
{/if}
