<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import '$lib/styles/admin.css';
	import ThemeToggle from '$lib/components/admin/ThemeToggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const groups = [
		{
			label: 'Gestión',
			links: [
				{ href: '/admin', label: 'Resumen' },
				{ href: '/admin/portada', label: 'Portada' },
				{ href: '/admin/portfolio', label: 'Portfolio' }
			]
		},
		{
			label: 'CV',
			links: [
				{ href: '/admin/entradas', label: 'Entradas' },
				{ href: '/admin/eventos', label: 'Eventos' }
			]
		},
		{
			label: 'Control',
			links: [{ href: '/admin/taxonomias', label: 'Taxonomías' }]
		}
	];

	const isCurrent = (href: string) =>
		href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell tw:min-h-screen tw:bg-canvas tw:font-mono tw:text-ink">
	<header
		class="tw:sticky tw:top-0 tw:z-[100] tw:flex tw:flex-wrap tw:items-stretch tw:gap-[clamp(1.25rem,3vw,2.5rem)] tw:border-b tw:border-rule tw:bg-[var(--surface-glass)] tw:px-gutter tw:py-[0.7rem] tw:backdrop-blur-[14px] tw:max-[980px]:gap-4 tw:max-[620px]:px-4"
	>
		<a
			class="tw:grid tw:min-w-18 tw:content-center tw:leading-none tw:text-ink"
			href="/admin"
			aria-label="Ir al resumen del dashboard"
		>
			<span class="tw:font-title tw:text-[1.15rem] tw:font-medium">DMR</span>
			<small class="tw:mt-1 tw:text-[0.58rem] tw:tracking-[0.12em] tw:text-ink-faint tw:uppercase"
				>cv/admin</small
			>
		</a>
		<nav
			class="tw:flex tw:items-stretch tw:gap-[clamp(1rem,2.5vw,2rem)] tw:max-[980px]:order-3 tw:max-[980px]:w-full tw:max-[980px]:overflow-x-auto tw:max-[980px]:pt-1"
			aria-label="Secciones del dashboard"
		>
			{#each groups as group (group.label)}
				<div class="tw:grid tw:content-center tw:gap-[0.22rem]">
					<span class="tw:text-[0.55rem] tw:tracking-[0.14em] tw:text-ink-faint tw:uppercase"
						>{group.label}</span
					>
					<div class="tw:flex tw:gap-3">
						{#each group.links as link (link.href)}
							<a
								class="tw:border-b tw:border-transparent tw:pb-[0.2rem] tw:text-[0.72rem] tw:text-ink-dim tw:hover:border-accent-strong tw:hover:text-accent-strong tw:aria-[current=page]:border-accent-strong tw:aria-[current=page]:text-accent-strong"
								href={link.href}
								data-sveltekit-preload-data="off"
								aria-current={isCurrent(link.href) ? 'page' : undefined}
							>
								{link.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</nav>
		<div class="tw:ml-auto tw:flex tw:items-center tw:gap-2.5">
			<ThemeToggle />
			<a
				href="/es"
				class="tw:text-[0.68rem] tw:text-ink-dim tw:hover:text-accent-strong tw:max-[620px]:hidden"
				>Web pública ↗</a
			>
			<span
				class="tw:max-w-32 tw:overflow-hidden tw:text-[0.65rem] tw:text-ellipsis tw:whitespace-nowrap tw:text-ink-faint tw:max-[620px]:hidden"
				title={data.session?.user?.name ?? 'admin'}>{data.session?.user?.name ?? 'admin'}</span
			>
			<form method="POST" action="/admin?/salir">
				<Button type="submit" size="sm">Salir</Button>
			</form>
		</div>
	</header>
	<main
		class="admin-main tw:mx-auto tw:w-[calc(100%-2*var(--gutter))] tw:max-w-[88rem] tw:py-[clamp(1.5rem,4vw,3.5rem)] tw:max-[720px]:w-[calc(100%-2rem)] tw:max-[720px]:py-6"
	>
		{@render children()}
	</main>
</div>
