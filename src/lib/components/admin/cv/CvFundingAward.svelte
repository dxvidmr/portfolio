<script lang="ts">
  import CvArrow from './CvArrow.svelte';
	import InlineTitle from '$lib/components/InlineTitle.svelte';
  import { CV_SEPARATOR } from '$lib/content/cv-format';
  import type { CvEntry, CvPresentation } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  let { entry, presentation: p, language }: {
    entry: CvEntry & { commentary: string };
    presentation: Extract<CvPresentation, { kind: 'funding' }>;
    language: 'es' | 'en';
  } = $props();
  const amount = $derived(p.amount != null && Number.isFinite(p.amount)
    ? `${new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-GB', {
        useGrouping: 'always', minimumFractionDigits: Number.isInteger(p.amount) ? 0 : 2, maximumFractionDigits: 2
      }).format(p.amount)}${p.currency ? ` ${p.currency}` : ''}` : '');
</script>

<div class="cv-funding-row grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4">
  <div class="cv-funding-marker pt-0.5 text-[#536a4f]">
    {#if entry.date}<span class="cv-funding-year block font-mono text-[0.75rem] leading-snug">{entry.date}</span>{/if}
    {#if p.awardType}<span class="cv-funding-type mt-1 block text-[0.6rem] leading-snug tracking-[0.04em] uppercase">{p.awardType}</span>{/if}
  </div>
  <div class="min-w-0">
    <h3 class="cv-funding-title m-0 font-title text-[1rem] leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
    {#if p.awardingBody || amount}<p class="cv-funding-body mt-1 mb-0 text-[0.76rem] leading-relaxed text-[#50534d]">{p.awardingBody}{p.awardingBody && amount ? CV_SEPARATOR : ''}{#if amount}<span class="cv-funding-amount font-mono font-medium whitespace-nowrap text-[#41583d]">{amount}</span>{/if}</p>{/if}
    {#if p.context}<p class="cv-funding-context mt-1 mb-0 text-[0.72rem] leading-relaxed text-[#50534d]">{p.context}</p>{/if}
    {#if entry.url}<a href={entry.url} class="cv-link mt-1 inline-block text-[0.7rem] text-[#536a4f] no-underline">{language === 'en' ? 'Details' : 'Más información'}<CvArrow /></a>{/if}
    {#if entry.contribution}<div class="cv-contribution mt-1"><CvProse body={entry.contribution} /></div>{/if}
    <CvProse body={entry.commentary} />
  </div>
</div>
