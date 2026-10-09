<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile, t } from '$lib/content/profile';

	let { locale }: { locale: Locale } = $props();

	const title = $derived(
		locale === 'es' ? 'Afiliaciones y responsabilidades actuales' : 'Current affiliations and roles'
	);
	const projectLabel = $derived(locale === 'es' ? 'Proyecto I+D+i' : 'R&D project');
	const affiliations = $derived(t(profile.currentAffiliations, locale));
</script>

<section class="mb-[clamp(48px,7vw,84px)]">
	<h3 class="meta m-0">{title}</h3>

	<ul class="mt-[clamp(22px,3vw,32px)] mb-0 grid list-none grid-cols-2 gap-x-[clamp(28px,5vw,58px)] gap-y-[clamp(28px,4vw,42px)] p-0 max-[620px]:grid-cols-1">
		{#each affiliations as affiliation (affiliation.name)}
			<li class="min-w-0">
				<a
					class="group block text-inherit no-underline"
					href={affiliation.url}
					target="_blank"
					rel="noreferrer"
				>
					<p class="m-0 font-title text-[clamp(1rem,1.5vw,1.2rem)] leading-[1.2] text-ink [transition:color_180ms_ease] group-hover:text-accent-strong group-focus-visible:text-accent-strong">
						{affiliation.name}
					</p>
					<p class="mt-1.5 mb-0 text-[.72rem] leading-[1.4] text-ink-dim">{affiliation.role}</p>
					<p class="mt-1 mb-0 text-[.64rem] leading-[1.45] text-ink-faint">{affiliation.context}</p>
					{#if affiliation.project}
						<p class="mt-3 mb-0 text-[.64rem] leading-[1.45] text-ink-dim">
							<span class="font-mono text-[.57rem] tracking-meta text-accent-strong uppercase">{projectLabel}</span>
							<span class="mt-1 block font-title text-[.78rem] leading-[1.35] text-ink-dim">
								<InlineTitle text={affiliation.project.title} />
							</span>
							<span class="mt-1 block font-mono text-[.56rem] text-ink-faint">{affiliation.project.code}</span>
						</p>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</section>
