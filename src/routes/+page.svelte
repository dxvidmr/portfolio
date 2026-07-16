<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { page } from '$app/state';
	import { localeFromPathname, localizedPath } from '$lib/i18n';
	import { profile, t } from '$lib/content/profile';
	import { entityLabel } from '$lib/content/labels';
	import AcademicPath from '$lib/components/AcademicPath.svelte';
	import SelectedWorks from '$lib/components/SelectedWorks.svelte';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import EditorialBackground from '$lib/components/EditorialBackground.svelte';

	let { data } = $props();
	let headerHidden = $state(false);
	let headerScrolled = $state(false);
	let introReady = $state(false);
	const locale = $derived(localeFromPathname(page.url.pathname));
	const projectModalOpen = $derived(
		typeof (page.state as Record<string, unknown>)?.portfolioModal === 'string' ||
			/\/proyectos\/[^/]+\/?$/.test(page.url.pathname)
	);

	const completeIntro = () => {
		introReady = true;
		if (typeof document !== 'undefined') document.body.classList.remove('home-intro');
	};

	const yr = (s: string | null) => (s ? s.slice(0, 4) : '—');
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
	const sectionClass = 'wrap tw:scroll-mt-[76px] tw:py-[clamp(48px,8vw,96px)]';
	const sectionHeadClass = 'tw:mb-[26px] tw:grid tw:gap-3';
	const sectionTitleClass = 'tw:max-w-[760px] tw:text-[clamp(1.45rem,4vw,3rem)] tw:leading-[1.05]';
	const ui = $derived({
		es: {
			navProjects: 'Proyectos',
			navAbout: 'Sobre mí',
			selectedWork: 'Trabajos seleccionados',
			aboutLabel: 'Perfil',
			aboutTitle: 'Sobre mí',
			aboutText:
				'Trabajo entre la filología, los estudios teatrales y las humanidades digitales, desde una mirada ligada también a la práctica escénica. Investigo la historia de la representación y recepción del teatro del Siglo de Oro, sus archivos y su edición, combinando trabajo documental, modelado de datos y métodos digitales a gran escala. Me interesa desarrollar formas sostenibles de publicar y preservar este patrimonio en la web.',
			portraitAlt: 'Retrato de David Merino Recalde',
			portraitCaption: 'Investigador · creador escénico',
			contactTitle: 'Contacto',
			profilesLabel: 'Perfiles y redes',
			recentLabel: 'Actualidad',
			recentTitle: 'Actividad reciente',
			cvLabel: 'Currículum completo',
			cvCta: 'Ver la trayectoria completa',
			cvSummary: 'Publicaciones, investigación, docencia y actividad académica.',
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
			navProjects: 'Projects',
			navAbout: 'About',
			selectedWork: 'Selected work',
			aboutLabel: 'Profile',
			aboutTitle: 'About me',
			aboutText:
				'I work across philology, theatre studies, and digital humanities, from a perspective also rooted in theatre practice. I study the performance and reception history of Spanish Golden Age theatre, its archives, and its editing, combining documentary research, data modelling, and large-scale digital methods. I am interested in developing sustainable ways to publish and preserve this heritage on the web.',
			portraitAlt: 'Portrait of David Merino Recalde',
			portraitCaption: 'Researcher · theatre practitioner',
			contactTitle: 'Contact',
			profilesLabel: 'Profiles and networks',
			recentLabel: 'Now',
			recentTitle: 'Recent activity',
			cvLabel: 'Full curriculum vitae',
			cvCta: 'View the complete trajectory',
			cvSummary: 'Publications, research, teaching, and academic activity.',
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
		if (reducedMotion) completeIntro();
		else document.body.classList.add('home-intro');
		let lastScrollY = window.scrollY;
		let frame = 0;
		const introFallback = window.setTimeout(completeIntro, reducedMotion ? 0 : 4200);

		const updateHeader = () => {
			frame = 0;
			const currentScrollY = window.scrollY;
			const delta = currentScrollY - lastScrollY;
			headerScrolled = currentScrollY > 20;

			if (currentScrollY < 72) {
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

		updateHeader();
		window.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			window.cancelAnimationFrame(frame);
			window.clearTimeout(introFallback);
			window.removeEventListener('scroll', handleScroll);
			document.body.classList.remove('home-page', 'home-intro');
		};
	});
</script>

<div class="home tw:relative tw:isolate tw:flex tw:flex-col">
	<EditorialBackground onIntroComplete={completeIntro} />

	{#if !projectModalOpen}
	<header
		class={`site-header tw:fixed tw:inset-x-0 tw:top-0 tw:z-20 tw:border-b tw:border-transparent tw:py-3.5 tw:[transition:transform_260ms_cubic-bezier(.22,1,.36,1),padding_220ms_ease,background-color_220ms_ease,border-color_220ms_ease] tw:motion-reduce:duration-[1ms] tw:max-[780px]:bg-[var(--surface-glass)] tw:max-[780px]:py-2 tw:max-[780px]:[backdrop-filter:blur(14px)] ${headerHidden ? 'tw:[transform:translateY(-110%)]' : ''} ${headerScrolled ? 'tw:border-rule tw:bg-[var(--surface-glass)] tw:py-2 tw:[backdrop-filter:blur(14px)]' : ''} ${introReady ? 'tw:[animation:home-intro-from-top_880ms_cubic-bezier(.16,1,.3,1)_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}
	>
		<div class="wrap tw:flex tw:items-center tw:justify-between tw:gap-6 tw:max-[780px]:gap-2.5">
			<a class="tw:flex tw:min-w-0 tw:items-center tw:hover:text-inherit" href={localizedPath('/', locale)} aria-label={profile.name}>
				<strong class="tw:inline-flex tw:gap-[.28em] tw:whitespace-nowrap tw:font-title tw:text-[1.02rem] tw:font-normal tw:leading-[1.1] tw:max-[520px]:text-[.9rem]">
					{#each profile.name.split(' ') as word (word)}
						<span><b class="tw:font-bold tw:text-accent-strong">{word.slice(0, 1)}</b>{word.slice(1)}</span>
					{/each}
				</strong>
			</a>
			<nav class="meta tw:flex tw:items-center tw:gap-[clamp(14px,2.3vw,30px)] tw:max-[780px]:gap-2.5 tw:max-[520px]:gap-2" aria-label="Principal">
				<a class="tw:inline-flex tw:items-baseline tw:gap-[7px] tw:text-ink-dim tw:max-[780px]:gap-0 tw:max-[780px]:text-[.62rem] tw:max-[520px]:text-[.57rem] tw:max-[520px]:tracking-[.08em]" href="#proyectos"><span class="tw:text-[.58rem] tw:tracking-normal tw:text-accent tw:max-[780px]:hidden">01</span>{ui.navProjects}</a>
				<a class="tw:inline-flex tw:items-baseline tw:gap-[7px] tw:text-ink-dim tw:max-[780px]:gap-0 tw:max-[780px]:text-[.62rem] tw:max-[520px]:text-[.57rem] tw:max-[520px]:tracking-[.08em]" href="#about"><span class="tw:text-[.58rem] tw:tracking-normal tw:text-accent tw:max-[780px]:hidden">02</span>{ui.navAbout}</a>
				<a class="tw:inline-flex tw:items-baseline tw:gap-[7px] tw:text-ink-dim tw:max-[780px]:gap-0 tw:max-[780px]:text-[.62rem] tw:max-[520px]:text-[.57rem] tw:max-[520px]:tracking-[.08em]" href="#cv"><span class="tw:text-[.58rem] tw:tracking-normal tw:text-accent tw:max-[780px]:hidden">03</span>CV</a>
				<SiteControls />
			</nav>
		</div>
	</header>
	{/if}

	<section class="wrap tw:relative tw:z-[1] tw:grid tw:min-h-svh tw:grid-rows-[1fr_auto] tw:gap-[clamp(32px,6vh,64px)] tw:pt-[clamp(112px,16vh,168px)] tw:pb-[clamp(22px,4vh,42px)] tw:max-[780px]:pt-[104px]">
		<div class="tw:grid tw:max-w-[1080px] tw:grid-cols-[minmax(0,1fr)] tw:content-center tw:max-[780px]:grid-cols-1 tw:max-[780px]:items-start">
			<div class="tw:relative tw:isolate tw:min-w-0 tw:before:pointer-events-none tw:before:absolute tw:before:inset-[clamp(-5rem,-7vw,-3rem)_-9vw] tw:before:z-[-1] tw:before:bg-[radial-gradient(ellipse_at_38%_48%,color-mix(in_srgb,var(--bg)_98%,transparent)_0_42%,color-mix(in_srgb,var(--bg)_84%,transparent)_58%,transparent_80%)] tw:before:content-['']" data-text-bg-avoid>
				<div class={`tw:mb-[clamp(25px,4vh,42px)] tw:grid tw:gap-[7px] tw:max-[780px]:mb-6 ${introReady ? 'tw:[animation:home-intro-from-left_980ms_cubic-bezier(.16,1,.3,1)_90ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>
					<h1 class="tw:text-[clamp(1.55rem,2.6vw,2.45rem)] tw:font-normal tw:leading-none tw:tracking-[-.02em]">{profile.name}</h1>
				</div>

				<p class="tw:m-0 tw:font-title tw:text-[clamp(3.2rem,7.15vw,7.2rem)] tw:font-normal tw:leading-[.87] tw:tracking-[-.06em] tw:max-[780px]:text-[clamp(3rem,13.5vw,5.6rem)] tw:max-[780px]:leading-[.9] tw:max-[520px]:text-[clamp(2.8rem,13.6vw,4.4rem)]">
					<span class={`tw:block ${introReady ? 'tw:[animation:home-intro-from-right_1080ms_cubic-bezier(.16,1,.3,1)_170ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>{ui.thesisLine1Before}<em class="tw:inline-block tw:bg-accent tw:[background-image:var(--accent-grain)] tw:[background-size:180px_180px] tw:[background-blend-mode:soft-light] tw:px-[.13em] tw:pt-[.01em] tw:pb-[.03em] tw:font-normal tw:italic tw:tracking-[-.04em] tw:text-[var(--on-accent)]">{ui.thesisAccent}</em></span>
					<span class={`tw:block ${introReady ? 'tw:[animation:home-intro-from-left_1120ms_cubic-bezier(.16,1,.3,1)_250ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>{ui.thesisLine2}</span>
					<span class={`tw:block ${introReady ? 'tw:[animation:home-intro-from-right_1160ms_cubic-bezier(.16,1,.3,1)_330ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>{ui.thesisLine3}</span>
				</p>

				<p class={`tw:mt-[clamp(25px,4vh,40px)] tw:mb-0 tw:max-w-[54ch] tw:font-title tw:text-[clamp(1.05rem,1.5vw,1.3rem)] tw:leading-[1.35] tw:text-ink-dim tw:max-[520px]:text-base ${introReady ? 'tw:[animation:home-intro-from-bottom_960ms_cubic-bezier(.16,1,.3,1)_460ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>{ui.heroSummary}</p>
				<p class={`meta tw:mt-3 tw:mb-0 tw:block tw:text-ink-dim ${introReady ? 'tw:[animation:home-intro-from-bottom_920ms_cubic-bezier(.16,1,.3,1)_540ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>{ui.affiliation}</p>
			</div>

		</div>

		<div class={`tw:grid tw:place-items-center ${introReady ? 'tw:[animation:home-intro-from-bottom_1050ms_cubic-bezier(.16,1,.3,1)_620ms_backwards] tw:motion-reduce:animate-none' : 'tw:invisible'}`}>
			<a class="tw:grid tw:h-[42px] tw:w-[42px] tw:place-items-center tw:text-ink-faint tw:[animation:home-scroll-cue_1700ms_ease-in-out_infinite] tw:hover:text-accent-strong tw:motion-reduce:animate-none" href="#proyectos" aria-label={ui.scrollHint} title={ui.scrollHint}>
				<ChevronDown size={30} strokeWidth={1.4} aria-hidden="true" />
			</a>
		</div>
	</section>

	<main class="tw:relative tw:z-[1] tw:pb-[88px]">
		<section id="proyectos" class={sectionClass}>
			<div class={sectionHeadClass}>
				<span class="meta tag">{ui.navProjects}</span>
				<h2 class={sectionTitleClass}>{ui.selectedWork}</h2>
			</div>
			<SelectedWorks {locale} relatedItems={data.portfolioItems} />
		</section>

		<section id="about" class={`${sectionClass} tw:relative tw:isolate tw:before:pointer-events-none tw:before:absolute tw:before:top-[16%] tw:before:left-[-10vw] tw:before:z-[-2] tw:before:aspect-square tw:before:w-[min(52vw,720px)] tw:before:rounded-full tw:before:bg-accent tw:before:opacity-[.11] tw:before:[filter:blur(150px)] tw:before:content-['']`}>
			<div class={`${sectionHeadClass} tw:mb-[clamp(38px,6vw,78px)]`}>
				<span class="meta tag">{ui.aboutLabel}</span>
				<h2 class={sectionTitleClass}>{ui.aboutTitle}</h2>
			</div>

			<div class="tw:relative tw:grid tw:grid-cols-[minmax(240px,4fr)_minmax(0,7fr)] tw:items-start tw:gap-[clamp(34px,7vw,112px)] tw:before:pointer-events-none tw:before:absolute tw:before:inset-[-5vw] tw:before:z-[-1] tw:before:bg-[color-mix(in_srgb,var(--bg)_44%,transparent)] tw:before:[backdrop-filter:blur(7px)] tw:before:[mask-image:radial-gradient(ellipse_at_center,#000_38%,transparent_78%)] tw:before:content-[''] tw:max-[780px]:grid-cols-1 tw:max-[780px]:gap-[42px]">
				<figure class="tw:sticky tw:top-[104px] tw:m-0 tw:max-[780px]:relative tw:max-[780px]:top-auto tw:max-[780px]:w-[min(74vw,420px)]">
					<div class="tw:group tw:relative tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule-strong tw:bg-[#777]">
						<img
							class="tw:block tw:h-auto tw:w-full"
							src="/images/about/david-merino-recalde.jpg"
							alt={ui.portraitAlt}
							width="820"
							height="1024"
							loading="lazy"
						/>
						<img
							class="tw:pointer-events-none tw:absolute tw:inset-0 tw:h-full tw:w-full tw:origin-center tw:object-cover tw:opacity-0 tw:[transform:scale(1)] tw:[transition:opacity_520ms_cubic-bezier(.22,1,.36,1),transform_900ms_cubic-bezier(.22,1,.36,1)] tw:group-hover:opacity-100 tw:group-hover:[transform:scale(1.035)] tw:motion-reduce:transition-none"
							src="/images/about/david-merino-recalde-hover.webp"
							alt=""
							width="820"
							height="1024"
							loading="lazy"
							aria-hidden="true"
						/>
						<div class="tw:pointer-events-none tw:absolute tw:right-[5%] tw:bottom-[12%] tw:left-[7%] tw:z-[2] tw:grid tw:gap-1 tw:font-mono tw:text-[clamp(.42rem,.72vw,.58rem)] tw:leading-[1.25] tw:tracking-[.08em] tw:text-[rgba(255,255,255,.82)] tw:opacity-0 tw:[text-shadow:0_1px_8px_rgba(0,0,0,.72)] tw:[transition:opacity_360ms_ease_90ms] tw:group-hover:opacity-100 tw:motion-reduce:transition-none" aria-hidden="true">
							<span class="tw:mb-2 tw:overflow-hidden tw:text-[.92em] tw:whitespace-nowrap">// DMR [ DECODED ]</span>
							<span class="tw:overflow-hidden tw:whitespace-nowrap">01100100 01100001 01110110 01101001 01100100</span>
							<span class="tw:ml-[8%] tw:overflow-hidden tw:whitespace-nowrap tw:opacity-[.68]">01110100 01100101 01111000 01110100 01101111</span>
							<span class="tw:ml-[3%] tw:overflow-hidden tw:whitespace-nowrap tw:opacity-[.44]">01100101 01110011 01100011 01100101 01101110 01100001</span>
						</div>
					</div>
					<figcaption class="meta tw:mt-2.5 tw:flex tw:justify-between tw:gap-[18px] tw:text-[.6rem] tw:text-ink-faint">
						<span>{ui.portraitCaption}</span>
						<span>Barcelona</span>
					</figcaption>
				</figure>

				<div class="tw:min-w-0 tw:pt-[clamp(8px,2vw,28px)] tw:max-[780px]:pt-0">
					<p class="tw:mt-0 tw:mb-[clamp(26px,4vw,48px)] tw:max-w-[36ch] tw:font-title tw:text-[clamp(1.35rem,2.2vw,2rem)] tw:leading-[1.32] tw:text-ink">{ui.aboutText}</p>
					<ul class="tw:mt-0 tw:mb-[clamp(48px,7vw,84px)] tw:flex tw:list-none tw:flex-wrap tw:gap-x-3 tw:gap-y-[7px] tw:p-0">
						{#each t(profile.areas, locale) as area (area)}
							<li class="tw:inline-flex tw:items-center tw:gap-3 tw:text-[.7rem] tw:tracking-[.06em] tw:text-ink-dim tw:uppercase tw:after:text-accent-strong tw:after:content-['/'] tw:last:after:content-none">{area}</li>
						{/each}
					</ul>
					<AcademicPath {locale} />
				</div>
			</div>

			<footer class="tw:mt-[clamp(28px,4vw,54px)] tw:grid tw:grid-cols-[minmax(260px,.8fr)_minmax(0,1.2fr)] tw:items-end tw:gap-[clamp(30px,6vw,92px)] tw:border-y tw:border-t-rule-strong tw:border-b-rule tw:bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--bg)_72%,transparent),color-mix(in_srgb,var(--bg)_92%,transparent))] tw:py-[clamp(24px,3vw,38px)] tw:[backdrop-filter:blur(12px)] tw:max-[780px]:grid-cols-1 tw:max-[780px]:items-start">
				<div class="tw:grid tw:justify-items-start tw:gap-1">
					<span class="meta tag tw:mb-2.5">{ui.contactTitle}</span>
					<a class="tw:font-title tw:text-[clamp(1.1rem,2vw,1.55rem)] tw:leading-[1.2]" href={'mailto:' + profile.contact.mail}>{profile.contact.mail}</a>
					<a class="tw:text-[.68rem] tw:text-ink-faint" href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a>
				</div>
				<nav class="tw:flex tw:flex-wrap tw:items-center tw:justify-end tw:gap-x-[18px] tw:gap-y-[5px] tw:max-[780px]:justify-start" aria-label={ui.profilesLabel}>
					<span class="meta tag tw:mb-2.5 tw:flex-[0_0_100%] tw:text-right tw:max-[780px]:text-left">{ui.profilesLabel}</span>
					{#each profile.profiles as item (item.id)}
						<a class="tw:inline-flex tw:items-center tw:gap-1.5 tw:py-1 tw:text-[.66rem] tw:text-ink-dim tw:hover:text-accent-strong" href={item.url} target="_blank" rel="noreferrer" title={`${item.label}: ${item.handle}`}>
							{#if academicIcons[item.id]}
								<i class="ai {academicIcons[item.id]} tw:min-w-[22px] tw:text-center tw:text-xl tw:font-bold tw:leading-none tw:not-italic tw:text-accent-strong" aria-hidden="true"></i>
							{:else if socialIcons[item.id]}
								<i class="fa-brands {socialIcons[item.id]} tw:min-w-[22px] tw:text-center tw:text-xl tw:font-bold tw:leading-none tw:not-italic tw:text-accent-strong" aria-hidden="true"></i>
							{/if}
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>
			</footer>
		</section>

		<section id="cv" class={sectionClass}>
			<div class={sectionHeadClass}>
				<span class="meta tag">{ui.recentLabel}</span>
				<h2 class={sectionTitleClass}>{ui.recentTitle}</h2>
			</div>
			<div class="rule"></div>
			<ol class="dense tw:m-0 tw:list-none tw:p-0">
				{#each data.recentActivity as e, i (e.entity_type + e.entity_id)}
					<li class="tw:group tw:grid tw:grid-cols-[34px_150px_1fr_56px] tw:items-baseline tw:gap-4 tw:border-b tw:border-rule tw:py-[11px] tw:max-[780px]:grid-cols-[26px_1fr_46px]">
						<span class="meta--faint tw:group-hover:text-accent">{String(i + 1).padStart(2, '0')}</span>
						<span class="meta tw:text-ink-dim tw:group-hover:text-accent tw:max-[780px]:hidden">{entityLabel(e.entity_type, locale)}</span>
						<span class="tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap tw:text-ink tw:group-hover:text-accent">{e.title}</span>
						<span class="meta--faint dense tw:text-right tw:group-hover:text-accent">{yr(e.sort_date)}</span>
					</li>
				{/each}
			</ol>
			<a class="tw:group tw:mt-[clamp(30px,5vw,54px)] tw:grid tw:grid-cols-[minmax(0,1fr)_auto] tw:items-center tw:gap-6 tw:rounded-ui tw:border tw:border-rule-strong tw:bg-[color-mix(in_srgb,var(--bg-panel)_72%,transparent)] tw:p-[clamp(22px,3.4vw,38px)] tw:[transition:border-color_180ms_ease,background-color_180ms_ease] tw:hover:border-accent-strong tw:hover:bg-accent-wash tw:hover:text-ink" href={localizedPath('/cv', locale)}>
				<span class="tw:grid tw:min-w-0 tw:justify-items-start tw:gap-[7px]">
					<span class="meta tag">{ui.cvLabel}</span>
					<strong class="tw:font-title tw:text-[clamp(1.65rem,3.8vw,3.2rem)] tw:font-medium tw:leading-none tw:tracking-[-.035em]">{ui.cvCta}</strong>
					<small class="tw:text-[.72rem] tw:text-ink-dim">{ui.cvSummary}</small>
				</span>
				<span class="tw:grid tw:aspect-square tw:w-[clamp(48px,6vw,66px)] tw:place-items-center tw:rounded-full tw:bg-accent tw:[background-image:var(--accent-grain)] tw:[background-size:150px_150px] tw:text-[var(--on-accent)] tw:[&>svg]:[transition:transform_220ms_cubic-bezier(.22,1,.36,1)] tw:group-hover:[&>svg]:translate-x-1" aria-hidden="true">
					<ArrowRight size={32} strokeWidth={1.4} />
				</span>
			</a>
		</section>
	</main>
</div>
