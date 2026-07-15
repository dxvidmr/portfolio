<script lang="ts">
	import { onMount } from 'svelte';

	let cursorElement: HTMLDivElement;
	let visible = $state(false);
	let interactive = $state(false);
	let nativeCursor = $state(false);

	const interactiveSelector = [
		'a[href]',
		'button:not([disabled])',
		'summary',
		'label[for]',
		'[role="button"]',
		'[role="link"]',
		'input[type="checkbox"]',
		'input[type="radio"]',
		'input[type="range"]',
		'select'
	].join(',');

	const nativeCursorSelector = [
		'textarea',
		'input:not([type])',
		'input[type="text"]',
		'input[type="email"]',
		'input[type="search"]',
		'input[type="url"]',
		'input[type="tel"]',
		'input[type="password"]',
		'[contenteditable="true"]'
	].join(',');

	onMount(() => {
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		if (!finePointer.matches) return;

		document.documentElement.classList.add('editorial-cursor-enabled');

		const handlePointerMove = (event: PointerEvent) => {
			if (event.pointerType && event.pointerType !== 'mouse') {
				visible = false;
				return;
			}

			cursorElement.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
			const target = event.target instanceof Element ? event.target : null;
			interactive = Boolean(target?.closest(interactiveSelector));
			nativeCursor = !interactive && Boolean(target?.closest(nativeCursorSelector));
			visible = !nativeCursor;
		};

		const hideCursor = () => {
			visible = false;
		};

		window.addEventListener('pointermove', handlePointerMove, { passive: true });
		document.documentElement.addEventListener('mouseleave', hideCursor);
		window.addEventListener('blur', hideCursor);

		return () => {
			document.documentElement.classList.remove('editorial-cursor-enabled');
			window.removeEventListener('pointermove', handlePointerMove);
			document.documentElement.removeEventListener('mouseleave', hideCursor);
			window.removeEventListener('blur', hideCursor);
		};
	});
</script>

<div
	bind:this={cursorElement}
	class="editorial-cursor"
	class:is-visible={visible}
	class:is-interactive={interactive}
	aria-hidden="true"
>
	<svg viewBox="0 0 34 24" role="presentation">
		<path class="bracket bracket--left" d="M 11 3 H 6 V 21 H 11" />
		<circle cx="17" cy="12" r="1.5" />
		<path class="bracket bracket--right" d="M 23 3 H 28 V 21 H 23" />
	</svg>
</div>

<style>
	.editorial-cursor {
		position: fixed;
		z-index: 2147483647;
		top: -12px;
		left: -17px;
		width: 34px;
		height: 24px;
		opacity: 0;
		pointer-events: none;
		will-change: transform;
		transition: opacity 90ms linear;
	}

	.editorial-cursor.is-visible {
		opacity: 1;
	}

	svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.bracket {
		fill: none;
		stroke: var(--fg);
		stroke-width: 1.25;
		stroke-linecap: square;
		stroke-linejoin: miter;
		vector-effect: non-scaling-stroke;
		transition:
			transform 150ms cubic-bezier(0.22, 1, 0.36, 1),
			stroke 110ms linear;
	}

	.bracket--left {
		transform: translateX(1px);
	}

	.bracket--right {
		transform: translateX(-1px);
	}

	circle {
		fill: var(--accent-strong);
		transition:
			fill 110ms linear,
			transform 150ms cubic-bezier(0.22, 1, 0.36, 1);
		transform-box: fill-box;
		transform-origin: center;
	}

	.editorial-cursor.is-interactive .bracket {
		stroke: var(--accent-strong);
	}

	.editorial-cursor.is-interactive .bracket--left {
		transform: translateX(-3px);
	}

	.editorial-cursor.is-interactive .bracket--right {
		transform: translateX(3px);
	}

	.editorial-cursor.is-interactive circle {
		fill: var(--accent);
		transform: scale(1.75);
	}

	:global(html.editorial-cursor-enabled),
	:global(html.editorial-cursor-enabled body),
	:global(html.editorial-cursor-enabled :is(a, button, summary, label[for], [role='button'], [role='link'])) {
		cursor: none !important;
	}

	:global(
		html.editorial-cursor-enabled
			:is(
				textarea,
				input:not([type]),
				input[type='text'],
				input[type='email'],
				input[type='search'],
				input[type='url'],
				input[type='tel'],
				input[type='password'],
				[contenteditable='true']
			)
	) {
		cursor: text !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.editorial-cursor,
		.bracket,
		circle {
			transition: none;
		}
	}

	@media (hover: none), (pointer: coarse) {
		.editorial-cursor {
			display: none;
		}
	}
</style>
