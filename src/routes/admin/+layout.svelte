<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const links = [
		{ href: '/admin', label: 'Resumen', ready: true },
		{ href: '/admin/entradas', label: 'Entradas', ready: true },
		{ href: '/admin/portada', label: 'Portada', ready: true },
		{ href: '/admin/portfolio', label: 'Portfolio', ready: true },
		{ href: '/admin/eventos', label: 'Eventos', ready: true }
	];
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin">
	<header>
		<span class="brand">cv/admin</span>
		<nav aria-label="Secciones del dashboard">
			{#each links as link (link.href)}
				{#if link.ready}
					<a
						href={link.href}
						data-sveltekit-preload-data="off"
						aria-current={page.url.pathname === link.href ? 'page' : undefined}
					>
						{link.label}
					</a>
				{:else}
					<span class="pending" title="Disponible en una fase posterior">{link.label}</span>
				{/if}
			{/each}
		</nav>
		<div class="session">
			<a href="/es" class="public-link">Ver web pública</a>
			<span class="user">{data.session?.user?.name ?? 'admin'}</span>
			<form method="POST" action="/admin?/salir">
				<button type="submit">Salir</button>
			</form>
		</div>
	</header>
	<main>
		{@render children()}
	</main>
</div>

<style>
	.admin {
		min-height: 100vh;
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		background: #0a0a0a;
		color: #d4d4d4;
	}

	header {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 0.75rem 1.5rem;
		border-bottom: 1px solid #262626;
		flex-wrap: wrap;
	}

	.brand {
		font-weight: 700;
		letter-spacing: 0.05em;
		color: #fafafa;
	}

	nav {
		display: flex;
		gap: 1.25rem;
	}

	nav a {
		color: #d4d4d4;
		text-decoration: none;
		border-bottom: 1px solid transparent;
	}

	nav a:hover {
		border-bottom-color: #525252;
	}

	nav a:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	nav a[aria-current='page'] {
		color: #fafafa;
		border-bottom-color: #fafafa;
	}

	.pending {
		color: #525252;
		cursor: not-allowed;
	}

	.session {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.public-link {
		color: #a3a3a3;
		text-decoration: none;
	}

	.public-link:hover {
		color: #d4d4d4;
	}

	.public-link:focus-visible,
	button:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 3px;
	}

	.user {
		color: #737373;
		font-size: 0.85rem;
	}

	button {
		font: inherit;
		background: none;
		border: 1px solid #404040;
		color: #d4d4d4;
		padding: 0.25rem 0.75rem;
		cursor: pointer;
	}

	button:hover {
		border-color: #737373;
	}

	main {
		padding: 2rem 1.5rem;
		max-width: 88rem;
		margin: 0 auto;
	}

	@media (max-width: 720px) {
		header {
			gap: 1rem;
			padding-inline: 1rem;
		}

		.session {
			width: 100%;
			margin-left: 0;
		}

		main {
			padding: 1.5rem 1rem;
		}
	}
</style>
