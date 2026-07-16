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
		`tw:fixed tw:top-4 tw:right-4 tw:z-[1000] tw:grid tw:w-[min(26rem,calc(100vw-2rem))] tw:grid-cols-[auto_minmax(0,1fr)_auto] tw:items-center tw:gap-3 tw:border tw:border-l-[3px] tw:border-rule tw:bg-[var(--admin-surface-raised)] tw:px-[0.9rem] tw:py-[0.8rem] tw:text-ink tw:shadow-[0_1rem_2.5rem_rgb(0_0_0/55%)] tw:motion-reduce:transition-none tw:max-[520px]:top-3 tw:max-[520px]:right-3 tw:max-[520px]:w-[calc(100vw-1.5rem)] ${success ? 'tw:border-l-accent-strong' : 'tw:border-l-danger'}`
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
			class="tw:grid tw:size-[1.35rem] tw:place-items-center tw:rounded-full tw:border tw:border-current tw:text-[0.72rem] {success
				? 'tw:text-accent-strong'
				: 'tw:text-danger'}"
			aria-hidden="true">{success ? '✓' : '!'}</span
		>
		<p class="tw:m-0 tw:text-[0.78rem] tw:leading-[1.45]">{message}</p>
		<Button
			variant="ghost"
			size="icon"
			onclick={() => (visible = false)}
			aria-label="Cerrar notificación"
			class="tw:text-[1.1rem]"
		>×</Button>
	</div>
{/if}
