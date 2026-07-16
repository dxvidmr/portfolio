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
	class="tw:min-h-[max(680px,125vh)] tw:border-t tw:border-rule-strong tw:pt-[clamp(24px,4vw,44px)]"
	bind:this={root}
>
	<div class="tw:sticky tw:top-[clamp(88px,13vh,126px)]">
		<header
			class="tw:flex tw:items-baseline tw:justify-between tw:gap-[18px] tw:max-[520px]:flex-col tw:max-[520px]:items-start"
		>
			<span class="meta">{copy.label}</span>
			<h3
				class="tw:font-title tw:text-[clamp(1.25rem,2.2vw,1.8rem)] tw:font-normal tw:leading-none tw:text-right tw:max-[520px]:text-left"
			>
				{copy.title}
			</h3>
		</header>

		<div
			class="tw:grid tw:grid-cols-[minmax(210px,.9fr)_minmax(0,1.1fr)] tw:gap-[clamp(26px,4vw,54px)] tw:pt-[clamp(26px,4vw,42px)] tw:max-[940px]:grid-cols-1"
		>
			<ol
				class="tw:relative tw:m-0 tw:grid tw:list-none tw:gap-[3px] tw:pt-0 tw:pr-0 tw:pb-0 tw:pl-[14px] tw:before:absolute tw:before:top-[11px] tw:before:bottom-[11px] tw:before:left-[3px] tw:before:w-px tw:before:bg-rule tw:before:content-['']"
			>
				{#each entries as entry, index (entry.period)}
					<li
						class={`tw:relative tw:before:absolute tw:before:top-[13px] tw:before:left-[-14px] tw:before:h-[7px] tw:before:w-[7px] tw:before:rounded-full tw:before:border tw:before:bg-canvas tw:before:content-[''] tw:before:[transition:background-color_180ms_ease,transform_180ms_ease] ${selected === index ? 'tw:before:scale-[1.45] tw:before:border-accent-strong tw:before:bg-accent' : 'tw:before:border-rule-strong'}`}
					>
						<button
							class="tw:group tw:grid tw:w-full tw:cursor-pointer tw:grid-cols-[82px_minmax(0,1fr)] tw:gap-2.5 tw:rounded-ui-sm tw:border-0 tw:bg-transparent tw:py-2 tw:pr-0 tw:pl-2.5 tw:text-left tw:[transition:color_160ms_ease] tw:max-[520px]:grid-cols-[76px_minmax(0,1fr)]"
							type="button"
							aria-pressed={selected === index}
							onclick={() => selectEntry(index)}
						>
							<span
								class="tw:text-[0.68rem] tw:text-ink-faint tw:uppercase tw:[font-variant-numeric:tabular-nums]"
							>
								{entry.period}
							</span>
							<span
								class={`tw:text-[0.76rem] tw:leading-[1.35] tw:group-hover:text-accent-strong ${selected === index ? 'tw:text-accent-strong' : 'tw:text-ink-dim'}`}
							>
								{entry.degree}
							</span>
						</button>
					</li>
				{/each}
			</ol>

			<div
				class="tw:relative tw:min-h-[138px] tw:overflow-hidden tw:pl-6 tw:[perspective:760px]"
			>
				<span
					class="tw:pointer-events-none tw:absolute tw:top-0.5 tw:bottom-0.5 tw:left-0 tw:z-[2] tw:w-0.5 tw:rounded-[2px] tw:bg-accent"
					aria-hidden="true"
				></span>
				{#key active.period}
					<article
						class={`tw:relative tw:z-[1] tw:min-h-[138px] tw:py-0.5 tw:[backface-visibility:hidden] tw:motion-reduce:animate-none ${direction < 0 ? 'tw:origin-[50%_0] tw:[animation:academic-cube-previous_900ms_cubic-bezier(.16,1,.3,1)_both]' : 'tw:origin-[50%_100%] tw:[animation:academic-cube-next_900ms_cubic-bezier(.16,1,.3,1)_both]'}`}
					>
						<p class="meta tw:m-0 tw:block tw:text-[0.74rem] tw:leading-[1.45] tw:text-ink-dim">
							{active.period}
						</p>
						<h4
							class="tw:mt-[5px] tw:mb-2 tw:font-title tw:text-[clamp(1.1rem,1.7vw,1.35rem)] tw:font-medium tw:leading-[1.2]"
						>
							{active.degree}
						</h4>
						<p class="tw:m-0 tw:block tw:text-[0.74rem] tw:leading-[1.45] tw:text-ink-dim">
							{active.institution}
						</p>
						<small
							class="tw:mt-[7px] tw:block tw:text-[0.74rem] tw:leading-[1.45] tw:text-ink-faint"
							>{active.detail}</small
						>
					</article>
				{/key}
			</div>
		</div>
	</div>
</section>
