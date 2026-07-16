<script lang="ts">
	import { onMount } from 'svelte';

	let { onIntroComplete }: { onIntroComplete?: () => void } = $props();

	type XmlMark = { text: string; id: string };
	type TextPart = { text: string; marked: boolean; id?: string };
	type Verse = { n: string; parts: TextPart[]; segmentIds: string[] };
	type Passage = {
		id: string;
		label: string;
		speaker: string;
		range: string;
		lines: Verse[];
		scene: 'hero' | 'projects' | 'about' | 'cv';
	};

	function verse(n: string, text: string, marks: XmlMark[] = []): Verse {
		const parts: TextPart[] = [];
		let cursor = 0;

		for (const mark of marks) {
			const index = text.indexOf(mark.text, cursor);
			if (index < 0) continue;
			if (index > cursor) parts.push({ text: text.slice(cursor, index), marked: false });
			parts.push({ text: mark.text, marked: true, id: mark.id });
			cursor = index + mark.text.length;
		}

		if (cursor < text.length) parts.push({ text: text.slice(cursor), marked: false });
		if (parts.length === 0) parts.push({ text, marked: false });

		return { n, parts, segmentIds: marks.map((mark) => mark.id) };
	}

	// Fragmentos transcritos de data/fuenteovejuna.xml. El componente no carga
	// el XML en tiempo de ejecución: los identificadores y el texto quedan fijados aquí.
	const passages: Passage[] = [
		{
			id: 'arenga-inicio',
			scene: 'hero',
			label: '<sp who="#laurencia" xml:id="sp-503">',
			speaker: 'LAURENCIA',
			range: 'vv. 1725b–1741',
			lines: [
				verse('1725b', 'Por muchas razones,'),
				verse('1726', 'y sean las principales:'),
				verse('1727', 'porque dejas que me roben'),
				verse('1728', 'tiranos sin que me vengues,'),
				verse('1729', 'traidores sin que me cobres.'),
				verse('1730', 'Aún no era yo de Frondoso'),
				verse('1731', 'para que digas que tome,'),
				verse('1732', 'como marido, venganza,'),
				verse('1733', 'que aquí por tu cuenta corre:'),
				verse('1734', 'que, en tanto que de las bodas'),
				verse('1735', 'no haya llegado la noche,'),
				verse('1736', 'del padre, y no del marido,'),
				verse('1737', 'la obligación presupone;'),
				verse('1738', 'que, en tanto que no me entregan'),
				verse('1739', 'una joya, aunque la compre,'),
				verse('1740', 'no ha de correr por mi cuenta'),
				verse('1741', 'las guardas ni los ladrones.', [
					{ text: 'guardas', id: 'seg-1741-1' }
				])
			]
		},
		{
			id: 'arenga-centro',
			scene: 'hero',
			label: '<sp who="#laurencia" xml:id="sp-503">',
			speaker: 'LAURENCIA',
			range: 'vv. 1750–1764',
			lines: [
				verse('1750', 'por rendir mi castidad'),
				verse('1751', 'a sus apetitos torpes?', [
					{ text: 'apetitos torpes', id: 'seg-1751-1' }
				]),
				verse('1752', 'Mis cabellos, ¿no lo dicen?'),
				verse('1753', '¿No se ven aquí los golpes'),
				verse('1754', 'de la sangre y las señales?'),
				verse('1755', '¿Vosotros sois hombres nobles?', [
					{ text: 'nobles', id: 'seg-1755-1' }
				]),
				verse('1756', '¿Vosotros padres y deudos?', [{ text: 'deudos', id: 'seg-1756-1' }]),
				verse('1757', '¡Vosotros, que no se os rompen'),
				verse('1758', 'las entrañas de dolor'),
				verse('1759', 'de verme en tantos dolores,'),
				verse('1760', 'ovejas sois: bien lo dice', [{ text: 'ovejas sois', id: 'seg-1760-1' }]),
				verse('1761', 'de Fuenteovejuna el nombre!'),
				verse('1762', 'Dadme unas armas a mí'),
				verse('1763', 'pues sois piedras, pues sois bronces,'),
				verse('1764', 'pues sois jaspes, pues sois tigres…', [
					{ text: 'jaspes', id: 'seg-1764-1' }
				])
			]
		},
		{
			id: 'arenga-final',
			scene: 'hero',
			label: '<sp who="#laurencia" xml:id="sp-503">',
			speaker: 'LAURENCIA',
			range: 'vv. 1770–1785',
			lines: [
				verse('1770', 'liebres cobardes nacistes;', [{ text: 'nacistes', id: 'seg-1770-1' }]),
				verse('1771', 'bárbaros sois, no españoles;', [{ text: 'bárbaros', id: 'seg-1771-1' }]),
				verse('1772', 'gallinas, ¡vuestras mujeres'),
				verse('1773', 'sufrís que otros hombres gocen!', [{ text: 'sufrís', id: 'seg-1773-1' }]),
				verse('1774', 'Poneos ruecas en la cinta.', [{ text: 'cinta', id: 'seg-1774-1' }]),
				verse('1775', '¿Para qué os ceñís estoques?'),
				verse('1776', '¡Vive Dios, que he de trazar'),
				verse('1777', 'que solas mujeres cobren'),
				verse('1778', 'la honra de estos tiranos,'),
				verse('1779', 'la sangre destos traidores,'),
				verse('1780', 'y que os han de tirar piedras,', [
					{ text: 'os han de tirar piedras', id: 'seg-1780-1' }
				]),
				verse('1781', 'hilanderas, maricones,'),
				verse('1782', 'amujerados, cobardes,'),
				verse('1783', 'y que mañana os adornen'),
				verse('1784', 'nuestras tocas y basquiñas,', [
					{ text: 'tocas', id: 'seg-1784-1' },
					{ text: 'basquiñas', id: 'seg-1784-2' }
				]),
				verse('1785', 'solimanes y colores!', [
					{ text: 'solimanes', id: 'seg-1785-1' },
					{ text: 'colores', id: 'seg-1785-2' }
				])
			]
		},
		{
			id: 'frondoso',
			scene: 'about',
			label: '<sp who="#frondoso" xml:id="sp-665">',
			speaker: 'FRONDOSO',
			range: 'vv. 2191–2200',
			lines: [
				verse('2191', '¿Cómo? ¿Qué procure quieres'),
				verse('2192', 'cosa tan mal recebida?'),
				verse('2193', '¿Es bien que los demás deje'),
				verse('2194', 'en el peligro presente'),
				verse('2195', 'y de tu vista me ausente?'),
				verse('2196', 'No me mandes que me aleje,'),
				verse('2197', 'porque no es puesto en razón', [
					{ text: 'puesto en razón', id: 'seg-2197-1' }
				]),
				verse('2198', 'que por evitar mi daño,'),
				verse('2199', 'sea con mi sangre estraño'),
				verse('2200', 'en tan terrible ocasión.')
			]
		},
		{
			id: 'voces',
			scene: 'projects',
			label: '<sp who="#laurencia" xml:id="sp-666">',
			speaker: 'LAURENCIA',
			range: 'vv. 2201–2204',
			lines: [
				verse('2201', 'Voces parece que he oído,'),
				verse('2202', 'y son, si yo mal no siento,'),
				verse('2203', 'de alguno que dan tormento.'),
				verse('2204', 'Oye con atento oído.')
			]
		},
		{
			id: 'flores',
			scene: 'projects',
			label: '<sp who="#flores" xml:id="sp-10">',
			speaker: 'FLORES',
			range: 'vv. 23–31',
			lines: [
				verse('23', '¡Qué cansado es de sufrir!'),
				verse('24', '¡Qué áspero y qué importuno!'),
				verse('25', 'Llaman la descortesía'),
				verse('26', '«necedad» en los iguales,'),
				verse('27', 'porque es entre desiguales'),
				verse('28', 'linaje de tiranía.'),
				verse('29', 'Aquí no te toca nada,'),
				verse('30', 'que un muchacho aún no ha llegado'),
				verse('31', 'a saber qué es ser amado.')
			]
		},
		{
			id: 'mujeres',
			scene: 'about',
			label: '<sp who="#laurencia" xml:id="sp-517">',
			speaker: 'LAURENCIA',
			range: 'vv. 1822–1829',
			lines: [
				verse('1822', '¿No veis cómo todos van'),
				verse('1823', 'a matar a Fernán Gómez,'),
				verse('1824', 'y hombres, mozos y muchachos'),
				verse('1825', 'furiosos al hecho corren?'),
				verse('1826', '¿Será bien que solos ellos'),
				verse('1827', 'de esta hazaña el honor gocen?'),
				verse('1828', '¡Pues no son de las mujeres'),
				verse('1829', 'sus agravios los menores!')
			]
		},
		{
			id: 'pesquisidor',
			scene: 'cv',
			label: '<sp xml:id="sp-709">',
			speaker: 'JUEZ',
			range: 'vv. 2253–2257',
			lines: [
				verse('2253', '¿Hay tan gran bellaquería?'),
				verse('2254', 'Del dolor se están burlando.'),
				verse('2255', 'En quien estaba esperando,'),
				verse('2256', 'niega con mayor porfía.'),
				verse('2257', 'Dejaldos, que estoy cansado.')
			]
		},
		{
			id: 'mengo',
			scene: 'cv',
			label: '<sp who="#mengo" xml:id="sp-509">',
			speaker: 'MENGO',
			range: 'vv. 1807–1810',
			lines: [
				verse('1807', 'Ir a matarle sin orden.'),
				verse('1808', 'Juntad el pueblo a una voz,'),
				verse('1809', 'que todos están conformes'),
				verse('1810', 'en que los tiranos mueran.')
			]
		}
	];
	const placementClasses: Record<string, string> = {
		'arenga-inicio':
			'tw:top-[8vh] tw:left-[-7.5rem] tw:[--scene-x:-24vw] tw:[--scene-y:-20vh] tw:[--scene-rotation:-5deg] tw:max-[780px]:top-[7vh] tw:max-[780px]:left-[-17rem]',
		'arenga-centro':
			'tw:top-[7vh] tw:right-[-8rem] tw:[--scene-x:24vw] tw:[--scene-y:-18vh] tw:[--scene-rotation:5deg] tw:max-[780px]:top-[5vh] tw:max-[780px]:right-[-17rem]',
		'arenga-final':
			'tw:bottom-[-3.5vh] tw:left-[-6rem] tw:[--scene-x:-22vw] tw:[--scene-y:23vh] tw:[--scene-rotation:-4deg] tw:max-[780px]:bottom-[-3vh] tw:max-[780px]:left-[-17rem]',
		frondoso:
			'tw:bottom-[7vh] tw:left-[4vw] tw:w-[min(29rem,35vw)] tw:[--scene-x:-28vw] tw:[--scene-y:22vh] tw:[--scene-rotation:-5deg] tw:max-[780px]:bottom-[5vh] tw:max-[780px]:left-[-15rem] tw:max-[780px]:w-[25rem]',
		voces:
			'tw:top-[45vh] tw:right-[8vw] tw:w-[min(25rem,31vw)] tw:[--scene-x:28vw] tw:[--scene-y:22vh] tw:[--scene-rotation:6deg] tw:max-[780px]:top-[48vh] tw:max-[780px]:right-[-14rem] tw:max-[780px]:w-[23rem]',
		flores:
			'tw:top-[14vh] tw:left-[18vw] tw:w-[min(27rem,33vw)] tw:[--scene-x:-28vw] tw:[--scene-y:-22vh] tw:[--scene-rotation:-6deg] tw:max-[780px]:top-[17vh] tw:max-[780px]:left-[-9rem] tw:max-[780px]:w-[24rem]',
		mujeres:
			'tw:top-[27vh] tw:right-[10vw] tw:w-[min(28rem,34vw)] tw:[--scene-x:28vw] tw:[--scene-y:-18vh] tw:[--scene-rotation:5deg] tw:max-[780px]:top-[29vh] tw:max-[780px]:right-[-12rem] tw:max-[780px]:w-[24rem]',
		pesquisidor:
			'tw:bottom-[11vh] tw:left-[25vw] tw:w-[min(26rem,32vw)] tw:[--scene-x:-26vw] tw:[--scene-y:24vh] tw:[--scene-rotation:-5deg] tw:max-[780px]:bottom-[16vh] tw:max-[780px]:left-[-8rem] tw:max-[780px]:w-[23rem]',
		mengo:
			'tw:top-[18vh] tw:right-[16vw] tw:w-[min(25rem,31vw)] tw:[--scene-x:26vw] tw:[--scene-y:-22vh] tw:[--scene-rotation:5deg] tw:max-[780px]:top-[20vh] tw:max-[780px]:right-[-10rem] tw:max-[780px]:w-[23rem]'
	};

	let root = $state<HTMLDivElement | null>(null);

	onMount(() => {
		if (!root) return;

		const background = root;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const items = Array.from(background.querySelectorAll<HTMLElement>('.passage'));
		type Scene = Passage['scene'];
		type GlyphPosition = { node: HTMLElement; x: number; y: number };
		let glyphs: GlyphPosition[] = [];
		const glyphAnimations = new Map<HTMLElement, Animation>();
		let pointerX = 0;
		let pointerY = 0;
		let pointerFrame = 0;
		let scrollFrame = 0;
		let resizeTimer = 0;
		let sceneTimer = 0;
		let interactionAttached = false;
		let active = true;
		let currentScene: Scene | '' = '';

		const cancelGlyphAnimations = () => {
			for (const animation of glyphAnimations.values()) animation.cancel();
			glyphAnimations.clear();
		};

		const cacheGlyphs = () => {
			cancelGlyphAnimations();
			glyphs = Array.from(background.querySelectorAll<HTMLElement>('.glyph'))
				.filter(
					(node) =>
						node.textContent?.trim() &&
						node.closest<HTMLElement>('.passage')?.classList.contains('is-scene-active')
				)
				.map((node) => {
					const rect = node.getBoundingClientRect();
					return {
						node,
						x: rect.left + rect.width / 2,
						y: rect.top + rect.height / 2
					};
				})
				.filter(
					(glyph) =>
						glyph.x > -24 &&
						glyph.x < window.innerWidth + 24 &&
						glyph.y > -24 &&
						glyph.y < window.innerHeight + 24
				);
		};

		const scatterGlyph = (node: HTMLElement, force: number) => {
			const angle = Math.random() * Math.PI * 2;
			const distance = (7 + Math.random() * 14) * (0.48 + force * 0.62);
			const shiftX = Math.cos(angle) * distance;
			const shiftY = Math.sin(angle) * distance * (0.72 + Math.random() * 0.42);
			const rotation = (Math.random() - 0.5) * 26 * (0.62 + force * 0.42);
			const duration = 760 + Math.random() * 380;
			const transform = (factor: number, rotationFactor: number) =>
				`translate3d(${(shiftX * factor).toFixed(2)}px, ${(shiftY * factor).toFixed(2)}px, 0) rotate(${(rotation * rotationFactor).toFixed(2)}deg)`;

			const animation = node.animate(
				[
					{ transform: 'translate3d(0, 0, 0) rotate(0deg)', offset: 0 },
					{ transform: transform(1, 1), offset: 0.2, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
					{ transform: transform(-0.24, -0.2), offset: 0.5, easing: 'ease-out' },
					{ transform: transform(0.11, 0.08), offset: 0.7, easing: 'ease-out' },
					{ transform: transform(-0.045, -0.035), offset: 0.86, easing: 'ease-out' },
					{ transform: 'translate3d(0, 0, 0) rotate(0deg)', offset: 1 }
				],
				{ duration, easing: 'linear' }
			);

			glyphAnimations.set(node, animation);
			void animation.finished
				.then(() => {
					if (glyphAnimations.get(node) === animation) glyphAnimations.delete(node);
				})
				.catch(() => {});
		};

		const paintDisplacement = () => {
			pointerFrame = 0;
			const radius = 82;
			let scatteredCount = 0;

			for (const glyph of glyphs) {
				if (scatteredCount >= 6) break;
				if (glyphAnimations.has(glyph.node)) continue;
				const dx = glyph.x - pointerX;
				const dy = glyph.y - pointerY;
				const distance = Math.hypot(dx, dy);
				if (distance >= radius) continue;

				const force = 1 - distance / radius;
				if (Math.random() > 0.08 + force * 0.34) continue;
				scatterGlyph(glyph.node, force);
				scatteredCount += 1;
			}
		};

		const handlePointer = (event: PointerEvent) => {
			pointerX = event.clientX;
			pointerY = event.clientY;
			if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintDisplacement);
		};

		const handleResize = () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				updateScrollScene();
				if (interactionAttached) cacheGlyphs();
			}, 160);
		};

		const updateScrollScene = () => {
			scrollFrame = 0;
			const marker = window.scrollY + window.innerHeight * 0.42;
			const projectsTop = document.querySelector<HTMLElement>('#proyectos')?.offsetTop ?? Infinity;
			const aboutTop = document.querySelector<HTMLElement>('#about')?.offsetTop ?? Infinity;
			const cvTop = document.querySelector<HTMLElement>('#cv')?.offsetTop ?? Infinity;
			let nextScene: Scene = 'hero';

			if (marker >= cvTop) nextScene = 'cv';
			else if (marker >= aboutTop) nextScene = 'about';
			else if (marker >= projectsTop) nextScene = 'projects';

			if (nextScene === currentScene) return;
			currentScene = nextScene;
			background.dataset.scene = nextScene;
			cancelGlyphAnimations();

			for (const item of items) {
				item.classList.toggle('is-scene-active', item.dataset.scene === nextScene);
			}

			window.clearTimeout(sceneTimer);
			if (interactionAttached) sceneTimer = window.setTimeout(cacheGlyphs, reducedMotion ? 0 : 1250);
		};

		const handleScroll = () => {
			if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollScene);
		};

		const attachInteraction = () => {
			if (!active || interactionAttached) return;
			interactionAttached = true;
			cacheGlyphs();
			window.addEventListener('pointermove', handlePointer, { passive: true });
		};

		updateScrollScene();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		if (reducedMotion) {
			background.classList.add('is-ready', 'is-settled');
			onIntroComplete?.();
			return () => {
				window.cancelAnimationFrame(scrollFrame);
				window.clearTimeout(resizeTimer);
				window.clearTimeout(sceneTimer);
				window.removeEventListener('scroll', handleScroll);
				window.removeEventListener('resize', handleResize);
			};
		}

		background.classList.add('is-ready');
		const entranceItems = items.filter((item) => item.classList.contains('is-scene-active'));
		const animations = entranceItems.map((item, index) => {
			const rect = item.getBoundingClientRect();
			const originX = window.innerWidth / 2 - (rect.left + rect.width / 2);
			const originY = window.innerHeight / 2 - (rect.top + rect.height / 2);
			const targetOpacity = window.getComputedStyle(item).opacity;

			return item.animate(
				[
					{
						transform: `translate3d(${originX}px, ${originY}px, 0) scale(0.34) rotate(${index % 2 === 0 ? -7 : 7}deg)`,
						opacity: 0,
						filter: 'blur(14px)'
					},
					{
						offset: 0.3,
						opacity: Number(targetOpacity) * 0.3,
						filter: 'blur(5px)'
					},
					{ transform: 'translate3d(0, 0, 0) scale(1)', opacity: targetOpacity, filter: 'blur(0)' }
				],
				{
					duration: 1450 + index * 150,
					delay: 80 + index * 100,
					easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
					fill: 'none'
				}
			);
		});

		void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
			if (!active) return;
			background.classList.add('is-settled');
			onIntroComplete?.();
			void document.fonts.ready.then(attachInteraction);
		});

		return () => {
			active = false;
			animations.forEach((animation) => animation.cancel());
			window.cancelAnimationFrame(pointerFrame);
			window.cancelAnimationFrame(scrollFrame);
			window.clearTimeout(resizeTimer);
			window.clearTimeout(sceneTimer);
			window.removeEventListener('pointermove', handlePointer);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
			cancelGlyphAnimations();
		};
	});
</script>

<div
	class="editorial-background tw:pointer-events-none tw:fixed tw:inset-0 tw:z-0 tw:overflow-hidden tw:[contain:strict] tw:[&.is-ready_.passage.is-scene-active]:opacity-[.78] tw:[&.is-ready_.passage.is-scene-active]:[filter:blur(0)] tw:[&.is-ready_.passage.is-scene-active]:[transform:translate3d(0,0,0)] tw:max-[780px]:[&.is-ready_.passage.is-scene-active]:opacity-[.64]"
	bind:this={root}
	aria-hidden="true"
>
	<div
		class="tw:absolute tw:inset-0 tw:bg-[radial-gradient(ellipse_at_49%_46%,var(--bg)_0_22%,transparent_65%)] tw:opacity-[.92] tw:max-[780px]:bg-[radial-gradient(ellipse_at_46%_42%,var(--bg)_0_30%,transparent_76%)]"
	></div>

	{#each passages as passage (passage.id)}
		<article
			class={`passage tw:absolute tw:w-[min(32rem,39vw)] tw:font-mono tw:text-[clamp(.56rem,.61vw,.68rem)] tw:leading-[1.18] tw:text-[var(--text-background)] tw:opacity-0 tw:[filter:blur(4px)] tw:[transform:translate3d(var(--scene-x),var(--scene-y),0)_scale(.84)_rotate(var(--scene-rotation))] tw:[transition:opacity_760ms_ease,filter_900ms_ease,transform_1150ms_cubic-bezier(.22,1,.36,1)] tw:will-change-[opacity,filter,transform] tw:[--scene-x:0vw] tw:[--scene-y:18vh] tw:[--scene-rotation:0deg] tw:motion-reduce:[filter:none] tw:motion-reduce:[transform:none] tw:motion-reduce:duration-[1ms] tw:max-[780px]:w-[25rem] tw:max-[780px]:text-[.55rem] ${placementClasses[passage.id]}`}
			data-scene={passage.scene}
		>
			<header class="tw:flex tw:justify-between tw:gap-4 tw:text-[.82em] tw:tracking-[.045em] tw:text-[var(--text-background-strong)]">
				<span>{passage.label}</span>
				<span>{passage.range}</span>
			</header>
			<strong class="tw:mt-[.48rem] tw:mr-0 tw:mb-[.32rem] tw:ml-[3.2rem] tw:block tw:font-medium tw:tracking-[.15em] tw:text-[var(--text-background-strong)]">{passage.speaker}</strong>
			<div class="tw:grid tw:gap-[.12rem]">
				{#each passage.lines as line (line.n)}
					<div class="tw:grid tw:grid-cols-[2.65rem_minmax(0,1fr)_auto] tw:items-baseline tw:gap-[.55rem]">
						<span class="tw:text-right tw:text-[var(--text-background-faint)] tw:[font-variant-numeric:tabular-nums]">{line.n}</span>
						<p class="tw:m-0 tw:whitespace-nowrap">
							{#each line.parts as part}
								{#if part.marked}
									<mark class="tw:bg-accent-wash tw:px-[.12em] tw:text-[var(--accent-background-text)]">
										{#each [...part.text] as character}
											<span class="glyph tw:inline-block tw:whitespace-pre">{character}</span>
										{/each}
									</mark>
								{:else}
									{#each [...part.text] as character}
									<span class="glyph tw:inline-block tw:whitespace-pre">{character}</span>
									{/each}
								{/if}
							{/each}
						</p>
						{#if line.segmentIds.length}
							<small class="tw:text-[.69em] tw:tracking-[.025em] tw:text-[var(--accent-background-text)] tw:max-[780px]:hidden">{line.segmentIds.join(' · ')}</small>
						{/if}
					</div>
				{/each}
			</div>
			<footer class="tw:mt-[.38rem] tw:flex tw:justify-end tw:gap-4 tw:text-[.82em] tw:tracking-[.045em] tw:text-[var(--text-background-strong)]">&lt;/sp&gt;</footer>
		</article>
	{/each}
</div>
