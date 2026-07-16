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
		'tw:inline-grid tw:h-6 tw:min-w-6 tw:place-content-center tw:rounded-ui-sm tw:bg-accent tw:text-[0.62rem] tw:font-bold tw:leading-none tw:text-[var(--on-accent)]';
	const profileNodeClass =
		'tw:absolute tw:top-[var(--y,50%)] tw:left-[var(--x,50%)] tw:inline-flex tw:min-h-9 tw:items-center tw:gap-2 tw:whitespace-nowrap tw:rounded-ui tw:border tw:px-2.5 tw:py-[7px] tw:text-[0.68rem] tw:[backdrop-filter:blur(7px)] tw:[transform:translate(-50%,-50%)] tw:[transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease,transform_240ms_cubic-bezier(.22,1,.36,1)] tw:motion-reduce:duration-[1ms] tw:hover:border-accent-strong tw:hover:bg-accent-wash tw:hover:text-ink tw:hover:[transform:translate(-50%,-50%)_scale(1.08)] tw:max-[720px]:relative tw:max-[720px]:top-auto tw:max-[720px]:left-auto tw:max-[720px]:justify-start tw:max-[720px]:whitespace-normal tw:max-[720px]:[transform:none] tw:max-[720px]:hover:[transform:translateY(-2px)]';
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

<section class="tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:bg-panel">
	<header
		class="tw:flex tw:items-end tw:justify-between tw:gap-5 tw:border-b tw:border-rule tw:p-[clamp(18px,2.4vw,28px)] tw:max-[720px]:flex-col tw:max-[720px]:items-start"
	>
		<div>
			<span class="meta">{copy.label}</span>
			<h3
				class="tw:mt-2 tw:font-title tw:text-[clamp(1.55rem,3vw,2.4rem)] tw:font-normal tw:leading-none"
			>
				{copy.title}
			</h3>
		</div>
		<span class="meta tw:inline-flex tw:items-center tw:gap-1.5 tw:text-ink-faint">
			{copy.hint}
			<MoveUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
		</span>
	</header>

	<div
		class="tw:relative tw:min-h-[clamp(310px,35vw,410px)] tw:[background-image:linear-gradient(to_right,var(--visual-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--visual-grid)_1px,transparent_1px)] tw:[background-size:36px_36px] tw:max-[720px]:grid tw:max-[720px]:min-h-0 tw:max-[720px]:grid-cols-2 tw:max-[720px]:gap-2 tw:max-[720px]:p-5 tw:max-[420px]:grid-cols-1"
	>
		<svg
			class="tw:absolute tw:inset-0 tw:h-full tw:w-full tw:overflow-visible tw:max-[720px]:hidden"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
			aria-hidden="true"
		>
			{#each nodes as node (node.id)}
				<line
					class={`tw:[vector-effect:non-scaling-stroke] tw:[transition:opacity_180ms_ease,stroke_180ms_ease,stroke-width_180ms_ease] tw:motion-reduce:duration-[1ms] ${node.id === activeId ? 'tw:stroke-accent-strong tw:stroke-2 tw:opacity-100 tw:[stroke-dasharray:none]' : 'tw:stroke-rule-strong tw:stroke-1 tw:opacity-[.55] tw:[stroke-dasharray:2_5]'}`}
					x1="50"
					y1="48"
					x2={node.x}
					y2={node.y}
				></line>
			{/each}
		</svg>

		<div
			class="tw:absolute tw:top-[48%] tw:left-1/2 tw:grid tw:h-[106px] tw:w-[106px] tw:place-content-center tw:rounded-full tw:border tw:border-accent-strong tw:bg-accent tw:[background-image:var(--accent-grain)] tw:[background-blend-mode:soft-light] tw:[background-size:180px_180px] tw:text-center tw:text-[var(--on-accent)] tw:shadow-[0_0_0_10px_color-mix(in_srgb,var(--accent)_12%,transparent)] tw:[transform:translate(-50%,-50%)] tw:max-[720px]:relative tw:max-[720px]:top-auto tw:max-[720px]:left-auto tw:max-[720px]:col-span-full tw:max-[720px]:mx-0 tw:max-[720px]:mt-1.5 tw:max-[720px]:mb-[18px] tw:max-[720px]:justify-self-center tw:max-[720px]:[transform:none]"
			aria-hidden="true"
		>
			<strong class="tw:font-title tw:text-[1.85rem] tw:leading-none">DMR</strong>
			<span class="tw:mt-[5px] tw:text-[0.54rem] tw:tracking-[0.08em]">network_id</span>
		</div>

		{#each nodes as node (node.id)}
			<a
				class={`${profileNodeClass} ${node.id === activeId ? 'tw:border-accent-strong tw:bg-accent-wash tw:text-ink tw:[transform:translate(-50%,-50%)_scale(1.08)] tw:max-[720px]:[transform:translateY(-2px)]' : 'tw:border-rule-strong tw:bg-[color-mix(in_srgb,var(--bg-panel)_91%,transparent)] tw:text-ink-dim'}`}
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
		class="tw:grid tw:min-h-[84px] tw:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] tw:items-center tw:gap-6 tw:border-t tw:border-rule tw:py-3.5 tw:px-[clamp(18px,2.4vw,28px)] tw:max-[720px]:grid-cols-1"
		aria-live="polite"
	>
		<div class="tw:flex tw:min-w-0 tw:items-center tw:gap-2.5">
			<span class={nodeCodeClass}>{active.code}</span>
			<div class="tw:grid tw:min-w-0">
				<strong class="tw:font-title tw:text-base tw:font-medium">{active.label}</strong>
				<span class="tw:overflow-hidden tw:text-[0.66rem] tw:text-ellipsis tw:whitespace-nowrap tw:text-ink-faint">
					{active.handle}
				</span>
			</div>
		</div>
		<div
			class="tw:flex tw:min-w-0 tw:items-center tw:justify-end tw:gap-3.5 tw:text-[0.7rem] tw:max-[720px]:flex-col tw:max-[720px]:items-start tw:max-[720px]:justify-start tw:max-[720px]:gap-[5px]"
		>
			<span class="meta">{copy.contact}</span>
			<a class="tw:text-ink-dim tw:hover:text-accent-strong" href={'mailto:' + profile.contact.mail}
				>{profile.contact.mail}</a
			>
			<a
				class="tw:text-ink-dim tw:hover:text-accent-strong"
				href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a
			>
		</div>
	</div>
</section>
