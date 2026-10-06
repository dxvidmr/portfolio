<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { replaceState } from '$app/navigation';
  import CvPagedDocument from '$lib/components/admin/cv/CvPagedDocument.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
  let preparing = $state(false);
  let ready = $state(false);
  let autoDownload = $state(false);
  let failure = $state('');
  const download = async () => {
    preparing = true;
    failure = '';
    try {
      const response = await fetch(`/admin/cv/${data.id}/exports/${data.exportId}/pdf`);
      if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) throw new Error('No se pudo generar el PDF. Vuelve a intentarlo.');
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `cv-${data.id}-version-${data.exportId}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    } catch (cause) {
      failure = cause instanceof Error ? cause.message : 'No se pudo generar el PDF.';
    } finally { preparing = false; }
  };
  onMount(() => {
    autoDownload = page.url.searchParams.get('print') === '1';
    if (autoDownload) {
      const url = new URL(page.url);
      url.searchParams.delete('print');
      replaceState(url, page.state);
    }
  });
  $effect(() => { if (ready && autoDownload) { autoDownload = false; void download(); } });
</script>
<svelte:head><title>{data.snapshot.personName} · {data.snapshot.title} · {data.exportId}</title></svelte:head>
<div class="cv-toolbar mb-8 flex flex-wrap items-center justify-between gap-4">
  <div><h1 class="m-0 font-title text-xl">Versión #{data.exportId}</h1><p class="mt-2 text-xs text-ink-dim">Datos conservados del {data.createdAt} UTC · CV v{data.snapshot.profileVersion}</p><p class="text-xs text-ink-dim">Descarga en A4 con texto seleccionable y enlaces activos.</p>{#if failure}<p role="alert" class="text-xs text-red-700">{failure}</p>{/if}</div>
  <div class="flex flex-wrap items-center gap-3"><ButtonLink href={`/admin/cv/${data.id}`}>Volver al editor</ButtonLink><Button type="button" variant="primary" disabled={preparing || !ready} onclick={download}>{preparing ? 'Generando PDF…' : 'Descargar PDF'}</Button></div>
</div>
<CvPagedDocument snapshot={data.snapshot} bind:ready />
