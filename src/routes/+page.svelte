<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import { onMount } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import { profile, t } from '$lib/content/profile';
	import { entityLabel } from '$lib/content/labels';
	import AcademicPath from '$lib/components/AcademicPath.svelte';
	import CurrentAffiliations from '$lib/components/CurrentAffiliations.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import SelectedWorks from '$lib/components/SelectedWorks.svelte';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';

	let { data } = $props();
	let headerHidden = $state(false);
	let headerScrolled = $state(false);
	let introStarted = $state(false);
	let introReady = $state(false);
	type PortraitMode = 'researcher' | 'performer';

	let portraitMode = $state<PortraitMode>('researcher');
	let portraitPreview = $state<PortraitMode | null>(null);
	let heroProgress = $state(0);
	let heroSection = $state<HTMLElement | null>(null);
	let heroName = $state<HTMLElement | null>(null);
	let heroStatement = $state<HTMLElement | null>(null);
	let headerBrand = $state<HTMLAnchorElement | null>(null);
	let wordMotions = $state<Array<{ dx: number; dy: number; scale: number }>>([]);
	let subtextOffset = $state(0);
	const locale = $derived(localeFromPathname(page.url.pathname));
	const currentRole = $derived(t(profile.role, locale));
	const projectModalOpen = $derived(
		typeof (page.state as Record<string, unknown>)?.portfolioModal === 'string' ||
			/\/portfolio\/[^/]+\/?$/.test(page.url.pathname)
	);
	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const ease = (value: number) => value * value * (3 - 2 * value);
	const nameProgress = $derived(ease(clamp(heroProgress / 0.52)));
	// Paso a la segunda pantalla en tres tiempos, sin solapes: subtítulo y afiliación se esconden
	// hacia arriba tras su máscara mientras el nombre sube a la cabecera; un respiro; y la frase
	// emerge línea a línea desde abajo con el mismo gesto.
	const subtextExit = (index: number) => ease(clamp((heroProgress - index * 0.05) / 0.17));
	const statementLine = (index: number) => ease(clamp((heroProgress - 0.36 - index * 0.07) / 0.2));
	const heroNameOpacity = $derived(1 - ease(clamp((heroProgress - 0.3) / 0.22)));
	const headerBrandOpacity = $derived(ease(clamp((heroProgress - 0.4) / 0.12)));
	const scrollCueOpacity = $derived(1 - ease(clamp(heroProgress / 0.16)));
	const introNameAnimation = (index: number) =>
		index % 2 === 0
			? '[animation:home-intro-from-left_1180ms_cubic-bezier(.16,1,.3,1)_backwards] motion-reduce:animate-none'
			: '[animation:home-intro-from-right_1180ms_cubic-bezier(.16,1,.3,1)_backwards] motion-reduce:animate-none';

	const wordTransform = (index: number) => {
		const motion = wordMotions[index];
		if (!motion) return 'translate3d(0, 0, 0) scale(1)';
		return `translate3d(${motion.dx * nameProgress}px, ${motion.dy * nameProgress}px, 0) scale(${1 + (motion.scale - 1) * nameProgress})`;
	};

	const measureNameMotion = (includeMotion = introReady) => {
		if (!heroName || !headerBrand) return;
		const previousSubtextOffset = subtextOffset;
		const nextSubtextOffset = Math.max(0, (heroStatement?.offsetHeight ?? 0) - heroName.offsetHeight);
		subtextOffset = nextSubtextOffset;
		if (!includeMotion) return;

		const sourceWords = Array.from(heroName.querySelectorAll<HTMLElement>('.hero-name-word'));
		const targetWords = Array.from(headerBrand.querySelectorAll<HTMLElement>('.header-name-word'));
		const transforms = sourceWords.map((word) => word.style.transform);

		sourceWords.forEach((word) => {
			word.style.transform = 'none';
		});

		wordMotions = sourceWords.map((source, index) => {
			const target = targetWords[index];
			if (!target) return { dx: 0, dy: 0, scale: 1 };
			const sourceRect = source.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			return {
				dx: targetRect.left - sourceRect.left,
				dy:
					targetRect.top -
					(sourceRect.top + nextSubtextOffset - previousSubtextOffset),
				scale: targetRect.height / sourceRect.height
			};
		});

		sourceWords.forEach((word, index) => {
			word.style.transform = transforms[index];
		});
	};

	const scrollToStatement = () => {
		if (!heroSection) return;
		const distance = Math.max(heroSection.offsetHeight - window.innerHeight, 1);
		window.scrollTo({
			top: heroSection.offsetTop + distance * 0.76,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
		});
	};

	const isMouseClick = (event: MouseEvent) =>
		event.detail > 0 &&
		(event instanceof PointerEvent
			? event.pointerType === 'mouse'
			: window.matchMedia('(hover: hover) and (pointer: fine)').matches);

	const selectPortrait = (mode: PortraitMode, event: MouseEvent) => {
		if (isMouseClick(event)) return;
		portraitMode = mode;
	};

	const previewPortrait = (mode: PortraitMode, event: PointerEvent) => {
		if (event.pointerType === 'mouse') portraitPreview = mode;
	};

	const previewAlternatePortrait = (event: PointerEvent) => {
		if (event.pointerType !== 'mouse') return;
		portraitPreview = portraitMode === 'researcher' ? 'performer' : 'researcher';
	};

	const clearPortraitPreview = (event: PointerEvent) => {
		if (event.pointerType === 'mouse') portraitPreview = null;
	};

	const activePortrait = $derived(portraitPreview ?? portraitMode);

	const completeIntro = () => {
		introReady = true;
		if (typeof document !== 'undefined') document.body.classList.remove('home-intro');
		if (typeof window !== 'undefined') {
			window.requestAnimationFrame(() => measureNameMotion(true));
		}
	};

	const yr = (s: string | null) => (s ? s.slice(0, 4) : '—');
	const activitySubtypeLabel = (item: {
		subtype: string | null;
		subtype_label_es: string | null;
		subtype_label_en: string | null;
	}) =>
		(locale === 'en' ? item.subtype_label_en : item.subtype_label_es) ??
		item.subtype?.replaceAll('_', ' ') ??
		null;
	// Capítulos de «Sobre mí». Ordenador: el avance por la sección elige el capítulo que se muestra
	// en el panel fijo. Móvil: pestañas sobre un carrusel horizontal.
	const aboutChapters = $derived(locale === 'es' ? ['Perfil', 'Afiliaciones', 'Recorrido'] : ['Profile', 'Affiliations', 'Path']);
	let activeChapter = $state(0);
	let chaptersEl = $state<HTMLDivElement | null>(null);
	let chapterTrack = $state<HTMLDivElement | null>(null);
	let aboutFigure = $state<HTMLElement | null>(null);
	// Altura a la que se fijan foto y panel: centrados en la pantalla, sin subir bajo la cabecera.
	let aboutStickyTop = $state(104);
	$effect(() => {
		const panel = chapterTrack?.firstElementChild as HTMLElement | null;
		if (!aboutFigure || !panel) return;
		const update = () => {
			const height = Math.max(aboutFigure!.offsetHeight, panel.offsetHeight);
			aboutStickyTop = Math.round(Math.max(72, (window.innerHeight - height) / 2));
		};
		const observer = new ResizeObserver(update);
		observer.observe(aboutFigure);
		observer.observe(panel);
		window.addEventListener('resize', update);
		update();
		return () => {
			observer.disconnect();
			window.removeEventListener('resize', update);
		};
	});
	const isMobile = () => window.matchMedia('(max-width: 780px)').matches;
	const chapterClass = (index: number) =>
		`[grid-area:1/1] min-w-0 [transition:opacity_520ms_ease,transform_640ms_cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none max-[780px]:flex-[0_0_86%] max-[780px]:snap-start max-[780px]:!translate-y-0 max-[780px]:!opacity-100 max-[780px]:!pointer-events-auto ${
			activeChapter === index ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
		}`;
	// Recorrido que corresponde a cada capítulo dentro de la pista: [inicio, fin] en píxeles de scroll.
	const chapterTravel = () => {
		if (!chapterTrack) return null;
		const rect = chapterTrack.getBoundingClientRect();
		const panel = chapterTrack.firstElementChild as HTMLElement | null;
		const travel = Math.max(1, rect.height - (panel?.offsetHeight ?? 0));
		return { top: rect.top + window.scrollY - aboutStickyTop, travel };
	};
	const showChapter = (index: number) => {
		activeChapter = index;
		if (isMobile()) {
			const card = chaptersEl?.children[index] as HTMLElement | undefined;
			if (chaptersEl && card) chaptersEl.scrollTo({ left: card.offsetLeft - chaptersEl.offsetLeft, behavior: 'smooth' });
			return;
		}
		const track = chapterTravel();
		if (track) window.scrollTo({ top: track.top + ((index + 0.5) / aboutChapters.length) * track.travel, behavior: 'smooth' });
	};
	const syncChapter = () => {
		if (!chaptersEl || !isMobile()) return;
		const start = chaptersEl.getBoundingClientRect().left;
		const cards = Array.from(chaptersEl.children) as HTMLElement[];
		activeChapter = cards.reduce(
			(best, card, index) =>
				Math.abs(card.getBoundingClientRect().left - start) < Math.abs(cards[best].getBoundingClientRect().left - start) ? index : best,
			0
		);
	};
	$effect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			if (isMobile()) return;
			const track = chapterTravel();
			if (!track) return;
			const progress = Math.min(0.999, Math.max(0, (window.scrollY - track.top) / track.travel));
			activeChapter = Math.floor(progress * aboutChapters.length);
		};
		const onScroll = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
	const academicIcons: Record<string, string> = {
		orcid: 'ai-orcid',
		scholar: 'ai-google-scholar',
		zotero: 'ai-zotero'
	};
	const socialIcons: Record<string, string> = {
		github: 'fa-github',
		bluesky: 'fa-bluesky',
		x: 'fa-x-twitter',
		instagram: 'fa-instagram'
	};
	const sectionClass = 'wrap scroll-mt-[76px] py-[clamp(80px,12vw,180px)]';
	const sectionHeadClass = 'mb-[clamp(40px,6vw,88px)] grid gap-3';
	const sectionTitleClass = 'section-title max-w-[14ch] text-[clamp(2.6rem,6vw,5.2rem)] font-medium leading-[0.95] tracking-[-0.04em]';
	const ui = $derived({
		es: {
			navPortfolio: 'Portfolio',
			navAbout: 'Sobre mí',
			selectedWork: 'Trabajos seleccionados',
			aboutLabel: 'Perfil',
			aboutTitle: 'Sobre mí',
			aboutText:
				'Trabajo entre la filología, los estudios teatrales y las humanidades digitales, desde una mirada ligada también a la práctica escénica. Investigo la historia de la representación y recepción del teatro del Siglo de Oro, sus archivos y su edición, combinando trabajo documental, modelado de datos y métodos digitales a gran escala. Me interesa desarrollar formas sostenibles de publicar y preservar este patrimonio en la web.',
			portraitAlt: 'Retrato de David Merino Recalde',
			portraitResearcher: 'Investigador',
			portraitPerformer: 'Creador escénico',
			contactTitle: 'Contacto',
			profilesLabel: 'Perfiles y redes',
			cvTitle: 'CV',
			recentLabel: 'Actualidad',
			recentTitle: 'Actividad destacada',
			invited: 'Por invitación',
			cvCta: 'Ver el CV completo',
			tags: 'Etiquetas',
			affiliation: 'Universitat Autònoma de Barcelona',
			thesisLine1Before: 'Estudio el ',
			thesisAccent: 'teatro',
			thesisLine2: 'entre el texto, la escena',
			thesisLine3: 'y los datos.',
			heroSummary:
				'Filología y métodos digitales para editar, analizar y preservar el teatro del Siglo de Oro.',
			scrollHint: 'DESPLAZAR PARA LEER'
		},
		en: {
			navPortfolio: 'Portfolio',
			navAbout: 'About',
			selectedWork: 'Selected work',
			aboutLabel: 'Profile',
			aboutTitle: 'About me',
			aboutText:
				'I work across philology, theatre studies, and digital humanities, from a perspective also rooted in theatre practice. I study the performance and reception history of Spanish Golden Age theatre, its archives, and its editing, combining documentary research, data modelling, and large-scale digital methods. I am interested in developing sustainable ways to publish and preserve this heritage on the web.',
			portraitAlt: 'Portrait of David Merino Recalde',
			portraitResearcher: 'Researcher',
			portraitPerformer: 'Theatre practitioner',
			contactTitle: 'Contact',
			profilesLabel: 'Profiles and networks',
			cvTitle: 'CV',
			recentLabel: 'Now',
			recentTitle: 'Highlights',
			invited: 'Invited',
			cvCta: 'View the full CV',
			tags: 'Tags',
			affiliation: 'Universitat Autònoma de Barcelona',
			thesisLine1Before: 'I study ',
			thesisAccent: 'theatre',
			thesisLine2: 'where text, performance',
			thesisLine3: 'and data meet.',
			heroSummary:
				'Philology and digital methods to edit, analyse, and preserve Spanish Golden Age theatre.',
			scrollHint: 'SCROLL TO READ'
		}
	}[locale]);

	onMount(() => {
		document.body.classList.add('home-page');
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			introStarted = true;
			completeIntro();
		} else {
			document.body.classList.add('home-intro');
			window.requestAnimationFrame(() => (introStarted = true));
		}
		let lastScrollY = window.scrollY;
		let frame = 0;
		let resizeTimer = 0;
		const introFallback = window.setTimeout(completeIntro, reducedMotion ? 0 : 4200);

		const updateHeader = () => {
			frame = 0;
			const currentScrollY = window.scrollY;
			const delta = currentScrollY - lastScrollY;
			const heroDistance = heroSection
				? Math.max(heroSection.offsetHeight - window.innerHeight, 1)
				: window.innerHeight;
			const rawHeroProgress = heroSection
				? clamp((currentScrollY - heroSection.offsetTop) / heroDistance)
				: 0;
			heroProgress = reducedMotion ? (rawHeroProgress > 0.08 ? 1 : 0) : rawHeroProgress;
			const nextHeaderScrolled = currentScrollY > 20 && heroProgress > 0.34;
			if (nextHeaderScrolled !== headerScrolled) {
				headerScrolled = nextHeaderScrolled;
				window.requestAnimationFrame(() => measureNameMotion(true));
			}

			if (heroProgress < 0.98 || currentScrollY < 72) {
				headerHidden = false;
			} else if (delta > 2) {
				headerHidden = true;
			} else if (delta < -2) {
				headerHidden = false;
			}

			lastScrollY = currentScrollY;
		};

		const handleScroll = () => {
			if (!frame) frame = window.requestAnimationFrame(updateHeader);
		};

		const handleResize = () => {
			window.clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				measureNameMotion();
				updateHeader();
			}, 120);
		};

		window.requestAnimationFrame(() => measureNameMotion(false));
		void document.fonts.ready.then(() => measureNameMotion(introReady));
		updateHeader();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize, { passive: true });

		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(introFallback);
			window.clearTimeout(resizeTimer);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
			document.body.classList.remove('home-page', 'home-intro');
		};
	});
</script>

<div class="home relative isolate flex flex-col">
	<EditorialBackground onIntroComplete={completeIntro} />

	{#if !projectModalOpen}
		<SiteHeader
			{locale}
			onHome
			scrolled={headerScrolled}
			hidden={headerHidden}
			brandOpacity={headerBrandOpacity}
			bind:brand={headerBrand}
		/>
	{/if}

	<section class="relative z-[1] h-[220svh]" bind:this={heroSection}>
		<div class="wrap sticky top-0 grid h-svh grid-rows-[1fr_auto] gap-[clamp(32px,6vh,64px)] overflow-hidden pt-[clamp(112px,16vh,168px)] pb-[clamp(22px,4vh,42px)] max-[780px]:pt-[104px]">
			<div class="grid max-w-[1080px] grid-cols-[minmax(0,1fr)] content-center max-[780px]:grid-cols-1 max-[780px]:items-start">
				<div class="relative isolate min-w-0 before:pointer-events-none before:absolute before:inset-[clamp(-5rem,-7vw,-3rem)_-9vw] before:z-[-1] before:bg-[radial-gradient(ellipse_at_38%_48%,color-mix(in_srgb,var(--bg)_98%,transparent)_0_42%,color-mix(in_srgb,var(--bg)_84%,transparent)_58%,transparent_80%)] before:content-['']" data-text-bg-avoid>
					<h1
						class={`absolute inset-x-0 z-10 m-0 flex flex-wrap gap-x-[.28em] gap-y-0 font-title text-[clamp(3.2rem,7.15vw,7.2rem)] font-medium leading-[.92] tracking-[-.045em] max-[780px]:text-[clamp(3rem,13.5vw,5.6rem)] max-[780px]:leading-[.9] max-[520px]:text-[clamp(2.8rem,13.6vw,4.4rem)] ${introStarted ? 'visible' : 'invisible'}`}
						bind:this={heroName}
						style:top={`${subtextOffset}px`}
						style:opacity={heroNameOpacity}
					>
						{#each profile.name.split(' ') as word, index (word)}
							<span
								class={`hero-name-word inline-block origin-top-left will-change-transform ${introStarted ? introNameAnimation(index) : 'invisible'}`}
								style:animation-delay={`${90 + index * 90}ms`}
								style:transform={wordTransform(index)}
							>{word}</span>
						{/each}
					</h1>

					<div
						id="hero-statement"
						class="pointer-events-none"
						bind:this={heroStatement}
					>
						<p class="m-0 font-title text-[clamp(3.2rem,7.15vw,7.2rem)] font-medium leading-[.92] tracking-[-.045em] max-[780px]:text-[clamp(3rem,13.5vw,5.6rem)] max-[780px]:leading-[.9] max-[520px]:text-[clamp(2.8rem,13.6vw,4.4rem)]">
							{#each [`${ui.thesisLine1Before}${ui.thesisAccent}`, ui.thesisLine2, ui.thesisLine3] as line, index (index)}
								<span class="-mb-[.12em] block overflow-hidden pb-[.12em]">
									<span
										class="block will-change-transform motion-reduce:!transform-none"
										style:opacity={statementLine(index)}
										style:transform={`translate3d(0, ${(1 - statementLine(index)) * 105}%, 0)`}
									>{line}</span>
								</span>
							{/each}
						</p>
					</div>

					<!-- Subtítulo y afiliación acompañan al nombre y se esconden con él antes de que entre la frase. -->
					<div class={introStarted ? 'visible' : 'invisible'}>
						<div class="mt-[clamp(25px,4vh,40px)] overflow-hidden">
						<div class="will-change-transform motion-reduce:!transform-none" style:opacity={1 - subtextExit(0)} style:transform={`translate3d(0, ${-subtextExit(0) * 105}%, 0)`}>
						<p class={`m-0 max-w-[54ch] font-title text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.35] text-ink-dim max-[520px]:text-base ${introStarted ? '[animation:home-intro-from-bottom_980ms_cubic-bezier(.16,1,.3,1)_500ms_backwards] motion-reduce:animate-none' : ''}`}>{ui.heroSummary}</p>
						</div>
						</div>
						<div class="mt-4 overflow-hidden">
						<div class="will-change-transform motion-reduce:!transform-none" style:opacity={1 - subtextExit(1)} style:transform={`translate3d(0, ${-subtextExit(1) * 105}%, 0)`}>
						<p class={`label m-0 block ${introStarted ? '[animation:home-intro-from-bottom_920ms_cubic-bezier(.16,1,.3,1)_610ms_backwards] motion-reduce:animate-none' : ''}`}>{ui.affiliation}</p>
						</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class={`grid place-items-center ${introReady ? '[animation:home-intro-from-bottom_1050ms_cubic-bezier(.16,1,.3,1)_300ms_backwards] motion-reduce:animate-none' : 'invisible'}`}
				style:opacity={scrollCueOpacity}
			>
				<button
					class="grid h-[42px] w-[42px] cursor-pointer place-items-center border-0 bg-transparent p-0 text-ink-faint [animation:home-scroll-cue_1700ms_ease-in-out_infinite] hover:text-accent-strong motion-reduce:animate-none"
					type="button"
					onclick={scrollToStatement}
					aria-label={ui.scrollHint}
					title={ui.scrollHint}
				>
					<ChevronDown size={30} strokeWidth={1.4} aria-hidden="true" />
				</button>
			</div>
		</div>
	</section>

	<main class="relative z-[1] pb-[88px]">
		<section id="portfolio" class={sectionClass}>
			<div class={sectionHeadClass}>
				<h2 class={sectionTitleClass}>{ui.selectedWork}</h2>
			</div>
			<SelectedWorks {locale} relatedItems={data.portfolioItems} projectIndex={data.portfolioProjects} />
		</section>

		<section id="about" class={`${sectionClass} relative isolate overflow-x-clip before:pointer-events-none before:absolute before:top-[16%] before:left-[-10vw] before:z-[-2] before:aspect-square before:w-[min(52vw,720px)] before:rounded-full before:bg-accent before:opacity-[.11] before:[filter:blur(150px)] before:content-['']`}>
			<div class={`${sectionHeadClass} mb-[clamp(38px,6vw,78px)]`}>
				<h2 class={sectionTitleClass}>{ui.aboutTitle}</h2>
			</div>

			<div class="relative grid grid-cols-[minmax(240px,4fr)_minmax(0,7fr)] items-start gap-[clamp(34px,7vw,112px)] before:pointer-events-none before:absolute before:inset-[-5vw] before:z-[-1] before:bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] before:[backdrop-filter:blur(7px)] before:[mask-image:radial-gradient(ellipse_at_center,#000_38%,transparent_78%)] before:content-[''] max-[780px]:grid-cols-1 max-[780px]:gap-[42px]">
				<figure class="sticky m-0 max-[780px]:static max-[780px]:w-full" style:top={`${aboutStickyTop}px`} bind:this={aboutFigure}>
					<!-- Proporción 4:5 fija: si no cabe de alto, la foto se estrecha en lugar de recortarse. -->
					<div
						class="relative block w-[min(100%,max(200px,calc((100svh-380px)*0.8)))] overflow-hidden rounded-ui border border-rule-strong bg-[#777] max-[780px]:w-full"
						onpointerenter={previewAlternatePortrait}
						onpointerleave={clearPortraitPreview}
						role="img"
						aria-label={ui.portraitAlt}
					>
						<img
							class={`block h-auto w-full [transition:opacity_700ms_ease] motion-reduce:transition-none ${activePortrait === 'researcher' ? 'opacity-100' : 'opacity-0'}`}
							src="/images/about/david-merino-recalde-researcher.jpg"
							alt=""
							width="820"
							height="1024"
							loading="lazy"
						/>
						<img
							class={`pointer-events-none absolute inset-0 h-full w-full object-cover object-[72%_50%] [transition:opacity_700ms_ease] motion-reduce:transition-none ${activePortrait === 'performer' ? 'opacity-100' : 'opacity-0'}`}
							src="/images/about/david-merino-recalde-stage.jpg"
							alt=""
							width="1368"
							height="912"
							loading="lazy"
							aria-hidden="true"
						/>
					</div>
					<figcaption class="mt-2.5 grid gap-4">
						<span class="label flex min-w-0 items-center gap-2">
							<button
								class={`cursor-pointer border-0 border-b bg-transparent p-0 pb-0.5 font-mono font-semibold tracking-[.08em] uppercase [transition:color_700ms_ease,border-color_700ms_ease] ${activePortrait === 'researcher' ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint'}`}
								type="button"
								onclick={(event) => selectPortrait('researcher', event)}
								onpointerenter={(event) => previewPortrait('researcher', event)}
								onpointerleave={clearPortraitPreview}
								aria-pressed={portraitMode === 'researcher'}
							>{ui.portraitResearcher}</button>
							<span class="text-ink-faint opacity-50" aria-hidden="true">/</span>
							<button
								class={`cursor-pointer border-0 border-b bg-transparent p-0 pb-0.5 font-mono font-semibold tracking-[.08em] uppercase [transition:color_700ms_ease,border-color_700ms_ease] ${activePortrait === 'performer' ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint'}`}
								type="button"
								onclick={(event) => selectPortrait('performer', event)}
								onpointerenter={(event) => previewPortrait('performer', event)}
								onpointerleave={clearPortraitPreview}
								aria-pressed={portraitMode === 'performer'}
							>{ui.portraitPerformer}</button>
						</span>
						<div class="mt-4 w-fit max-w-full border-l-2 border-accent-strong pl-4">
							<p class="m-0 max-w-[24ch] font-title text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.2] text-ink">{currentRole.title}</p>
							<p class="mt-2 mb-0 text-[.72rem] leading-[1.4] text-ink-dim">{currentRole.department}</p>
							<p class="label mt-1.5 mb-0 text-ink-faint">{currentRole.institution}</p>
							<p class="mt-3 mb-0 border-t border-rule pt-3 text-[.66rem] leading-[1.4] text-accent-strong">{currentRole.funding}</p>
						</div>
					</figcaption>
				</figure>

				<!-- Ordenador: el recorrido por la sección elige el capítulo, que se sustituye en un panel fijo
				     junto a la foto. Móvil: pestañas sobre un carrusel horizontal. -->
				<div
					class="relative min-w-0 max-[780px]:!h-auto"
					style:height={`${aboutChapters.length * 78}svh`}
					bind:this={chapterTrack}
				>
					<div class="sticky max-[780px]:static" style:top={`${aboutStickyTop}px`}>
						<div class="mb-[clamp(20px,3vw,34px)] flex gap-6" role="tablist" aria-label={ui.aboutTitle}>
							{#each aboutChapters as chapter, index (chapter)}
								<button
									type="button"
									role="tab"
									aria-selected={activeChapter === index}
									class={`label cursor-pointer border-0 border-b bg-transparent p-0 pb-1 [transition:color_300ms_ease,border-color_300ms_ease] ${activeChapter === index ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint hover:text-ink-dim'}`}
									onclick={() => showChapter(index)}
								>{chapter}</button>
							{/each}
						</div>
						<div
							class="grid max-[780px]:mr-[calc(-1*var(--gutter))] max-[780px]:flex max-[780px]:gap-8 max-[780px]:overflow-x-auto max-[780px]:overscroll-x-contain max-[780px]:snap-x max-[780px]:snap-mandatory max-[780px]:pr-[var(--gutter)] max-[780px]:pb-2"
							bind:this={chaptersEl}
							onscroll={syncChapter}
						>
							<div class={chapterClass(0)} aria-label={aboutChapters[0]}>
								<p class="mt-0 mb-[clamp(22px,3vw,36px)] max-w-[34ch] font-title text-[clamp(1.3rem,2.1vw,1.85rem)] leading-[1.3] tracking-[-0.015em] text-ink max-[780px]:text-[1.15rem]">{ui.aboutText}</p>
					<ul class="m-0 flex list-none flex-wrap gap-x-3 gap-y-[7px] p-0 max-[520px]:gap-1.5">
								{#each t(profile.areas, locale) as area (area)}
									<li class="label inline-flex items-center gap-3 after:text-rule-strong after:content-['/'] last:after:content-none max-[520px]:rounded-full max-[520px]:border max-[520px]:border-rule max-[520px]:px-2.5 max-[520px]:py-1.5 max-[520px]:text-[.68rem] max-[520px]:after:hidden">{area}</li>
								{/each}
							</ul>
							</div>
							<div class={chapterClass(1)} aria-label={aboutChapters[1]}>
								<CurrentAffiliations {locale} />
							</div>
							<div class={chapterClass(2)} aria-label={aboutChapters[2]}>
								<AcademicPath {locale} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<footer class="mt-[clamp(28px,4vw,54px)] grid grid-cols-[minmax(260px,.8fr)_minmax(0,1.2fr)] items-start gap-[clamp(30px,6vw,92px)] border-t border-rule bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--bg)_72%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))] py-[clamp(24px,3vw,38px)] [backdrop-filter:blur(12px)] max-[780px]:grid-cols-1 max-[780px]:items-start">
				<div class="grid justify-items-start gap-1">
					<span class="label mb-2.5">{ui.contactTitle}</span>
					<a class="font-title text-[clamp(1.1rem,2vw,1.55rem)] leading-[1.2]" href={'mailto:' + profile.contact.mail}>{profile.contact.mail}</a>
					<a class="font-mono text-[.72rem] text-ink-faint" href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a>
				</div>
				<nav class="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-6 gap-y-2" aria-label={ui.profilesLabel}>
					<span class="label col-span-full mb-2.5">{ui.profilesLabel}</span>
					{#each profile.profiles as item (item.id)}
						<a class="label inline-flex items-center gap-2 py-1 hover:text-accent-strong" href={item.url} target="_blank" rel="noreferrer" title={`${item.label}: ${item.handle}`}>
							{#if academicIcons[item.id]}
								<i class="ai {academicIcons[item.id]} min-w-[18px] text-center text-base font-bold leading-none not-italic text-accent-strong" aria-hidden="true"></i>
							{:else if socialIcons[item.id]}
								<i class="fa-brands {socialIcons[item.id]} min-w-[18px] text-center text-base font-bold leading-none not-italic text-accent-strong" aria-hidden="true"></i>
							{/if}
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>
			</footer>
		</section>

		<section id="cv" class={sectionClass}>
			<div class={`${sectionHeadClass} grid-cols-[minmax(0,1fr)_auto] items-end gap-6 max-[620px]:grid-cols-1`}>
				<h2 class={sectionTitleClass}>{ui.cvTitle}</h2>
				<a class="group label inline-flex items-center gap-2 pb-[.6em] text-accent-strong no-underline hover:text-ink focus-visible:text-ink" href={localizedPath('/cv', locale)}>
					{ui.cvCta}
					<span class="[transition:transform_220ms_cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none" aria-hidden="true"><ArrowRight size={16} strokeWidth={1.6} /></span>
				</a>
			</div>
			<section aria-labelledby="recent-activity-title">
				<header class="mb-5 grid gap-3">
					<h3 class="label m-0 font-normal" id="recent-activity-title">{ui.recentTitle}</h3>
				</header>
				<ol class="m-0 list-none border-t border-rule p-0">
				{#each data.recentActivity as e, i (e.entity_type + e.entity_id)}
					<li class="relative grid grid-cols-[minmax(190px,.62fr)_minmax(0,1.38fr)] gap-[clamp(20px,4vw,60px)] border-b border-rule py-[clamp(22px,3vw,36px)] max-[700px]:grid-cols-1 max-[700px]:gap-4">
						<div class="grid grid-cols-[minmax(0,1fr)_42px] gap-3">
								<span class="grid content-start justify-items-start gap-1.5">
									<span class="label text-accent-strong">{entityLabel(e.entity_type, locale)}</span>
									{#if activitySubtypeLabel(e)}
										<span class="text-[.9rem] leading-[1.3] text-ink-dim">{activitySubtypeLabel(e)}</span>
									{/if}
									{#if e.metadata?.kind === 'event' && e.metadata.invited}
										<span class="label mt-1 bg-accent-wash px-1.5 py-0.5 text-accent-strong">{ui.invited}</span>
									{/if}
								</span>
								<span class="label text-right text-ink-faint">{yr(e.sort_date)}</span>
						</div>
						<div class="min-w-0">
							{#if e.target_url}
								<a class="group m-0 flex items-start justify-between gap-[18px] font-title text-[clamp(1.15rem,1.9vw,1.6rem)] leading-[1.15] tracking-[-0.015em] text-ink no-underline" href={e.target_url} target="_blank" rel="noreferrer">
									<span><InlineTitle text={e.title} /></span>
									<span class="mt-[2px] grid h-[22px] w-[22px] flex-[0_0_22px] place-items-center text-accent-strong [transition:transform_180ms_ease] group-hover:translate-x-0.5 group-hover:translate-y-[-2px] group-focus-visible:translate-x-0.5 group-focus-visible:translate-y-[-2px] motion-reduce:transition-none" aria-hidden="true">
										<MoveUpRight size={22} strokeWidth={1.7} />
									</span>
								</a>
							{:else}
								<p class="m-0 font-title text-[clamp(1.15rem,1.9vw,1.6rem)] leading-[1.15] tracking-[-0.015em] text-ink"><InlineTitle text={e.title} /></p>
							{/if}
							{#if e.metadata}
								<p class="mt-[10px] mb-0 max-w-[72ch] text-[.72rem] leading-[1.45] text-ink-faint"><EntryMetadata metadata={e.metadata} {locale} hideInvitation title={e.title} /></p>
							{/if}
						</div>
					</li>
				{/each}
				</ol>
			</section>
		</section>
	</main>
</div>
