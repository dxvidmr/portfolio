<!-- Sistema público de ilustraciones conceptuales mínimas. -->
<script module lang="ts">
	export type MinimalMotif = 'reception' | 'metrics' | 'etso' | 'networks' | 'edition' | 'stage';
	export type MinimalStyle = 'line' | 'solid' | 'editorial';
</script>

<script lang="ts">
	let {
		motif,
		style
	}: {
		motif: MinimalMotif;
		style: MinimalStyle;
	} = $props();

	const styleVars = $derived(
		style === 'line'
			? '--key-fill:var(--cover-paper);--soft-fill:transparent;--stroke-width:1.35;--ghost-opacity:.22'
			: style === 'solid'
				? '--key-fill:var(--cover-accent);--soft-fill:color-mix(in srgb,var(--cover-accent) 22%,var(--cover-paper));--stroke-width:2.1;--ghost-opacity:.12'
				: '--key-fill:color-mix(in srgb,var(--cover-accent) 14%,var(--cover-paper));--soft-fill:color-mix(in srgb,var(--cover-accent) 9%,var(--cover-paper));--stroke-width:1.15;--ghost-opacity:.3'
	);
</script>

<svg
	class="h-full w-full overflow-visible"
	viewBox="0 0 620 390"
	fill="none"
	style={styleVars}
	aria-hidden="true"
>
	<defs>
		<marker id={`arrow-${motif}-${style}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
			<path d="M0 0 8 4 0 8Z" fill="var(--cover-accent)" />
		</marker>
	</defs>

	{#if motif === 'reception'}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<path d="M46 310H574" opacity=".35" />
			<path d="M74 302V318M196 302V318M326 300V320M444 302V318M556 302V318" />
			<path d="M74 240C142 172 226 238 326 133S480 97 556 61" stroke="var(--cover-accent)" stroke-width="2.2" />
			<path d="M74 240C168 274 231 266 326 133M196 215C254 188 280 162 326 133M326 133C385 188 408 212 444 231M326 133C416 98 471 83 556 61" stroke-dasharray="4 8" opacity=".5" />
			<circle cx="74" cy="240" r="13" fill="var(--soft-fill)" />
			<circle cx="196" cy="215" r="10" fill="var(--soft-fill)" />
			<circle cx="326" cy="133" r="34" fill="var(--key-fill)" stroke-width="2.4" />
			<circle cx="444" cy="231" r="12" fill="var(--soft-fill)" />
			<circle cx="556" cy="61" r="16" fill="var(--soft-fill)" />
			<circle cx="133" cy="130" r="5" /><circle cx="260" cy="278" r="5" /><circle cx="493" cy="142" r="5" />
		</g>
		<g fill="currentColor" font-family="monospace" font-size="9" letter-spacing="1.2">
			<text x="326" y="137" text-anchor="middle">OBRA</text>
			<text x="74" y="346" text-anchor="middle">1619</text><text x="196" y="346" text-anchor="middle">1900</text>
			<text x="326" y="346" text-anchor="middle">1935</text><text x="444" y="346" text-anchor="middle">1970</text>
			<text x="556" y="346" text-anchor="middle">HOY</text>
		</g>

	{:else if motif === 'metrics'}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<path d="M55 69H565M55 319H565" opacity=".28" />
			<rect x="55" y="94" width="510" height="52" rx="4" fill="var(--soft-fill)" />
			<path d="M122 94V146M182 94V146M278 94V146M326 94V146M451 94V146M504 94V146" />
			<rect x="182" y="94" width="96" height="52" fill="var(--key-fill)" stroke="none" />
			<path d="M55 262C112 233 147 247 184 201S261 170 305 216 379 257 424 196 503 172 565 211" stroke="var(--cover-accent)" stroke-width="2.4" />
			<path d="M55 282H565" stroke-dasharray="3 7" opacity=".36" />
			<circle cx="184" cy="201" r="7" fill="var(--cover-paper)" /><circle cx="305" cy="216" r="7" fill="var(--cover-paper)" /><circle cx="424" cy="196" r="7" fill="var(--cover-paper)" />
		</g>
		<g fill="currentColor" font-family="monospace" font-size="9" letter-spacing="1.1">
			<text x="55" y="54">OBRA → JORNADA → SECUENCIA</text>
			<text x="55" y="171">ROM.</text><text x="191" y="124">REDONDILLA</text><text x="458" y="171">QUINT.</text>
			<text x="55" y="345">PERFIL MÉTRICO</text>
		</g>

	{:else if motif === 'etso'}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<rect x="42" y="42" width="536" height="306" rx="7" fill="var(--soft-fill)" />
			<path d="M42 84H578" /><circle cx="65" cy="63" r="4" fill="var(--cover-accent)" /><circle cx="80" cy="63" r="4" /><circle cx="95" cy="63" r="4" />
			<rect x="64" y="106" width="154" height="220" rx="3" fill="var(--key-fill)" />
			<path d="M87 137H121M87 176H121M121 137V176M121 156.5H172M87 242H137M87 281H137M137 242V281M137 261.5H172M172 156.5V261.5M172 209H202" />
			<circle cx="121" cy="156.5" r="4" fill="var(--cover-accent)" /><circle cx="137" cy="261.5" r="4" fill="var(--cover-accent)" /><circle cx="172" cy="209" r="5" fill="var(--cover-accent)" />
			<rect x="244" y="106" width="309" height="58" rx="3" />
			<path d="M266 129H442M266 143H389" opacity=".42" />
			<rect x="244" y="184" width="142" height="142" rx="3" />
			<path d="M263 208H361M263 228H344M263 248H370M263 268H330" opacity=".42" />
			<rect x="408" y="184" width="145" height="142" rx="3" />
			{#each [0, 1, 2, 3] as row}
				{#each [0, 1, 2, 3] as col}
					<rect x={430 + col * 25} y={207 + row * 24} width="17" height="16" rx="2" fill={row === col ? 'var(--cover-accent)' : 'var(--soft-fill)'} stroke="none" opacity={row === col ? 0.8 : 1} />
				{/each}
			{/each}
		</g>
		<g fill="currentColor" font-family="monospace" font-size="8.5" letter-spacing="1.1">
			<text x="64" y="99">AUTORÍAS</text><text x="244" y="99">TEXORO / BÚSQUEDA</text>
			<text x="244" y="342">SITIO WEB · CORPUS · ESTILOMETRÍA</text>
		</g>

	{:else if motif === 'networks'}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<path d="M136 102C225 54 329 68 446 105" stroke-width="5" opacity=".28" marker-end={`url(#arrow-${motif}-${style})`} />
			<path d="M146 282C232 318 341 312 457 273" stroke-width="3.4" opacity=".5" marker-end={`url(#arrow-${motif}-${style})`} />
			<path d="M136 117C163 178 165 220 150 264M446 125C419 178 423 220 452 254" stroke-width="2" marker-end={`url(#arrow-${motif}-${style})`} />
			<path d="M158 119 432 258M430 125 168 267" stroke-dasharray="4 8" opacity=".38" marker-end={`url(#arrow-${motif}-${style})`} />
			<circle cx="130" cy="104" r="42" fill="var(--key-fill)" />
			<circle cx="454" cy="110" r="51" fill="var(--soft-fill)" />
			<circle cx="148" cy="281" r="28" fill="var(--soft-fill)" />
			<circle cx="463" cy="272" r="34" fill="var(--key-fill)" />
			<circle cx="297" cy="194" r="8" fill="var(--cover-accent)" />
		</g>
		<g fill="currentColor" font-family="monospace" font-size="9" letter-spacing="1.1">
			<text x="130" y="108" text-anchor="middle">DAMA</text><text x="454" y="114" text-anchor="middle">GALÁN</text>
			<text x="148" y="285" text-anchor="middle">A</text><text x="463" y="276" text-anchor="middle">B</text>
			<text x="297" y="220" text-anchor="middle">INTERACCIÓN</text>
		</g>

	{:else if motif === 'edition'}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<rect x="42" y="55" width="164" height="276" rx="4" fill="var(--soft-fill)" />
			<path d="M67 93H178M67 117H162M67 141H184M67 165H145M67 213H181M67 237H159M67 261H173" opacity=".45" />
			<path d="M67 188H182" stroke="var(--cover-accent)" stroke-width="3" />
			<path d="M225 192H274" marker-end={`url(#arrow-${motif}-${style})`} />
			<rect x="288" y="91" width="128" height="202" rx="4" fill="var(--key-fill)" />
			<path d="M317 129 303 147 317 165M387 129 401 147 387 165M333 119 370 177M318 209H387M318 231H371M318 253H392" />
			<path d="M430 192H468" marker-end={`url(#arrow-${motif}-${style})`} />
			<rect x="480" y="117" width="102" height="150" rx="4" fill="var(--soft-fill)" />
			<rect x="495" y="136" width="72" height="20" rx="3" fill="var(--cover-accent)" stroke="none" opacity=".75" />
			<path d="M495 179H567M495 197H554M495 215H561M495 233H532" opacity=".45" />
		</g>
		<g fill="currentColor" font-family="monospace" font-size="8.5" letter-spacing="1.1">
			<text x="42" y="44">DOCUMENTO</text><text x="288" y="80">XML—TEI</text><text x="480" y="106">WEB</text>
			<text x="42" y="358">EDITAR → ESTRUCTURAR → PUBLICAR</text>
		</g>

	{:else}
		<g stroke="currentColor" stroke-width="var(--stroke-width)">
			<path d="M70 329V145C70 80 126 44 194 44H426C494 44 550 80 550 145V329" stroke-width="2.2" />
			<path d="M70 329H550M118 289H502M168 250H452" opacity=".38" />
			<path d="M104 309 168 250M516 309 452 250" />
			<path d="M134 266C193 177 244 304 307 191S419 112 478 231" stroke="var(--cover-accent)" stroke-width="2.6" />
			<path d="M158 111C239 137 198 214 302 224S424 190 465 112" stroke-dasharray="5 9" opacity=".5" />
			<circle cx="174" cy="224" r="14" fill="var(--soft-fill)" />
			<circle cx="307" cy="191" r="18" fill="var(--key-fill)" />
			<circle cx="430" cy="157" r="12" fill="var(--soft-fill)" />
			<path d="M174 238V285M307 209V285M430 169V285" opacity=".45" />
		</g>
		<g fill="currentColor" font-family="monospace" font-size="9" letter-spacing="1.1">
			<text x="70" y="360">CUERPO</text><text x="289" y="360">VOZ</text><text x="489" y="360">ESPACIO</text>
			<text x="310" y="68" text-anchor="middle">ESCENARIO</text>
		</g>
	{/if}
</svg>
