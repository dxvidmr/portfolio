<script lang="ts">
  import CvPagedDocument from '$lib/components/admin/cv/CvPagedDocument.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
  let ready = $state(false);
</script>
<svelte:head><title>{data.snapshot.personName} · {data.snapshot.title}</title></svelte:head>
<div class="cv-toolbar mb-8 flex flex-wrap items-center justify-between gap-4">
  <div><h1 class="m-0 font-title text-xl">Vista previa</h1><p class="mt-2 text-xs text-ink-dim">A4. «Exportar PDF» guarda esta versión en el historial y descarga el archivo.</p></div>
  <div class="flex items-center gap-3"><ButtonLink href={`/admin/cv/${data.id}`}>Volver al editor</ButtonLink><form method="POST" action="?/export"><input type="hidden" name="version" value={data.snapshot.profileVersion} /><Button type="submit" variant="primary" disabled={!ready || data.missing.length > 0}>Exportar PDF</Button></form></div>
</div>
{#if form?.message}<p class="cv-warning text-warning" role="alert">{form.message}</p>{/if}
{#if data.missing.length}<p class="cv-warning text-warning" role="alert">Hay registros que ya no existen: {data.missing.join(', ')}. Retíralos del CV antes de exportar.</p>{/if}
<CvPagedDocument snapshot={data.snapshot} bind:ready />
