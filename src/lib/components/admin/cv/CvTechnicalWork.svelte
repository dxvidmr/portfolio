<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
  import { CV_SEPARATOR } from '$lib/content/cv-format';
  import type { CvEntry, CvPresentation } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  let { entry, presentation: p, language }: {
    entry: CvEntry;
    presentation: Extract<CvPresentation, { kind: 'technical' }>;
    language: 'es' | 'en';
  } = $props();
  const en = $derived(language === 'en');
  const period = $derived(entry.date);
  const recipient = $derived(p.projects?.length || p.contextName ? '' : p.recipient);
  const contextName = $derived(p.contextName !== entry.title ? p.contextName : '');
  const contextDetails = $derived([...new Set([p.contextProgramme,
    p.contextResponsibles ? (p.contextProgramme ? p.contextResponsibles : `${en ? 'Project leads' : 'Responsables'}: ${p.contextResponsibles}`) : '',p.contextCode,p.contextFundingBody,
    p.contextInstitution && !p.contextFundingBody.includes(p.contextInstitution) ? p.contextInstitution : ''].filter(Boolean))].join(CV_SEPARATOR));
  const linkLabel = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
</script>
<div class="cv-technical-card bg-[#f3f3ef] px-4 py-3">
  {#if period}<p class="cv-date mt-0 mb-1 font-mono text-[0.72rem] leading-snug font-medium text-[#41583d]">{period}</p>{/if}
  <h3 class="cv-technical-title m-0 font-title text-[1.1rem] leading-snug font-medium"><InlineTitle text={entry.title} /></h3>
  {#if recipient}
    <p class="cv-technical-context mt-1 mb-0 text-[0.75rem] leading-relaxed text-[#50534d]">{recipient}</p>
  {/if}
  {#if p.projects?.length}
    <div class="cv-technical-background mt-1 text-[0.7rem] leading-relaxed text-[#50534d]">
      {#each p.projects as project}
        <p class="m-0 mt-1"><span class="italic"><InlineTitle text={project.title} /></span>{project.code ? ` (${project.code})` : ''}</p>
      {/each}
    </div>
  {:else if contextName || contextDetails}
    <div class="cv-technical-background mt-1 text-[0.7rem] leading-relaxed text-[#50534d]">
      {#if contextName}<p class="m-0 italic">{contextName}</p>{/if}
      {#if contextDetails}<p class="m-0 mt-1">{contextDetails}</p>{/if}
    </div>
  {/if}
  {#if entry.contribution}<div class="cv-contribution cv-technical-contribution mt-2 text-[0.78rem]"><CvProse body={entry.contribution} /></div>{/if}
  {#if entry.url}
    <a href={entry.url} aria-label={(en ? 'View resource: ' : 'Ver recurso: ')+entry.title} class="cv-link cv-technical-link mt-2 inline-block max-w-full text-[0.7rem] break-words text-[#41583d] no-underline"><span class="font-semibold">{en ? 'View resource' : 'Ver recurso'} ↗</span>{' '}<span>{linkLabel(entry.url)}</span></a>
  {/if}
</div>
