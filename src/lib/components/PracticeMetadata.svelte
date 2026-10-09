<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
  import type { EntryMetadata } from '$lib/types/entry-metadata';
  let { metadata, locale }: { metadata: Extract<EntryMetadata, {kind: 'project' | 'professional'}>; locale: 'es' | 'en' } = $props();
  const join = (...parts: (string | null)[]) => [...new Set(parts.filter(Boolean))].join(' · ');
  const en = $derived(locale === 'en');
  const contribution = $derived(en ? metadata.contribution_en || metadata.contribution_es : metadata.contribution_es);
</script>
{#if metadata.kind === 'project'}
  <span class="block">{join(en ? metadata.role_en : metadata.role_es, metadata.institution, en ? metadata.nature_en : metadata.nature_es)}</span>
  <span class="block">{join(en ? metadata.programme_en : metadata.programme_es, metadata.code, metadata.investigators ? `${en ? 'PI' : 'IP'}: ${metadata.investigators}` : null)}</span>
{:else}
  <span class="block">{join(en ? metadata.modality_en : metadata.modality_es, metadata.recipient)}</span>
  {#if metadata.projects?.length}
    {#each metadata.projects as project}
      <span class="block italic"><InlineTitle text={project.title} /></span>
      <span class="block">{join(project.institution,en ? project.programme_en : project.programme_es,project.code,project.responsibles)}</span>
    {/each}
  {:else}
    {#if metadata.context_name}<span class="block italic">{metadata.context_name}</span>{/if}
    <span class="block">{join(metadata.context_institution, en ? metadata.context_programme_en : metadata.context_programme_es, metadata.context_code, metadata.context_funding, metadata.context_responsibles)}</span>
  {/if}
{/if}
{#if contribution}<span class="mt-1 block whitespace-pre-line">{contribution}</span>{/if}
