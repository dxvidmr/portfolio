<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { plainInlineTitle } from '$lib/content/inline-markup';
  import type { CvEntry } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  import CvAuthors from './CvAuthors.svelte';
  import CvTechnicalWork from './CvTechnicalWork.svelte';
  import CvFundingAward from './CvFundingAward.svelte';
  import { CV_SEPARATOR, cvJoin } from '$lib/content/cv-format';
  let { entry, language, personName = '' }: { entry: CvEntry & { commentary: string }; language: 'es' | 'en'; personName?: string } = $props();
  const en = $derived(language === 'en');
  const p = $derived(entry.presentation);
  const linkLabel = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const compact = cvJoin;
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
  // Por código de vocabulario; las versiones exportadas antes de guardarlo solo tienen la etiqueta.
  const invited = $derived(p?.kind === 'talk' && (p.invited ?? /^invit/i.test(p.selectionMode)));
  // La ciudad no se repite si ya forma parte del nombre de la institución («Universidad de León»).
  const place = (institution: string, city = '') =>
    [institution, city && !folded(institution).includes(folded(city)) ? city : ''].filter(Boolean).join(', ');
  // Las fechas del evento van junto a su nombre; a la derecha solo el día exacto de la intervención.
  // Las versiones exportadas antes de separar ambas fechas solo tienen entry.date.
  const eventVenue = $derived(p?.kind === 'talk'
    ? [place(p.institution && !folded(p.event).includes(folded(p.institution)) ? p.institution : '', p.city), p.eventDates ?? entry.date].filter(Boolean).join(', ')
    : '');
  const talkDay = $derived(p?.kind === 'talk' && p.talkDate && p.talkDate !== p.eventDates ? p.talkDate : '');
  // En la columna de fecha, los intervalos se parten por el guion en dos líneas.
  const dateLines = (date: string) => date.split(' - ');
  const listEntry = $derived(['teaching', 'memberships', 'service_activities', 'courses'].includes(entry.entityType));
  const locator = $derived(p?.kind === 'publication'
    ? [p.volume ? `${p.volume}${p.issue ? ` (${p.issue})` : ''}` : p.issue, p.pages ? `pp. ${p.pages}` : ''].filter(Boolean).join(', ')
    : '');
  const publicationLink = $derived(/^https?:\/\/(?:dx\.)?doi\.org\//i.test(entry.url) ? 'DOI' : en ? 'Link' : 'Enlace');
</script>
<div class="cv-entry my-5" class:cv-entry-brief={listEntry} data-entry-type={entry.entityType}>
  {#if p?.kind === 'publication'}
    <p class="cv-reference m-0 pl-4 -indent-4 text-[0.85rem] leading-relaxed">
      {#if p.authors}<span class="cv-reference-authors font-semibold"><CvAuthors text={p.authors} {personName} /></span>{' '}{/if}{#if entry.date}<span class="cv-reference-year text-[#536a4f]">({entry.date})</span>{/if}{p.authors || entry.date ? '. ' : ''}<span class="cv-reference-title font-title text-[1rem] font-medium">«<InlineTitle text={entry.title} />»</span>.{' '}
      {#if p.editors}{en ? 'In ' : 'En '}{p.editors} ({editorAbbreviation(p.editors)}),{' '}{/if}{#if p.container}<cite class="italic"><InlineTitle text={p.container} /></cite>{/if}{#if locator}{p.container ? ', ' : ''}{locator}{/if}{#if p.publisher}{p.container || locator ? '. ' : ''}{p.publisher}{/if}{p.container || locator || p.publisher ? '.' : ''}
      {#if entry.url}{' '}<a href={entry.url} aria-label={`${publicationLink}: ${plainInlineTitle(entry.title)}`} class="cv-reference-link ml-1 font-mono text-[0.62rem] whitespace-nowrap text-[#536a4f] no-underline">{publicationLink} ↗</a>{/if}
    </p>
  {:else if p?.kind === 'talk'}
    {#if p.contributionType || invited || talkDay}
      <div class="mb-1 flex items-baseline justify-between gap-3">
        <p class="m-0 flex flex-wrap items-baseline gap-x-2 leading-snug">
          {#if p.contributionType}<span class="cv-talk-type text-[0.62rem] font-semibold tracking-[0.06em] text-[#50534d] uppercase">{p.contributionType}</span>{/if}
          {#if invited}<span class="cv-badge bg-[#e7ece3] px-1.5 text-[0.62rem] font-semibold tracking-[0.06em] text-[#41583d] uppercase">{en ? 'Invited' : 'Por invitación'}</span>{/if}
        </p>
        {#if talkDay}<span class="cv-talk-date shrink-0 font-mono text-[0.7rem] text-[#536a4f]">{talkDay}</span>{/if}
      </div>
    {/if}
    <h3 class="cv-entry-title m-0 font-title text-[1rem] leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
    {#if talkAuthors}<p class="cv-talk-authors mt-1 mb-0 text-[0.78rem] leading-relaxed"><CvAuthors text={talkAuthors} {personName} /></p>{/if}
    {#if p.event || eventVenue}<p class="cv-talk-context mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{#if p.event && p.event !== entry.title}<cite class="italic"><InlineTitle text={p.event} /></cite>{eventVenue ? ' (' : ''}{eventVenue}{eventVenue ? ')' : ''}{:else}{eventVenue}{/if}</p>{/if}
    {#if p.sessionTitle || p.sessionFormat}<p class="cv-session mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{compact(p.sessionTitle, p.sessionFormat)}</p>{/if}
  {:else if p?.kind === 'project'}
    {#if entry.date}<p class="cv-project-period mt-0 mb-1 font-mono text-[0.72rem] leading-snug font-medium text-[#41583d]" aria-label={en ? `Project period: ${entry.date}` : `Periodo del proyecto: ${entry.date}`}>{entry.date}</p>{/if}
    <h3 class="cv-entry-title m-0 font-title text-[1.1rem] leading-snug font-medium">{#if entry.url}<a href={entry.url} class="text-inherit no-underline hover:underline underline-offset-2"><InlineTitle text={entry.title} /></a>{:else}<InlineTitle text={entry.title} />{/if}</h3>
    {#if p.role}<p class="cv-project-role mt-1 mb-0 text-[0.78rem] leading-snug font-medium text-[#41583d]">{p.role}</p>{/if}
    {#if p.institution || p.principalInvestigators}<p class="cv-project-context mt-1 mb-0 text-[0.78rem] leading-relaxed">{p.institution}{#if p.principalInvestigators}{p.institution ? '. ' : ''}<span class="text-[#50534d]">{en ? 'PI: ' : 'IP: '}{p.principalInvestigators}</span>{/if}</p>{/if}
    {#if p.programme || p.code}<p class="cv-project-programme mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{p.programme}{p.programme && p.code ? CV_SEPARATOR : ''}<span class="cv-project-code font-mono text-[0.65rem]">{p.code}</span></p>{/if}
    {#if p.description}<p class="cv-description mt-1 mb-0 text-[0.78rem] leading-relaxed text-[#50534d]">{p.description}</p>{/if}
  {:else if p?.kind === 'skill'}
    <h3 class="cv-entry-title m-0 font-title text-[1rem] font-medium"><InlineTitle text={entry.title} /></h3>
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
    <div class="cv-list-row grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4">
      <div class="pt-0.5 text-[#536a4f]">
        {#if p.dates}<span class="cv-list-date block font-mono text-[0.72rem] leading-snug">{#each dateLines(p.dates) as line, i (i)}<span class="block">{i ? '- ' : ''}{line}</span>{/each}</span>{/if}
        {#if p.role}<span class="cv-list-label mt-1 block text-[0.6rem] leading-snug tracking-[0.04em] uppercase">{p.role}</span>{/if}
      </div>
      <div class="min-w-0">
        <h3 class="cv-list-title m-0 font-title text-base leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
        {#if p.venue || p.city}<p class="cv-list-detail mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{place(p.venue, p.city)}</p>{/if}
      </div>
    </div>
  {:else if listEntry}
    <div class="cv-list-row grid grid-cols-[88px_minmax(0,1fr)] items-start gap-4">
      <span class="cv-list-date pt-0.5 font-mono text-[0.72rem] leading-snug text-[#536a4f]">{#each dateLines(entry.date) as line, i (i)}<span class="block">{i ? '- ' : ''}{line}</span>{/each}</span>
      <div class="min-w-0">
        <h3 class="cv-list-title m-0 font-title text-base leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
        {#if entry.detail}<p class="cv-list-detail mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{entry.detail}</p>{/if}
      </div>
    </div>
  {:else}
    {#if entry.date}<p class="cv-date mt-0 mb-1 font-mono text-[0.72rem] leading-snug font-medium text-[#41583d]">{entry.date}</p>{/if}
    <h3 class="cv-entry-title m-0 font-title text-[1.1rem] leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
    {#if entry.detail}<p class="cv-detail mt-1 mb-0 text-[0.8rem] leading-relaxed text-[#50534d]">{entry.detail}</p>{/if}
  {/if}
  <!-- En las listas, lo que sigue se alinea con la columna de contenido, no con la de la fecha. -->
  <div class:cv-list-extra={listEntry || p?.kind === 'eventOrganization'}>
    {#if entry.url && p?.kind !== 'publication' && p?.kind !== 'project' && p?.kind !== 'technical' && p?.kind !== 'funding'}<a href={entry.url} class="cv-link mt-1 inline-block max-w-full text-[0.7rem] break-words text-[#536a4f] no-underline">{linkLabel(entry.url)} ↗</a>{/if}
    {#if entry.contribution && p?.kind !== 'technical' && p?.kind !== 'funding'}<div class="cv-contribution mt-1 text-[0.78rem]"><CvProse body={entry.contribution} /></div>{/if}
    {#if p?.kind !== 'funding'}<CvProse body={entry.commentary} />{/if}
  </div>
</div>
<style>
  :global(.cv-document) .cv-list-extra { padding-left: calc(var(--cv-date-column, 88px) + 4mm); }
</style>
