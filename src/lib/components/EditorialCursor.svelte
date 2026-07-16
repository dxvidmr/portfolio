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
	class={`editorial-cursor tw:pointer-events-none tw:fixed tw:top-[-12px] tw:left-[-17px] tw:z-[2147483647] tw:h-6 tw:w-[34px] tw:transition-opacity tw:duration-[90ms] tw:ease-linear tw:will-change-transform tw:motion-reduce:transition-none ${visible ? 'tw:opacity-100' : 'tw:opacity-0'}`}
	aria-hidden="true"
>
	<svg class="tw:block tw:size-full tw:overflow-visible" viewBox="0 0 34 24" role="presentation">
		<path
			class={`tw:fill-none tw:[stroke-linecap:square] tw:[stroke-linejoin:miter] tw:[stroke-width:1.25] tw:[vector-effect:non-scaling-stroke] tw:[transition:transform_150ms_cubic-bezier(0.22,1,0.36,1),stroke_110ms_linear] tw:motion-reduce:transition-none ${interactive ? 'tw:translate-x-[-3px] tw:stroke-accent-strong' : 'tw:translate-x-px tw:stroke-ink'}`}
			d="M 11 3 H 6 V 21 H 11"
		/>
		<circle
			class={`tw:origin-center tw:[transform-box:fill-box] tw:[transition:fill_110ms_linear,transform_150ms_cubic-bezier(0.22,1,0.36,1)] tw:motion-reduce:transition-none ${interactive ? 'tw:scale-[1.75] tw:fill-accent' : 'tw:fill-accent-strong'}`}
			cx="17"
			cy="12"
			r="1.5"
		/>
		<path
			class={`tw:fill-none tw:[stroke-linecap:square] tw:[stroke-linejoin:miter] tw:[stroke-width:1.25] tw:[vector-effect:non-scaling-stroke] tw:[transition:transform_150ms_cubic-bezier(0.22,1,0.36,1),stroke_110ms_linear] tw:motion-reduce:transition-none ${interactive ? 'tw:translate-x-[3px] tw:stroke-accent-strong' : 'tw:translate-x-[-1px] tw:stroke-ink'}`}
			d="M 23 3 H 28 V 21 H 23"
		/>
	</svg>
</div>
