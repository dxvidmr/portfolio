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
	class={`editorial-cursor pointer-events-none fixed top-[-12px] left-[-17px] z-[2147483647] h-6 w-[34px] transition-opacity duration-[90ms] ease-linear will-change-transform motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
	aria-hidden="true"
>
	<svg class="block size-full overflow-visible" viewBox="0 0 34 24" role="presentation">
		<path
			class={`fill-none [stroke-linecap:square] [stroke-linejoin:miter] [stroke-width:1.25] [vector-effect:non-scaling-stroke] [transition:transform_150ms_cubic-bezier(0.22,1,0.36,1),stroke_110ms_linear] motion-reduce:transition-none ${interactive ? 'translate-x-[-3px] stroke-accent-strong' : 'translate-x-px stroke-ink'}`}
			d="M 11 3 H 6 V 21 H 11"
		/>
		<circle
			class={`origin-center [transform-box:fill-box] [transition:fill_110ms_linear,transform_150ms_cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${interactive ? 'scale-[1.75] fill-accent' : 'fill-accent-strong'}`}
			cx="17"
			cy="12"
			r="1.5"
		/>
		<path
			class={`fill-none [stroke-linecap:square] [stroke-linejoin:miter] [stroke-width:1.25] [vector-effect:non-scaling-stroke] [transition:transform_150ms_cubic-bezier(0.22,1,0.36,1),stroke_110ms_linear] motion-reduce:transition-none ${interactive ? 'translate-x-[3px] stroke-accent-strong' : 'translate-x-[-1px] stroke-ink'}`}
			d="M 23 3 H 28 V 21 H 23"
		/>
	</svg>
</div>
