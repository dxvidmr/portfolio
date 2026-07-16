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
		<a href="/admin/entradas/nueva">+ Nueva entrada</a>
		<a href="/admin/eventos/nuevo">+ Nuevo evento</a>
		<a href="/admin/portada" class="secondary">Ordenar portada</a>
	</div>
</section>

<section class="recent" aria-labelledby="recent-title">
	<div class="section-heading">
		<h2 id="recent-title">Últimos elementos modificados</h2>
		<a href="/admin/entradas">Ver todas las entradas →</a>
	</div>
	<ul>
		{#each data.summary.recent as entry (`${entry.entityType}:${entry.entityId}`)}
			<li>
				<a href={`/admin/entradas/${entry.entityType}/${entry.entityId}`} class="entry-link">
					<span class="entry-title">{entry.title}</span>
					<span>{entry.typeLabel} · {entry.updatedAt ?? entry.sortDate ?? 'sin fecha'}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	h1 {
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--fg);
		margin: 0 0 1rem;
	}

	.session-note {
		color: var(--fg-faint);
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
		color: var(--fg-dim);
		margin: 0 0 1rem;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		border-radius: var(--radius);
		overflow: hidden;
		margin: 2rem 0;
	}

	.metrics article {
		background: var(--admin-surface);
		padding: 1.25rem;
		display: grid;
		gap: 0.35rem;
	}

	.metrics strong {
		font-size: 1.75rem;
		color: var(--fg);
	}

	.metrics span,
	.recent li span:last-child {
		font-size: 0.75rem;
		color: var(--fg-faint);
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
		border: 1px solid var(--line-strong);
		padding: 0.55rem 0.8rem;
		color: var(--fg);
	}

	.actions a:hover {
		border-color: var(--accent-strong);
		color: var(--accent-strong);
	}

	.actions .secondary {
		color: var(--fg-dim);
	}

	.section-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-heading > a {
		color: var(--fg-dim);
		font-size: 0.68rem;
	}

	.recent ul {
		list-style: none;
		padding: 0;
		margin: 0;
		border-top: 1px solid var(--line);
	}

	.recent li {
		padding: 0;
		border-bottom: 1px solid var(--line);
	}

	.entry-link {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		padding: 0.85rem 0.25rem;
	}

	.entry-link:hover .entry-title {
		color: var(--accent-strong);
	}

	.entry-title {
		color: var(--fg);
	}

	@media (max-width: 620px) {
		.section-heading,
		.entry-link {
			align-items: flex-start;
			flex-direction: column;
		}
	}
</style>
