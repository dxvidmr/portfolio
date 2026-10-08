<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();

	const cardClass =
		'grid h-full gap-1 rounded-ui border border-rule px-4 py-[0.9rem] text-ink hover:border-accent-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong';
</script>

<svelte:head>
	<title>Nuevo mérito · cv/admin</title>
</svelte:head>

<ButtonLink variant="ghost" size="sm" href="/admin/meritos" data-sveltekit-preload-data="off" class="mb-4 px-0">← Volver</ButtonLink>

<AdminPageHeader
	title="Nuevo mérito"
	description="Elige qué quieres registrar."
/>

{#each data.groups as group (group.title)}
	<section class="mt-8 grid gap-3 border-t border-rule pt-6 first-of-type:border-t-0 first-of-type:pt-0">
		<h2 class="m-0 text-base">{group.title}</h2>
		<ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3 p-0">
			{#each group.types as option (option.type)}
				<li>
					<a class={`group ${cardClass}`} href={`/admin/meritos/nuevo/${option.type}`} data-sveltekit-preload-data="off">
						<span class="group-hover:text-accent-strong">{option.label}</span>
						<span class="text-[0.72rem] leading-snug text-ink-faint">{option.hint}</span>
					</a>
				</li>
			{/each}
			{#if group.types.some((option) => option.type === 'talks')}
				<li>
					<a class={`group ${cardClass} border-dashed`} href="/admin/eventos/nuevo">
						<span class="group-hover:text-accent-strong">Evento nuevo con varios papeles</span>
						<span class="text-[0.72rem] leading-snug text-ink-faint"
							>Registra el evento y, a la vez, tu comunicación, servicio o asistencia</span
						>
					</a>
				</li>
			{/if}
		</ul>
	</section>
{/each}
