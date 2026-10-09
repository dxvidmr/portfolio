<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { CV_SEPARATOR } from '$lib/content/cv-format';
  import type { EntryMetadata } from '$lib/types/entry-metadata';
  // compact: una línea con modalidad, destinatario y nombre de los proyectos; sin descripción
  // (el CV público la deja para la ficha del portfolio).
  let { metadata, locale, compact = false }: { metadata: Extract<EntryMetadata, {kind: 'project' | 'professional'}>; locale: 'es' | 'en'; compact?: boolean } = $props();
  const join = (...parts: (string | null)[]) => [...new Set(parts.filter(Boolean))].join(CV_SEPARATOR);
  const en = $derived(locale === 'en');
  const contribution = $derived(en ? metadata.contribution_en || metadata.contribution_es : metadata.contribution_es);
</script>
{#if compact && metadata.kind === 'professional'}
  {@const projectTitles = metadata.projects?.length ? metadata.projects.map((project) => project.title) : metadata.context_name ? [metadata.context_name] : []}
  <span>{join(en ? metadata.modality_en : metadata.modality_es, metadata.recipient)}{#each projectTitles as projectTitle, index (index)}{CV_SEPARATOR}<em><InlineTitle text={projectTitle} /></em>{/each}</span>
{:else if metadata.kind === 'project'}
  <span class="block">{join(en ? metadata.role_en : metadata.role_es, metadata.institution, en ? metadata.nature_en : metadata.nature_es)}</span>
  <span class="block">{join(metadata.code, metadata.investigators ? `${en ? 'PI' : 'IP'}: ${metadata.investigators}` : null)}</span>
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
{#if contribution && !compact}<span class="mt-1 block whitespace-pre-line">{contribution}</span>{/if}
