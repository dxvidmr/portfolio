<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import type { PageData } from './$types';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Resumen · cv/admin</title>
</svelte:head>

<h1 class="mt-0 mb-4 text-[clamp(1.7rem,3vw,2.45rem)]! leading-[1.05]">
	Resumen
</h1>
<p class="max-w-[60ch] text-[0.85rem] leading-[1.6] text-ink-faint">
	Sesión de {data.session?.user?.name ?? 'administrador'}.
</p>

<section
	class="my-8 grid overflow-hidden rounded-ui border border-rule bg-rule [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))] gap-px"
	aria-label="Resumen editorial"
>
	<article class="grid gap-[0.35rem] bg-[var(--admin-surface)] p-5">
		<strong class="text-[1.75rem] text-ink">{data.summary.total}</strong>
		<span class="text-xs text-ink-faint">méritos en total</span>
	</article>
	<article class="grid gap-[0.35rem] bg-[var(--admin-surface)] p-5">
		<strong class="text-[1.75rem] text-ink">{data.summary.publicCount}</strong>
		<span class="text-xs text-ink-faint">públicos</span>
	</article>
	<article class="grid gap-[0.35rem] bg-[var(--admin-surface)] p-5">
		<strong class="text-[1.75rem] text-ink">{data.summary.draftCount}</strong>
		<span class="text-xs text-ink-faint">privados</span>
	</article>
	<article class="grid gap-[0.35rem] bg-[var(--admin-surface)] p-5">
		<strong class="text-[1.75rem] text-ink">{data.summary.homeCount}</strong>
		<span class="text-xs text-ink-faint">en portada</span>
	</article>
	<article class="grid gap-[0.35rem] bg-[var(--admin-surface)] p-5">
		<strong class="text-[1.75rem] text-ink">{data.summary.relatedCount}</strong>
		<span class="text-xs text-ink-faint">con relaciones</span>
	</article>
</section>

<section class="mt-8" aria-labelledby="quick-actions">
	<h2 class="mt-0 mb-4 text-base" id="quick-actions">Acciones rápidas</h2>
	<div class="flex flex-wrap gap-3">
		<ButtonLink href="/admin/meritos/nuevo">+ Nuevo mérito</ButtonLink>
		<ButtonLink href="/admin/eventos/nuevo">+ Nuevo evento</ButtonLink>
		<ButtonLink href="/admin/portada">Ordenar portada</ButtonLink>
	</div>
</section>

<section class="mt-8" aria-labelledby="recent-title">
	<div class="flex items-baseline justify-between gap-4 max-[620px]:flex-col max-[620px]:items-start">
		<h2 class="mt-0 mb-4 text-base" id="recent-title">Modificados recientemente</h2>
		<a class="text-[0.68rem] text-ink-dim" href="/admin/meritos"
			>Ver todos los méritos →</a
		>
	</div>
	<ul class="m-0 list-none border-t border-rule p-0">
		{#each data.summary.recent as entry (`${entry.entityType}:${entry.entityId}`)}
			<li class="border-b border-rule p-0">
				<a
					href={`/admin/meritos/${entry.entityType}/${entry.entityId}`}
					class="group flex w-full items-baseline justify-between gap-4 px-1 py-[0.85rem] max-[620px]:flex-col max-[620px]:items-start"
				>
					<span class="text-ink group-hover:text-accent-strong"><InlineTitle text={entry.title} /></span>
					<span class="text-xs text-ink-faint"
						>{entry.typeLabel} · {entry.updatedAt ?? entry.sortDate ?? 'sin fecha'}</span
					>
				</a>
			</li>
		{/each}
	</ul>
</section>
