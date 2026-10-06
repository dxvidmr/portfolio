<script lang="ts">
  import type { Snippet } from 'svelte';
  let { body, lead }: { body: string; lead?: Snippet } = $props();
  const paragraphs = (text: string) => text.trim().split(/\n\s*\n/).filter(Boolean);
  const isList = (text: string) => text.split('\n').every(line => line.trim().startsWith('- '));
</script>
{#if body.trim() || lead}
  <div class="cv-prose text-[0.95rem] leading-relaxed">
    {#if lead && (!body.trim() || isList(paragraphs(body)[0]))}<p class="my-3">{@render lead()}</p>{/if}
    {#each paragraphs(body) as paragraph,index}
      {#if isList(paragraph)}
        <ul class="my-3 list-disc pl-5">{#each paragraph.split('\n') as line}<li>{line.trim().slice(2)}</li>{/each}</ul>
      {:else}<p class="my-3 whitespace-pre-line">{#if index===0 && lead}{@render lead()}{' '}{/if}{paragraph}</p>{/if}
    {/each}
  </div>
{/if}
