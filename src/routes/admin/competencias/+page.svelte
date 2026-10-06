<script lang="ts">
  import { enhance } from '$app/forms';
  let {data,form}=$props();
  const natures={method:'Método',standard:'Estándar',language:'Lenguaje',tool:'Herramienta',platform:'Plataforma'};
</script>
<h1 class="font-title text-3xl">Competencias técnicas y metodológicas</h1>
<p class="max-w-3xl text-sm leading-relaxed text-ink-dim">Describe qué haces y vincúlalo a trabajos concretos. Los recursos son opcionales y representativos. No hay niveles ni listas exhaustivas de tecnologías.</p>
<div class="my-5 flex gap-5 text-sm"><a href="/admin/entradas/nueva/skills" class="text-accent-strong underline">Crear capacidad</a><a href="/admin/taxonomias" class="text-accent-strong underline">Editar áreas</a></div>
{#each data.skills as skill,i (skill.id)}
  {#if i===0 || data.skills[i-1].area!==skill.area}<h2 class="mt-8 font-title text-xl">{skill.area}</h2>{/if}
  <article class="border-t border-rule py-4">
    <h3 class="m-0 font-title text-lg"><a href={`/admin/entradas/skills/${skill.id}`} class="text-accent-strong">{skill.name} ↗</a></h3>
    <p class="max-w-4xl text-sm leading-relaxed">{skill.description}</p>
    <p class="text-xs text-ink-dim">{skill.isPublic ? 'Pública' : 'Privada'}{skill.details?.resources.length ? ` · ${skill.details.resources.map(r=>r.label).join(', ')}` : ''}</p>
    {#if skill.details?.evidence.length}<div class="flex flex-wrap gap-x-4 gap-y-2 text-xs">{#each skill.details.evidence as example}<a href={example.adminUrl} class="text-accent-strong underline">{example.label}</a>{/each}</div>{/if}
  </article>
{/each}
<section class="mt-10 border-t border-rule pt-6">
  <h2 class="font-title text-2xl">Catálogo de recursos</h2>
  <p class="text-sm text-ink-dim">Un mismo recurso puede apoyar varias capacidades. Añade uno nuevo solo si ayuda a explicar tu trabajo.</p>
  {#if form?.message}<p role="status" class="text-sm text-accent-strong">{form.message}</p>{/if}
  {#snippet fields(id:number,name:string,nameEn:string,nature:string)}
    <input type="hidden" name="id" value={id} />
    <label class="grid gap-1 text-xs">Nombre<input name="name" value={name} required maxlength="200" class="border border-rule bg-canvas p-2" /></label>
    <label class="grid gap-1 text-xs">Nombre en inglés<input name="nameEn" value={nameEn} maxlength="200" class="border border-rule bg-canvas p-2" /></label>
    <label class="grid gap-1 text-xs">Naturaleza<select name="nature" value={nature} class="border border-rule bg-canvas p-2">{#each Object.entries(natures) as [key,label]}<option value={key}>{label}</option>{/each}</select></label>
    <button class="self-end border border-rule p-2 text-xs text-accent-strong" type="submit">Guardar</button>
  {/snippet}
  <h3 class="font-title text-lg">Añadir recurso</h3>
  <form method="POST" action="?/guardarRecurso" use:enhance class="grid gap-3 sm:grid-cols-4">{@render fields(0,'','','tool')}</form>
  <details class="mt-6"><summary class="cursor-pointer text-sm">Editar recursos existentes ({data.resources.length})</summary>
    {#each data.resources as resource (resource.id)}<div class="border-t border-rule py-4">
      <form method="POST" action="?/guardarRecurso" use:enhance class="grid gap-3 sm:grid-cols-4">{@render fields(resource.id,resource.name,resource.nameEn,resource.nature)}</form>
      <div class="mt-2 flex gap-4 text-xs text-ink-dim"><span>{resource.uses} capacidades</span>{#if !resource.uses}<form method="POST" action="?/eliminarRecurso" use:enhance><input type="hidden" name="id" value={resource.id} /><button type="submit" class="text-warning">Eliminar</button></form>{/if}</div>
    </div>{/each}
  </details>
</section>
