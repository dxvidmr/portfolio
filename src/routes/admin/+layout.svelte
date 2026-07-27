<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import '$lib/styles/admin.css';
	import SiteControls from '$lib/components/SiteControls.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const links = [
		{ href: '/admin', label: 'Resumen' },
		{ href: '/admin/actividad', label: 'Actividad' },
		{ href: '/admin/portfolio', label: 'Portfolio' },
		{ href: '/admin/entradas', label: 'Entradas' },
		{ href: '/admin/eventos', label: 'Eventos' },
		{ href: '/admin/documentos', label: 'Documentos' },
		{ href: '/admin/taxonomias', label: 'Taxonomías' }
	];

	const isCurrent = (href: string) =>
		href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin-shell min-h-screen bg-canvas font-mono text-ink">
	<header
		class="sticky top-0 z-[100] border-b border-rule bg-[var(--surface-glass)] py-2 backdrop-blur-[14px]"
	>
		<div
			class="mx-auto flex w-[calc(100%-2*var(--gutter))] max-w-[88rem] flex-wrap items-center gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-2 max-[720px]:w-[calc(100%-2rem)]"
		>
			<a
				class="inline-flex min-w-0 items-center whitespace-nowrap font-title text-[1.02rem] font-normal leading-[1.1] text-ink hover:text-accent-strong"
				href="/admin"
				aria-label="Ir al resumen del dashboard"
			>
				CV/admin
			</a>
			<nav
				class="meta flex min-w-0 items-center gap-[clamp(0.85rem,1.7vw,1.65rem)] max-[1080px]:order-3 max-[1080px]:w-full max-[1080px]:overflow-x-auto max-[1080px]:border-t max-[1080px]:border-rule max-[1080px]:pt-2 max-[1080px]:pb-0.5"
				aria-label="Secciones del dashboard"
			>
				{#each links as link, index (link.href)}
					<a
						class="inline-flex shrink-0 items-baseline gap-[0.42rem] text-ink-dim hover:text-accent-strong aria-[current=page]:text-accent-strong"
						href={link.href}
						data-sveltekit-preload-data="off"
						aria-current={isCurrent(link.href) ? 'page' : undefined}
					>
						<span class="text-[0.58rem] tracking-normal text-accent" aria-hidden="true">
							{String(index + 1).padStart(2, '0')}
						</span>
						{link.label}
					</a>
				{/each}
			</nav>
			<div class="ml-auto flex items-center gap-[clamp(0.7rem,1.5vw,1.2rem)]">
				<SiteControls showLanguage={false} />
				<a
					href="/es"
					class="meta text-ink-dim hover:text-accent-strong max-[620px]:hidden"
					>Web ↗</a
				>
				<span
					class="max-w-28 overflow-hidden text-[0.6rem] text-ellipsis whitespace-nowrap text-ink-faint max-[760px]:hidden"
					title={data.session?.user?.name ?? 'admin'}>{data.session?.user?.name ?? 'admin'}</span
				>
				<form method="POST" action="/admin?/salir">
					<button
						class="meta cursor-pointer border-0 bg-transparent p-0 text-ink-dim hover:text-accent-strong"
						type="submit"
					>
						Salir
					</button>
				</form>
			</div>
		</div>
	</header>
	<main
		class="admin-main mx-auto w-[calc(100%-2*var(--gutter))] max-w-[88rem] py-[clamp(1.5rem,4vw,3.5rem)] max-[720px]:w-[calc(100%-2rem)] max-[720px]:py-6"
	>
		{@render children()}
	</main>
</div>
