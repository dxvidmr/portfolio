<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { plainInlineTitle } from '$lib/content/inline-markup';
  import CvSkillSelector from './CvSkillSelector.svelte';
  import SortableList from '$lib/components/admin/SortableList.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { cvEntityLabels, type CvBlock, type CvEntry } from '$lib/types/cv';
  let { block = $bindable(), catalog }: { block: CvBlock; catalog: CvEntry[] } = $props();
  let search = $state('');
  let type = $state('');
  const skillsOnly = $derived(block.entryScope === 'skills');
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const lookup = $derived(new Map(catalog.map(e => [e.key, e])));
  const normalEntries=$derived(block.entries.filter(e=>e.entityType!=='skills'));
  const reorderNormal=(next:typeof normalEntries)=>{let i=0;block.entries=block.entries.map(e=>e.entityType==='skills'?e:next[i++]);};
  const available = $derived(catalog.filter(e => e.entityType!=='skills' && (!type || e.entityType === type)
    && normalize(`${plainInlineTitle(e.title)} ${e.detail}`).includes(normalize(search))
    && !block.entries.some(s => s.entityType === e.entityType && s.entityId === e.entityId)));
  const add = (entry: CvEntry) => {
    block.entries = [...block.entries, { key: crypto.randomUUID(), entityType: entry.entityType, entityId: entry.entityId, commentary: '', contributionMode: 'inherit', contributionText: '' }];
  };
  const sort = () => {
    reorderNormal([...normalEntries].sort((a, b) => (lookup.get(`${b.entityType}:${b.entityId}`)?.sortDate || '').localeCompare(lookup.get(`${a.entityType}:${a.entityId}`)?.sortDate || '')));
  };
</script>
<div class="grid gap-4">
  <label class="grid gap-2 text-xs">Título {block.kind === 'text' ? '(opcional)' : 'del apartado'}<input bind:value={block.title} maxlength="300" class="w-full rounded-sm border border-rule bg-canvas p-3 font-title text-lg" /></label>
  {#snippet narrativeField()}<label class="grid gap-2 text-xs">{block.kind === 'text' ? 'Texto narrativo' : 'Introducción al apartado (opcional)'}<textarea bind:value={block.body} rows={block.kind === 'text' ? 8 : 4} maxlength="30000" class="w-full rounded-sm border border-rule bg-canvas p-3 leading-relaxed" placeholder="Escribe en Markdown. Separa los párrafos con una línea en blanco."></textarea><span class="text-ink-dim">Markdown: *cursiva*, **negrita**, [texto del enlace](https://…). Listas con - o 1. El formato se conserva en la vista previa y el PDF.</span></label>{/snippet}
  {#if block.kind === 'text'}{@render narrativeField()}{:else}<details open={Boolean(block.body)} class="rounded-sm border border-rule p-3"><summary class="cursor-pointer text-xs text-ink-dim">Introducción al apartado (opcional)</summary><div class="mt-3">{@render narrativeField()}</div></details>{/if}
  {#if block.kind === 'entries'}
    <div class="flex flex-wrap items-center justify-between gap-3"><h3 class="m-0 text-sm">{block.entries.length} {skillsOnly ? 'competencias seleccionadas' : 'méritos seleccionados'}</h3>{#if normalEntries.length}<Button type="button" size="sm" variant="ghost" onclick={sort}>Ordenar por fecha ↓</Button>{/if}</div>
    {#if skillsOnly || block.entries.some(e=>e.entityType==='skills')}
      <div class="rounded-sm border border-rule bg-[var(--admin-surface)] p-4"><CvSkillSelector bind:block {catalog} /></div>
    {/if}
    {#if normalEntries.length}
    <SortableList items={normalEntries} onreorder={reorderNormal} getKey={e => e.key} getLabel={e => lookup.get(`${e.entityType}:${e.entityId}`)?.title || 'Mérito eliminado'}>
      {#snippet children(selection)}
        {@const entry = lookup.get(`${selection.entityType}:${selection.entityId}`)}
        <details>
          <summary class="cursor-pointer">
            <span class="block font-title text-lg">{#if entry}<InlineTitle text={entry.title} />{:else}Mérito eliminado{/if}</span>
            {#if entry}<span class="mt-1 block text-[0.65rem] text-ink-dim">{cvEntityLabels[entry.entityType]} · {entry.date} {entry.isPublic ? '' : '· Privado en la web'}</span>{/if}
            <span class="mt-2 block text-[0.65rem] text-accent-strong">Detalles y adaptación para este CV</span>
          </summary>
        {#if entry}
          <p class="text-[0.65rem] leading-relaxed text-ink-dim">{entry.detail}</p>
          <a href={`/admin/meritos/${selection.entityType}/${selection.entityId}`} target="_blank" rel="noopener" class="text-[0.65rem] text-accent-strong">Editar registro original ↗</a>
        {:else}<p class="text-warning" role="alert">Este registro ya no existe: {selection.entityType}:{selection.entityId}. Retíralo para exportar.</p>{/if}
        {#if entry && (entry.entityType === 'projects' || entry.entityType === 'technical_works')}
          <label class="mt-3 grid gap-2 text-[0.65rem]">Mi aportación en este CV
            <select bind:value={selection.contributionMode} class="w-full rounded-sm border border-rule bg-canvas p-2">
              <option value="inherit">Usar el texto original</option><option value="custom">Adaptar para este CV</option><option value="hidden">Ocultar aportación</option>
            </select>
          </label>
          {#if selection.contributionMode === 'custom'}
            <Button type="button" size="sm" variant="ghost" onclick={() => selection.contributionText = entry.contribution ?? ''}>Copiar el texto original para adaptarlo</Button>
            <label class="mt-2 grid gap-2 text-[0.65rem]">Aportación adaptada<textarea bind:value={selection.contributionText} rows="3" maxlength="10000" class="w-full rounded-sm border border-rule bg-canvas p-2"></textarea></label>
            <p class="text-[0.65rem] text-ink-faint">Solo afecta a este CV. Si después cambias el original, esta versión no se actualiza.</p>
          {:else if selection.contributionMode !== 'hidden'}
            <p class="mt-2 whitespace-pre-line text-[0.7rem] text-ink-dim">{entry.contribution || 'El mérito original no tiene texto de aportación.'}</p>
          {/if}
        {/if}
        <label class="mt-3 grid gap-2 text-[0.65rem]">Comentario adicional para este CV<textarea bind:value={selection.commentary} rows="2" maxlength="10000" class="w-full rounded-sm border border-rule bg-canvas p-2"></textarea></label>
        </details>
      {/snippet}
      {#snippet actions(selection)}<Button type="button" size="sm" variant="ghost" onclick={() => block.entries = block.entries.filter(e => e.key !== selection.key)}>Quitar</Button>{/snippet}
    </SortableList>
    {/if}
    {#if !skillsOnly}
    <details class="rounded-sm border border-rule p-4">
      <summary class="cursor-pointer text-sm text-accent-strong">+ Añadir méritos</summary>
      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <label class="grid gap-2 text-xs">Buscar<input bind:value={search} placeholder="Título, autor, institución…" class="w-full rounded-sm border border-rule bg-canvas p-3" /></label>
        <label class="grid gap-2 text-xs">Tipo<select bind:value={type} class="w-full rounded-sm border border-rule bg-canvas p-3"><option value="">Todos los tipos</option>{#each Object.entries(cvEntityLabels).filter(([key])=>key!=='skills') as [key, label]}<option value={key}>{label}</option>{/each}</select></label>
      </div>
      <p class="text-xs text-ink-faint">{available.length} disponibles. Puedes combinar tipos en un mismo apartado.</p>
      <ul class="m-0 max-h-80 list-none overflow-y-auto p-0">
        {#each available as entry (entry.key)}<li class="flex items-center justify-between gap-3 border-t border-rule py-3"><div><p class="m-0 font-title text-base"><InlineTitle text={entry.title} /></p><p class="mt-1 text-[0.65rem] text-ink-dim">{cvEntityLabels[entry.entityType]} · {entry.date}</p></div><Button type="button" size="sm" onclick={() => add(entry)}>Añadir</Button></li>{:else}<li class="py-4 text-xs text-ink-faint">No hay más resultados.</li>{/each}
      </ul>
    </details>
    {/if}
  {/if}
</div>
