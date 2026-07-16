<script lang="ts">
	type ReceptionNode = { x: number; y: number; r: number; degree?: 'work' | 'place' | 'mid' };
	type ReceptionEdge = { a: number; b: number; bend: number };

	let { compact = false }: { compact?: boolean } = $props();

	const nodes: ReceptionNode[] = [
		{ x: 306, y: 252, r: 22, degree: 'work' },
		{ x: 474, y: 224, r: 15, degree: 'place' },
		{ x: 382, y: 98, r: 12, degree: 'place' },
		{ x: 220, y: 172, r: 8, degree: 'mid' },
		{ x: 246, y: 326, r: 7, degree: 'mid' },
		{ x: 397, y: 307, r: 8, degree: 'mid' },
		{ x: 522, y: 315, r: 6, degree: 'mid' },
		{ x: 151, y: 267, r: 6, degree: 'mid' },
		{ x: 282, y: 91, r: 6, degree: 'mid' },
		{ x: 545, y: 154, r: 5, degree: 'mid' },
		{ x: 112, y: 188, r: 4 }, { x: 83, y: 125, r: 3.5 },
		{ x: 164, y: 111, r: 4 }, { x: 193, y: 74, r: 3 },
		{ x: 252, y: 53, r: 3.5 }, { x: 334, y: 47, r: 3 },
		{ x: 433, y: 53, r: 3.5 }, { x: 493, y: 81, r: 3 },
		{ x: 570, y: 99, r: 4 }, { x: 599, y: 177, r: 3 },
		{ x: 579, y: 251, r: 4 }, { x: 600, y: 341, r: 3.5 },
		{ x: 548, y: 377, r: 3 }, { x: 468, y: 365, r: 4 },
		{ x: 414, y: 394, r: 3 }, { x: 337, y: 371, r: 4 },
		{ x: 287, y: 405, r: 3 }, { x: 205, y: 384, r: 3.5 },
		{ x: 141, y: 354, r: 4 }, { x: 83, y: 315, r: 3 },
		{ x: 49, y: 252, r: 3.5 }, { x: 181, y: 229, r: 3 },
		{ x: 261, y: 212, r: 3.5 }, { x: 346, y: 190, r: 4 },
		{ x: 430, y: 175, r: 3 }, { x: 454, y: 276, r: 3.5 },
		{ x: 360, y: 326, r: 3 }, { x: 197, y: 304, r: 3.5 }
	];

	const edges: ReceptionEdge[] = [
		{ a: 0, b: 1, bend: -20 }, { a: 0, b: 2, bend: 18 }, { a: 0, b: 3, bend: -13 },
		{ a: 0, b: 4, bend: 16 }, { a: 0, b: 5, bend: -12 }, { a: 0, b: 6, bend: 25 },
		{ a: 0, b: 7, bend: -18 }, { a: 0, b: 8, bend: 14 }, { a: 0, b: 9, bend: -28 },
		{ a: 0, b: 10, bend: 12 }, { a: 0, b: 14, bend: -20 }, { a: 0, b: 20, bend: 25 },
		{ a: 0, b: 23, bend: -18 }, { a: 0, b: 25, bend: 10 }, { a: 0, b: 28, bend: -16 },
		{ a: 1, b: 5, bend: 12 }, { a: 1, b: 6, bend: -10 }, { a: 1, b: 9, bend: 14 },
		{ a: 1, b: 16, bend: -20 }, { a: 1, b: 17, bend: 11 }, { a: 1, b: 18, bend: -16 },
		{ a: 1, b: 19, bend: 18 }, { a: 1, b: 20, bend: -12 }, { a: 1, b: 21, bend: 20 },
		{ a: 1, b: 22, bend: -14 }, { a: 1, b: 23, bend: 12 }, { a: 1, b: 34, bend: -9 },
		{ a: 1, b: 35, bend: 10 }, { a: 2, b: 8, bend: -10 }, { a: 2, b: 14, bend: 12 },
		{ a: 2, b: 15, bend: -14 }, { a: 2, b: 16, bend: 16 }, { a: 2, b: 17, bend: -11 },
		{ a: 2, b: 33, bend: 10 }, { a: 2, b: 34, bend: -13 }, { a: 3, b: 10, bend: 10 },
		{ a: 3, b: 11, bend: -14 }, { a: 3, b: 12, bend: 9 }, { a: 3, b: 13, bend: -11 },
		{ a: 3, b: 14, bend: 12 }, { a: 3, b: 31, bend: -9 }, { a: 3, b: 32, bend: 8 },
		{ a: 4, b: 7, bend: 11 }, { a: 4, b: 25, bend: -12 }, { a: 4, b: 26, bend: 15 },
		{ a: 4, b: 27, bend: -9 }, { a: 4, b: 28, bend: 13 }, { a: 4, b: 29, bend: -12 },
		{ a: 4, b: 37, bend: 8 }, { a: 5, b: 23, bend: -11 }, { a: 5, b: 24, bend: 13 },
		{ a: 5, b: 25, bend: -8 }, { a: 5, b: 35, bend: 10 }, { a: 5, b: 36, bend: -9 },
		{ a: 6, b: 20, bend: 10 }, { a: 6, b: 21, bend: -13 }, { a: 6, b: 22, bend: 11 },
		{ a: 7, b: 28, bend: -8 }, { a: 7, b: 29, bend: 10 }, { a: 7, b: 30, bend: -12 }
	];

	function path(edge: ReceptionEdge): string {
		const start = nodes[edge.a];
		const end = nodes[edge.b];
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const length = Math.hypot(dx, dy) || 1;
		const cx = (start.x + end.x) / 2 - (dy / length) * edge.bend;
		const cy = (start.y + end.y) / 2 + (dx / length) * edge.bend;
		return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
	}
</script>

<svg
	class={`tw:absolute ${compact ? 'tw:inset-[4%_-18%_9%] tw:h-[87%] tw:w-[130%]' : 'tw:inset-[2%_1%_4%] tw:h-[94%] tw:w-[98%]'}`}
	viewBox="0 0 640 440"
	role="presentation"
>
	<g class="tw:fill-none tw:stroke-[#8f4142] tw:stroke-[0.85] tw:opacity-[.34]">
		{#each edges as edge}<path d={path(edge)} />{/each}
	</g>
	<g>
		{#each nodes as node}
			<circle
				class={node.degree === 'work'
					? 'tw:fill-[#8f4142] tw:stroke-[#383634] tw:stroke-2'
					: node.degree === 'place'
						? 'tw:fill-[color-mix(in_srgb,#8f4142_72%,#ddd7d6)] tw:stroke-[#8f4142] tw:stroke-[1.4]'
						: node.degree === 'mid'
							? 'tw:fill-[color-mix(in_srgb,#8f4142_42%,#ddd7d6)] tw:stroke-[color-mix(in_srgb,#8f4142_68%,#ddd7d6)] tw:stroke-[0.8]'
							: 'tw:fill-[color-mix(in_srgb,#ddd7d6_84%,white)] tw:stroke-[color-mix(in_srgb,#8f4142_45%,#ddd7d6)] tw:stroke-[0.8]'}
				cx={node.x}
				cy={node.y}
				r={node.r}
			/>
		{/each}
	</g>
	<g class="tw:fill-[#383634] tw:font-mono tw:text-[7px] tw:tracking-[0.14em]">
		<text x="306" y="287" text-anchor="middle">OBRA</text>
		<text x="474" y="250" text-anchor="middle">LUGAR</text>
		<text x="382" y="76" text-anchor="middle">LUGAR</text>
	</g>
</svg>

<div
	class={`tw:absolute tw:bottom-[6%] tw:left-[6%] tw:z-[3] tw:grid tw:gap-[5px] tw:rounded-ui-sm tw:bg-[color-mix(in_srgb,#ddd7d6_78%,transparent)] tw:px-3.5 tw:py-3 tw:[backdrop-filter:blur(8px)] ${compact ? 'tw:right-[6%]' : ''}`}
>
	<span class="meta tw:text-[clamp(.38rem,.7vw,.55rem)]">1619 — PRESENTE</span>
	<strong class="tw:font-title tw:text-[clamp(1.7rem,4vw,3.5rem)] tw:font-[550] tw:leading-[0.9] tw:tracking-[-0.04em]">TODOS A UNA</strong>
	<span class="meta tw:text-[clamp(.38rem,.7vw,.55rem)]">EDICIÓN · ARCHIVO · PARTICIPACIÓN</span>
</div>
