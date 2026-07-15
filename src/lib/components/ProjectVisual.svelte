<script lang="ts">
	import type { ProjectVisual } from '$lib/content/projects';

	let {
		visual,
		label,
		period,
		compact = false
	}: { visual: ProjectVisual; label: string; period: string; compact?: boolean } = $props();

	type ReceptionNode = { x: number; y: number; r: number; degree?: 'work' | 'place' | 'mid' };
	type ReceptionEdge = { a: number; b: number; bend: number };

	const receptionNodes: ReceptionNode[] = [
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

	const receptionEdges: ReceptionEdge[] = [
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

	function receptionPath(edge: ReceptionEdge): string {
		const start = receptionNodes[edge.a];
		const end = receptionNodes[edge.b];
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const length = Math.hypot(dx, dy) || 1;
		const cx = (start.x + end.x) / 2 - (dy / length) * edge.bend;
		const cy = (start.y + end.y) / 2 + (dx / length) * edge.bend;
		return `M ${start.x} ${start.y} Q ${cx} ${cy} ${end.x} ${end.y}`;
	}
</script>

<div class="project-visual visual-{visual}" class:is-compact={compact} aria-hidden="true">
	<div class="visual-meta meta">
		<span>{label}</span>
		<span>{period}</span>
	</div>

	{#if visual === 'fuenteovejuna'}
		<svg class="reception-map" viewBox="0 0 640 440" role="presentation">
			<g class="reception-edges">
				{#each receptionEdges as edge}
					<path d={receptionPath(edge)} />
				{/each}
			</g>
			<g class="reception-nodes">
				{#each receptionNodes as node}
					<circle
						cx={node.x}
						cy={node.y}
						r={node.r}
						class:node-work={node.degree === 'work'}
						class:node-place={node.degree === 'place'}
						class:node-mid={node.degree === 'mid'}
					/>
				{/each}
			</g>
			<g class="reception-labels">
				<text x="306" y="287" text-anchor="middle">OBRA</text>
				<text x="474" y="250" text-anchor="middle">LUGAR</text>
				<text x="382" y="76" text-anchor="middle">LUGAR</text>
			</g>
		</svg>
		<div class="reception-copy">
			<span class="meta">1619 — PRESENTE</span>
			<strong>TODOS A UNA</strong>
			<span class="meta">EDICIÓN · ARCHIVO · PARTICIPACIÓN</span>
		</div>
	{:else if visual === 'versologia'}
		<div class="metric-model">
			<div class="metric-path meta"><span>OBRA</span><i></i><span>JORNADA</span><i></i><span>CUADRO</span></div>
			<div class="metric-barcode">
				{#each [18, 9, 14, 5, 21, 8, 12, 4, 9] as width, index}
					<i class="form-{index % 4}" style={`--segment: ${width}`}></i>
				{/each}
			</div>
			<div class="sequence-table meta">
				<span>001</span><b>QUINTILLA</b><em>1—235</em>
				<span>002</span><b>ROMANCE</b><em>236—399</em>
				<span>003</span><b>REDONDILLA</b><em>400—614</em>
			</div>
		</div>
		<div class="distance-matrix">
			{#each [12, 36, 67, 24, 36, 14, 45, 78, 67, 45, 10, 52, 24, 78, 52, 8] as tone}<i style={`--tone: ${tone}%`}></i>{/each}
		</div>
		<div class="metric-caption meta">SECUENCIAS → PERFIL → DISTANCIA</div>
	{:else if visual === 'etso'}
		<div class="etso-stylometry">
			<svg class="dendrogram" viewBox="0 0 360 180" role="presentation">
				<g class="dendrogram-lines">
					<path d="M92 28H142M92 67H142M142 28V67M142 47.5H218" />
					<path d="M92 113H170M92 152H170M170 113V152M170 132.5H218" />
					<path d="M218 47.5V132.5M218 90H310" />
				</g>
				<g class="dendrogram-nodes">
					<circle cx="142" cy="47.5" r="4" /><circle cx="170" cy="132.5" r="4" /><circle cx="218" cy="90" r="5" />
				</g>
				<g class="dendrogram-labels">
					<text x="5" y="32">LOPE</text><text x="5" y="71">MORETO</text>
					<text x="5" y="117">TIRSO</text><text x="5" y="156">CALDERÓN</text>
				</g>
			</svg>
			<div class="lexical-signals meta"><span>HONOR</span><span>MERCED</span><span>AMOR</span><span>SEÑOR</span></div>
			<div class="etso-matrix" aria-hidden="true">
				{#each [8, 28, 63, 45, 28, 8, 52, 74, 63, 52, 8, 34, 45, 74, 34, 8] as tone}
					<i style={`--distance: ${tone}%`}></i>
				{/each}
			</div>
			<span class="matrix-label meta">DISTANCIA LÉXICA</span>
		</div>
		<div class="etso-search">
			<span class="meta">TEXORO</span><strong>«constancia»</strong><i></i><em class="meta">1.407 OCURRENCIAS</em>
		</div>
	{:else if visual === 'networks'}
		<svg class="parallel-network" viewBox="0 0 640 420" role="presentation">
			<defs><marker id="network-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 8 4 0 8Z" /></marker></defs>
			<g class="parallel-periphery">
				<path d="M92 78 205 129M92 78 176 300M548 70 431 116M548 70 467 288M75 340 218 303M562 348 454 293" />
				<circle cx="92" cy="78" r="6" /><circle cx="548" cy="70" r="5" /><circle cx="75" cy="340" r="5" /><circle cx="562" cy="348" r="6" />
			</g>
			<g class="parallel-edges">
				<path class="edge-love" d="M230 130 C285 92 350 93 405 118" />
				<path class="edge-mirror" d="M238 291 C292 326 358 326 414 286" />
				<path class="edge-service" d="M214 151 C196 203 200 240 221 276" />
				<path class="edge-service" d="M426 141 C451 194 453 235 438 270" />
				<path class="edge-message" d="M238 282 C285 224 349 174 405 134" />
				<path class="edge-message" d="M414 276 C362 220 302 176 238 142" />
			</g>
			<g class="parallel-nodes">
				<circle class="node-dama" cx="220" cy="130" r="34" />
				<circle class="node-galan" cx="422" cy="120" r="40" />
				<circle class="node-criada" cx="228" cy="294" r="23" />
				<circle class="node-criado" cx="432" cy="286" r="27" />
			</g>
			<g class="parallel-labels">
				<text x="220" y="134" text-anchor="middle">DAMA</text><text x="422" y="124" text-anchor="middle">GALÁN</text>
				<text x="228" y="298" text-anchor="middle">CRIADA</text><text x="432" y="290" text-anchor="middle">CRIADO</text>
			</g>
		</svg>
		<div class="network-title"><strong>AMOR EN PARALELO</strong><span class="meta">DIRECCIÓN · PESO · FUNCIÓN</span></div>
	{:else if visual === 'editions'}
		<div class="edition-board">
			<div class="edited-text">
				<span class="meta">LOPE DE VEGA</span>
				<strong>Comedia famosa</strong>
				<i></i><i></i><i></i><i></i>
				<em>nota</em>
			</div>
			<div class="tei-layer">
				<span>&lt;teiHeader&gt;</span>
				<span>&lt;text&gt;</span>
				<strong>&lt;note/&gt;</strong>
			</div>
			<div class="web-layer">
				<span></span>
				<i></i><i></i><i></i>
			</div>
			<div class="corpus-strip">
				<i></i><i></i><i></i><i></i><i></i>
			</div>
		</div>
	{:else}
		<div class="stage-board">
			<div class="stage-note meta">PRÁCTICA ESCÉNICA</div>
			<div class="stage-script" aria-hidden="true">
				<span>JORNADA</span><i></i><i></i><strong>ENTRA</strong><i></i><i></i><i></i>
			</div>
			<div class="rehearsal-floor" aria-hidden="true">
				<svg viewBox="0 0 320 210" preserveAspectRatio="none">
					<path d="M42 162 C92 88 142 184 188 92 S260 50 285 128" />
					<path d="M68 52 C132 72 104 136 170 150 S236 124 270 58" />
				</svg>
				<b class="actor actor-a"></b><b class="actor actor-b"></b><b class="actor actor-c"></b>
				<span>CUERPO</span><span>VOZ</span><span>ESPACIO</span>
			</div>
			<div class="stage-years meta"><span>2018</span><i></i><span>2024</span><i></i><span>2026</span></div>
		</div>
	{/if}
</div>

<style>
	.project-visual {
		position: relative;
		isolation: isolate;
		width: 100%;
		aspect-ratio: 16 / 11;
		overflow: hidden;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--visual-bg);
		color: var(--fg);
	}

	.project-visual::before {
		position: absolute;
		z-index: -2;
		inset: 0;
		background:
			linear-gradient(90deg, var(--visual-grid) 1px, transparent 1px),
			linear-gradient(0deg, var(--visual-grid) 1px, transparent 1px);
		background-size: 28px 28px;
		content: '';
		opacity: 0.55;
	}

	.project-visual::after {
		position: absolute;
		z-index: 8;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E");
		content: '';
		mix-blend-mode: multiply;
		opacity: 0.12;
		pointer-events: none;
	}

	.visual-meta {
		position: absolute;
		z-index: 10;
		top: 16px;
		right: 18px;
		left: 18px;
		display: flex;
		justify-content: space-between;
		gap: 16px;
		color: currentColor;
	}

	.visual-fuenteovejuna {
		background: #ddd7d6;
		color: #383634;
	}

	.reception-map {
		position: absolute;
		inset: 2% 1% 4%;
		width: 98%;
		height: 94%;
	}

	.reception-edges {
		fill: none;
		stroke: #8f4142;
		stroke-width: 0.85;
		opacity: 0.34;
	}

	.reception-nodes circle {
		fill: color-mix(in srgb, #ddd7d6 84%, white);
		stroke: color-mix(in srgb, #8f4142 45%, #ddd7d6);
		stroke-width: 0.8;
	}

	.reception-nodes .node-mid {
		fill: color-mix(in srgb, #8f4142 42%, #ddd7d6);
		stroke: color-mix(in srgb, #8f4142 68%, #ddd7d6);
	}
	.reception-nodes .node-place {
		fill: color-mix(in srgb, #8f4142 72%, #ddd7d6);
		stroke: #8f4142;
		stroke-width: 1.4;
	}
	.reception-nodes .node-work { fill: #8f4142; stroke: #383634; stroke-width: 2; }

	.reception-labels {
		fill: #383634;
		font-family: var(--font-mono);
		font-size: 7px;
		letter-spacing: 0.14em;
	}

	.reception-labels text:first-child { fill: #383634; }

	.reception-copy {
		position: absolute;
		z-index: 3;
		bottom: 6%;
		left: 6%;
		display: grid;
		gap: 5px;
		padding: 12px 14px;
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, #ddd7d6 78%, transparent);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
	}

	.reception-copy strong {
		font-family: var(--font-title);
		font-size: clamp(1.7rem, 4vw, 3.5rem);
		font-weight: 550;
		line-height: 0.9;
		letter-spacing: -0.04em;
	}

	.reception-copy span { font-size: clamp(0.38rem, 0.7vw, 0.55rem); }

	.visual-versologia {
		background: color-mix(in srgb, #d4aa42 8%, var(--visual-bg));
	}

	.metric-model {
		position: absolute;
		top: 20%;
		left: 7%;
		width: 62%;
		display: grid;
		gap: clamp(14px, 2vw, 24px);
	}

	.metric-path { display: flex; align-items: center; gap: 9px; color: var(--fg-faint); }
	.metric-path i { width: clamp(16px, 3vw, 42px); height: 1px; background: #d4aa42; }
	.metric-barcode { display: flex; height: clamp(24px, 4vw, 44px); overflow: hidden; border-radius: var(--radius-sm); }
	.metric-barcode i { flex-grow: var(--segment); min-width: 3px; background: #c41b22; }
	.metric-barcode .form-1 { background: #e56e08; }
	.metric-barcode .form-2 { background: #ff9e38; }
	.metric-barcode .form-3 { background: #1979a3; }
	.sequence-table { display: grid; grid-template-columns: 30px 1fr auto; gap: 0 12px; border-top: 1px solid var(--line-strong); }
	.sequence-table span, .sequence-table b, .sequence-table em { padding-block: 7px; border-bottom: 1px solid var(--line); font-style: normal; }
	.sequence-table span, .sequence-table em { color: var(--fg-faint); }
	.sequence-table b { font-weight: 500; }
	.distance-matrix { position: absolute; right: 7%; bottom: 17%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; width: 17%; aspect-ratio: 1; transform: rotate(2deg); }
	.distance-matrix i { border-radius: 2px; background: color-mix(in srgb, #d4aa42 var(--tone), var(--visual-bg)); }
	.metric-caption { position: absolute; right: 7%; bottom: 8%; color: var(--fg-faint); }

	.is-compact .metric-model { top: 18%; right: 9%; left: 9%; width: auto; }
	.is-compact .distance-matrix { display: none; }
	.is-compact .metric-caption { right: 9%; left: 9%; }
	.is-compact .sequence-table { grid-template-columns: 26px 1fr; }
	.is-compact .sequence-table em { display: none; }

	@media (max-width: 520px) {
		.metric-model { right: 8%; left: 8%; width: auto; }
		.distance-matrix { display: none; }
	}

	.visual-etso {
		background: color-mix(in srgb, #003a92 8%, var(--visual-bg));
	}

	.etso-stylometry {
		position: absolute;
		top: 16%;
		right: 7%;
		left: 7%;
		height: 48%;
	}
	.dendrogram { position: absolute; top: 0; left: 0; width: 61%; height: 100%; overflow: visible; }
	.dendrogram-lines { fill: none; stroke: #003a92; stroke-width: 1.35; opacity: .72; }
	.dendrogram-nodes { fill: #003a92; }
	.dendrogram-labels { fill: var(--fg-dim); font-family: var(--font-mono); font-size: 10px; letter-spacing: .08em; }
	.lexical-signals { position: absolute; top: 1%; left: 49%; display: grid; gap: 7px; color: var(--fg-faint); transform: rotate(-4deg); }
	.lexical-signals span:nth-child(2) { margin-left: 24px; color: #003a92; font-size: 1.35em; }
	.lexical-signals span:nth-child(3) { margin-left: 8px; }
	.lexical-signals span:nth-child(4) { margin-left: 36px; color: #003a92; }
	.etso-matrix { position: absolute; top: 12%; right: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; width: 24%; aspect-ratio: 1; transform: rotate(2deg); }
	.etso-matrix i { border-radius: 2px; background: color-mix(in srgb, #003a92 var(--distance), var(--visual-bg)); }
	.matrix-label { position: absolute; right: 0; bottom: 0; width: 24%; color: var(--fg-faint); text-align: center; }
	.etso-search { position: absolute; right: 7%; bottom: 9%; left: 22%; display: grid; grid-template-columns: auto 1fr auto; gap: 7px 14px; align-items: center; padding: clamp(12px, 2vw, 20px); border-radius: var(--radius); background: color-mix(in srgb, #003a92 8%, var(--bg)); box-shadow: 9px 9px 0 color-mix(in srgb, #003a92 16%, transparent); }
	.etso-search span { grid-column: 1 / -1; color: #003a92; }
	.etso-search strong { font-family: var(--font-title); font-size: clamp(1.2rem, 3vw, 2.5rem); font-weight: 450; }
	.etso-search i { height: 1px; background: var(--line-strong); }
	.etso-search em { color: var(--fg-faint); font-style: normal; white-space: nowrap; }
	.is-compact .etso-stylometry { top: 17%; right: 9%; left: 9%; height: 42%; }
	.is-compact .dendrogram { width: 100%; }
	.is-compact .lexical-signals { display: none; }
	.is-compact .etso-matrix { top: auto; right: 0; bottom: -8%; width: 31%; }
	.is-compact .matrix-label { display: none; }
	.is-compact .etso-search { right: 9%; bottom: 9%; left: 9%; grid-template-columns: 1fr; }
	.is-compact .etso-search i { display: none; }
	.is-compact .etso-search em { font-size: .42rem; }
	@media (max-width: 520px) {
		.etso-search { left: 8%; }
		.etso-search em { display: none; }
	}

	.visual-networks { background: color-mix(in srgb, #aaa0bd 14%, var(--visual-bg)); }
	.parallel-network { position: absolute; inset: 10% 3% 4%; width: 94%; height: 86%; }
	.parallel-network marker path { fill: #8f4142; }
	.parallel-periphery { fill: color-mix(in srgb, var(--fg-faint) 28%, var(--visual-bg)); stroke: var(--fg-faint); stroke-width: .8; opacity: .48; }
	.parallel-periphery path { fill: none; }
	.parallel-edges { fill: none; stroke-linecap: round; marker-end: url(#network-arrow); }
	.parallel-edges path { stroke: color-mix(in srgb, #8f4142 72%, #f2b07d); }
	.parallel-edges .edge-love { stroke-width: 9; }
	.parallel-edges .edge-mirror { stroke-width: 6; }
	.parallel-edges .edge-service { stroke-width: 3.5; opacity: .72; }
	.parallel-edges .edge-message { stroke-width: 2.2; stroke-dasharray: 4 4; opacity: .62; }
	.parallel-nodes circle { stroke: color-mix(in srgb, var(--fg) 40%, transparent); stroke-width: 1; }
	.parallel-nodes .node-dama { fill: #aaa0bd; }
	.parallel-nodes .node-galan { fill: #d1be5c; }
	.parallel-nodes .node-criada { fill: #7baea0; }
	.parallel-nodes .node-criado { fill: #f4b73b; }
	.parallel-labels { fill: #383634; font-family: var(--font-mono); font-size: 9px; letter-spacing: .08em; }
	.network-title { position: absolute; right: 6%; bottom: 6%; left: 6%; display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
	.network-title strong { font-family: var(--font-title); font-size: clamp(1.2rem, 3vw, 2.7rem); font-weight: 500; letter-spacing: -.04em; }
	.network-title span { color: var(--fg-faint); }
	.is-compact .parallel-network { inset: 14% -16% 12%; width: 132%; height: 74%; }
	.is-compact .network-title { display: grid; }

	.visual-editions { background: color-mix(in srgb, #2f7f7a 13%, var(--visual-bg)); }
	.edition-board {
		position: absolute;
		inset: 13% 7% 10%;
	}
	.edited-text {
		position: absolute;
		top: 4%;
		left: 3%;
		display: grid;
		width: 46%;
		min-height: 70%;
		gap: 10px;
		align-content: start;
		padding: clamp(16px, 3vw, 28px);
		border: 1px solid color-mix(in srgb, #2f7f7a 32%, var(--line-strong));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--bg) 80%, transparent);
		box-shadow: 12px 12px 0 color-mix(in srgb, #2f7f7a 13%, transparent);
	}
	.edited-text .meta { color: #2f7f7a; }
	.edited-text strong {
		font-family: var(--font-title);
		font-size: clamp(1.25rem, 3vw, 2.6rem);
		font-weight: 450;
		line-height: .95;
		letter-spacing: -.04em;
	}
	.edited-text i {
		height: 1px;
		background: color-mix(in srgb, var(--fg-faint) 65%, transparent);
	}
	.edited-text i:nth-of-type(1) { width: 86%; }
	.edited-text i:nth-of-type(2) { width: 72%; }
	.edited-text i:nth-of-type(3) { width: 92%; }
	.edited-text i:nth-of-type(4) { width: 58%; }
	.edited-text em {
		justify-self: end;
		margin-top: 8px;
		padding: 5px 9px;
		border-left: 2px solid #2f7f7a;
		color: var(--fg-faint);
		font-family: var(--font-mono);
		font-size: clamp(.42rem, .72vw, .58rem);
		font-style: normal;
		text-transform: uppercase;
	}
	.tei-layer {
		position: absolute;
		top: 12%;
		right: 6%;
		display: grid;
		width: 35%;
		gap: 6px;
		padding: clamp(12px, 2vw, 20px);
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, #2f7f7a 16%, var(--bg));
		font-family: var(--font-mono);
		font-size: clamp(.46rem, .88vw, .68rem);
		transform: rotate(2deg);
	}
	.tei-layer span { color: var(--fg-faint); }
	.tei-layer strong { color: #2f7f7a; font-weight: 500; }
	.web-layer {
		position: absolute;
		right: 10%;
		bottom: 19%;
		display: grid;
		width: 30%;
		height: 29%;
		align-content: start;
		gap: 10px;
		padding: 12px;
		border: 1px solid color-mix(in srgb, #2f7f7a 42%, var(--line-strong));
		border-radius: var(--radius-sm);
		background: color-mix(in srgb, var(--bg) 76%, transparent);
	}
	.web-layer span {
		width: 42%;
		height: 14px;
		border-radius: 999px;
		background: #2f7f7a;
	}
	.web-layer i { height: 1px; background: var(--fg-faint); }
	.web-layer i:nth-of-type(2) { width: 72%; }
	.web-layer i:nth-of-type(3) { width: 52%; }
	.corpus-strip {
		position: absolute;
		right: 4%;
		bottom: 2%;
		left: 20%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 5px;
	}
	.corpus-strip i {
		height: clamp(14px, 3vw, 28px);
		border-radius: 3px;
		background: color-mix(in srgb, #2f7f7a 32%, var(--visual-bg));
	}
	.corpus-strip i:nth-child(2),
	.corpus-strip i:nth-child(5) { background: color-mix(in srgb, #2f7f7a 58%, var(--visual-bg)); }

	.visual-stage { background: color-mix(in srgb, #68495f 20%, var(--visual-bg)); }
	.stage-board { position: absolute; inset: 12% 8% 9%; }
	.stage-note { position: absolute; top: 0; left: 0; color: color-mix(in srgb, #68495f 82%, var(--fg)); }
	.stage-script {
		position: absolute;
		top: 17%;
		left: 0;
		display: grid;
		width: 31%;
		gap: clamp(5px, 1vw, 10px);
		padding: 6% 4%;
		border-radius: 4px;
		background: color-mix(in srgb, var(--visual-bg) 84%, white);
		box-shadow: 0 18px 44px color-mix(in srgb, #31202d 16%, transparent);
		transform: rotate(-3deg);
	}
	.stage-script span, .stage-script strong { font-family: var(--font-mono); font-size: clamp(.34rem, .7vw, .56rem); font-style: normal; }
	.stage-script span { color: var(--fg-faint); }.stage-script strong { width: max-content; padding: 2px 5px; background: color-mix(in srgb, #68495f 26%, transparent); color: var(--fg); font-weight: 600; }
	.stage-script i { width: 100%; height: 1px; background: var(--line-strong); }.stage-script i:nth-of-type(2), .stage-script i:nth-of-type(5) { width: 72%; }
	.rehearsal-floor {
		position: absolute;
		top: 9%;
		right: 0;
		width: 62%;
		aspect-ratio: 1.52;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, #68495f 50%, var(--line-strong));
		border-radius: 50% 50% 8px 8px;
		background: radial-gradient(circle at 50% 4%, color-mix(in srgb, #68495f 17%, transparent), transparent 56%);
	}
	.rehearsal-floor::after { position: absolute; right: 8%; bottom: 9%; left: 8%; height: 1px; background: var(--line-strong); content: ''; }
	.rehearsal-floor svg { position: absolute; inset: 8%; width: 84%; height: 78%; fill: none; stroke: color-mix(in srgb, #68495f 58%, var(--fg-faint)); stroke-dasharray: 3 7; stroke-width: 1.2; }
	.actor { position: absolute; z-index: 1; width: clamp(8px, 1.5vw, 15px); aspect-ratio: 1; border: 2px solid color-mix(in srgb, #68495f 70%, var(--fg)); border-radius: 50%; background: var(--visual-bg); box-shadow: 0 0 0 5px color-mix(in srgb, #68495f 10%, transparent); }
	.actor-a { top: 30%; left: 25%; }.actor-b { top: 57%; left: 54%; }.actor-c { top: 24%; right: 17%; }
	.rehearsal-floor span { position: absolute; color: var(--fg-faint); font-family: var(--font-mono); font-size: clamp(.3rem, .6vw, .48rem); }
	.rehearsal-floor span:nth-of-type(1) { top: 12%; left: 34%; }.rehearsal-floor span:nth-of-type(2) { top: 50%; right: 8%; }.rehearsal-floor span:nth-of-type(3) { bottom: 5%; left: 10%; }
	.stage-years { position: absolute; right: 0; bottom: 0; display: flex; width: 62%; align-items: center; gap: 8px; color: var(--fg-faint); }
	.stage-years i { flex: 1; height: 1px; background: color-mix(in srgb, #68495f 50%, var(--line)); }

	.is-compact {
		aspect-ratio: 4 / 5;
	}

	.is-compact .reception-map { inset: 4% -18% 9%; width: 130%; height: 87%; }
	.is-compact .reception-copy { right: 6%; }

	@media (max-width: 840px) {
		.project-visual,
		.is-compact { aspect-ratio: 16 / 11; }
	}
</style>
