<script lang="ts">
  import AcademicPath from '$lib/components/AcademicPath.svelte';
  import CvProse from './CvProse.svelte';
  import type { CvEntry } from '$lib/types/cv';
  let { entries, language }: { entries: (CvEntry & { commentary: string })[]; language: 'es' | 'en' } = $props();
  const sortedEntries = $derived([...entries].sort((a,b)=>b.sortDate.localeCompare(a.sortDate)));
  const items = $derived(sortedEntries.map(entry=>{
    const p = entry.presentation?.kind === 'education' ? entry.presentation : undefined;
    const ongoing = p?.ongoing ?? /en curso|ongoing/i.test(entry.date);
    const year = p?.year ?? [...entry.date.matchAll(/\b\d{4}\b/g)].at(-1)?.[0] ?? '';
    const qualifier = entry.title.match(/(\s+\(título propio\)|,\s*especialidad en .+)$/i);
    return {
      key: entry.key, period: p?.expected ? year : ongoing ? (language === 'en' ? 'Ongoing' : 'En curso') : year,
      degree: qualifier ? entry.title.slice(0,qualifier.index) : entry.title,
      degreeSuffix: qualifier?.[0], institution: entry.detail, dateLabel: p?.expected ? (language==='en' ? 'Expected' : 'Prevista') : undefined, status: p?.expected ? (language==='en' ? 'Ongoing' : 'En curso') : undefined
    };
  }));
</script>

<AcademicPath locale={language} print {items}>
  {#snippet extra(index: number)}
    {@const entry = sortedEntries[index]}
    {#if entry.url}<a href={entry.url} class="cv-link mt-1 inline-block max-w-full text-[0.7rem] break-words text-[#536a4f] underline underline-offset-2">{entry.url.replace(/^https?:\/\//,'').replace(/\/$/,'')} ↗</a>{/if}
    {#if entry.contribution}<div class="cv-contribution mt-1"><CvProse body={entry.contribution} /></div>{/if}
    <CvProse body={entry.commentary} />
  {/snippet}
</AcademicPath>
