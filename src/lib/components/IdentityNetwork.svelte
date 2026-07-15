<script lang="ts">
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile } from '$lib/content/profile';

	let { locale }: { locale: Locale } = $props();
	let activeId = $state('orcid');
	const positions = [
		{ id: 'orcid', x: 14, y: 21 },
		{ id: 'scholar', x: 39, y: 11 },
		{ id: 'zotero', x: 68, y: 13 },
		{ id: 'github', x: 87, y: 31 },
		{ id: 'bluesky', x: 84, y: 70 },
		{ id: 'x', x: 61, y: 84 },
		{ id: 'instagram', x: 27, y: 80 }
	];
	const nodes = profile.profiles.map((item) => ({
		...item,
		...(positions.find((position) => position.id === item.id) ?? { x: 50, y: 50 })
	}));
	const active = $derived(nodes.find((node) => node.id === activeId) ?? nodes[0]);
	const copy = $derived(
		locale === 'es'
			? {
					label: 'Contacto y perfiles',
					title: 'Identidad en red',
					hint: 'Explorar nodo',
					contact: 'Escribir'
				}
			: {
					label: 'Contact and profiles',
					title: 'Network identity',
					hint: 'Explore node',
					contact: 'Write'
				}
	);
</script>

<section class="identity-network">
	<header>
		<div>
			<span class="meta tag">{copy.label}</span>
			<h3>{copy.title}</h3>
		</div>
		<span class="meta hint">
			{copy.hint}
			<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</span>
	</header>

	<div class="graph">
		<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
			{#each nodes as node (node.id)}
				<line
					class:is-active={node.id === activeId}
					x1="50"
					y1="48"
					x2={node.x}
					y2={node.y}
				></line>
			{/each}
		</svg>

		<div class="identity-node" aria-hidden="true">
			<strong>DMR</strong>
			<span>network_id</span>
		</div>

		{#each nodes as node (node.id)}
			<a
				class="profile-node"
				class:is-active={node.id === activeId}
				href={node.url}
				target="_blank"
				rel="noreferrer"
				aria-label={`${node.label}: ${node.handle}`}
				style={`--x: ${node.x}%; --y: ${node.y}%;`}
				onpointerenter={() => (activeId = node.id)}
				onfocus={() => (activeId = node.id)}
			>
				<span class="node-code">{node.code}</span>
				<span>{node.label}</span>
			</a>
		{/each}
	</div>

	<div class="network-footer" aria-live="polite">
		<div class="active-profile">
			<span class="node-code">{active.code}</span>
			<div>
				<strong>{active.label}</strong>
				<span>{active.handle}</span>
			</div>
		</div>
		<div class="mail-links">
			<span class="meta">{copy.contact}</span>
			<a href={'mailto:' + profile.contact.mail}>{profile.contact.mail}</a>
			<a href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a>
		</div>
	</div>
</section>

<style>
	.identity-network {
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--bg-panel);
		overflow: hidden;
	}

	header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 20px;
		padding: clamp(18px, 2.4vw, 28px);
		border-bottom: 1px solid var(--line);
	}

	header h3 {
		margin-top: 8px;
		font-family: var(--font-title);
		font-size: clamp(1.55rem, 3vw, 2.4rem);
		font-weight: 400;
		line-height: 1;
	}

	.hint {
		display: inline-flex;
		gap: 6px;
		align-items: center;
		color: var(--fg-faint);
	}

	.graph {
		position: relative;
		min-height: clamp(310px, 35vw, 410px);
		background-image:
			linear-gradient(to right, var(--visual-grid) 1px, transparent 1px),
			linear-gradient(to bottom, var(--visual-grid) 1px, transparent 1px);
		background-size: 36px 36px;
	}

	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	line {
		vector-effect: non-scaling-stroke;
		stroke: var(--line-strong);
		stroke-dasharray: 2 5;
		stroke-width: 1;
		opacity: 0.55;
		transition:
			opacity 180ms ease,
			stroke 180ms ease,
			stroke-width 180ms ease;
	}

	line.is-active {
		stroke: var(--accent-strong);
		stroke-dasharray: none;
		stroke-width: 2;
		opacity: 1;
	}

	.identity-node,
	.profile-node {
		position: absolute;
		left: var(--x, 50%);
		top: var(--y, 50%);
		transform: translate(-50%, -50%);
	}

	.identity-node {
		left: 50%;
		top: 48%;
		display: grid;
		place-content: center;
		width: 106px;
		height: 106px;
		border: 1px solid var(--accent-strong);
		border-radius: 50%;
		background-color: var(--accent);
		background-image: var(--accent-grain);
		background-size: 180px 180px;
		background-blend-mode: soft-light;
		color: var(--on-accent);
		text-align: center;
		box-shadow: 0 0 0 10px color-mix(in srgb, var(--accent) 12%, transparent);
	}

	.identity-node strong {
		font-family: var(--font-title);
		font-size: 1.85rem;
		line-height: 1;
	}

	.identity-node span {
		margin-top: 5px;
		font-size: 0.54rem;
		letter-spacing: 0.08em;
	}

	.profile-node {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding: 7px 10px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--bg-panel) 91%, transparent);
		color: var(--fg-dim);
		font-size: 0.68rem;
		white-space: nowrap;
		-webkit-backdrop-filter: blur(7px);
		backdrop-filter: blur(7px);
		transition:
			background-color 180ms ease,
			border-color 180ms ease,
			color 180ms ease,
			transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.profile-node:hover,
	.profile-node.is-active {
		border-color: var(--accent-strong);
		background-color: var(--accent-wash);
		color: var(--fg);
		transform: translate(-50%, -50%) scale(1.08);
	}

	.node-code {
		display: inline-grid;
		place-content: center;
		min-width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		background: var(--accent);
		color: var(--on-accent);
		font-size: 0.62rem;
		font-weight: 700;
		line-height: 1;
	}

	.network-footer {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		gap: 24px;
		align-items: center;
		min-height: 84px;
		padding: 14px clamp(18px, 2.4vw, 28px);
		border-top: 1px solid var(--line);
	}

	.active-profile {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.active-profile div {
		display: grid;
		min-width: 0;
	}

	.active-profile strong {
		font-family: var(--font-title);
		font-size: 1rem;
		font-weight: 500;
	}

	.active-profile div span {
		color: var(--fg-faint);
		font-size: 0.66rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mail-links {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 14px;
		min-width: 0;
		font-size: 0.7rem;
	}

	.mail-links a {
		color: var(--fg-dim);
	}

	.mail-links a:hover {
		color: var(--accent-strong);
	}

	@media (max-width: 720px) {
		header {
			align-items: flex-start;
			flex-direction: column;
		}

		.graph {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 8px;
			min-height: 0;
			padding: 20px;
		}

		svg {
			display: none;
		}

		.identity-node,
		.profile-node {
			position: relative;
			left: auto;
			top: auto;
			transform: none;
		}

		.identity-node {
			grid-column: 1 / -1;
			justify-self: center;
			margin: 6px 0 18px;
		}

		.profile-node {
			justify-content: flex-start;
			white-space: normal;
		}

		.profile-node:hover,
		.profile-node.is-active {
			transform: translateY(-2px);
		}

		.network-footer {
			grid-template-columns: 1fr;
		}

		.mail-links {
			align-items: flex-start;
			justify-content: flex-start;
			flex-direction: column;
			gap: 5px;
		}
	}

	@media (max-width: 420px) {
		.graph {
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.profile-node,
		line {
			transition-duration: 1ms;
		}
	}
</style>
