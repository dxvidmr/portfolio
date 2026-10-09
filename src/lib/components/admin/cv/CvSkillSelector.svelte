<script lang="ts">
  import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { plainInlineTitle } from '$lib/content/inline-markup';
  import Button from '$lib/components/ui/Button.svelte';
  import type {CvBlock,CvEntry} from '$lib/types/cv';
  let {block=$bindable(),catalog}:{block:CvBlock;catalog:CvEntry[]}=$props();
  let search=$state('');
  const fold=(s:string)=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const selected=$derived(new Map(block.entries.filter(e=>e.entityType==='skills').map(e=>[e.entityId,e])));
  const areas=$derived.by(()=>{
    const groups=new Map<string,CvEntry[]>();
    const chosen=block.entries.filter(e=>e.entityType==='skills').map(e=>catalog.find(c=>c.entityType==='skills'&&c.entityId===e.entityId)).filter((e):e is CvEntry=>Boolean(e));
    for(const entry of [...chosen,...catalog.filter(e=>e.entityType==='skills')]){
      const area=entry.presentation?.kind==='skill' ? entry.presentation.area : 'Sin área';
      if(!groups.has(area)) groups.set(area,[]);
      if(!groups.get(area)!.some(e=>e.entityId===entry.entityId)) groups.get(area)!.push(entry);
    }
    return [...groups].map(([area,entries])=>({area,entries,visible:entries.filter(e=>fold(`${area} ${plainInlineTitle(e.title)} ${e.contribution}`).includes(fold(search))),count:entries.filter(e=>selected.has(e.entityId)).length}));
  });
  const choose=(entry:CvEntry,enabled:boolean)=>{
    if(enabled&&!selected.has(entry.entityId)) block.entries=[...block.entries,{key:crypto.randomUUID(),entityType:'skills',entityId:entry.entityId,commentary:'',contributionMode:'inherit',contributionText:'',skillOptions:{resources:[],evidence:[]}}];
    if(!enabled) block.entries=block.entries.filter(e=>e.entityType!=='skills'||e.entityId!==entry.entityId);
  };
  const chooseArea=(entries:CvEntry[],enabled:boolean)=>entries.forEach(e=>choose(e,enabled));
  const moveArea=(area:string,offset:number)=>{
    const current=areas.filter(g=>g.count);
    const index=current.findIndex(g=>g.area===area),target=index+offset;
    if(target<0||target>=current.length)return;
    [current[index],current[target]]=[current[target],current[index]];
    const reordered=current.flatMap(g=>g.entries.filter(e=>selected.has(e.entityId)).map(e=>selected.get(e.entityId)!));
    if(reordered.length!==selected.size)return;
    let i=0;block.entries=block.entries.map(e=>e.entityType==='skills' ? reordered[i++] : e);
  };
  const moveSkill=(entry:CvEntry,entries:CvEntry[],offset:number)=>{
    const chosen=entries.filter(e=>selected.has(e.entityId));
    const index=chosen.findIndex(e=>e.entityId===entry.entityId),other=chosen[index+offset];
    if(!other)return;
    const a=block.entries.findIndex(e=>e.entityType==='skills'&&e.entityId===entry.entityId),b=block.entries.findIndex(e=>e.entityType==='skills'&&e.entityId===other.entityId);
    const next=[...block.entries];[next[a],next[b]]=[next[b],next[a]];block.entries=next;
  };
</script>
<div class="grid gap-4">
  <label class="grid gap-2 text-xs">Presentación de las competencias en este CV<select bind:value={block.skillsDisplay} class="border border-rule bg-canvas p-2"><option value="names">Solo nombres</option><option value="descriptions">Nombres y descripciones</option></select></label>
  <p class="m-0 text-xs leading-relaxed text-ink-dim">Elige competencias sueltas o áreas completas. «Solo nombres» oculta descripciones y recursos sin perder lo que hayas configurado.</p>
  <label class="grid gap-2 text-xs">Buscar competencias o áreas<input type="search" bind:value={search} class="border border-rule bg-canvas p-2" /></label>
  <p class="m-0 text-xs text-accent-strong">{selected.size} competencias en {areas.filter(g=>g.count).length} áreas</p>
  {#each block.entries.filter(e=>e.entityType==='skills'&&!catalog.some(c=>c.entityType==='skills'&&c.entityId===e.entityId)) as missing}
    <p role="alert" class="text-xs text-warning">La competencia #{missing.entityId} ya no existe. <button type="button" class="underline" onclick={()=>block.entries=block.entries.filter(e=>e.key!==missing.key)}>Quitar del CV</button></p>
  {/each}
  {#each areas.filter(g=>g.visible.length) as group (group.area)}
    <fieldset class="border border-rule p-4">
      <legend class="px-2 font-title text-lg">{group.area} <span class="font-mono text-xs text-ink-dim">{group.count}/{group.entries.length}</span></legend>
      <div class="mb-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="ghost" onclick={()=>chooseArea(group.entries,true)}>Seleccionar área completa</Button>
        <Button type="button" size="sm" variant="ghost" onclick={()=>chooseArea(group.entries,false)}>Quitar área</Button>
        {#if group.count}<Button type="button" size="sm" variant="ghost" onclick={()=>moveArea(group.area,-1)}>Subir área ↑</Button><Button type="button" size="sm" variant="ghost" onclick={()=>moveArea(group.area,1)}>Bajar área ↓</Button>{/if}
      </div>
      {#each group.visible as entry (entry.entityId)}
        {@const selection=selected.get(entry.entityId)}
        <div class="border-t border-rule py-3">
          <label class="flex items-start gap-3"><input type="checkbox" class="mt-1 accent-accent-strong" checked={Boolean(selection)} onchange={e=>choose(entry,e.currentTarget.checked)} /><span><span class="font-title text-base"><InlineTitle text={entry.title} /></span><span class="mt-1 block text-xs leading-relaxed text-ink-dim">{entry.contribution}</span></span></label>
          {#if selection}
            <div class="mt-2 flex gap-2"><Button type="button" size="sm" variant="ghost" onclick={()=>moveSkill(entry,group.entries,-1)}>Subir ↑</Button><Button type="button" size="sm" variant="ghost" onclick={()=>moveSkill(entry,group.entries,1)}>Bajar ↓</Button></div>
            <details class="mt-2 text-xs">
              <summary class="cursor-pointer text-accent-strong">Texto adaptado y opciones adicionales{block.skillsDisplay==='names' ? ' (ocultos en el PDF)' : ''}</summary>
              <div class="mt-3 grid gap-3">
                <a href={`/admin/meritos/skills/${entry.entityId}`} target="_blank" rel="noopener" class="text-accent-strong underline">Editar capacidad original ↗</a>
                <label class="grid gap-2">Descripción<select bind:value={selection.contributionMode} class="border border-rule bg-canvas p-2"><option value="inherit">Usar el texto original</option><option value="custom">Adaptar para este CV</option><option value="hidden">Ocultar descripción</option></select></label>
                {#if selection.contributionMode==='custom'}<label class="grid gap-2">Descripción adaptada<textarea bind:value={selection.contributionText} rows="3" maxlength="10000" class="border border-rule bg-canvas p-2"></textarea></label>{/if}
                {#if entry.presentation?.kind==='skill'}
                  <fieldset class="grid gap-2"><legend>Recursos opcionales</legend>{#each entry.presentation.resources as resource}<label><input type="checkbox" checked={selection.skillOptions?.resources.includes(resource.key)??false} onchange={e=>{selection.skillOptions??={resources:[],evidence:[]};selection.skillOptions.resources=e.currentTarget.checked?[...selection.skillOptions.resources,resource.key]:selection.skillOptions.resources.filter(k=>k!==resource.key);}} /> {resource.label}</label>{/each}</fieldset>
                  <fieldset class="grid gap-2"><legend>Ejemplos opcionales</legend>{#each entry.presentation.evidence as evidence}<label><input type="checkbox" checked={selection.skillOptions?.evidence.includes(evidence.key)??false} onchange={e=>{selection.skillOptions??={resources:[],evidence:[]};selection.skillOptions.evidence=e.currentTarget.checked?[...selection.skillOptions.evidence,evidence.key]:selection.skillOptions.evidence.filter(k=>k!==evidence.key);}} /> {evidence.label}</label>{/each}</fieldset>
                {/if}
                <label class="grid gap-2">Comentario adicional<textarea bind:value={selection.commentary} rows="2" maxlength="10000" class="border border-rule bg-canvas p-2"></textarea></label>
              </div>
            </details>
          {/if}
        </div>
      {/each}
    </fieldset>
  {/each}
</div>
