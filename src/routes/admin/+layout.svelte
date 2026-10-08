<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import Menu from '@lucide/svelte/icons/menu';
	import Settings from '@lucide/svelte/icons/settings';
	import '$lib/styles/admin.css';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Tres grupos: los datos (méritos y competencias), el CV que se envía y la web pública.
	// Eventos y documentos cuelgan de Méritos y se muestran como pestañas de esa sección.
	const groups = [
		[
			{ href: '/admin/meritos', label: 'Méritos', also: ['/admin/eventos', '/admin/documentos'] },
			{ href: '/admin/competencias', label: 'Competencias' }
		],
		[{ href: '/admin/cv', label: 'Mis CV' }],
		[
			{ href: '/admin/portada', label: 'Portada' },
			{ href: '/admin/portfolio', label: 'Portfolio' }
		]
	];
	const links = groups.flat().map((link, index) => ({
		...link,
		number: String(index + 1).padStart(2, '0')
	}));
	// Eventos y documentos no son méritos: los acompañan. Por eso van a la derecha,
	// en un tono más suave que la pestaña principal.
	const meritTabs = [
		{ href: '/admin/meritos', label: 'Méritos', secondary: false, title: undefined },
		{
			href: '/admin/eventos',
			label: 'Eventos',
			secondary: true,
			title: 'Congresos y jornadas a los que se vinculan comunicaciones, asistencias y servicios'
		},
		{
			href: '/admin/documentos',
			label: 'Documentos',
			secondary: true,
			title: 'Certificados y archivos de todos los méritos'
		}
	];

	const startsWith = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	const isCurrent = (link: { href: string; also?: string[] }) =>
		[link.href, ...(link.also ?? [])].some(startsWith);
	const currentTab = $derived(meritTabs.find((tab) => startsWith(tab.href)));

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement | null>(null);
	const userName = $derived(data.session?.user?.name ?? 'admin');
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#snippet signOut(className: string)}
	<form method="POST" action="/admin?/salir">
		<button class={`cursor-pointer border-0 bg-transparent p-0 ${className}`} type="submit">
			Salir
		</button>
	</form>
{/snippet}

<div class="admin-shell min-h-screen bg-canvas font-mono text-ink">
	<header
		class="sticky top-0 z-[100] border-b border-rule bg-[var(--surface-glass)] py-2 backdrop-blur-[14px]"
	>
		<div
			class="mx-auto flex min-h-[38px] w-[calc(100%-2*var(--gutter))] max-w-[88rem] items-center gap-x-[clamp(1.25rem,3vw,2.5rem)] max-[720px]:w-[calc(100%-2rem)]"
		>
			<a
				class="inline-flex min-w-0 items-center whitespace-nowrap font-title text-[1.02rem] font-normal leading-[1.1] text-ink hover:text-accent-strong"
				href="/admin"
				aria-label="Ir al resumen del panel"
			>
				CV/admin
			</a>
			<nav
				class="meta flex min-w-0 items-center gap-[clamp(0.85rem,1.7vw,1.65rem)] max-[1000px]:hidden"
				aria-label="Secciones del panel"
			>
				{#each groups as group, groupIndex (groupIndex)}
					{#if groupIndex > 0}
						<span class="h-3 w-px bg-rule-strong" aria-hidden="true"></span>
					{/if}
					{#each group as link (link.href)}
						{@const item = links.find((candidate) => candidate.href === link.href)!}
						<a
							class="inline-flex shrink-0 items-baseline gap-[0.42rem] whitespace-nowrap text-ink-dim hover:text-accent-strong aria-[current=page]:text-accent-strong"
							href={link.href}
							data-sveltekit-preload-data="off"
							aria-current={isCurrent(link) ? 'page' : undefined}
						>
							<span class="text-[0.58rem] tracking-normal text-accent" aria-hidden="true">
								{item.number}
							</span>
							{link.label}
						</a>
					{/each}
				{/each}
			</nav>
			<div class="ml-auto flex items-center gap-[clamp(0.7rem,1.5vw,1.2rem)] max-[1000px]:hidden">
				<SiteControls showLanguage={false} />
				<a
					href="/admin/taxonomias"
					class="grid place-items-center text-ink-dim hover:text-accent-strong aria-[current=page]:text-accent-strong"
					aria-label="Taxonomías"
					title="Taxonomías"
					aria-current={startsWith('/admin/taxonomias') ? 'page' : undefined}
				>
					<Settings size={15} strokeWidth={1.6} aria-hidden="true" />
				</a>
				<a href="/es" class="meta whitespace-nowrap text-ink-dim hover:text-accent-strong">Web ↗</a>
				<span
					class="max-w-28 overflow-hidden text-[0.6rem] text-ellipsis whitespace-nowrap text-ink-faint max-[1200px]:hidden"
					title={userName}>{userName}</span
				>
				{@render signOut('meta text-ink-dim hover:text-accent-strong')}
			</div>
			<button
				class="ml-auto hidden h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink hover:text-accent-strong focus-visible:text-accent-strong max-[1000px]:grid"
				bind:this={menuButton}
				type="button"
				onclick={() => (menuOpen = true)}
				aria-label="Abrir menú"
				aria-expanded={menuOpen}
			>
				<Menu size={22} strokeWidth={1.5} aria-hidden="true" />
			</button>
		</div>
	</header>

	<MobileMenu
		open={menuOpen}
		onclose={() => (menuOpen = false)}
		returnFocus={menuButton}
		locale="es"
		name="CV/admin"
		links={links.map((link) => ({ ...link, current: isCurrent(link) }))}
	>
		{#snippet footer()}
			<div class="grid gap-4">
				<div class="meta flex flex-wrap items-center gap-x-6 gap-y-2 text-ink-dim">
					<a href="/admin/taxonomias" class="hover:text-accent-strong" onclick={() => (menuOpen = false)}
						>Taxonomías</a
					>
					<a href="/es" class="hover:text-accent-strong">Web ↗</a>
					{@render signOut('meta text-ink-dim hover:text-accent-strong')}
					<span class="ml-auto text-[0.6rem] text-ink-faint">{userName}</span>
				</div>
				<SiteControls expanded showLanguage={false} />
			</div>
		{/snippet}
	</MobileMenu>

	<main
		class="admin-main mx-auto w-[calc(100%-2*var(--gutter))] max-w-[88rem] py-[clamp(1.5rem,4vw,3.5rem)] max-[720px]:w-[calc(100%-2rem)] max-[720px]:py-6"
	>
		{#if currentTab}
			<nav
				class="meta -mt-[clamp(0.5rem,2vw,1.5rem)] mb-[clamp(1.25rem,3vw,2rem)] flex items-end gap-5 border-b border-rule"
				aria-label="Méritos"
			>
				{#each meritTabs as tab, index (tab.href)}
					<a
						href={tab.href}
						data-sveltekit-preload-data="off"
						title={tab.title}
						class={`-mb-px border-b border-transparent pb-2 hover:text-accent-strong aria-[current=page]:border-accent-strong aria-[current=page]:text-accent-strong ${
							tab.secondary ? 'text-[0.62rem] text-ink-faint' : 'text-ink-dim'
						} ${index === 1 ? 'ml-auto' : ''}`}
						aria-current={tab === currentTab ? 'page' : undefined}>{tab.label}</a
					>
				{/each}
			</nav>
		{/if}
		{@render children()}
	</main>
</div>
