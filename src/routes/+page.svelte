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

<div class="home" class:intro-ready={introReady}>
	<EditorialBackground onIntroComplete={completeIntro} />

	{#if !projectModalOpen}
	<header class="site-header" class:is-hidden={headerHidden} class:is-scrolled={headerScrolled}>
		<div class="topbar wrap">
			<a class="brand" href={localizedPath('/', locale)} aria-label={profile.name}>
				<strong class="brand-name">
					{#each profile.name.split(' ') as word (word)}
						<span><b>{word.slice(0, 1)}</b>{word.slice(1)}</span>
					{/each}
				</strong>
			</a>
			<nav class="nav meta" aria-label="Principal">
				<a href="#proyectos"><span>01</span>{ui.navProjects}</a>
				<a href="#about"><span>02</span>{ui.navAbout}</a>
				<a href="#cv"><span>03</span>CV</a>
				<SiteControls />
			</nav>
		</div>
	</header>
	{/if}

	<section class="landing wrap">
		<div class="hero">
			<div class="hero-main" data-text-bg-avoid>
				<div class="hero-identity">
					<h1 class="name">{profile.name}</h1>
				</div>

				<p class="thesis">
					<span>{ui.thesisLine1Before}<em>{ui.thesisAccent}</em></span>
					<span>{ui.thesisLine2}</span>
					<span>{ui.thesisLine3}</span>
				</p>

				<p class="hero-summary">{ui.heroSummary}</p>
				<p class="affiliation meta">{ui.affiliation}</p>
			</div>

		</div>

		<div class="landing-foot">
			<a class="scroll-cue" href="#proyectos" aria-label={ui.scrollHint} title={ui.scrollHint}>
				<ChevronDown size={30} strokeWidth={1.4} aria-hidden="true" />
			</a>
		</div>
	</section>

	<main>
		<section id="proyectos" class="section wrap">
			<div class="section-head">
				<span class="meta tag">{ui.navProjects}</span>
				<h2>{ui.selectedWork}</h2>
			</div>
			<SelectedWorks {locale} relatedItems={data.portfolioItems} />
		</section>

		<section id="about" class="section wrap about-editorial">
			<div class="section-head">
				<span class="meta tag">{ui.aboutLabel}</span>
				<h2>{ui.aboutTitle}</h2>
			</div>

			<div class="about-layout">
				<figure class="about-portrait">
					<div class="portrait-image">
						<img
							src="/images/about/david-merino-recalde.jpg"
							alt={ui.portraitAlt}
							width="820"
							height="1024"
							loading="lazy"
						/>
						<img
							class="portrait-hover"
							src="/images/about/david-merino-recalde-hover.webp"
							alt=""
							width="820"
							height="1024"
							loading="lazy"
							aria-hidden="true"
						/>
						<div class="portrait-data" aria-hidden="true">
							<span class="portrait-data__label">// DMR [ DECODED ]</span>
							<span>01100100 01100001 01110110 01101001 01100100</span>
							<span>01110100 01100101 01111000 01110100 01101111</span>
							<span>01100101 01110011 01100011 01100101 01101110 01100001</span>
						</div>
					</div>
					<figcaption class="meta">
						<span>{ui.portraitCaption}</span>
						<span>Barcelona</span>
					</figcaption>
				</figure>

				<div class="about-content">
					<p class="about-text">{ui.aboutText}</p>
					<ul class="areas">
						{#each t(profile.areas, locale) as area (area)}
							<li>{area}</li>
						{/each}
					</ul>
					<AcademicPath {locale} />
				</div>
			</div>

			<footer class="about-contact">
				<div class="contact-copy">
					<span class="meta tag">{ui.contactTitle}</span>
					<a class="contact-primary" href={'mailto:' + profile.contact.mail}>{profile.contact.mail}</a>
					<a class="contact-secondary" href={'mailto:' + profile.contact.mailAlt}>{profile.contact.mailAlt}</a>
				</div>
				<nav class="profile-links" aria-label={ui.profilesLabel}>
					<span class="meta tag profile-links__label">{ui.profilesLabel}</span>
					{#each profile.profiles as item (item.id)}
						<a href={item.url} target="_blank" rel="noreferrer" title={`${item.label}: ${item.handle}`}>
							{#if academicIcons[item.id]}
								<i class="ai {academicIcons[item.id]}" aria-hidden="true"></i>
							{:else if socialIcons[item.id]}
								<i class="fa-brands {socialIcons[item.id]}" aria-hidden="true"></i>
							{/if}
							<span>{item.label}</span>
						</a>
					{/each}
				</nav>
			</footer>
		</section>

		<section id="cv" class="section wrap">
			<div class="section-head">
				<span class="meta tag">{ui.recentLabel}</span>
				<h2>{ui.recentTitle}</h2>
			</div>
			<div class="rule"></div>
			<ol class="rows dense">
				{#each data.recentActivity as e, i (e.entity_type + e.entity_id)}
					<li class="row">
						<span class="idx meta--faint">{String(i + 1).padStart(2, '0')}</span>
						<span class="etype meta">{entityLabel(e.entity_type, locale)}</span>
						<span class="rtitle">{e.title}</span>
						<span class="rdate meta--faint dense">{yr(e.sort_date)}</span>
					</li>
				{/each}
			</ol>
			<a class="cv-gateway" href={localizedPath('/cv', locale)}>
				<span class="cv-gateway__copy">
					<span class="meta tag">{ui.cvLabel}</span>
					<strong>{ui.cvCta}</strong>
					<small>{ui.cvSummary}</small>
				</span>
				<span class="cv-gateway__icon" aria-hidden="true">
					<ArrowRight size={32} strokeWidth={1.4} />
				</span>
			</a>
		</section>
	</main>
</div>

<style>
	.home {
		position: relative;
		display: flex;
		flex-direction: column;
		isolation: isolate;
	}

	:global(body.home-intro) {
		overflow: hidden;
	}

	.home:not(.intro-ready) .site-header,
	.home:not(.intro-ready) .hero-identity,
	.home:not(.intro-ready) .thesis > span,
	.home:not(.intro-ready) .hero-summary,
	.home:not(.intro-ready) .affiliation,
	.home:not(.intro-ready) .landing-foot {
		visibility: hidden;
	}

	.home.intro-ready .site-header {
		animation: intro-from-top 880ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
	}

	.home.intro-ready .hero-identity {
		animation: intro-from-left 980ms cubic-bezier(0.16, 1, 0.3, 1) 90ms backwards;
	}

	.home.intro-ready .thesis > span:nth-child(1) {
		animation: intro-from-right 1080ms cubic-bezier(0.16, 1, 0.3, 1) 170ms backwards;
	}

	.home.intro-ready .thesis > span:nth-child(2) {
		animation: intro-from-left 1120ms cubic-bezier(0.16, 1, 0.3, 1) 250ms backwards;
	}

	.home.intro-ready .thesis > span:nth-child(3) {
		animation: intro-from-right 1160ms cubic-bezier(0.16, 1, 0.3, 1) 330ms backwards;
	}

	.home.intro-ready .hero-summary {
		animation: intro-from-bottom 960ms cubic-bezier(0.16, 1, 0.3, 1) 460ms backwards;
	}

	.home.intro-ready .affiliation {
		animation: intro-from-bottom 920ms cubic-bezier(0.16, 1, 0.3, 1) 540ms backwards;
	}

	.home.intro-ready .landing-foot {
		animation: intro-from-bottom 1050ms cubic-bezier(0.16, 1, 0.3, 1) 620ms backwards;
	}

	@keyframes intro-from-top {
		from {
			opacity: 0;
			filter: blur(6px);
			transform: translate3d(0, -125%, 0);
		}
	}

	@keyframes intro-from-left {
		from {
			opacity: 0;
			filter: blur(7px);
			transform: translate3d(-72vw, 0, 0);
		}
	}

	@keyframes intro-from-right {
		from {
			opacity: 0;
			filter: blur(7px);
			transform: translate3d(72vw, 0, 0);
		}
	}

	@keyframes intro-from-bottom {
		from {
			opacity: 0;
			filter: blur(6px);
			transform: translate3d(0, 24vh, 0);
		}
	}

	:global(body.home-page),
	:global(body:has(.home)) {
		background-image: none;
	}

	.landing,
	main {
		position: relative;
		z-index: 1;
	}

	.site-header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 20;
		padding-block: 14px;
		border-bottom: 1px solid transparent;
		transition:
			transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
			padding 220ms ease,
			background-color 220ms ease,
			border-color 220ms ease;
	}

	.site-header.is-scrolled {
		padding-block: 8px;
		border-color: var(--line);
		background: var(--surface-glass);
		-webkit-backdrop-filter: blur(14px);
		backdrop-filter: blur(14px);
	}

	.site-header.is-hidden {
		transform: translateY(-110%);
	}

	.landing {
		min-height: 100svh;
		padding-block: clamp(112px, 16vh, 168px) clamp(22px, 4vh, 42px);
		display: grid;
		grid-template-rows: 1fr auto;
		gap: clamp(32px, 6vh, 64px);
	}

	.topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
	}

	.brand {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	.brand:hover {
		color: inherit;
	}

	.brand-name {
		display: inline-flex;
		gap: 0.28em;
		font-family: var(--font-title);
		font-size: 1.02rem;
		font-weight: 400;
		line-height: 1.1;
		white-space: nowrap;
	}

	.brand-name b {
		color: var(--accent-strong);
		font-weight: 700;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: clamp(14px, 2.3vw, 30px);
	}

	.nav > a {
		display: inline-flex;
		align-items: baseline;
		gap: 7px;
		color: var(--fg-dim);
	}

	.nav > a span {
		color: var(--accent);
		font-size: 0.58rem;
		letter-spacing: 0;
	}

	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-content: center;
		max-width: 1080px;
	}

	.hero-main {
		position: relative;
		isolation: isolate;
		min-width: 0;
	}

	.hero-main::before {
		position: absolute;
		z-index: -1;
		inset: clamp(-5rem, -7vw, -3rem) -9vw;
		content: '';
		background: radial-gradient(
			ellipse at 38% 48%,
			color-mix(in srgb, var(--bg) 98%, transparent) 0 42%,
			color-mix(in srgb, var(--bg) 84%, transparent) 58%,
			transparent 80%
		);
		pointer-events: none;
	}

	.hero-identity {
		display: grid;
		gap: 7px;
		margin-bottom: clamp(25px, 4vh, 42px);
	}

	.name {
		font-size: clamp(1.55rem, 2.6vw, 2.45rem);
		font-weight: 400;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.thesis {
		margin: 0;
		font-family: var(--font-title);
		font-size: clamp(3.2rem, 7.15vw, 7.2rem);
		font-weight: 400;
		line-height: 0.87;
		letter-spacing: -0.06em;
	}

	.thesis > span {
		display: block;
	}

	.thesis em {
		display: inline-block;
		padding: 0.01em 0.13em 0.03em;
		background-color: var(--accent);
		background-image: var(--accent-grain);
		background-size: 180px 180px;
		background-blend-mode: soft-light;
		color: var(--on-accent);
		font-weight: 400;
		font-style: italic;
		letter-spacing: -0.04em;
	}

	.hero-summary {
		max-width: 54ch;
		margin: clamp(25px, 4vh, 40px) 0 0;
		font-family: var(--font-title);
		font-size: clamp(1.05rem, 1.5vw, 1.3rem);
		line-height: 1.35;
		color: var(--fg-dim);
	}

	.affiliation {
		display: block;
		margin: 12px 0 0;
		color: var(--fg-dim);
	}

	.landing-foot {
		display: grid;
		place-items: center;
	}

	.scroll-cue {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
		color: var(--fg-faint);
		animation: scroll-cue 1700ms ease-in-out infinite;
	}

	.scroll-cue:hover {
		color: var(--accent-strong);
	}

	@keyframes scroll-cue {
		0%,
		100% {
			transform: translateY(-2px);
		}
		50% {
			transform: translateY(7px);
		}
	}

	main {
		padding-bottom: 88px;
	}
	.section {
		padding-block: clamp(48px, 8vw, 96px);
		scroll-margin-top: 76px;
	}
	.section-head {
		display: grid;
		gap: 12px;
		margin-bottom: 26px;
	}
	.section-head h2 {
		max-width: 760px;
		font-size: clamp(1.45rem, 4vw, 3rem);
		line-height: 1.05;
	}
	.about-editorial {
		position: relative;
		isolation: isolate;
	}

	.about-editorial::before {
		position: absolute;
		z-index: -2;
		top: 16%;
		left: -10vw;
		width: min(52vw, 720px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--accent);
		filter: blur(150px);
		opacity: 0.11;
		content: '';
		pointer-events: none;
	}

	.about-editorial .section-head {
		margin-bottom: clamp(38px, 6vw, 78px);
	}

	.about-layout {
		position: relative;
		display: grid;
		grid-template-columns: minmax(240px, 4fr) minmax(0, 7fr);
		gap: clamp(34px, 7vw, 112px);
		align-items: start;
	}

	.about-layout::before {
		position: absolute;
		z-index: -1;
		inset: -5vw;
		background: color-mix(in srgb, var(--bg) 44%, transparent);
		-webkit-backdrop-filter: blur(7px);
		backdrop-filter: blur(7px);
		-webkit-mask-image: radial-gradient(ellipse at center, #000 38%, transparent 78%);
		mask-image: radial-gradient(ellipse at center, #000 38%, transparent 78%);
		content: '';
		pointer-events: none;
	}

	.about-portrait {
		position: sticky;
		top: 104px;
		margin: 0;
	}

	.portrait-image {
		position: relative;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: #777;
		overflow: hidden;
	}

	.portrait-image img {
		display: block;
		width: 100%;
		height: auto;
	}

	.portrait-image .portrait-hover {
		position: absolute;
		inset: 0;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		pointer-events: none;
		transform: scale(1);
		transform-origin: center;
		transition:
			opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
			transform 900ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.portrait-data {
		position: absolute;
		z-index: 2;
		left: 7%;
		right: 5%;
		bottom: 12%;
		display: grid;
		gap: 4px;
		color: rgba(255, 255, 255, 0.82);
		font-family: var(--font-mono);
		font-size: clamp(0.42rem, 0.72vw, 0.58rem);
		letter-spacing: 0.08em;
		line-height: 1.25;
		opacity: 0;
		pointer-events: none;
		text-shadow: 0 1px 8px rgba(0, 0, 0, 0.72);
		transition: opacity 360ms ease 90ms;
	}

	.portrait-data span {
		overflow: hidden;
		white-space: nowrap;
	}

	.portrait-data span:nth-child(3) {
		margin-left: 8%;
		opacity: 0.68;
	}

	.portrait-data span:nth-child(4) {
		margin-left: 3%;
		opacity: 0.44;
	}

	.portrait-data__label {
		margin-bottom: 8px;
		font-size: 0.92em;
	}

	.portrait-image:hover .portrait-hover {
		opacity: 1;
		transform: scale(1.035);
	}

	.portrait-image:hover .portrait-data {
		opacity: 1;
	}

	.about-portrait figcaption {
		display: flex;
		justify-content: space-between;
		gap: 18px;
		margin-top: 10px;
		color: var(--fg-faint);
		font-size: 0.6rem;
	}

	.about-content {
		min-width: 0;
		padding-top: clamp(8px, 2vw, 28px);
	}

	.about-text {
		max-width: 36ch;
		margin: 0 0 clamp(26px, 4vw, 48px);
		font-family: var(--font-title);
		font-size: clamp(1.35rem, 2.2vw, 2rem);
		line-height: 1.32;
		color: var(--fg);
	}

	.areas {
		display: flex;
		flex-wrap: wrap;
		gap: 7px 12px;
		margin: 0 0 clamp(48px, 7vw, 84px);
		padding: 0;
		list-style: none;
	}

	.areas li {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: var(--fg-dim);
		font-size: 0.7rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.areas li:not(:last-child)::after {
		color: var(--accent-strong);
		content: '/';
	}

	.about-contact {
		display: grid;
		grid-template-columns: minmax(260px, 0.8fr) minmax(0, 1.2fr);
		gap: clamp(30px, 6vw, 92px);
		align-items: end;
		margin-top: clamp(28px, 4vw, 54px);
		padding-block: clamp(24px, 3vw, 38px);
		border-top: 1px solid var(--line-strong);
		border-bottom: 1px solid var(--line);
		background: linear-gradient(
			to bottom,
			color-mix(in srgb, var(--bg) 72%, transparent),
			color-mix(in srgb, var(--bg) 92%, transparent)
		);
		-webkit-backdrop-filter: blur(12px);
		backdrop-filter: blur(12px);
	}

	.contact-copy {
		display: grid;
		justify-items: start;
		gap: 4px;
	}

	.contact-copy > .tag {
		margin-bottom: 10px;
	}

	.contact-primary {
		font-family: var(--font-title);
		font-size: clamp(1.1rem, 2vw, 1.55rem);
		line-height: 1.2;
	}

	.contact-secondary {
		color: var(--fg-faint);
		font-size: 0.68rem;
	}

	.profile-links {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 5px 18px;
	}

	.profile-links__label {
		flex: 0 0 100%;
		margin-bottom: 10px;
		text-align: right;
	}

	.profile-links a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 0;
		color: var(--fg-dim);
		font-size: 0.66rem;
	}

	.profile-links a:hover {
		color: var(--accent-strong);
	}

	.profile-links i {
		min-width: 22px;
		color: var(--accent-strong);
		font-size: 1.25rem;
		font-style: normal;
		font-weight: 700;
		line-height: 1;
		text-align: center;
	}

	.rows {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: grid;
		grid-template-columns: 34px 150px 1fr 56px;
		gap: 16px;
		align-items: baseline;
		padding: 11px 0;
		border-bottom: 1px solid var(--line);
	}
	.row:hover,
	.row:hover .etype,
	.row:hover .idx,
	.row:hover .rdate {
		color: var(--accent);
	}
	.etype {
		color: var(--fg-dim);
	}
	.rtitle {
		color: var(--fg);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rdate {
		text-align: right;
	}

	.cv-gateway {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 24px;
		align-items: center;
		margin-top: clamp(30px, 5vw, 54px);
		padding: clamp(22px, 3.4vw, 38px);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--bg-panel) 72%, transparent);
		transition:
			border-color 180ms ease,
			background-color 180ms ease;
	}

	.cv-gateway:hover {
		border-color: var(--accent-strong);
		background-color: var(--accent-wash);
		color: var(--fg);
	}

	.cv-gateway__copy {
		display: grid;
		justify-items: start;
		gap: 7px;
		min-width: 0;
	}

	.cv-gateway__copy strong {
		font-family: var(--font-title);
		font-size: clamp(1.65rem, 3.8vw, 3.2rem);
		font-weight: 500;
		line-height: 1;
		letter-spacing: -0.035em;
	}

	.cv-gateway__copy small {
		color: var(--fg-dim);
		font-size: 0.72rem;
	}

	.cv-gateway__icon {
		display: grid;
		place-items: center;
		width: clamp(48px, 6vw, 66px);
		aspect-ratio: 1;
		border-radius: 50%;
		background-color: var(--accent);
		background-image: var(--accent-grain);
		background-size: 150px 150px;
		color: var(--on-accent);
	}

	.cv-gateway__icon :global(svg) {
		transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.cv-gateway:hover .cv-gateway__icon :global(svg) {
		transform: translateX(4px);
	}

	@media (max-width: 780px) {
		.site-header,
		.site-header.is-scrolled {
			padding-block: 8px;
			background: var(--surface-glass);
			-webkit-backdrop-filter: blur(14px);
			backdrop-filter: blur(14px);
		}

		.topbar {
			gap: 10px;
		}

		.nav {
			gap: 10px;
		}

		.nav > a {
			gap: 0;
			font-size: 0.62rem;
		}

		.nav > a span {
			display: none;
		}

		.landing {
			padding-top: 104px;
		}

		.about-layout {
			grid-template-columns: 1fr;
			gap: 42px;
		}

		.about-portrait {
			position: relative;
			top: auto;
			width: min(74vw, 420px);
		}

		.about-content {
			padding-top: 0;
		}

		.about-contact {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.profile-links {
			justify-content: flex-start;
		}

		.profile-links__label {
			text-align: left;
		}

		.hero {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.hero-identity {
			margin-bottom: 24px;
		}

		.thesis {
			font-size: clamp(3rem, 13.5vw, 5.6rem);
			line-height: 0.9;
		}

		.row {
			grid-template-columns: 26px 1fr 46px;
		}
		.row .etype {
			display: none;
		}
	}

	@media (max-width: 520px) {
		.brand-name {
			font-size: 0.9rem;
		}

		.nav {
			gap: 8px;
		}

		.nav > a {
			font-size: 0.57rem;
			letter-spacing: 0.08em;
		}

		.thesis {
			font-size: clamp(2.8rem, 13.6vw, 4.4rem);
		}

		.hero-summary {
			font-size: 1rem;
		}

	}

	@media (prefers-reduced-motion: reduce) {
		.site-header {
			transition-duration: 1ms;
		}

		.home.intro-ready .site-header,
		.home.intro-ready .hero-identity,
		.home.intro-ready .thesis > span,
		.home.intro-ready .hero-summary,
		.home.intro-ready .affiliation,
		.home.intro-ready .landing-foot {
			animation: none;
		}

		.scroll-cue {
			animation: none;
		}

		.portrait-hover,
		.portrait-data {
			transition: none;
		}
	}
</style>
