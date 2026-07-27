<script lang="ts">
	import type { PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';

	let { data }: { data: PageData } = $props();
	const eventActions = [
		{
			label: 'Comunicación',
			href: '/admin/entradas/nueva/talks'
		},
		{
			label: 'Servicio',
			href: '/admin/entradas/nueva/service_activities?context=event'
		},
		{
			label: 'Asistencia privada',
			href: '/admin/entradas/nueva/event_attendance'
		}
	];
	const eventEntryTypes = new Set(['talks', 'event_attendance', 'service_activities']);
	const noEventOptions = $derived(
		data.typeOptions.filter((option) => !eventEntryTypes.has(option.value))
	);
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

<AdminPageHeader title="Nueva entrada" />

<section class="mt-8 grid gap-3">
	<h2 class="text-base">Eventos</h2>

	<a class="block rounded-ui border border-accent-strong px-[1.1rem] py-4 text-ink hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href="/admin/eventos/nuevo">
		<strong class="text-accent-strong">Crear evento</strong>
	</a>

	<div class="mt-2 grid gap-2">
		<h3 class="text-[0.78rem] font-normal text-ink-faint">Añadir a un evento existente</h3>
		<ul class="m-0 grid list-none grid-cols-3 gap-3 p-0 max-[850px]:grid-cols-1">
			{#each eventActions as action (action.href)}
				<li>
					<a class="block h-full rounded-ui border border-rule px-4 py-[0.9rem] text-ink hover:border-accent-strong hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href={action.href}>
						{action.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</section>

<section class="mt-8 grid gap-4 border-t border-rule pt-6">
	<h2 class="text-base">Entradas sin evento</h2>
	<ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3 p-0">
		<li>
			<a class="block rounded-ui border border-rule px-4 py-[0.9rem] text-ink hover:border-accent-strong hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href="/admin/entradas/nueva/service_activities?context=standalone">
				Servicio independiente
			</a>
		</li>
		{#each noEventOptions as option (option.value)}
			<li>
				<a class="block rounded-ui border border-rule px-4 py-[0.9rem] text-ink hover:border-accent-strong hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-strong" href={`/admin/entradas/nueva/${option.value}`}>
					{option.label}
				</a>
			</li>
		{/each}
	</ul>
</section>
