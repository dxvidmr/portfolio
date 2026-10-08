<script lang="ts">
  import { enhance } from '$app/forms';
  import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
  import type { PageData, ActionData } from './$types';
  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>
<svelte:head><title>Mis CV · cv/admin</title></svelte:head>
<AdminPageHeader title="Mis CV" description="Un CV para cada solicitud, con tus textos y los méritos que elijas. Lo que cambies aquí no afecta a la web." />
{#if form?.message}<p role="alert" class="text-warning">{form.message}</p>{/if}
<form method="POST" action="?/create" use:enhance class="mb-8 flex flex-wrap items-end gap-3">
  <label class="grid gap-2 text-xs">Nombre del nuevo CV<input name="name" required maxlength="200" placeholder="Solicitud, convocatoria o destinatario" class="min-w-72 rounded-sm border border-rule bg-canvas p-3" /></label>
  <Button type="submit" variant="primary">+ Crear CV</Button>
</form>
{#each data.cvs as cv (cv.id)}
  <article class="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-6">
    <div><h2 class="m-0 font-title text-xl"><a href={`/admin/cv/${cv.id}`}>{cv.name}</a></h2><p class="mt-2 text-xs text-ink-dim">{cv.block_count} bloques · {cv.export_count} versiones para PDF · Actualizado: {cv.updated_at} UTC</p></div>
    <div class="flex flex-wrap items-center gap-3"><ButtonLink href={`/admin/cv/${cv.id}`}>Editar</ButtonLink>
      <form method="POST" action="?/duplicate" use:enhance><input type="hidden" name="id" value={cv.id} /><input type="hidden" name="name" value={`${cv.name} (copia)`} /><Button type="submit" variant="ghost">Duplicar</Button></form>
    </div>
  </article>
{:else}<p class="border-y border-rule py-10 text-ink-faint">Crea tu primer CV para empezar.</p>{/each}
