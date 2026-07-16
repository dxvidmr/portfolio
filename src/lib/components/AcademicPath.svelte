<script lang="ts">
	import { onMount } from 'svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile } from '$lib/content/profile';

	let { locale }: { locale: Locale } = $props();
	let root = $state<HTMLElement | null>(null);
	let selected = $state(0);
	let direction = $state(1);
	const entries = $derived([...profile.education[locale]].reverse());
	const active = $derived(entries[selected] ?? entries[0]);
	const copy = $derived(
		locale === 'es'
			? { label: 'Recorrido académico', title: 'De la escena a los datos' }
			: { label: 'Academic path', title: 'From stage to data' }
	);

	const selectEntry = (next: number) => {
		if (next === selected) return;
		direction = next > selected ? 1 : -1;
		selected = next;
	};

	onMount(() => {
		let frame = 0;

		const updateFromScroll = () => {
			frame = 0;
			if (!root) return;
			const rect = root.getBoundingClientRect();
			const viewport = Math.max(1, window.innerHeight);
			const start = viewport * 0.58;
			const travel = Math.max(1, rect.height - viewport * 0.1);
			const progress = Math.min(1, Math.max(0, (start - rect.top) / travel));
			const thresholds = [0, 0.22, 0.45, 0.86];
			const next = Math.min(
				entries.length - 1,
				thresholds.reduce((index, threshold, candidate) => (progress >= threshold ? candidate : index), 0)
			);
			selectEntry(next);
		};

		const handleScroll = () => {
			if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
		};

		updateFromScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });

		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	});
</script>

<section
	class="min-h-[max(680px,125vh)] border-t border-rule-strong pt-[clamp(24px,4vw,44px)]"
	bind:this={root}
>
	<div class="sticky top-[clamp(88px,13vh,126px)]">
		<header
			class="flex items-baseline justify-between gap-[18px] max-[520px]:flex-col max-[520px]:items-start"
		>
			<span class="meta">{copy.label}</span>
			<h3
				class="font-title text-[clamp(1.25rem,2.2vw,1.8rem)] font-normal leading-none text-right max-[520px]:text-left"
			>
				{copy.title}
			</h3>
		</header>

		<div
			class="grid grid-cols-[minmax(210px,.9fr)_minmax(0,1.1fr)] gap-[clamp(26px,4vw,54px)] pt-[clamp(26px,4vw,42px)] max-[940px]:grid-cols-1"
		>
			<ol
				class="relative m-0 grid list-none gap-[3px] pt-0 pr-0 pb-0 pl-[14px] before:absolute before:top-[11px] before:bottom-[11px] before:left-[3px] before:w-px before:bg-rule before:content-['']"
			>
				{#each entries as entry, index (entry.period)}
					<li
						class={`relative before:absolute before:top-[13px] before:left-[-14px] before:h-[7px] before:w-[7px] before:rounded-full before:border before:bg-canvas before:content-[''] before:[transition:background-color_180ms_ease,transform_180ms_ease] ${selected === index ? 'before:scale-[1.45] before:border-accent-strong before:bg-accent' : 'before:border-rule-strong'}`}
					>
						<button
							class="group grid w-full cursor-pointer grid-cols-[82px_minmax(0,1fr)] gap-2.5 rounded-ui-sm border-0 bg-transparent py-2 pr-0 pl-2.5 text-left [transition:color_160ms_ease] max-[520px]:grid-cols-[76px_minmax(0,1fr)]"
							type="button"
							aria-pressed={selected === index}
							onclick={() => selectEntry(index)}
						>
							<span
								class="text-[0.68rem] text-ink-faint uppercase [font-variant-numeric:tabular-nums]"
							>
								{entry.period}
							</span>
							<span
								class={`text-[0.76rem] leading-[1.35] group-hover:text-accent-strong ${selected === index ? 'text-accent-strong' : 'text-ink-dim'}`}
							>
								{entry.degree}
							</span>
						</button>
					</li>
				{/each}
			</ol>

			<div
				class="relative min-h-[138px] overflow-hidden pl-6 [perspective:760px]"
			>
				<span
					class="pointer-events-none absolute top-0.5 bottom-0.5 left-0 z-[2] w-0.5 rounded-[2px] bg-accent"
					aria-hidden="true"
				></span>
				{#key active.period}
					<article
						class={`relative z-[1] min-h-[138px] py-0.5 [backface-visibility:hidden] motion-reduce:animate-none ${direction < 0 ? 'origin-[50%_0] [animation:academic-cube-previous_900ms_cubic-bezier(.16,1,.3,1)_both]' : 'origin-[50%_100%] [animation:academic-cube-next_900ms_cubic-bezier(.16,1,.3,1)_both]'}`}
					>
						<p class="meta m-0 block text-[0.74rem] leading-[1.45] text-ink-dim">
							{active.period}
						</p>
						<h4
							class="mt-[5px] mb-2 font-title text-[clamp(1.1rem,1.7vw,1.35rem)] font-medium leading-[1.2]"
						>
							{active.degree}
						</h4>
						<p class="m-0 block text-[0.74rem] leading-[1.45] text-ink-dim">
							{active.institution}
						</p>
						<small
							class="mt-[7px] block text-[0.74rem] leading-[1.45] text-ink-faint"
							>{active.detail}</small
						>
					</article>
				{/key}
			</div>
		</div>
	</div>
</section>
