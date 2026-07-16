import type { Component } from 'svelte';
import type { Locale } from '$lib/paraglide/runtime';

type StoryModule = { default: Component<{ locale: Locale }> };
type StoryLoader = () => Promise<StoryModule>;

const storyModules = import.meta.glob<StoryModule>('../components/projects/stories/*.svelte');
const storyLoaders = new Map<string, StoryLoader>(
	Object.entries(storyModules).map(([path, loader]) => [
		path.split('/').at(-1)?.replace(/\.svelte$/, '') ?? '',
		loader
	])
);
const storyPromises = new Map<string, Promise<StoryModule>>();

export const projectStorySlugs = [...storyLoaders.keys()].filter(Boolean).sort();

export const hasProjectStory = (slug: string) => storyLoaders.has(slug);

export function loadProjectStory(slug: string): Promise<StoryModule> | null {
	const loader = storyLoaders.get(slug);
	if (!loader) return null;
	const cached = storyPromises.get(slug);
	if (cached) return cached;
	const promise = loader();
	storyPromises.set(slug, promise);
	return promise;
}
