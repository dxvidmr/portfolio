<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva entrada · cv/admin</title>
</svelte:head>

<ButtonLink variant="ghost" size="sm" href="/admin/entradas" data-sveltekit-preload-data="off" class="tw:mb-4 tw:px-0">← Volver</ButtonLink>

<nav class="tw:mb-6 tw:flex tw:gap-2 tw:text-[0.8rem] tw:text-ink-faint" aria-label="Ruta">
	<a class="tw:text-ink-dim" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>Nueva</span>
</nav>

<AdminPageHeader
	title="Nueva entrada"
	eyebrow="Índice transversal"
	description="Elige el tipo. La entrada se creará como privada: no aparecerá en la web pública hasta que la publiques."
/>

<a class="tw:mt-8 tw:grid tw:gap-1.5 tw:rounded-ui tw:border tw:border-accent-strong tw:px-[1.1rem] tw:py-4 tw:text-ink tw:hover:bg-accent-wash tw:focus-visible:outline-2 tw:focus-visible:outline-offset-3 tw:focus-visible:outline-accent-strong" href="/admin/eventos/nuevo">
	<strong class="tw:text-accent-strong">Evento académico</strong>
	<span class="tw:max-w-[70ch] tw:text-[0.82rem] tw:leading-[1.5] tw:text-ink-dim">
		Congreso, seminario, jornada… Crea el evento y, en el mismo paso, tu contribución,
		servicio o asistencia. Es el camino recomendado para comunicaciones y organización.
	</span>
</a>

<ul class="tw:mt-6 tw:mb-0 tw:grid tw:list-none tw:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] tw:gap-3 tw:p-0">
	{#each data.typeOptions as option (option.value)}
		<li>
			<a class="tw:block tw:rounded-ui tw:border tw:border-rule tw:px-4 tw:py-[0.9rem] tw:text-ink tw:hover:border-accent-strong tw:hover:text-accent-strong tw:focus-visible:outline-2 tw:focus-visible:outline-offset-3 tw:focus-visible:outline-accent-strong" href={`/admin/entradas/nueva/${option.value}`}>
				{option.label}
				{#if option.value === 'talks' || option.value === 'service_activities'}
					<small class="tw:mt-1 tw:block tw:text-[0.7rem] tw:text-ink-faint">si el evento ya existe</small>
				{/if}
			</a>
		</li>
	{/each}
</ul>
