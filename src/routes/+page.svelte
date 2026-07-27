<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Menu from '@lucide/svelte/icons/menu';
	import MoveUpRight from '@lucide/svelte/icons/move-up-right';
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import { profile, t } from '$lib/content/profile';
	import { entityLabel } from '$lib/content/labels';
	import AcademicPath from '$lib/components/AcademicPath.svelte';
	import CurrentAffiliations from '$lib/components/CurrentAffiliations.svelte';
	import EntryMetadata from '$lib/components/EntryMetadata.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import SelectedWorks from '$lib/components/SelectedWorks.svelte';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';

	let { data } = $props();
	let headerHidden = $state(false);
	let headerScrolled = $state(false);
	let introStarted = $state(false);
	let introReady = $state(false);
	let mobileMenuOpen = $state(false);
	let mobileMenuButton = $state<HTMLButtonElement | null>(null);
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
	const statementProgress = $derived(ease(clamp((heroProgress - 0.3) / 0.28)));
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
	const sectionClass = 'wrap scroll-mt-[76px] py-[clamp(48px,8vw,96px)]';
	const sectionHeadClass = 'mb-[26px] grid gap-3';
	const sectionTitleClass = 'max-w-[760px] text-[clamp(1.45rem,4vw,3rem)] leading-[1.05]';
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
			recentTitle: 'Actividad reciente',
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
			recentTitle: 'Recent activity',
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
	<header
		class={`site-header fixed inset-x-0 top-0 z-20 border-b border-transparent py-3.5 [transition:transform_260ms_cubic-bezier(.22,1,.36,1),padding_220ms_ease,background-color_220ms_ease,border-color_220ms_ease] motion-reduce:duration-[1ms] max-[780px]:bg-[var(--surface-glass)] max-[780px]:py-2 max-[780px]:[backdrop-filter:blur(14px)] ${headerHidden ? '[transform:translateY(-110%)]' : ''} ${headerScrolled ? 'border-rule bg-[var(--surface-glass)] py-2 [backdrop-filter:blur(14px)]' : ''} ${introReady ? '[animation:home-intro-from-top_880ms_cubic-bezier(.16,1,.3,1)_backwards] motion-reduce:animate-none' : 'invisible'}`}
	>
		<div class="wrap flex items-center justify-between gap-6 max-[780px]:gap-2.5 max-[420px]:gap-1.5">
			<a
				class="flex min-w-0 items-center hover:text-inherit"
				href={localizedPath('/', locale)}
				aria-label={profile.name}
				bind:this={headerBrand}
				style:opacity={headerBrandOpacity}
			>
				<strong class="inline-flex gap-[.28em] whitespace-nowrap font-title text-[1.02rem] font-normal leading-[1.1] max-[520px]:text-[.9rem]">
					{#each profile.name.split(' ') as word (word)}
						<span class="header-name-word">{word}</span>
					{/each}
				</strong>
			</a>
			<nav class="meta flex items-center gap-[clamp(14px,2.3vw,30px)] max-[780px]:hidden" aria-label="Principal">
				<a class="inline-flex items-baseline gap-[7px] text-ink-dim max-[780px]:gap-0 max-[780px]:text-[.62rem] max-[520px]:text-[.57rem] max-[520px]:tracking-[.08em] max-[420px]:text-[.52rem] max-[420px]:tracking-[.05em]" href="#portfolio"><span class="text-[.58rem] tracking-normal text-accent max-[780px]:hidden">01</span>{ui.navPortfolio}</a>
				<a class="inline-flex items-baseline gap-[7px] text-ink-dim max-[780px]:gap-0 max-[780px]:text-[.62rem] max-[520px]:text-[.57rem] max-[520px]:tracking-[.08em] max-[420px]:text-[.52rem] max-[420px]:tracking-[.05em]" href="#about"><span class="text-[.58rem] tracking-normal text-accent max-[780px]:hidden">02</span>{ui.navAbout}</a>
				<a class="inline-flex items-baseline gap-[7px] text-ink-dim max-[780px]:gap-0 max-[780px]:text-[.62rem] max-[520px]:text-[.57rem] max-[520px]:tracking-[.08em] max-[420px]:text-[.52rem] max-[420px]:tracking-[.05em]" href="#cv"><span class="text-[.58rem] tracking-normal text-accent max-[780px]:hidden">03</span>CV</a>
				<SiteControls />
			</nav>
			<button
				class="hidden h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--surface-glass)_48%,transparent)] text-ink [backdrop-filter:blur(18px)_saturate(1.04)] [transition:color_180ms_ease,background-color_180ms_ease] hover:text-accent-strong focus-visible:text-accent-strong motion-reduce:transition-none max-[780px]:grid"
				bind:this={mobileMenuButton}
				type="button"
				onclick={() => (mobileMenuOpen = true)}
				aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
				aria-expanded={mobileMenuOpen}
			>
				<Menu size={24} strokeWidth={1.5} aria-hidden="true" />
			</button>
		</div>
	</header>
	{/if}

	<MobileMenu
		open={mobileMenuOpen}
		onclose={() => (mobileMenuOpen = false)}
		returnFocus={mobileMenuButton}
		{locale}
		name={profile.name}
		links={[
			{ href: '#portfolio', label: ui.navPortfolio, number: '01' },
			{ href: '#about', label: ui.navAbout, number: '02' },
			{ href: '#cv', label: 'CV', number: '03' }
		]}
	/>

	<section class="relative z-[1] h-[220svh]" bind:this={heroSection}>
		<div class="wrap sticky top-0 grid h-svh grid-rows-[1fr_auto] gap-[clamp(32px,6vh,64px)] overflow-hidden pt-[clamp(112px,16vh,168px)] pb-[clamp(22px,4vh,42px)] max-[780px]:pt-[104px]">
			<div class="grid max-w-[1080px] grid-cols-[minmax(0,1fr)] content-center max-[780px]:grid-cols-1 max-[780px]:items-start">
				<div class="relative isolate min-w-0 before:pointer-events-none before:absolute before:inset-[clamp(-5rem,-7vw,-3rem)_-9vw] before:z-[-1] before:bg-[radial-gradient(ellipse_at_38%_48%,color-mix(in_srgb,var(--bg)_98%,transparent)_0_42%,color-mix(in_srgb,var(--bg)_84%,transparent)_58%,transparent_80%)] before:content-['']" data-text-bg-avoid>
					<h1
						class={`absolute inset-x-0 z-10 m-0 flex flex-wrap gap-x-[.28em] gap-y-0 font-title text-[clamp(3.2rem,7.15vw,7.2rem)] font-normal leading-[.87] tracking-[-.06em] max-[780px]:text-[clamp(3rem,13.5vw,5.6rem)] max-[780px]:leading-[.9] max-[520px]:text-[clamp(2.8rem,13.6vw,4.4rem)] ${introStarted ? 'visible' : 'invisible'}`}
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
						style:opacity={statementProgress}
						style:transform={`translate3d(0, ${(1 - statementProgress) * 32}px, 0)`}
					>
						<p class="m-0 font-title text-[clamp(3.2rem,7.15vw,7.2rem)] font-normal leading-[.87] tracking-[-.06em] max-[780px]:text-[clamp(3rem,13.5vw,5.6rem)] max-[780px]:leading-[.9] max-[520px]:text-[clamp(2.8rem,13.6vw,4.4rem)]">
							<span class="block">{ui.thesisLine1Before}<em class="inline-block bg-accent [background-image:var(--accent-grain)] [background-size:180px_180px] [background-blend-mode:soft-light] px-[.13em] pt-[.01em] pb-[.03em] font-normal italic tracking-[-.04em] text-[var(--on-accent)]">{ui.thesisAccent}</em></span>
							<span class="block">{ui.thesisLine2}</span>
							<span class="block">{ui.thesisLine3}</span>
						</p>
					</div>

					<div class={introStarted ? 'visible' : 'invisible'}>
						<p class={`mt-[clamp(25px,4vh,40px)] mb-0 max-w-[54ch] font-title text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.35] text-ink-dim max-[520px]:text-base ${introStarted ? '[animation:home-intro-from-bottom_980ms_cubic-bezier(.16,1,.3,1)_500ms_backwards] motion-reduce:animate-none' : ''}`}>{ui.heroSummary}</p>
						<p class={`meta mt-3 mb-0 block text-ink-dim ${introStarted ? '[animation:home-intro-from-bottom_920ms_cubic-bezier(.16,1,.3,1)_610ms_backwards] motion-reduce:animate-none' : ''}`}>{ui.affiliation}</p>
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
				<span class="meta tag">{ui.navPortfolio}</span>
				<h2 class={sectionTitleClass}>{ui.selectedWork}</h2>
			</div>
			<SelectedWorks {locale} relatedItems={data.portfolioItems} projectIndex={data.portfolioProjects} />
		</section>

		<section id="about" class={`${sectionClass} relative isolate before:pointer-events-none before:absolute before:top-[16%] before:left-[-10vw] before:z-[-2] before:aspect-square before:w-[min(52vw,720px)] before:rounded-full before:bg-accent before:opacity-[.11] before:[filter:blur(150px)] before:content-['']`}>
			<div class={`${sectionHeadClass} mb-[clamp(38px,6vw,78px)]`}>
				<span class="meta tag">{ui.aboutLabel}</span>
				<h2 class={sectionTitleClass}>{ui.aboutTitle}</h2>
			</div>

			<div class="relative grid grid-cols-[minmax(240px,4fr)_minmax(0,7fr)] items-start gap-[clamp(34px,7vw,112px)] before:pointer-events-none before:absolute before:inset-[-5vw] before:z-[-1] before:bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] before:[backdrop-filter:blur(7px)] before:[mask-image:radial-gradient(ellipse_at_center,#000_38%,transparent_78%)] before:content-[''] max-[780px]:grid-cols-1 max-[780px]:gap-[42px]">
				<figure class="sticky top-[104px] m-0 max-[780px]:relative max-[780px]:top-auto max-[780px]:w-full">
					<div
						class="relative block w-full overflow-hidden rounded-ui border border-rule-strong bg-[#777]"
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
						<span class="flex min-w-0 items-center gap-2 font-mono text-[.62rem] tracking-meta uppercase">
							<button
								class={`cursor-pointer border-0 border-b bg-transparent p-0 pb-0.5 font-mono font-semibold tracking-meta uppercase [transition:color_700ms_ease,border-color_700ms_ease] ${activePortrait === 'researcher' ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint'}`}
								type="button"
								onclick={(event) => selectPortrait('researcher', event)}
								onpointerenter={(event) => previewPortrait('researcher', event)}
								onpointerleave={clearPortraitPreview}
								aria-pressed={portraitMode === 'researcher'}
							>{ui.portraitResearcher}</button>
							<span class="text-ink-faint opacity-50" aria-hidden="true">/</span>
							<button
								class={`cursor-pointer border-0 border-b bg-transparent p-0 pb-0.5 font-mono font-semibold tracking-meta uppercase [transition:color_700ms_ease,border-color_700ms_ease] ${activePortrait === 'performer' ? 'border-accent-strong text-accent-strong' : 'border-transparent text-ink-faint'}`}
								type="button"
								onclick={(event) => selectPortrait('performer', event)}
								onpointerenter={(event) => previewPortrait('performer', event)}
								onpointerleave={clearPortraitPreview}
								aria-pressed={portraitMode === 'performer'}
							>{ui.portraitPerformer}</button>
						</span>
						<div class="mt-4 border-l-2 border-accent-strong pl-4">
							<p class="m-0 max-w-[24ch] font-title text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.2] text-ink">{currentRole.title}</p>
							<p class="mt-2 mb-0 text-[.72rem] leading-[1.4] text-ink-dim">{currentRole.department}</p>
							<p class="meta mt-1.5 mb-0 leading-[1.4] text-ink-faint">{currentRole.institution}</p>
							<p class="mt-3 mb-0 border-t border-rule pt-3 text-[.66rem] leading-[1.4] text-accent-strong">{currentRole.funding}</p>
						</div>
					</figcaption>
				</figure>

				<div class="min-w-0 pt-[clamp(8px,2vw,28px)] max-[780px]:pt-0">
					<p class="mt-0 mb-[clamp(26px,4vw,48px)] max-w-[36ch] font-title text-[clamp(1.35rem,2.2vw,2rem)] leading-[1.32] text-ink">{ui.aboutText}</p>
					<ul class="mt-0 mb-[clamp(34px,5vw,56px)] flex list-none flex-wrap gap-x-3 gap-y-[7px] p-0 max-[520px]:gap-1.5">
						{#each t(profile.areas, locale) as area (area)}
							<li class="inline-flex items-center gap-3 text-[.7rem] tracking-[.06em] text-ink-dim uppercase after:text-accent-strong after:content-['/'] last:after:content-none max-[520px]:rounded-full max-[520px]:border max-[520px]:border-rule max-[520px]:px-2.5 max-[520px]:py-1.5 max-[520px]:text-[.58rem] max-[520px]:after:hidden">{area}</li>
						{/each}
					</ul>
					<CurrentAffiliations {locale} />
					<AcademicPath {locale} />
				</div>
			</div>

			<footer class="mt-[clamp(28px,4vw,54px)] grid grid-cols-[minmax(260px,.8fr)_minmax(0,1.2fr)] items-end gap-[clamp(30px,6vw,92px)] border-y border-t-rule-strong border-b-rule bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--bg)_72%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))] py-[clamp(24px,3vw,38px)] [backdrop-filter:blur(12px)] max-[780px]:grid-cols-1 max-[780px]:items-start">
				<div class="grid justify-items-start gap-1">
					<span class="meta tag mb-2.5">{ui.contactTitle}</span>
					<a class="font-title text-[clamp(1.1rem,2vw,1.55rem)] leading-[1.2]" href={'mailto:' + profile.contact.mail}>{profile.contact.mail}</a>
					<a class="text-[.68rem] text-ink-faint" href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a>
				</div>
				<nav class="flex flex-wrap items-center justify-end gap-x-[18px] gap-y-[5px] max-[780px]:justify-start" aria-label={ui.profilesLabel}>
					<span class="meta tag mb-2.5 flex-[0_0_100%] text-right max-[780px]:text-left">{ui.profilesLabel}</span>
					{#each profile.profiles as item (item.id)}
						<a class="inline-flex items-center gap-1.5 py-1 text-[.66rem] text-ink-dim hover:text-accent-strong" href={item.url} target="_blank" rel="noreferrer" title={`${item.label}: ${item.handle}`}>
							{#if academicIcons[item.id]}
								<i class="ai {academicIcons[item.id]} min-w-[22px] text-center text-xl font-bold leading-none not-italic text-accent-strong" aria-hidden="true"></i>
							{:else if socialIcons[item.id]}
								<i class="fa-brands {socialIcons[item.id]} min-w-[22px] text-center text-xl font-bold leading-none not-italic text-accent-strong" aria-hidden="true"></i>
							{/if}
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>
			</footer>
		</section>

		<section id="cv" class={sectionClass}>
			<div class={`${sectionHeadClass} mb-[clamp(42px,6vw,72px)]`}>
				<h2 class={sectionTitleClass}>{ui.cvTitle}</h2>
			</div>
			<a class="group mb-[clamp(42px,6vw,72px)] flex items-center justify-between gap-6 border-y border-rule-strong py-[18px] text-ink no-underline [transition:color_180ms_ease,border-color_180ms_ease] hover:border-accent-strong hover:text-accent-strong focus-visible:border-accent-strong focus-visible:text-accent-strong" href={localizedPath('/cv', locale)}>
				<strong class="font-title text-[clamp(1.2rem,2.2vw,1.65rem)] font-medium leading-[1.1]">{ui.cvCta}</strong>
				<span class="grid h-8 w-8 flex-[0_0_2rem] place-items-center text-accent-strong [transition:transform_220ms_cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none" aria-hidden="true">
					<ArrowRight size={24} strokeWidth={1.5} />
				</span>
			</a>
			<section aria-labelledby="recent-activity-title">
				<header class="mb-[26px] grid gap-3">
					<span class="meta tag">{ui.recentLabel}</span>
					<h3 class="max-w-[760px] text-[clamp(1.35rem,3vw,2.25rem)] leading-[1.05]" id="recent-activity-title">{ui.recentTitle}</h3>
				</header>
				<ol class="m-0 list-none border-t border-rule p-0">
				{#each data.recentActivity as e, i (e.entity_type + e.entity_id)}
					<li class="relative grid grid-cols-[minmax(190px,.62fr)_minmax(0,1.38fr)] gap-[clamp(20px,4vw,60px)] border-b border-rule py-[clamp(20px,3vw,32px)] max-[700px]:grid-cols-1 max-[700px]:gap-4">
						<div class="meta grid grid-cols-[28px_minmax(0,1fr)_42px] gap-3 text-ink-faint">
							<span>{String(i + 1).padStart(2, '0')}</span>
							<span class="grid gap-[5px]">
								<span class="text-accent-strong">{entityLabel(e.entity_type, locale)}</span>
								{#if activitySubtypeLabel(e)}
									<span class="text-left text-[.62rem] leading-[1.3] text-ink-dim">{activitySubtypeLabel(e)}</span>
								{/if}
							</span>
							<span class="text-right">{yr(e.sort_date)}</span>
						</div>
						<div class="min-w-0">
							{#if e.target_url}
								<a class="group m-0 flex items-start justify-between gap-[18px] font-title text-[clamp(1.15rem,2.2vw,1.8rem)] leading-[1.1] text-ink no-underline" href={e.target_url} target="_blank" rel="noreferrer">
									<span>{e.title}</span>
									<span class="mt-[2px] grid h-[22px] w-[22px] flex-[0_0_22px] place-items-center text-accent-strong [transition:transform_180ms_ease] group-hover:translate-x-0.5 group-hover:translate-y-[-2px] group-focus-visible:translate-x-0.5 group-focus-visible:translate-y-[-2px] motion-reduce:transition-none" aria-hidden="true">
										<MoveUpRight size={22} strokeWidth={1.7} />
									</span>
								</a>
							{:else}
								<p class="m-0 font-title text-[clamp(1.15rem,2.2vw,1.8rem)] leading-[1.1] text-ink">{e.title}</p>
							{/if}
							{#if e.metadata}
								<p class="mt-[9px] mb-0 max-w-[72ch] text-[.72rem] leading-[1.45] text-ink-faint"><EntryMetadata metadata={e.metadata} {locale} /></p>
							{/if}
						</div>
					</li>
				{/each}
				</ol>
			</section>
		</section>
	</main>
</div>
