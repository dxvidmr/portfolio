<script lang="ts">
  import type { CvEntry } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  import CvAuthors from './CvAuthors.svelte';
  import CvTechnicalWork from './CvTechnicalWork.svelte';
  import CvFundingAward from './CvFundingAward.svelte';
  let { entry, language, personName = '' }: { entry: CvEntry & { commentary: string }; language: 'es' | 'en'; personName?: string } = $props();
  const en = $derived(language === 'en');
  const p = $derived(entry.presentation);
  const linkLabel = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const compact = (...parts: string[]) => parts.filter(Boolean).join(' · ');
  const folded = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const normalizedName = (text: string) => folded(text).replace(/[.,]/g, ' ').replace(/\s+/g, ' ').trim();
  const isSoleAuthor = (authors: string) => {
    if (!personName.trim()) return false;
    if (normalizedName(authors) === normalizedName(personName)) return true;
    const parts = authors.split(',');
    return parts.length === 2 && normalizedName(`${parts[1]} ${parts[0]}`) === normalizedName(personName);
  };
  // «Apellido, Nombre» es un solo editor; varias comas, «;» o una conjunción indican varios.
  const editorAbbreviation = (editors: string) => {
    const parts = editors.split(',').map((part) => part.trim()).filter(Boolean);
    const several = /;|\s(?:y|e|and|&)\s/i.test(editors) || parts.length > 2 || (parts.length === 2 && parts.every((part) => part.includes(' ')));
    return several ? 'eds.' : 'ed.';
  };
  const talkAuthors = $derived(p?.kind === 'talk' && !isSoleAuthor(p.authors) ? p.authors : '');
  const eventVenue = $derived(p?.kind === 'talk'
    ? [p.institution && !folded(p.event).includes(folded(p.institution)) ? p.institution : '', p.city, entry.date].filter(Boolean).join(', ')
    : '');
  const locator = $derived(p?.kind === 'publication'
    ? [p.volume ? `${p.volume}${p.issue ? ` (${p.issue})` : ''}` : p.issue, p.pages ? `pp. ${p.pages}` : ''].filter(Boolean).join(', ')
    : '');
  const publicationLink = $derived(/^https?:\/\/(?:dx\.)?doi\.org\//i.test(entry.url) ? 'DOI' : en ? 'Link' : 'Enlace');
</script>
<div class="cv-entry my-5" class:cv-entry-brief={['teaching','memberships','service_activities'].includes(entry.entityType)} data-entry-type={entry.entityType}>
  {#if p?.kind === 'publication'}
    <p class="cv-reference m-0 pl-4 -indent-4 text-[0.85rem] leading-relaxed">
      {#if p.authors}<span class="cv-reference-authors font-semibold"><CvAuthors text={p.authors} {personName} /></span>{' '}{/if}{#if entry.date}<span class="cv-reference-year text-[#536a4f]">({entry.date})</span>{/if}{p.authors || entry.date ? '. ' : ''}<span class="cv-reference-title font-title text-[1rem] font-medium">«{entry.title}»</span>.{' '}
      {#if p.editors}{en ? 'In ' : 'En '}{p.editors} ({editorAbbreviation(p.editors)}),{' '}{/if}{#if p.container}<cite class="italic">{p.container}</cite>{/if}{#if locator}{p.container ? ', ' : ''}{locator}{/if}{#if p.publisher}{p.container || locator ? '. ' : ''}{p.publisher}{/if}{p.container || locator || p.publisher ? '.' : ''}
      {#if entry.url}{' '}<a href={entry.url} aria-label={`${publicationLink}: ${entry.title}`} class="cv-reference-link ml-1 font-mono text-[0.62rem] whitespace-nowrap text-[#536a4f] no-underline">{publicationLink} ↗</a>{/if}
    </p>
  {:else if p?.kind === 'talk'}
    {#if p.contributionType || p.selectionMode}
      <p class="mt-0 mb-1 text-[0.78rem] leading-relaxed">
        {#if p.contributionType}<span class="cv-talk-type text-[0.68rem] font-semibold tracking-[0.045em] text-[#41583d] uppercase">{p.contributionType}</span>{/if}{#if p.selectionMode}{p.contributionType ? ' ' : ''}<span class="text-[#536a4f]">({p.selectionMode})</span>{/if}
      </p>
    {/if}
    <h3 class="cv-entry-title m-0 font-title text-[1.1rem] leading-snug font-medium">{entry.title}</h3>
    {#if talkAuthors}<p class="cv-talk-authors mt-1 mb-0 text-[0.78rem] leading-relaxed"><CvAuthors text={talkAuthors} {personName} /></p>{/if}
    {#if p.event || eventVenue}<p class="cv-talk-context mt-1 mb-0 text-[0.78rem] leading-relaxed text-[#50534d]">{#if p.event && p.event !== entry.title}<cite class="italic">{p.event}</cite>{eventVenue ? ' (' : ''}{eventVenue}{eventVenue ? ')' : ''}{:else}{eventVenue}{/if}</p>{/if}
    {#if p.sessionTitle || p.sessionFormat}<p class="cv-session mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{compact(p.sessionTitle, p.sessionFormat)}</p>{/if}
  {:else if p?.kind === 'project'}
    {#if entry.date}<p class="cv-project-period mt-0 mb-1 font-mono text-[0.72rem] leading-snug font-medium text-[#41583d]" aria-label={en ? `Project period: ${entry.date}` : `Periodo del proyecto: ${entry.date}`}>{entry.date}</p>{/if}
    <h3 class="cv-entry-title m-0 font-title text-[1.1rem] leading-snug font-medium">{#if entry.url}<a href={entry.url} class="text-inherit no-underline hover:underline underline-offset-2">{entry.title}</a>{:else}{entry.title}{/if}</h3>
    {#if p.role}<div class="cv-project-role mt-1 leading-tight"><span class="cv-project-role-label inline-block font-mono text-[0.65rem] leading-snug text-[#41583d]">{p.role}</span></div>{/if}
    {#if p.institution || p.principalInvestigators}<p class="cv-project-context mt-1 mb-0 text-[0.78rem] leading-relaxed">{p.institution}{#if p.principalInvestigators}{p.institution ? '. ' : ''}<span class="text-[#50534d]">{en ? 'PI: ' : 'IP: '}{p.principalInvestigators}</span>{/if}</p>{/if}
    {#if p.programme || p.code}<p class="cv-project-programme mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{p.programme}{p.programme && p.code ? ' · ' : ''}<span class="cv-project-code font-mono text-[0.65rem]">{p.code}</span></p>{/if}
    {#if p.description}<p class="cv-description mt-1 mb-0 text-[0.78rem] leading-relaxed text-[#50534d]">{p.description}</p>{/if}
  {:else if p?.kind === 'skill'}
    <h3 class="cv-entry-title m-0 font-title text-[1rem] font-medium">{entry.title}</h3>
    {#if p.resources.length}<p class="mt-1 mb-0 text-[0.7rem] text-[#536a4f]">{p.resources.map(r=>r.label).join(', ')}</p>{/if}
    {#if p.evidence.length}<p class="mt-1 mb-0 text-[0.7rem]">{#each p.evidence as example,i}{i ? '; ' : ''}{#if example.url}<a href={example.url} class="text-[#536a4f] no-underline">{example.label} ↗</a>{:else}{example.label}{/if}{/each}</p>{/if}
  {:else if p?.kind === 'technical'}
    <CvTechnicalWork {entry} presentation={p} {language} />
  {:else if p?.kind === 'funding'}
    <CvFundingAward {entry} presentation={p} {language} />
  {:else if p?.kind === 'responsibility'}
    <h3 class="cv-brief-title m-0 font-title text-base leading-snug font-medium">{p.organization}</h3>
    <div class="cv-brief-row mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
      <span class="cv-brief-detail text-[0.75rem] leading-relaxed text-[#50534d]">{p.role}</span>
      {#if entry.date}<span class="cv-brief-period font-mono text-[0.65rem] text-[#536a4f]">{entry.date}</span>{/if}
    </div>
  {:else if p?.kind === 'eventOrganization'}
    <h3 class="cv-brief-title m-0 font-title text-base leading-snug font-medium">{entry.title}</h3>
    {#if p.role}<p class="cv-brief-detail mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{p.role}</p>{/if}
    {#if p.venue || p.dates}<p class="cv-brief-detail mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#62665d]">{p.venue}{p.venue && p.dates ? ' (' : ''}{p.dates}{p.venue && p.dates ? ')' : ''}</p>{/if}
  {:else if ['teaching','memberships','service_activities'].includes(entry.entityType)}
    <div class="cv-brief-row grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
      <h3 class="cv-brief-title m-0 font-title text-base leading-snug font-medium">{entry.title}</h3>
      {#if entry.date}<span class="cv-brief-period font-mono text-[0.65rem] text-[#536a4f]">{entry.date}</span>{/if}
    </div>
    {#if entry.detail}<p class="cv-brief-detail mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{entry.detail}</p>{/if}
  {:else}
    <h3 class="cv-entry-title m-0 font-title text-[1.1rem] leading-snug font-medium">{entry.title}</h3>
    {#if entry.date}<span class="cv-date mt-1 inline-block font-mono text-[0.65rem] text-[#536a4f]">{entry.date}</span>{/if}
    {#if entry.detail}<p class="cv-detail mt-2 mb-0 text-[0.8rem] leading-relaxed text-[#50534d]">{entry.detail}</p>{/if}
  {/if}
  {#if entry.url && p?.kind !== 'publication' && p?.kind !== 'project' && p?.kind !== 'technical' && p?.kind !== 'funding'}<a href={entry.url} class="cv-link mt-1 inline-block max-w-full text-[0.7rem] break-words text-[#536a4f] no-underline">{linkLabel(entry.url)}</a>{/if}
  {#if entry.contribution && p?.kind !== 'technical' && p?.kind !== 'funding'}<div class="cv-contribution mt-1 text-[0.78rem]"><CvProse body={entry.contribution} /></div>{/if}
  {#if p?.kind !== 'funding'}<CvProse body={entry.commentary} />{/if}
</div>
