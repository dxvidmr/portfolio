<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import type { Locale } from '$lib/paraglide/runtime';
	import { localizedPath } from '$lib/i18n';
	import { profile } from '$lib/content/profile';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	// Cabecera común de la web. Por defecto gestiona su comportamiento al desplazarse (se oculta al
	// bajar, reaparece al subir y pasa a fondo translúcido). La portada le pasa ese estado, porque
	// depende del titular animado, y usa `brand` para animar el nombre hasta la cabecera.
	let {
		locale,
		current,
		onHome = false,
		scrolled,
		hidden,
		brandOpacity = 1,
		brand = $bindable(null)
	}: {
		locale: Locale;
		current?: 'portfolio' | 'about' | 'cv';
		onHome?: boolean;
		scrolled?: boolean;
		hidden?: boolean;
		brandOpacity?: number;
		brand?: HTMLAnchorElement | null;
	} = $props();

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement | null>(null);
	let ownScrolled = $state(false);
	let ownHidden = $state(false);
	const isScrolled = $derived(scrolled ?? ownScrolled);
	const isHidden = $derived(hidden ?? ownHidden);
	const home = $derived(localizedPath('/', locale));
	const links = $derived([
		{ key: 'portfolio', href: onHome ? '#portfolio' : `${home}#portfolio`, label: 'Portfolio' },
		{ key: 'about', href: onHome ? '#about' : `${home}#about`, label: locale === 'es' ? 'Sobre mí' : 'About' },
		{ key: 'cv', href: onHome ? '#cv' : localizedPath('/cv', locale), label: 'CV' }
	]);

	$effect(() => {
		if (scrolled !== undefined && hidden !== undefined) return;
		let last = window.scrollY;
		let frame = 0;
		const update = () => {
			frame = 0;
			const y = window.scrollY;
			const delta = y - last;
			ownScrolled = y > 20;
			if (y < 72) ownHidden = false;
			else if (delta > 2) ownHidden = true;
			else if (delta < -2) ownHidden = false;
			last = y;
		};
		const onScroll = () => {
			if (!frame) frame = window.requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<header
	class={`site-header fixed inset-x-0 top-0 z-20 py-3.5 [transition:transform_260ms_cubic-bezier(.22,1,.36,1),padding_220ms_ease,background-color_220ms_ease] motion-reduce:duration-[1ms] max-[780px]:bg-[var(--surface-glass)] max-[780px]:py-2 max-[780px]:[backdrop-filter:blur(14px)] ${isHidden ? '[transform:translateY(-110%)]' : ''} ${isScrolled ? 'bg-[var(--surface-glass)] py-2 [backdrop-filter:blur(14px)]' : ''}`}
>
	<div class="wrap flex items-center justify-between gap-6 max-[780px]:gap-2.5 max-[420px]:gap-1.5">
		<a class="flex min-w-0 items-center hover:text-inherit" href={home} aria-label={profile.name} bind:this={brand} style:opacity={brandOpacity}>
			<strong class="inline-flex gap-[.28em] whitespace-nowrap font-title text-[1.02rem] font-normal leading-[1.1] max-[520px]:text-[.9rem]">
				{#each profile.name.split(' ') as word (word)}
					<span class="header-name-word">{word}</span>
				{/each}
			</strong>
		</a>
		<nav class="label flex items-center gap-[clamp(16px,2.4vw,32px)] max-[780px]:hidden" aria-label="Principal">
			{#each links as link (link.key)}
				<a
					class="text-ink-dim hover:text-ink aria-[current=page]:text-accent-strong"
					href={link.href}
					aria-current={current === link.key ? 'page' : undefined}>{link.label}</a
				>
			{/each}
			<SiteControls />
		</nav>
		<button
			class="hidden h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--surface-glass)_48%,transparent)] text-ink [backdrop-filter:blur(18px)_saturate(1.04)] hover:text-accent-strong focus-visible:text-accent-strong max-[780px]:grid"
			bind:this={menuButton}
			type="button"
			onclick={() => (menuOpen = true)}
			aria-label={locale === 'es' ? 'Abrir menú' : 'Open menu'}
			aria-expanded={menuOpen}
		>
			<Menu size={24} strokeWidth={1.5} aria-hidden="true" />
		</button>
	</div>
</header>

<MobileMenu
	open={menuOpen}
	onclose={() => (menuOpen = false)}
	returnFocus={menuButton}
	{locale}
	name={profile.name}
	links={links.map((link) => ({ href: link.href, label: link.label, current: current === link.key }))}
/>
