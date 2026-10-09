<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import type { Snippet } from 'svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile } from '$lib/content/profile';

	let { locale, print = false, items, extra }: {
		locale: Locale;
		print?: boolean;
		items?: { key: string; period: string; degree: string; institution: string; degreeSuffix?: string; dateLabel?: string; status?: string }[];
		extra?: Snippet<[number]>;
	} = $props();
	const entries = $derived(items ?? [...profile.education[locale]].reverse());
	const label = $derived(locale === 'es' ? 'Recorrido académico' : 'Academic path');
</script>

{#if print}
	<ol class="cv-education-timeline relative m-0 list-none p-0" aria-label={label}>
		{#each entries as entry, index (items?.[index].key ?? entry.period)}
			<li class="cv-education-entry relative py-3 pl-6 before:absolute before:top-0 before:bottom-0 before:left-[3px] before:w-px before:bg-[#c3c6c2] before:content-[''] after:absolute after:top-[19px] after:left-0 after:size-[7px] after:rounded-full after:border after:border-[#536a4f] after:bg-white after:content-['']">
				<div class="cv-education-row grid grid-cols-[92px_minmax(0,1fr)] items-start gap-3">
					<span class="cv-education-period pt-1 font-mono text-[0.68rem] leading-relaxed text-[#536a4f]">
						{#if items?.[index].dateLabel}<span class="cv-education-date-label block font-sans text-[0.62rem]">{items[index].dateLabel}</span>{/if}
						<span class="block whitespace-nowrap">{entry.period}</span>
						{#if items?.[index].status}<span class="block whitespace-nowrap font-sans">{items[index].status}</span>{/if}
					</span>
					<div class="min-w-0">
						<h3 class="cv-education-title m-0 font-title text-[1.1rem] leading-snug font-medium"><InlineTitle text={entry.degree} />{#if items?.[index].degreeSuffix}<span class="cv-education-qualifier font-sans text-[0.78rem] font-normal text-[#50534d]">{items[index].degreeSuffix}</span>{/if}</h3>
						{#if entry.institution}<p class="cv-education-institution mt-1 mb-0 text-[0.78rem] leading-relaxed text-[#50534d]">{entry.institution}</p>{/if}
						{#if extra}{@render extra(index)}{/if}
					</div>
				</div>
			</li>
		{/each}
	</ol>
{:else}
<!-- Línea de tiempo estática: todos los hitos visibles y el actual marcado. Antes dependía del
     desplazamiento (sticky y 140vh), que chocaba con la columna fija de «Sobre mí». -->
<section aria-label={label}>
	<header><span class="label">{label}</span></header>
	<ol
		class="relative m-0 mt-[clamp(18px,2.5vw,28px)] grid list-none gap-[clamp(16px,2vw,22px)] p-0 pl-[20px] before:absolute before:top-[9px] before:bottom-[9px] before:left-[3px] before:w-px before:bg-rule before:content-['']"
	>
		{#each entries as entry, index (entry.period)}
			{@const current = index === entries.length - 1}
			<li
				class={`relative before:absolute before:top-[5px] before:left-[-20px] before:size-[7px] before:rounded-full before:border before:content-[''] ${current ? 'before:border-accent-strong before:bg-accent' : 'before:border-rule-strong before:bg-canvas'}`}
			>
				<span class={`font-mono text-[.72rem] ${current ? 'text-accent-strong' : 'text-ink-faint'}`}>{entry.period}</span>
				<p class="mt-1 mb-0 text-[1rem] leading-[1.3] text-ink"><InlineTitle text={entry.degree} /></p>
				{#if entry.institution}<p class="mt-1 mb-0 text-[.76rem] leading-[1.45] text-ink-faint">{entry.institution}</p>{/if}
			</li>
		{/each}
	</ol>
</section>
{/if}
