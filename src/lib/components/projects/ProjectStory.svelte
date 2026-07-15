<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import DigitalEditionsStory from './DigitalEditionsStory.svelte';
	import EtsoStory from './EtsoStory.svelte';
	import NetworksStory from './NetworksStory.svelte';
	import StageStory from './StageStory.svelte';
	import TodosAUnaStory from './TodosAUnaStory.svelte';
	import VersologiaStory from './VersologiaStory.svelte';

	let { slug, locale }: { slug: string; locale: Locale } = $props();
</script>

{#if slug === 'todos-a-una'}
	<TodosAUnaStory {locale} />
{:else if slug === 'versologia-metadrama'}
	<VersologiaStory {locale} />
{:else if slug === 'etso-plataforma-web'}
	<EtsoStory {locale} />
{:else if slug === 'redes-personajes-teatrales'}
	<NetworksStory {locale} />
{:else if slug === 'edicion-digital-corpus'}
	<DigitalEditionsStory {locale} />
{:else if slug === 'documento-escena'}
	<StageStory {locale} />
{/if}
