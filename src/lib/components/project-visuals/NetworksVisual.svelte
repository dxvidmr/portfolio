<script lang="ts">
	let { compact = false }: { compact?: boolean } = $props();
</script>

<svg
	class={`absolute ${compact ? 'inset-[14%_-16%_12%] h-[74%] w-[132%]' : 'inset-[10%_3%_4%] h-[86%] w-[94%]'}`}
	viewBox="0 0 640 420"
	role="presentation"
>
	<defs>
		<marker id="network-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
			<path class="fill-[#8f4142]" d="M0 0 8 4 0 8Z" />
		</marker>
	</defs>
	<g class="fill-[color-mix(in_srgb,var(--fg-faint)_28%,var(--visual-bg))] stroke-ink-faint stroke-[.8] opacity-[.48]">
		<path class="fill-none" d="M92 78 205 129M92 78 176 300M548 70 431 116M548 70 467 288M75 340 218 303M562 348 454 293" />
		<circle cx="92" cy="78" r="6" /><circle cx="548" cy="70" r="5" /><circle cx="75" cy="340" r="5" /><circle cx="562" cy="348" r="6" />
	</g>
	<g class="fill-none [marker-end:url(#network-arrow)] [stroke-linecap:round]">
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[9]" d="M230 130 C285 92 350 93 405 118" />
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[6]" d="M238 291 C292 326 358 326 414 286" />
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[3.5] opacity-[.72]" d="M214 151 C196 203 200 240 221 276" />
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[3.5] opacity-[.72]" d="M426 141 C451 194 453 235 438 270" />
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[2.2] opacity-[.62] [stroke-dasharray:4_4]" d="M238 282 C285 224 349 174 405 134" />
		<path class="stroke-[color-mix(in_srgb,#8f4142_72%,#f2b07d)] stroke-[2.2] opacity-[.62] [stroke-dasharray:4_4]" d="M414 276 C362 220 302 176 238 142" />
	</g>
	<g class="stroke-[color-mix(in_srgb,var(--fg)_40%,transparent)] stroke-1">
		<circle class="fill-[#aaa0bd]" cx="220" cy="130" r="34" />
		<circle class="fill-[#d1be5c]" cx="422" cy="120" r="40" />
		<circle class="fill-[#7baea0]" cx="228" cy="294" r="23" />
		<circle class="fill-[#f4b73b]" cx="432" cy="286" r="27" />
	</g>
	<g class="fill-[#383634] font-mono text-[9px] tracking-[.08em]">
		<text x="220" y="134" text-anchor="middle">DAMA</text><text x="422" y="124" text-anchor="middle">GALÁN</text>
		<text x="228" y="298" text-anchor="middle">CRIADA</text><text x="432" y="290" text-anchor="middle">CRIADO</text>
	</g>
</svg>

<div
	class={`absolute right-[6%] bottom-[6%] left-[6%] items-baseline justify-between gap-4 ${compact ? 'grid' : 'flex'}`}
>
	<strong class="font-title text-[clamp(1.2rem,3vw,2.7rem)] font-medium tracking-[-0.04em]">AMOR EN PARALELO</strong>
	<span class="meta text-ink-faint">DIRECCIÓN · PESO · FUNCIÓN</span>
</div>
