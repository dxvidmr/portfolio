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
				{ href: '/admin/actividad', label: 'Actividad' },
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

<div class="admin-shell min-h-screen bg-canvas font-mono text-ink">
	<header
		class="sticky top-0 z-[100] flex flex-wrap items-stretch gap-[clamp(1.25rem,3vw,2.5rem)] border-b border-rule bg-[var(--surface-glass)] px-gutter py-[0.7rem] backdrop-blur-[14px] max-[980px]:gap-4 max-[620px]:px-4"
	>
		<a
			class="grid min-w-18 content-center leading-none text-ink"
			href="/admin"
			aria-label="Ir al resumen del dashboard"
		>
			<span class="font-title text-[1.15rem] font-medium">DMR</span>
			<small class="mt-1 text-[0.58rem] tracking-[0.12em] text-ink-faint uppercase"
				>cv/admin</small
			>
		</a>
		<nav
			class="flex items-stretch gap-[clamp(1rem,2.5vw,2rem)] max-[980px]:order-3 max-[980px]:w-full max-[980px]:overflow-x-auto max-[980px]:pt-1"
			aria-label="Secciones del dashboard"
		>
			{#each groups as group (group.label)}
				<div class="grid content-center gap-[0.22rem]">
					<span class="text-[0.55rem] tracking-[0.14em] text-ink-faint uppercase"
						>{group.label}</span
					>
					<div class="flex gap-3">
						{#each group.links as link (link.href)}
							<a
								class="border-b border-transparent pb-[0.2rem] text-[0.72rem] text-ink-dim hover:border-accent-strong hover:text-accent-strong aria-[current=page]:border-accent-strong aria-[current=page]:text-accent-strong"
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
		<div class="ml-auto flex items-center gap-2.5">
			<ThemeToggle />
			<a
				href="/es"
				class="text-[0.68rem] text-ink-dim hover:text-accent-strong max-[620px]:hidden"
				>Web pública ↗</a
			>
			<span
				class="max-w-32 overflow-hidden text-[0.65rem] text-ellipsis whitespace-nowrap text-ink-faint max-[620px]:hidden"
				title={data.session?.user?.name ?? 'admin'}>{data.session?.user?.name ?? 'admin'}</span
			>
			<form method="POST" action="/admin?/salir">
				<Button type="submit" size="sm">Salir</Button>
			</form>
		</div>
	</header>
	<main
		class="admin-main mx-auto w-[calc(100%-2*var(--gutter))] max-w-[88rem] py-[clamp(1.5rem,4vw,3.5rem)] max-[720px]:w-[calc(100%-2rem)] max-[720px]:py-6"
	>
		{@render children()}
	</main>
</div>
