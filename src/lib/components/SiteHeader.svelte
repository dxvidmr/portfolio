<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import type { Locale } from '$lib/paraglide/runtime';
	import { localizedPath } from '$lib/i18n';
	import { profile } from '$lib/content/profile';
	import SiteControls from '$lib/components/SiteControls.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	// Cabecera de las páginas interiores: la misma marca, menú y controles que la portada.
	let { locale, current }: { locale: Locale; current?: 'portfolio' | 'about' | 'cv' } = $props();

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement | null>(null);
	const home = $derived(localizedPath('/', locale));
	const links = $derived([
		{ key: 'portfolio', href: `${home}#portfolio`, label: 'Portfolio' },
		{ key: 'about', href: `${home}#about`, label: locale === 'es' ? 'Sobre mí' : 'About' },
		{ key: 'cv', href: localizedPath('/cv', locale), label: 'CV' }
	]);
</script>

<header
	class="sticky top-0 z-20 border-b border-rule bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] py-3.5 [backdrop-filter:blur(14px)]"
>
	<div class="wrap flex items-center justify-between gap-6 max-[780px]:gap-2.5">
		<a class="flex min-w-0 items-center hover:text-inherit" href={home} aria-label={profile.name}>
			<strong class="whitespace-nowrap font-title text-[1.02rem] font-normal leading-[1.1] max-[520px]:text-[.9rem]">{profile.name}</strong>
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
			class="hidden h-[38px] w-[38px] cursor-pointer place-items-center rounded-full border-0 bg-transparent text-ink hover:text-accent-strong focus-visible:text-accent-strong max-[780px]:grid"
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
