<script lang="ts">
  import type { CvSnapshot } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  import CvMerit from './CvMerit.svelte';
  import CvEducationTimeline from './CvEducationTimeline.svelte';
  import CvSkills from './CvSkills.svelte';
  import CvMemberships from './CvMemberships.svelte';
  import '@fontsource/public-sans/400.css';
  import '@fontsource/public-sans/400-italic.css';
  import '@fontsource/public-sans/500.css';
  import '@fontsource/public-sans/600.css';
  import '@fontsource/public-sans/700.css';
  import '$lib/styles/cv-fonts.css';
  import '$lib/styles/cv-print.css';
  let { snapshot }: { snapshot: CvSnapshot } = $props();
  const affiliationAndWeb = $derived(snapshot.affiliation !== undefined
    ? [snapshot.affiliation, snapshot.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')].filter(Boolean).join(' · ')
    : snapshot.contact || '');
  const entryGroups = (entries: CvSnapshot['blocks'][number]['entries']) => {
    const groups: { education: boolean; skills: boolean; memberships: boolean; entries: typeof entries }[] = [];
    for (const entry of entries) {
      const education = entry.entityType === 'education';
      const skills = entry.entityType === 'skills';
      const memberships = entry.entityType === 'memberships';
      const organization = memberships ? groups.find(g=>g.memberships && g.entries[0].title===entry.title) : undefined;
      if (organization) { organization.entries.push(entry); continue; }
      const previous = groups.at(-1);
      if ((education && previous?.education) || (skills && previous?.skills)) previous.entries.push(entry);
      else groups.push({ education, skills, memberships, entries: [entry] });
    }
    return groups;
  };
</script>
<article class="cv-document mx-auto max-w-[210mm] bg-white px-[clamp(1.5rem,5vw,4rem)] py-12 text-[#171916] shadow-sm" lang={snapshot.language}>
  <header class="mb-9 border-b-2 border-[#536a4f] pb-6">
    <p class="cv-kicker mb-4 text-[0.62rem] tracking-[0.14em] text-[#536a4f] uppercase">{snapshot.title}</p>
    <h1 class="m-0 font-title text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-normal">{snapshot.personName}</h1>
    {#if snapshot.position}<p class="cv-position mt-4 mb-0 text-[0.9rem] leading-relaxed font-medium text-[#41583d]">{snapshot.position}</p>{/if}
    {#if affiliationAndWeb}<p class="cv-contact mt-2 mb-0 text-[0.8rem] leading-relaxed text-[#50534d]">{affiliationAndWeb}</p>{/if}
    {#if snapshot.email}<p class="cv-email mt-1 mb-0 text-[0.8rem]"><a href={`mailto:${snapshot.email}`} class="text-[#536a4f] no-underline">{snapshot.email}</a></p>{/if}
  </header>
  {#each snapshot.blocks as block, index (block.key)}
    {@const selected = /\s+(seleccionad[oa]s?|selected)$/i.test(block.title)}
    {@const sectionTitle = selected ? block.title.replace(/\s+(seleccionad[oa]s?|selected)$/i, '') : block.title}
    {#if block.title || block.body || block.entries.length}
      <section class="cv-section mt-8" class:cv-section-brief={block.entries.length > 0 && block.entries.length <= 4 && block.entries.every(e=>['teaching','memberships','service_activities'].includes(e.entityType))}>
        <div class="cv-section-header">
        {#if selected}<p class="cv-selection-label mt-0 mb-1 font-mono text-[0.55rem] tracking-[0.08em] text-[#657060] uppercase">{snapshot.language==='en' ? 'Selection' : 'Selección'}</p>{/if}
        {#if block.title}<h2 class="cv-heading mb-5 flex items-baseline gap-3 border-b border-[#c3c6c2] pb-2 font-title text-[1.45rem] font-normal"><span class="cv-index font-mono text-[0.62rem] text-[#536a4f]">{String(index + 1).padStart(2, '0')}</span>{sectionTitle}</h2>{/if}
        </div>
        <CvProse body={block.body} />
        {#each entryGroups(block.entries) as group (group.entries[0].key)}
          {#if group.education}
            <CvEducationTimeline entries={group.entries} language={snapshot.language} />
          {:else if group.skills}
            <CvSkills entries={group.entries} language={snapshot.language} display={block.skillsDisplay ?? 'names'} />
          {:else if group.memberships}
            <CvMemberships entries={group.entries} />
          {:else}
            <CvMerit entry={group.entries[0]} language={snapshot.language} personName={snapshot.personName} />
          {/if}
        {/each}
      </section>
    {/if}
  {/each}
</article>
<style>
  .cv-document { font-family: 'Public Sans', Arial, sans-serif; }
  .cv-kicker { font-family: var(--font-code); }
  @media print {
    :global(html), :global(body), :global(.admin-shell) { background: white !important; color: #171916 !important; }
    :global(.admin-shell > header), :global(.cv-toolbar), :global(.cv-warning) { display: none !important; }
    :global(.admin-main) { width: 100% !important; max-width: none !important; padding: 0 !important; margin: 0 !important; }
    :global(body) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
