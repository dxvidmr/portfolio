<script lang="ts">
  import { tick } from 'svelte';
  import CvDocument from './CvDocument.svelte';
  import paginationCss from '$lib/styles/cv-pagination.css?raw';
  import type { CvSnapshot } from '$lib/types/cv';
  import type { Previewer } from 'pagedjs';
  let { snapshot, ready = $bindable(false) }: { snapshot: CvSnapshot; ready?: boolean } = $props();
  let source = $state<HTMLDivElement>();
  let target = $state<HTMLDivElement>();
  let total = $state(0);
  let failure = $state('');
  let attempt = $state(0);

  $effect(() => {
    // A new snapshot must replace the previous layout, including after navigation.
    const input = snapshot;
    const retry = attempt;
    const sourceElement = source;
    const targetElement = target;
    if (!sourceElement || !targetElement) return;
    let cancelled = false;
    let completed = false;
    let previewer: Previewer | undefined;
    const dispose = () => {
      // Chunker.destroy only removes DOM; disconnect page resize observers first.
      previewer?.chunker.pages?.forEach(page => page.removeListeners());
      try { previewer?.chunker.destroy(); } catch { /* Rendering may have failed before setup. */ }
      try { previewer?.polisher.destroy(); } catch { /* Rendering may have failed before setup. */ }
    };
    const render = async () => {
      ready = false; failure = ''; total = 0;
      await tick();
      // The source is hidden: load every face before measuring, including titles
      // and margin counters. FontFaceSet.ready alone permits missing faces.
      const fonts = [
        ...['400', '500', '600', '700', 'italic 400'].map(weight => `${weight} 14px "Public Sans"`),
        ...['400', '500', '600', '700', 'italic 400'].map(weight => `${weight} 14px "CV Fraunces"`),
        ...['400', '500', '600', '700'].map(weight => `${weight} 14px "CV JetBrains Mono"`)
      ];
      await Promise.all(fonts.map(async font => {
        if (!(await document.fonts.load(font)).length) throw new Error(`Fuente del CV no disponible: ${font}`);
      }));
      await document.fonts.ready;
      if (cancelled) return;
      const { Previewer } = await import('pagedjs');
      if (cancelled) return;
      previewer = new Previewer();
      const content = document.createElement('div');
      content.appendChild(sourceElement.firstElementChild!.cloneNode(true));
      // Explicit styles prevent Paged.js from removing the dashboard stylesheets.
      const flow = await previewer.preview(content,
        [{ [window.location.href]: paginationCss }], targetElement);
      if (cancelled) { dispose(); return; }
      completed = true;
      total = flow.total; ready = true;
    };
    void render().catch((cause) => {
      dispose();
      if (!cancelled) { console.error('[cv] Paginación', cause); failure = 'No se pudo paginar el CV. Vuelve a intentarlo.'; }
    });
    return () => {
      cancelled = true;
      if (completed) dispose();
    };
  });
</script>
<div class="cv-toolbar mb-4 text-xs text-ink-dim" aria-live="polite">
  {#if failure}<span role="alert">{failure}</span> <button type="button" onclick={() => attempt++} class="cursor-pointer text-accent-strong underline">Reintentar</button>
  {:else if ready}{total} páginas A4 · 210 × 297 mm
  {:else}Preparando páginas A4…{/if}
</div>
<div class="cv-pagination-source" bind:this={source} aria-hidden="true" inert><CvDocument {snapshot} /></div>
<div class="cv-pages overflow-x-auto" bind:this={target} data-ready={ready} aria-label="CV en páginas A4" aria-busy={!ready}></div>
<style>
  .cv-pagination-source { display: none; }
  .cv-pages :global(.pagedjs_pages) { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 8px; }
  .cv-pages :global(.pagedjs_page) { flex-shrink: 0; background: white; color: #171916; box-shadow: 0 2px 12px #0002; }
  @media print {
    .cv-pages { overflow: visible; }
    .cv-pages :global(.pagedjs_pages) { display: block; padding: 0; }
    .cv-pages :global(.pagedjs_page) { margin: 0; box-shadow: none; break-after: page; }
    .cv-pages :global(.pagedjs_page:last-child) { break-after: auto; }
  }
</style>
