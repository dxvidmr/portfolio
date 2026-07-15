<script lang="ts">
	import { onMount } from 'svelte';
	import { profile } from '$lib/content/profile';

	let hh = $state('--');
	let mm = $state('--');

	function tick() {
		const parts = new Intl.DateTimeFormat('en-GB', {
			timeZone: profile.timezone.tz,
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).formatToParts(new Date());
		hh = parts.find((p) => p.type === 'hour')?.value ?? '--';
		mm = parts.find((p) => p.type === 'minute')?.value ?? '--';
	}

	onMount(() => {
		tick();
		const id = setInterval(tick, 1000 * 15);
		return () => clearInterval(id);
	});
</script>

<div class="clock">
	<span class="meta meta--faint">{profile.timezone.label}</span>
	<div class="time dense"><span>{hh}</span><span class="sep">{mm}</span></div>
</div>

<style>
	.clock {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}
	.time {
		display: flex;
		gap: 20px;
		font-size: clamp(2.4rem, 6vw, 3.4rem);
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.sep { position: relative; }
</style>
