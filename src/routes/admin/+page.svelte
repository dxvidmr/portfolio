<script lang="ts">
	import type { PageData } from './$types';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Resumen · cv/admin</title>
</svelte:head>

<h1 class="tw:mt-0 tw:mb-4 tw:text-[clamp(1.7rem,3vw,2.45rem)]! tw:leading-[1.05]">
	Panel de gestión del CV
</h1>
<p class="tw:max-w-[60ch] tw:text-[0.85rem] tw:leading-[1.6] tw:text-ink-faint">
	Sesión iniciada como {data.session?.user?.name ?? 'administrador'} (GitHub).
</p>

<section
	class="tw:my-8 tw:grid tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:bg-rule tw:[grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))] tw:gap-px"
	aria-label="Resumen editorial"
>
	<article class="tw:grid tw:gap-[0.35rem] tw:bg-[var(--admin-surface)] tw:p-5">
		<strong class="tw:text-[1.75rem] tw:text-ink">{data.summary.total}</strong>
		<span class="tw:text-xs tw:text-ink-faint">entradas totales</span>
	</article>
	<article class="tw:grid tw:gap-[0.35rem] tw:bg-[var(--admin-surface)] tw:p-5">
		<strong class="tw:text-[1.75rem] tw:text-ink">{data.summary.publicCount}</strong>
		<span class="tw:text-xs tw:text-ink-faint">públicas</span>
	</article>
	<article class="tw:grid tw:gap-[0.35rem] tw:bg-[var(--admin-surface)] tw:p-5">
		<strong class="tw:text-[1.75rem] tw:text-ink">{data.summary.draftCount}</strong>
		<span class="tw:text-xs tw:text-ink-faint">privadas</span>
	</article>
	<article class="tw:grid tw:gap-[0.35rem] tw:bg-[var(--admin-surface)] tw:p-5">
		<strong class="tw:text-[1.75rem] tw:text-ink">{data.summary.homeCount}</strong>
		<span class="tw:text-xs tw:text-ink-faint">en portada</span>
	</article>
	<article class="tw:grid tw:gap-[0.35rem] tw:bg-[var(--admin-surface)] tw:p-5">
		<strong class="tw:text-[1.75rem] tw:text-ink">{data.summary.relatedCount}</strong>
		<span class="tw:text-xs tw:text-ink-faint">con relaciones</span>
	</article>
</section>

<section class="tw:mt-8" aria-labelledby="quick-actions">
	<h2 class="tw:mt-0 tw:mb-4 tw:text-base" id="quick-actions">Acciones rápidas</h2>
	<div class="tw:flex tw:flex-wrap tw:gap-3">
		<ButtonLink href="/admin/entradas/nueva">+ Nueva entrada</ButtonLink>
		<ButtonLink href="/admin/eventos/nuevo">+ Nuevo evento</ButtonLink>
		<ButtonLink href="/admin/portada">Ordenar portada</ButtonLink>
	</div>
</section>

<section class="tw:mt-8" aria-labelledby="recent-title">
	<div class="tw:flex tw:items-baseline tw:justify-between tw:gap-4 tw:max-[620px]:flex-col tw:max-[620px]:items-start">
		<h2 class="tw:mt-0 tw:mb-4 tw:text-base" id="recent-title">Últimos elementos modificados</h2>
		<a class="tw:text-[0.68rem] tw:text-ink-dim" href="/admin/entradas"
			>Ver todas las entradas →</a
		>
	</div>
	<ul class="tw:m-0 tw:list-none tw:border-t tw:border-rule tw:p-0">
		{#each data.summary.recent as entry (`${entry.entityType}:${entry.entityId}`)}
			<li class="tw:border-b tw:border-rule tw:p-0">
				<a
					href={`/admin/entradas/${entry.entityType}/${entry.entityId}`}
					class="tw:group tw:flex tw:w-full tw:items-baseline tw:justify-between tw:gap-4 tw:px-1 tw:py-[0.85rem] tw:max-[620px]:flex-col tw:max-[620px]:items-start"
				>
					<span class="tw:text-ink tw:group-hover:text-accent-strong">{entry.title}</span>
					<span class="tw:text-xs tw:text-ink-faint"
						>{entry.typeLabel} · {entry.updatedAt ?? entry.sortDate ?? 'sin fecha'}</span
					>
				</a>
			</li>
		{/each}
	</ul>
</section>
