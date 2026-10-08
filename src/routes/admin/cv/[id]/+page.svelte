<script lang="ts">
  import { enhance } from '$app/forms';
  import { beforeNavigate, goto, invalidateAll } from '$app/navigation';
  import { untrack, tick } from 'svelte';
  import type { SubmitFunction } from '@sveltejs/kit';
  import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
  import SortableList from '$lib/components/admin/SortableList.svelte';
  import CvBlockEditor from '$lib/components/admin/cv/CvBlockEditor.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
  import type { CvProfile, CvBlock } from '$lib/types/cv';
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
  const copy = (v: CvProfile) => JSON.parse(JSON.stringify(v)) as CvProfile;
  let cv = $state(untrack(() => copy(data.cv)));
  let baseline = $state(untrack(() => JSON.stringify(data.cv)));
  let saving = $state(false);
  let expanded = $state<Record<string, boolean>>({});
  const isExpanded = (block: CvBlock) => expanded[block.key] ?? block.kind === 'text';
  const blockLabel = (block: CvBlock) => block.kind === 'text' ? 'Texto narrativo' : block.entryScope === 'skills' ? 'Competencias' : 'Méritos';
  const toggle = (block: CvBlock) => expanded = { ...expanded, [block.key]: !isExpanded(block) };
  const openBlock = async (block: CvBlock) => {
    expanded = { ...expanded, [block.key]: true };
    await tick();
    document.getElementById(`cv-block-${block.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const dirty = $derived(JSON.stringify(cv) !== baseline);
  $effect(() => { cv = copy(data.cv); baseline = JSON.stringify(data.cv); });
  beforeNavigate(({ cancel }) => { if (dirty && !saving && !window.confirm('Hay cambios sin guardar. ¿Salir y descartarlos?')) cancel(); });
  const addBlock = async (kind: 'text' | 'entries', entryScope: 'merits'|'skills' = 'merits') => {
    const block: CvBlock = { key: crypto.randomUUID(), kind, entryScope, title: kind === 'text' ? '' : entryScope === 'skills' ? 'Competencias' : 'Nuevo apartado', body: '', entries: [], skillsDisplay: 'names' };
    cv.blocks = [...cv.blocks, block];
    await openBlock(block);
  };
  const submit: SubmitFunction = ({ submitter }) => {
    saving = true;
    const preview = submitter?.getAttribute('value') === 'preview';
    return async ({ result, update }) => {
      await update({ reset: false });
      if (result.type === 'success') {
        cv = copy(data.cv); baseline = JSON.stringify(data.cv);
        if (preview) await goto(`/admin/cv/${cv.id}/preview`);
      }
      saving = false;
    };
  };
  const refresh = async () => { if (!dirty || window.confirm('Recargar descartará los cambios sin guardar. ¿Continuar?')) await invalidateAll(); };
  const unload = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
</script>
<svelte:window onbeforeunload={unload} />
<svelte:head><title>{data.cv.name} · Mis CV</title></svelte:head>
<AdminPageHeader title="Editar CV" eyebrow={data.cv.name} description="Organiza bloques de texto y apartados de méritos. Los datos originales se actualizan al cargar el CV y al generar una versión para PDF.">
  {#snippet actions()}<ButtonLink href="/admin/cv">Mis CV</ButtonLink><Button type="button" variant="ghost" onclick={refresh}>Recargar datos</Button>{/snippet}
</AdminPageHeader>
{#if form?.message}<p role="status" class={form.success ? 'text-accent-strong' : 'text-warning'}>{form.message}</p>{/if}
<form method="POST" action="?/save" use:enhance={submit} class="grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
  <nav aria-label="Apartados del CV" class="rounded-sm border border-rule bg-[var(--admin-surface)] p-4 lg:sticky lg:top-32">
    <p class="meta mb-3 text-ink-dim">En este CV</p>
    <a href="#cv-header" class="mb-3 block text-xs text-accent-strong">Datos y cabecera</a>
    <ol class="m-0 grid max-h-[55vh] list-none gap-1 overflow-x-hidden overflow-y-auto p-0">
      {#each cv.blocks as block,index (block.key)}<li><button type="button" disabled={saving} onclick={() => openBlock(block)} class="flex w-full cursor-pointer items-start gap-2 rounded-sm border-0 bg-transparent p-2 text-left text-xs text-ink-dim hover:bg-[var(--admin-surface-raised)] hover:text-accent-strong"><span class="shrink-0 text-ink-faint">{String(index+1).padStart(2,'0')}</span><span class="min-w-0 whitespace-normal [overflow-wrap:anywhere]">{block.title || 'Texto narrativo'}</span></button></li>{/each}
    </ol>
    <div class="mt-4 flex flex-wrap gap-3 border-t border-rule pt-3"><button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-xs text-accent-strong" onclick={() => expanded = Object.fromEntries(cv.blocks.map(b => [b.key,true]))}>Abrir todos</button><button type="button" class="cursor-pointer border-0 bg-transparent p-0 text-xs text-ink-dim" onclick={() => expanded = Object.fromEntries(cv.blocks.map(b => [b.key,false]))}>Plegar todos</button></div>
  </nav>
  <input type="hidden" name="cv" value={JSON.stringify(cv)} />
  <fieldset disabled={saving} class="m-0 grid min-w-0 gap-6 border-0 p-0 [&_textarea]:max-w-full [&_textarea]:min-w-0 [&_textarea]:resize-y [&_input]:min-w-0">
    <section id="cv-header" class="scroll-mt-36 rounded-sm border border-rule p-5"><h2 class="mb-4 font-title text-xl">Datos y cabecera</h2><div class="grid gap-4 sm:grid-cols-2">
      <label class="grid gap-2 text-xs">Nombre interno<input bind:value={cv.name} required maxlength="200" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Título del documento<input bind:value={cv.title} required maxlength="300" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Nombre<input bind:value={cv.personName} required maxlength="200" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Posición<input bind:value={cv.position} maxlength="500" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Correo electrónico<input type="email" bind:value={cv.email} maxlength="254" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Afiliación<input bind:value={cv.affiliation} maxlength="1000" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Web<input bind:value={cv.website} inputmode="url" maxlength="1000" placeholder="https://davidmerinorecalde.com" class="rounded-sm border border-rule bg-canvas p-3" /></label>
      <label class="grid gap-2 text-xs">Idioma de las etiquetas<select bind:value={cv.language} class="rounded-sm border border-rule bg-canvas p-3"><option value="es">Español</option><option value="en">English</option></select><span class="text-ink-faint">Los títulos y textos propios conservan lo que escribas; no se traducen automáticamente.</span></label>
    </div></section>
    <div class="grid gap-3"><h2 class="m-0 font-title text-xl">Contenido del CV</h2><div class="flex flex-wrap items-center gap-3"><Button type="button" onclick={() => addBlock('text')}>+ Texto narrativo</Button><Button type="button" onclick={() => addBlock('entries')}>+ Apartado de méritos</Button><Button type="button" onclick={() => addBlock('entries','skills')}>+ Apartado de competencias</Button></div><p class="m-0 text-xs text-ink-faint">Abre un apartado para editarlo. Arrastra su número o usa las flechas para ordenar.</p></div>
    <SortableList bind:items={cv.blocks} layout="blocks" getId={b => `cv-block-${b.key}`} {isExpanded} getKey={b => b.key} getLabel={b => b.title || 'Texto narrativo'}>
      {#snippet heading(block)}<button type="button" class="w-full cursor-pointer border-0 bg-transparent p-0 text-left text-ink" aria-expanded={isExpanded(block)} aria-controls={`cv-content-${block.key}`} onclick={() => toggle(block)}><span class="mb-1 block text-[0.65rem] text-accent-strong">{blockLabel(block)}{block.kind === 'entries' ? ` · ${block.entries.length} seleccionados` : ''}</span><span class="block font-title text-lg">{block.title || 'Texto narrativo'} <span class="font-mono text-xs text-ink-faint">{isExpanded(block) ? '▾' : '▸'}</span></span></button>{/snippet}
      {#snippet children(block, index)}<div id={`cv-content-${block.key}`}><CvBlockEditor bind:block={cv.blocks[index]} catalog={data.catalog} /></div>{/snippet}
      {#snippet actions(block)}<Button type="button" size="sm" variant="ghost" onclick={() => { if (window.confirm('¿Quitar este bloque del CV?')) cv.blocks = cv.blocks.filter(b => b.key !== block.key); }}>Quitar bloque</Button>{/snippet}
    </SortableList>
    {#if cv.blocks.length === 0}<p class="text-xs text-ink-faint">Añade tu primer bloque de texto o de méritos.</p>{/if}
    <div class="sticky bottom-0 z-20 flex flex-wrap items-center gap-4 border-t border-rule bg-canvas py-4">
      <Button type="submit" variant="primary">{saving ? 'Guardando…' : 'Guardar'}</Button><Button type="submit" name="next" value="preview">Guardar y vista previa</Button><span class="text-xs text-ink-faint">{dirty ? 'Cambios sin guardar' : 'Guardado'} · Versión {data.cv.version}</span>
    </div>
  </fieldset>
</form>
<section class="mt-10 border-t border-rule pt-6"><h2 class="font-title text-xl">Historial de versiones para PDF</h2><p class="text-xs text-ink-dim">Cada versión conserva los textos y méritos tal como estaban al exportar. Puedes volver a imprimirla aunque los registros originales cambien.</p>
  {#each data.exports as item (item.id)}<p class="text-xs"><a href={`/admin/cv/${cv.id}/exports/${item.id}`} class="text-accent-strong">Entrega #{item.id} · CV v{item.profile_version} · {item.created_at} UTC ↗</a></p>{:else}<p class="text-xs text-ink-faint">Todavía no hay versiones.</p>{/each}
</section>
<details class="mt-10 border-t border-rule pt-6"><summary class="cursor-pointer text-xs text-warning">Eliminar este CV y su historial</summary><form method="POST" action="?/delete" class="mt-4 flex flex-wrap items-end gap-3"><input type="hidden" name="version" value={data.cv.version} /><label class="grid gap-2 text-xs">Escribe ELIMINAR<input name="confirm" required pattern="ELIMINAR" class="rounded-sm border border-rule bg-canvas p-3" /></label><Button type="submit">Eliminar CV</Button></form></details>
