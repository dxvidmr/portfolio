<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';
	import '$lib/styles/admin.css';
	import ThemeToggle from '$lib/components/admin/ThemeToggle.svelte';

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

<div class="admin-shell">
	<header class="admin-header">
		<a class="brand" href="/admin" aria-label="Ir al resumen del dashboard">
			<span>DMR</span>
			<small>cv/admin</small>
		</a>
		<nav class="admin-nav" aria-label="Secciones del dashboard">
			{#each groups as group (group.label)}
				<div class="nav-group">
					<span class="group-label">{group.label}</span>
					<div class="nav-links">
					{#each group.links as link (link.href)}
					<a
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
		<div class="session">
			<ThemeToggle />
			<a href="/es" class="public-link">Web pública ↗</a>
			<span class="user" title={data.session?.user?.name ?? 'admin'}>{data.session?.user?.name ?? 'admin'}</span>
			<form method="POST" action="/admin?/salir">
				<button type="submit">Salir</button>
			</form>
		</div>
	</header>
	<main class="admin-main">
		{@render children()}
	</main>
</div>

<style>
	.admin-header {
		position: sticky;
		z-index: 100;
		top: 0;
		display: flex;
		align-items: stretch;
		gap: clamp(1.25rem, 3vw, 2.5rem);
		padding: 0.7rem var(--gutter);
		border-bottom: 1px solid var(--line);
		background: var(--surface-glass);
		backdrop-filter: blur(14px);
		flex-wrap: wrap;
	}

	.brand {
		display: grid;
		align-content: center;
		min-width: 4.5rem;
		color: var(--fg);
		line-height: 1;
	}

	.brand span {
		font-family: var(--font-title);
		font-size: 1.15rem;
		font-weight: 500;
	}

	.brand small {
		margin-top: 0.25rem;
		color: var(--fg-faint);
		font-size: 0.58rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.admin-nav {
		display: flex;
		align-items: stretch;
		gap: clamp(1rem, 2.5vw, 2rem);
	}

	.nav-group {
		display: grid;
		align-content: center;
		gap: 0.22rem;
	}

	.group-label {
		color: var(--fg-faint);
		font-size: 0.55rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.nav-links {
		display: flex;
		gap: 0.75rem;
	}

	.nav-links a {
		padding-bottom: 0.2rem;
		border-bottom: 1px solid transparent;
		color: var(--fg-dim);
		font-size: 0.72rem;
	}

	.nav-links a:hover,
	.nav-links a[aria-current='page'] {
		border-bottom-color: var(--accent-strong);
		color: var(--accent-strong);
	}

	.session {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.public-link {
		color: var(--fg-dim);
		font-size: 0.68rem;
	}

	.public-link:hover {
		color: var(--accent-strong);
	}

	.user {
		max-width: 8rem;
		overflow: hidden;
		color: var(--fg-faint);
		font-size: 0.65rem;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.session button,
	:global(.theme-toggle) {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		font: inherit;
		font-size: 0.65rem;
		background: transparent;
		color: var(--fg-dim);
		padding: 0.35rem 0.55rem;
		cursor: pointer;
	}

	.session button:hover,
	:global(.theme-toggle:hover) {
		border-color: var(--accent-strong);
		background: var(--accent-wash);
		color: var(--accent-strong);
	}

	@media (max-width: 980px) {
		.admin-header {
			gap: 1rem;
		}

		.admin-nav {
			order: 3;
			width: 100%;
			overflow-x: auto;
			padding-top: 0.2rem;
		}
	}

	@media (max-width: 620px) {
		.admin-header {
			padding-inline: 1rem;
		}

		.user,
		.public-link,
		:global(.theme-toggle span) {
			display: none;
		}
	}
</style>
