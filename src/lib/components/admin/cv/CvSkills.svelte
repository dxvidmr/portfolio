<script lang="ts">
  import type {CvSnapshot} from '$lib/types/cv';
  import CvProse from './CvProse.svelte';
  let {entries,language,display='names'}:{display?:'names'|'descriptions';entries:CvSnapshot['blocks'][number]['entries'];language:'es'|'en'}=$props();
  const groups=$derived.by(()=>{
    const result:{area:string;entries:typeof entries}[]=[];
    for(const entry of entries){
      const area=entry.presentation?.kind==='skill' ? entry.presentation.area : '';
      const previous=result.find(g=>g.area===area);
      if(previous) previous.entries.push(entry);
      else result.push({area,entries:[entry]});
    }
    return result;
  });
</script>
<div class="cv-skills mt-4">
  {#each groups as group}
    <section class:cv-skill-area-compact={display==='names'} class="cv-skill-area mt-4 bg-[#f3f3ef] px-4 py-3">
      <h3 class="cv-skill-area-title m-0 mb-3 font-title text-[1.1rem] leading-snug font-semibold text-[#41583d]">{group.area}</h3>
      {#if display==='names'}
        <ul class="cv-skill-names m-0 list-none border-t border-[#d2d9ce] pl-0">
          {#each group.entries as entry (entry.key)}
            <li class="cv-skill-name border-b border-[#d2d9ce]/60 py-1.5 font-title text-[0.95rem] leading-snug last:border-b-0 last:pb-0">{entry.title}</li>
          {/each}
        </ul>
      {:else}
      <div class="cv-skill-items">
        {#each group.entries as entry (entry.key)}
          {@const p=entry.presentation}
          <div class="cv-skill-item min-w-0 border-t border-[#d2d9ce] py-2.5">
            <h4 class="cv-skill-title m-0 font-title text-[0.95rem] leading-snug font-medium text-[#171916]">{entry.title}</h4>
            {#if entry.contribution}<div class="cv-skill-description mt-1 text-[0.75rem] leading-relaxed text-[#50534d]"><CvProse body={entry.contribution} /></div>{/if}
            {#if p?.kind==='skill' && p.resources.length}<p class="cv-skill-resources mt-2 mb-0 font-mono text-[0.58rem] leading-relaxed text-[#536a4f]"><span class="font-semibold">{language==='en' ? 'Resources: ' : 'Recursos: '}</span>{p.resources.map(r=>r.label).join(', ')}</p>{/if}
            {#if p?.kind==='skill' && p.evidence.length}<p class="mt-1 mb-0 text-[0.65rem] leading-relaxed">{#each p.evidence as example,i}{i ? '; ' : ''}{#if example.url}<a href={example.url} class="text-[#536a4f] no-underline">{example.label} ↗</a>{:else}{example.label}{/if}{/each}</p>{/if}
            {#if entry.commentary}<div class="mt-1 text-[0.72rem]"><CvProse body={entry.commentary} /></div>{/if}
          </div>
        {/each}
      </div>
      {/if}
    </section>
  {/each}
</div>
