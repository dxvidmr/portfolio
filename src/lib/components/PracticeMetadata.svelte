<script lang="ts">
	import { CV_SEPARATOR } from '$lib/content/cv-format';
	import { contextLine } from '$lib/content/context-line';
  import type { EntryMetadata } from '$lib/types/entry-metadata';
  // title: nombre del mérito, para no repetir en el contexto lo que ya dice.
  let { metadata, locale, title = '' }: { metadata: Extract<EntryMetadata, {kind: 'project' | 'professional'}>; locale: 'es' | 'en'; title?: string } = $props();
  const join = (...parts: (string | null)[]) => [...new Set(parts.filter(Boolean))].join(CV_SEPARATOR);
  const en = $derived(locale === 'en');
  const contribution = $derived(en ? metadata.contribution_en || metadata.contribution_es : metadata.contribution_es);
  // Trabajos técnicos: modalidad y un dato de contexto (grupo destinatario, financiación,
  // responsable o institución, por ese orden).
  const professionalLine = (value: Extract<EntryMetadata, { kind: 'professional' }>) => {
    const projects = value.projects ?? [];
    return contextLine(title, en ? value.modality_en : value.modality_es, [
      value.recipient,
      value.context_funding,
      en ? value.context_programme_en : value.context_programme_es,
      ...projects.map((project) => (en ? project.programme_en : project.programme_es)),
      value.context_responsibles,
      ...projects.map((project) => project.responsibles),
      value.context_institution,
      ...projects.map((project) => project.institution)
    ], CV_SEPARATOR);
  };
</script>
{#if metadata.kind === 'project'}
  <span class="block">{join(en ? metadata.role_en : metadata.role_es, metadata.institution, en ? metadata.nature_en : metadata.nature_es)}</span>
  <span class="block">{join(metadata.code, metadata.investigators ? `${en ? 'PI' : 'IP'}: ${metadata.investigators}` : null)}</span>
  {#if contribution}<span class="mt-1 block whitespace-pre-line">{contribution}</span>{/if}
{:else if professionalLine(metadata)}
  <span>{professionalLine(metadata)}</span>
{/if}
