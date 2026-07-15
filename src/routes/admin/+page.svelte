<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Resumen · cv/admin</title>
</svelte:head>

<h1>Panel de gestión del CV</h1>
<p class="session-note">
	Sesión iniciada como {data.session?.user?.name ?? 'administrador'} (GitHub).
</p>

<section class="metrics" aria-label="Resumen editorial">
	<article>
		<strong>{data.summary.total}</strong>
		<span>entradas totales</span>
	</article>
	<article>
		<strong>{data.summary.publicCount}</strong>
		<span>públicas</span>
	</article>
	<article>
		<strong>{data.summary.draftCount}</strong>
		<span>privadas</span>
	</article>
	<article>
		<strong>{data.summary.homeCount}</strong>
		<span>en portada</span>
	</article>
	<article>
		<strong>{data.summary.relatedCount}</strong>
		<span>con relaciones</span>
	</article>
</section>

<section class="actions" aria-labelledby="quick-actions">
	<h2 id="quick-actions">Acciones rápidas</h2>
	<div>
		<a href="/admin/entradas/nueva">Nueva entrada</a>
		<a href="/admin/entradas">Gestionar entradas</a>
		<a href="/admin/portada">Ordenar portada</a>
		<a href="/admin/portfolio">Relacionar portfolio</a>
		<a href="/admin/eventos">Gestionar eventos</a>
		<a href="/es" class="secondary">Ver web pública</a>
	</div>
</section>

<section class="recent" aria-labelledby="recent-title">
	<h2 id="recent-title">Últimos controles modificados</h2>
	<ul>
		{#each data.summary.recent as entry (`${entry.entityType}:${entry.entityId}`)}
			<li>
				<span class="entry-title">{entry.title}</span>
				<span>{entry.typeLabel} · {entry.updatedAt ?? 'sin control explícito'}</span>
			</li>
		{/each}
	</ul>
</section>

<style>
	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fafafa;
		margin: 0 0 1rem;
	}

	.session-note {
		color: #737373;
		font-size: 0.85rem;
	}

	p {
		max-width: 60ch;
		line-height: 1.6;
	}

	h2 {
		font-family: inherit;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #a3a3a3;
		margin: 0 0 1rem;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 1px;
		background: #262626;
		border: 1px solid #262626;
		margin: 2rem 0;
	}

	.metrics article {
		background: #111;
		padding: 1.25rem;
		display: grid;
		gap: 0.35rem;
	}

	.metrics strong {
		font-size: 1.75rem;
		color: #fafafa;
	}

	.metrics span,
	.recent li span:last-child {
		font-size: 0.75rem;
		color: #737373;
	}

	.actions,
	.recent {
		margin-top: 2rem;
	}

	.actions div {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.actions a {
		border: 1px solid #525252;
		padding: 0.55rem 0.8rem;
		color: #fafafa;
	}

	.actions a:hover {
		border-color: #00ff88;
		color: #00ff88;
	}

	.actions .secondary {
		color: #a3a3a3;
	}

	.recent ul {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid #262626;
	}

	.recent li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.8rem 0;
		border-bottom: 1px solid #262626;
	}

	.entry-title {
		color: #d4d4d4;
	}
</style>
