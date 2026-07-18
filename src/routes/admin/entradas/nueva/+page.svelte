<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Nueva entrada · cv/admin</title>
</svelte:head>

<ButtonLink variant="ghost" size="sm" href="/admin/entradas" data-sveltekit-preload-data="off" class="mb-4 px-0">← Volver</ButtonLink>

<nav class="mb-6 flex gap-2 text-[0.8rem] text-ink-faint" aria-label="Ruta">
	<a class="text-ink-dim" href="/admin/entradas">Entradas</a>
	<span aria-hidden="true">/</span>
	<span>Nueva</span>
</nav>

<AdminPageHeader
	title="Nueva entrada"
	eyebrow="Índice transversal"
	description="Elige el tipo. La entrada se creará como privada: no aparecerá en la web pública hasta que la publiques."
/>

<a class="mt-8 grid gap-1.5 rounded-ui border border-accent-strong px-[1.1rem] py-4 text-ink hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href="/admin/eventos/nuevo">
	<strong class="text-accent-strong">Evento académico</strong>
	<span class="max-w-[70ch] text-[0.82rem] leading-[1.5] text-ink-dim">
		Congreso, seminario, jornada… Crea el evento y, en el mismo paso, tu comunicación,
		servicio o asistencia. Es el camino recomendado para comunicaciones y organización.
	</span>
</a>

<ul class="mt-6 mb-0 grid list-none grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3 p-0">
	{#each data.typeOptions as option (option.value)}
		<li>
			<a class="block rounded-ui border border-rule px-4 py-[0.9rem] text-ink hover:border-accent-strong hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href={`/admin/entradas/nueva/${option.value}`}>
				{option.label}
				{#if option.value === 'talks' || option.value === 'service_activities'}
					<small class="mt-1 block text-[0.7rem] text-ink-faint">si el evento ya existe</small>
				{/if}
			</a>
		</li>
	{/each}
</ul>
