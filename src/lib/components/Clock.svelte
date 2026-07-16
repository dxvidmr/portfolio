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

<div class="flex flex-col items-center gap-2.5">
	<span class="meta meta--faint">{profile.timezone.label}</span>
	<div
		class="dense flex gap-5 text-[clamp(2.4rem,6vw,3.4rem)] font-bold tracking-[0.04em]"
	>
		<span>{hh}</span><span>{mm}</span>
	</div>
</div>
