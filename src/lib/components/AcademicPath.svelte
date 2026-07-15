<script lang="ts">
	import { onMount } from 'svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile } from '$lib/content/profile';

	let { locale }: { locale: Locale } = $props();
	let root = $state<HTMLElement | null>(null);
	let selected = $state(0);
	let direction = $state(1);
	const entries = $derived([...profile.education[locale]].reverse());
	const active = $derived(entries[selected] ?? entries[0]);
	const copy = $derived(
		locale === 'es'
			? { label: 'Recorrido académico', title: 'De la escena a los datos' }
			: { label: 'Academic path', title: 'From stage to data' }
	);

	const selectEntry = (next: number) => {
		if (next === selected) return;
		direction = next > selected ? 1 : -1;
		selected = next;
	};

	onMount(() => {
		let frame = 0;

		const updateFromScroll = () => {
			frame = 0;
			if (!root) return;
			const rect = root.getBoundingClientRect();
			const viewport = Math.max(1, window.innerHeight);
			const start = viewport * 0.58;
			const travel = Math.max(1, rect.height - viewport * 0.1);
			const progress = Math.min(1, Math.max(0, (start - rect.top) / travel));
			const thresholds = [0, 0.22, 0.45, 0.86];
			const next = Math.min(
				entries.length - 1,
				thresholds.reduce((index, threshold, candidate) => (progress >= threshold ? candidate : index), 0)
			);
			selectEntry(next);
		};

		const handleScroll = () => {
			if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
		};

		updateFromScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });

		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	});
</script>

<section class="academic-path" bind:this={root}>
	<div class="path-sticky">
		<header>
			<span class="meta tag">{copy.label}</span>
			<h3>{copy.title}</h3>
		</header>

		<div class="path-layout">
			<ol class="steps">
				{#each entries as entry, index (entry.period)}
					<li class:is-active={selected === index}>
						<button type="button" aria-pressed={selected === index} onclick={() => selectEntry(index)}>
							<span class="period">{entry.period}</span>
							<span class="degree">{entry.degree}</span>
						</button>
					</li>
				{/each}
			</ol>

			<div class="detail-stage">
				<span class="detail-rail" aria-hidden="true"></span>
				{#key active.period}
					<article class="path-detail" class:is-reverse={direction < 0}>
						<p class="meta">{active.period}</p>
						<h4>{active.degree}</h4>
						<p>{active.institution}</p>
						<small>{active.detail}</small>
					</article>
				{/key}
			</div>
		</div>
	</div>
</section>

<style>
	.academic-path {
		min-height: max(680px, 125vh);
		padding-top: clamp(24px, 4vw, 44px);
		border-top: 1px solid var(--line-strong);
	}

	.path-sticky {
		position: sticky;
		top: clamp(88px, 13vh, 126px);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 18px;
	}

	header h3 {
		font-family: var(--font-title);
		font-size: clamp(1.25rem, 2.2vw, 1.8rem);
		font-weight: 400;
		line-height: 1;
		text-align: right;
	}

	.path-layout {
		display: grid;
		grid-template-columns: minmax(210px, 0.9fr) minmax(0, 1.1fr);
		gap: clamp(26px, 4vw, 54px);
		padding-top: clamp(26px, 4vw, 42px);
	}

	.steps {
		position: relative;
		display: grid;
		gap: 3px;
		margin: 0;
		padding: 0 0 0 14px;
		list-style: none;
	}

	.steps::before {
		position: absolute;
		top: 11px;
		bottom: 11px;
		left: 3px;
		width: 1px;
		background: var(--line);
		content: '';
	}

	.steps li {
		position: relative;
	}

	.steps li::before {
		position: absolute;
		top: 13px;
		left: -14px;
		width: 7px;
		height: 7px;
		border: 1px solid var(--line-strong);
		border-radius: 50%;
		background: var(--bg);
		content: '';
		transition:
			background-color 180ms ease,
			transform 180ms ease;
	}

	.steps li.is-active::before {
		border-color: var(--accent-strong);
		background: var(--accent);
		transform: scale(1.45);
	}

	button {
		display: grid;
		grid-template-columns: 82px minmax(0, 1fr);
		gap: 10px;
		width: 100%;
		padding: 8px 0 8px 10px;
		border: 0;
		border-radius: var(--radius-sm);
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition: color 160ms ease;
	}

	button:hover .degree,
	.is-active .degree {
		color: var(--accent-strong);
	}

	.period {
		color: var(--fg-faint);
		font-size: 0.68rem;
		font-variant-numeric: tabular-nums;
		text-transform: uppercase;
	}

	.degree {
		color: var(--fg-dim);
		font-size: 0.76rem;
		line-height: 1.35;
	}

	.detail-stage {
		position: relative;
		min-height: 138px;
		padding-left: 24px;
		overflow: hidden;
		perspective: 760px;
	}

	.detail-rail {
		position: absolute;
		top: 2px;
		bottom: 2px;
		left: 0;
		z-index: 2;
		width: 2px;
		border-radius: 2px;
		background: var(--accent);
		pointer-events: none;
	}

	.path-detail {
		position: relative;
		z-index: 1;
		min-height: 138px;
		padding: 2px 0;
		backface-visibility: hidden;
		transform-origin: 50% 100%;
		animation: cube-next 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}

	.path-detail.is-reverse {
		transform-origin: 50% 0;
		animation-name: cube-previous;
	}

	.path-detail h4 {
		margin: 5px 0 8px;
		font-family: var(--font-title);
		font-size: clamp(1.1rem, 1.7vw, 1.35rem);
		font-weight: 500;
		line-height: 1.2;
	}

	.path-detail p,
	.path-detail small {
		display: block;
		margin: 0;
		color: var(--fg-dim);
		font-size: 0.74rem;
		line-height: 1.45;
	}

	.path-detail small {
		margin-top: 7px;
		color: var(--fg-faint);
	}

	@keyframes cube-next {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translate3d(0, 32px, 0) rotateX(-72deg);
		}
	}

	@keyframes cube-previous {
		from {
			opacity: 0;
			filter: blur(4px);
			transform: translate3d(0, -32px, 0) rotateX(72deg);
		}
	}

	@media (max-width: 940px) {
		.path-layout {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 520px) {
		header {
			align-items: flex-start;
			flex-direction: column;
		}

		header h3 {
			text-align: left;
		}

		button {
			grid-template-columns: 76px minmax(0, 1fr);
		}

	}

	@media (prefers-reduced-motion: reduce) {
		.path-detail {
			animation: none;
		}
	}
</style>
