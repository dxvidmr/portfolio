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
	const nodeCodeClass =
		'inline-grid h-6 min-w-6 place-content-center rounded-ui-sm bg-accent text-[0.62rem] font-bold leading-none text-[var(--on-accent)]';
	const profileNodeClass =
		'absolute top-[var(--y,50%)] left-[var(--x,50%)] inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-ui border px-2.5 py-[7px] text-[0.68rem] [backdrop-filter:blur(7px)] [transform:translate(-50%,-50%)] [transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease,transform_240ms_cubic-bezier(.22,1,.36,1)] motion-reduce:duration-[1ms] hover:border-accent-strong hover:bg-accent-wash hover:text-ink hover:[transform:translate(-50%,-50%)_scale(1.08)] max-[720px]:relative max-[720px]:top-auto max-[720px]:left-auto max-[720px]:justify-start max-[720px]:whitespace-normal max-[720px]:[transform:none] max-[720px]:hover:[transform:translateY(-2px)]';
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

<section class="overflow-hidden rounded-ui border border-rule bg-panel">
	<header
		class="flex items-end justify-between gap-5 border-b border-rule p-[clamp(18px,2.4vw,28px)] max-[720px]:flex-col max-[720px]:items-start"
	>
		<div>
			<span class="meta">{copy.label}</span>
			<h3
				class="mt-2 font-title text-[clamp(1.55rem,3vw,2.4rem)] font-normal leading-none"
			>
				{copy.title}
			</h3>
		</div>
		<span class="meta inline-flex items-center gap-1.5 text-ink-faint">
			{copy.hint}
			<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</span>
	</header>

	<div
		class="relative min-h-[clamp(310px,35vw,410px)] [background-image:linear-gradient(to_right,var(--visual-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--visual-grid)_1px,transparent_1px)] [background-size:36px_36px] max-[720px]:grid max-[720px]:min-h-0 max-[720px]:grid-cols-2 max-[720px]:gap-2 max-[720px]:p-5 max-[420px]:grid-cols-1"
	>
		<svg
			class="absolute inset-0 h-full w-full overflow-visible max-[720px]:hidden"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			{#each nodes as node (node.id)}
				<line
					class={`[vector-effect:non-scaling-stroke] [transition:opacity_180ms_ease,stroke_180ms_ease,stroke-width_180ms_ease] motion-reduce:duration-[1ms] ${node.id === activeId ? 'stroke-accent-strong stroke-2 opacity-100 [stroke-dasharray:none]' : 'stroke-rule-strong stroke-1 opacity-[.55] [stroke-dasharray:2_5]'}`}
					x1="50"
					y1="48"
					x2={node.x}
					y2={node.y}
				></line>
			{/each}
		</svg>

		<div
			class="absolute top-[48%] left-1/2 grid h-[106px] w-[106px] place-content-center rounded-full border border-accent-strong bg-accent [background-image:var(--accent-grain)] [background-blend-mode:soft-light] [background-size:180px_180px] text-center text-[var(--on-accent)] shadow-[0_0_0_10px_color-mix(in_srgb,var(--accent)_12%,transparent)] [transform:translate(-50%,-50%)] max-[720px]:relative max-[720px]:top-auto max-[720px]:left-auto max-[720px]:col-span-full max-[720px]:mx-0 max-[720px]:mt-1.5 max-[720px]:mb-[18px] max-[720px]:justify-self-center max-[720px]:[transform:none]"
			aria-hidden="true"
		>
			<strong class="font-title text-[1.85rem] leading-none">DMR</strong>
			<span class="mt-[5px] text-[0.54rem] tracking-[0.08em]">network_id</span>
		</div>

		{#each nodes as node (node.id)}
			<a
				class={`${profileNodeClass} ${node.id === activeId ? 'border-accent-strong bg-accent-wash text-ink [transform:translate(-50%,-50%)_scale(1.08)] max-[720px]:[transform:translateY(-2px)]' : 'border-rule-strong bg-[color-mix(in_srgb,var(--bg-panel)_91%,transparent)] text-ink-dim'}`}
				href={node.url}
				target="_blank"
				rel="noreferrer"
				aria-label={`${node.label}: ${node.handle}`}
				style={`--x: ${node.x}%; --y: ${node.y}%;`}
				onpointerenter={() => (activeId = node.id)}
				onfocus={() => (activeId = node.id)}
			>
				<span class={nodeCodeClass}>{node.code}</span>
				<span>{node.label}</span>
			</a>
		{/each}
	</div>

	<div
		class="grid min-h-[84px] grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] items-center gap-6 border-t border-rule py-3.5 px-[clamp(18px,2.4vw,28px)] max-[720px]:grid-cols-1"
		aria-live="polite"
	>
		<div class="flex min-w-0 items-center gap-2.5">
			<span class={nodeCodeClass}>{active.code}</span>
			<div class="grid min-w-0">
				<strong class="font-title text-base font-medium">{active.label}</strong>
				<span class="overflow-hidden text-[0.66rem] text-ellipsis whitespace-nowrap text-ink-faint">
					{active.handle}
				</span>
			</div>
		</div>
		<div
			class="flex min-w-0 items-center justify-end gap-3.5 text-[0.7rem] max-[720px]:flex-col max-[720px]:items-start max-[720px]:justify-start max-[720px]:gap-[5px]"
		>
			<span class="meta">{copy.contact}</span>
			<a class="text-ink-dim hover:text-accent-strong" href={'mailto:' + profile.contact.mail}
				>{profile.contact.mail}</a
			>
			<a
				class="text-ink-dim hover:text-accent-strong"
				href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a
			>
		</div>
	</div>
</section>
