<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		message,
		success = true,
		duration
	}: { message: string; success?: boolean; duration?: number } = $props();

	let visible = $state(true);
	const toastClasses = $derived(
		`fixed top-4 right-4 z-[1000] grid w-[min(26rem,calc(100vw-2rem))] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border border-l-[3px] border-rule bg-[var(--admin-surface-raised)] px-[0.9rem] py-[0.8rem] text-ink shadow-[0_1rem_2.5rem_rgb(0_0_0/55%)] motion-reduce:transition-none max-[520px]:top-3 max-[520px]:right-3 max-[520px]:w-[calc(100vw-1.5rem)] ${success ? 'border-l-accent-strong' : 'border-l-danger'}`
	);

	$effect(() => {
		const timeout = window.setTimeout(() => {
			visible = false;
		}, duration ?? (success ? 3500 : 6000));

		return () => window.clearTimeout(timeout);
	});
</script>

{#if visible}
	<div
		class={toastClasses}
		role={success ? 'status' : 'alert'}
		aria-live={success ? 'polite' : 'assertive'}
		in:fly={{ y: -12, duration: 160 }}
		out:fade={{ duration: 140 }}
	>
		<span
			class="grid size-[1.35rem] place-items-center rounded-full border border-current text-[0.72rem] {success
				? 'text-accent-strong'
				: 'text-danger'}"
			aria-hidden="true">{success ? '✓' : '!'}</span
		>
		<p class="m-0 text-[0.78rem] leading-[1.45]">{message}</p>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (visible = false)}
			aria-label="Cerrar notificación"
			class="text-[1.1rem]"
		>×</Button>
	</div>
{/if}
