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
<p>
	Shell del dashboard operativo. Las secciones de gestión (índice de entradas,
	curación de portada, formularios) llegan en las fases 3 y 4 del plan.
</p>

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
</style>
