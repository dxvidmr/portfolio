<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	let {
		message,
		success = true,
		duration
	}: { message: string; success?: boolean; duration?: number } = $props();

	let visible = $state(true);

	$effect(() => {
		const timeout = window.setTimeout(() => {
			visible = false;
		}, duration ?? (success ? 3500 : 6000));

		return () => window.clearTimeout(timeout);
	});
</script>

{#if visible}
	<div
		class:success
		class:error={!success}
		role={success ? 'status' : 'alert'}
		aria-live={success ? 'polite' : 'assertive'}
		in:fly={{ y: -12, duration: 160 }}
		out:fade={{ duration: 140 }}
	>
		<span class="icon" aria-hidden="true">{success ? '✓' : '!'}</span>
		<p>{message}</p>
		<button type="button" onclick={() => (visible = false)} aria-label="Cerrar notificación">
			×
		</button>
	</div>
{/if}

<style>
	div {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 1000;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.75rem;
		width: min(26rem, calc(100vw - 2rem));
		padding: 0.8rem 0.9rem;
		border: 1px solid #404040;
		border-left: 3px solid;
		background: #171717;
		box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 55%);
		color: #e5e5e5;
	}

	div.success { border-left-color: #00ff88; }
	div.error { border-left-color: #ff6b6b; }

	.icon {
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border: 1px solid currentColor;
		border-radius: 50%;
		font-size: 0.72rem;
	}

	.success .icon { color: #00ff88; }
	.error .icon { color: #ff8b8b; }

	p {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.45;
	}

	button {
		border: 0;
		background: transparent;
		color: #a3a3a3;
		padding: 0.2rem 0.35rem;
		font: inherit;
		font-size: 1.1rem;
		line-height: 1;
		cursor: pointer;
	}

	button:hover { color: #fafafa; }

	button:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 2px;
	}

	@media (max-width: 520px) {
		div {
			top: 0.75rem;
			right: 0.75rem;
			width: calc(100vw - 1.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		div { transition: none; }
	}
</style>
