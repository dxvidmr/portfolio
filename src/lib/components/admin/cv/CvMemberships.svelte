<script lang="ts">
  import type { CvSnapshot } from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  let { entries }: { entries: CvSnapshot['blocks'][number]['entries'] } = $props();
</script>
<div class="cv-entry cv-entry-brief my-4" data-entry-type="memberships">
  <h3 class="cv-brief-title m-0 font-title text-base leading-snug font-medium">{entries[0].title}</h3>
  <ul class="m-0 mt-2 list-none p-0">
    {#each entries as entry (entry.key)}
      <li class="cv-membership-mandate mt-1">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <span class="cv-brief-detail text-[0.75rem] leading-relaxed text-[#50534d]">{entry.detail}</span>
        <span class="cv-brief-period font-mono text-[0.65rem] text-[#536a4f]">{entry.date}</span>
        </div>
      {#if entry.contribution}<CvProse body={entry.contribution} />{/if}
      <CvProse body={entry.commentary} />
      {#if entry.url}<a href={entry.url} class="cv-link mt-1 inline-block max-w-full text-[0.7rem] break-words text-[#536a4f]">{entry.url.replace(/^https?:\/\//,'').replace(/\/$/,'')} ↗</a>{/if}
      </li>
    {/each}
  </ul>
</div>
