<script lang="ts">
	import { CV_SEPARATOR } from '$lib/content/cv-format';
	import { contextLine } from '$lib/content/context-line';
  import type { EntryMetadata } from '$lib/types/entry-metadata';
  // title: nombre del mérito, para no repetir en el contexto lo que ya dice.
  let { metadata, locale, title = '' }: { metadata: Extract<EntryMetadata, {kind: 'project' | 'professional'}>; locale: 'es' | 'en'; title?: string } = $props();
  const en = $derived(locale === 'en');
  const projectRows = (value: Extract<EntryMetadata, { kind: 'project' }>) =>
    [
      { label: en ? 'Role' : 'Rol', value: en ? value.role_en : value.role_es },
      { label: en ? 'Institution' : 'Entidad', value: value.institution },
      { label: en ? 'Type' : 'Tipo', value: en ? value.nature_en : value.nature_es },
      { label: en ? 'Code' : 'Código', value: value.code },
      { label: en ? 'PI' : 'IP', value: value.investigators }
    ].filter((row): row is { label: string; value: string } => Boolean(row.value));
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
  <!-- Proyectos: un dato por fila con su etiqueta; la descripción queda para el CV exportado. -->
  <span class="mt-1 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-0.5">
    {#each projectRows(metadata) as row (row.label)}
      <span class="label leading-[1.7]">{row.label}</span><span>{row.value}</span>
    {/each}
  </span>
{:else if professionalLine(metadata)}
  <span>{professionalLine(metadata)}</span>
{/if}
