<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Locale } from '$lib/paraglide/runtime';
	import SiteControls from '$lib/components/SiteControls.svelte';

	let {
		open,
		onclose,
		returnFocus,
		locale,
		name,
		links,
		footer
	}: {
		open: boolean;
		onclose: () => void;
		returnFocus: HTMLButtonElement | null;
		locale: Locale;
		name: string;
		links: Array<{ href: string; label: string; number: string; current?: boolean }>;
		/** Sustituye a los controles de la web pública en el pie del menú. */
		footer?: Snippet;
	} = $props();

	let shell = $state<HTMLElement | null>(null);
	let closeButton = $state<HTMLButtonElement | null>(null);

	const copy = $derived(
		locale === 'es'
			? { close: 'Cerrar menú', navigation: 'Navegación principal' }
			: { close: 'Close menu', navigation: 'Main navigation' }
	);
	const menuControlClass =
		'grid h-[42px] w-[42px] cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--surface-glass)_48%,transparent)] text-ink [backdrop-filter:blur(18px)_saturate(1.04)] [transition:color_180ms_ease,background-color_180ms_ease] hover:text-accent-strong focus-visible:text-accent-strong motion-reduce:transition-none';

	const closeMenu = async (restoreFocus = true) => {
		onclose();
		if (restoreFocus) {
			await tick();
			returnFocus?.focus();
		}
	};

	$effect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		void tick().then(() => closeButton?.focus());

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				void closeMenu();
				return;
			}
			if (event.key !== 'Tab' || !shell) return;

			const focusable = Array.from(
				shell.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
			);
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if open}
	<div
		class="fixed inset-0 z-[100] flex h-dvh flex-col overflow-hidden bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] [animation:project-layer-in_260ms_ease_both] [backdrop-filter:blur(24px)_saturate(.88)] motion-reduce:animate-none"
		bind:this={shell}
		role="dialog"
		aria-modal="true"
		aria-label={copy.navigation}
	>
		<header class="wrap flex min-h-[66px] items-center justify-between gap-5">
			<strong class="font-title text-[.95rem] font-normal">{name}</strong>
			<button
				class={menuControlClass}
				bind:this={closeButton}
				type="button"
				onclick={() => closeMenu()}
				aria-label={copy.close}
			>
				<XIcon size={27} strokeWidth={1.5} aria-hidden="true" />
			</button>
		</header>

		<nav
			class="wrap grid flex-1 content-center"
			aria-label={copy.navigation}
		>
			{#each links as link, index (link.href)}
				<a
					class="group grid grid-cols-[34px_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-rule py-[clamp(14px,2.8vh,24px)] text-ink no-underline last:border-b-0 hover:text-accent-strong focus-visible:text-accent-strong aria-[current=page]:text-accent-strong"
					href={link.href}
					aria-current={link.current ? 'page' : undefined}
					onclick={() => closeMenu(false)}
					style:animation={`project-modal-in 520ms ${index * 55}ms cubic-bezier(.16,1,.3,1) both`}
				>
					<span class="meta text-accent-strong">{link.number}</span>
					<span class="font-title text-[clamp(2.55rem,13vw,4.8rem)] leading-[.86] tracking-[-.045em]">
						{link.label}
					</span>
				</a>
			{/each}
		</nav>

		<footer class="wrap py-4">
			{#if footer}
				{@render footer()}
			{:else}
				<SiteControls expanded />
			{/if}
		</footer>
	</div>
{/if}
