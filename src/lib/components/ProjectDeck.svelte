<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import ProjectVisual from '$lib/components/ProjectVisual.svelte';
	import { projectText, type PortfolioProject } from '$lib/content/projects';
	import { localizedPath } from '$lib/i18n';
	import type { Locale } from '$lib/paraglide/runtime';

	// Móvil: los trabajos como una pila de tarjetas. La de arriba sigue al dedo y, al soltarla con
	// decisión, sale volando y sube la siguiente; hacia la derecha vuelve la anterior. El scroll
	// vertical sigue siendo de la página: solo se captura el gesto si es claramente horizontal.
	let {
		projects,
		locale,
		activeIndex = $bindable(0),
		onopen
	}: {
		projects: PortfolioProject[];
		locale: Locale;
		activeIndex?: number;
		onopen: (event: MouseEvent, index: number) => void;
	} = $props();

	const PILE = 2;
	const STEP = 7;
	let deck = $state<HTMLDivElement | null>(null);
	let dragX = $state(0);
	let dragging = $state(false);
	let hint = $state(false);
	let start: { x: number; y: number; time: number; id: number } | null = null;
	let axis: 'x' | 'y' | null = null;
	let moved = false;

	const width = () => deck?.offsetWidth ?? 320;
	const progress = $derived(Math.min(1, Math.abs(dragX) / width()));

	// Posición de cada tarjeta según su distancia a la activa (negativa: ya pasada a la izquierda).
	const cardStyle = (index: number) => {
		const offset = index - activeIndex;
		if (offset < 0) {
			const back = offset === -1 && dragX > 0 ? 1 - progress : 1;
			return {
				transform: `translate3d(${-118 * back}%, 0, 0) rotate(${-7 * back}deg)`,
				opacity: offset === -1 ? 1 - back * 0.9 : 0,
				z: 30
			};
		}
		// Hacia la izquierda la de arriba sigue al dedo y la pila sube un escalón; hacia la derecha la
		// de arriba se queda y baja a la pila mientras la anterior entra por encima. En los extremos,
		// sin tarjeta a la que ir, la de arriba solo cede un poco.
		const hasPrevious = activeIndex > 0;
		const pull = dragX < 0 ? progress : 0;
		const push = dragX > 0 && hasPrevious ? progress : 0;
		if (offset === 0 && (dragX < 0 || !hasPrevious)) {
			const rotate = (dragX / width()) * 9;
			return { transform: `translate3d(${dragX}px, 0, 0) rotate(${rotate}deg)`, opacity: 1, z: 20 };
		}
		const depth = Math.min(offset, PILE + 1) - pull + push;
		return {
			transform: `translate3d(${depth * STEP}px, 0, 0) scale(${1 - depth * 0.035})`,
			opacity: Math.max(0, depth > PILE ? (PILE + 1 - depth) * (1 - PILE * 0.18) : 1 - depth * 0.18),
			z: 20 - offset
		};
	};

	const onpointerdown = (event: PointerEvent) => {
		if (event.pointerType === 'mouse' && event.button !== 0) return;
		start = { x: event.clientX, y: event.clientY, time: event.timeStamp, id: event.pointerId };
		axis = null;
		moved = false;
		hint = false;
	};

	const onpointermove = (event: PointerEvent) => {
		if (!start || event.pointerId !== start.id) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		if (!axis) {
			if (Math.hypot(dx, dy) < 8) return;
			axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
			if (axis === 'y') {
				start = null;
				return;
			}
			try {
				deck?.setPointerCapture(event.pointerId);
			} catch {
				// Sin captura el gesto sigue funcionando mientras el dedo no salga de la pila.
			}
			dragging = true;
		}
		moved = true;
		const atEdge = (dx < 0 && activeIndex === projects.length - 1) || (dx > 0 && activeIndex === 0);
		dragX = atEdge ? dx * 0.25 : dx;
	};

	const release = (event: PointerEvent) => {
		if (!start || event.pointerId !== start.id) return;
		const velocity = dragX / Math.max(1, event.timeStamp - start.time);
		const decided = Math.abs(dragX) > width() * 0.28 || (Math.abs(velocity) > 0.45 && Math.abs(dragX) > 40);
		if (dragging && decided) {
			if (dragX < 0 && activeIndex < projects.length - 1) activeIndex += 1;
			else if (dragX > 0 && activeIndex > 0) activeIndex -= 1;
		}
		start = null;
		dragging = false;
		dragX = 0;
	};

	const onclick = (event: MouseEvent) => {
		if (moved) {
			event.preventDefault();
			moved = false;
			return;
		}
		onopen(event, activeIndex);
	};

	// Amago la primera vez que la pila entra en pantalla: la tarjeta de arriba se aparta un poco y
	// vuelve, y la de debajo asoma.
	$effect(() => {
		const element = deck;
		if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				hint = true;
			},
			{ threshold: 0.85 }
		);
		observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<div class="w-full">
	<div
		class="relative grid touch-pan-y select-none pr-[14px] [-webkit-tap-highlight-color:transparent]"
		bind:this={deck}
		role="group"
		aria-roledescription={locale === 'es' ? 'pila de trabajos' : 'stack of works'}
		{onpointerdown}
		{onpointermove}
		onpointerup={release}
		onpointercancel={release}
	>
		{#each projects as project, index (project.slug)}
			{@const style = cardStyle(index)}
			<a
				class={`block [grid-area:1/1] origin-[50%_120%] text-inherit no-underline will-change-transform ${dragging ? '' : '[transition:transform_460ms_cubic-bezier(.2,.8,.2,1),opacity_360ms_ease] motion-reduce:[transition:opacity_200ms_ease]'} ${hint && index === activeIndex ? '[animation:deck-hint_1200ms_cubic-bezier(.45,0,.2,1)_300ms_both]' : ''}`}
				style:transform={style.transform}
				style:opacity={style.opacity}
				style:z-index={style.z}
				href={localizedPath(`/portfolio/${project.slug}`, locale)}
				tabindex={index === activeIndex ? 0 : -1}
				aria-hidden={index !== activeIndex}
				aria-label={projectText(project.title, locale)}
				draggable="false"
				{onclick}
				onanimationend={(event) => {
					if (event.target === event.currentTarget) hint = false;
				}}
			>
				<ProjectVisual visual={project.visual} label={projectText(project.kind, locale)} period={project.year} showMeta={false} mobileTall />
			</a>
		{/each}
	</div>

	{#key activeIndex}
		<div class="mt-3.5 grid gap-2 [animation:editorial-preview-in_420ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:animate-none">
			<span class="label text-ink-dim">{projectText(projects[activeIndex].kind, locale)}</span>
			<span class="font-title text-[clamp(1.2rem,5.6vw,1.6rem)] font-medium leading-[1.05] tracking-[-0.03em] text-accent-strong">
				<InlineTitle text={projectText(projects[activeIndex].title, locale)} />
			</span>
		</div>
	{/key}
</div>
