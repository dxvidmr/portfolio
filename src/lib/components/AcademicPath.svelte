<script lang="ts">
	import { onMount } from 'svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import { profile } from '$lib/content/profile';

	let { locale }: { locale: Locale } = $props();
	let root = $state<HTMLElement | null>(null);
	let selected = $state(0);
	const entries = $derived([...profile.education[locale]].reverse());
	const label = $derived(locale === 'es' ? 'Recorrido académico' : 'Academic path');

	const selectEntry = (next: number) => {
		if (next === selected) return;
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
			const next = Math.min(entries.length - 1, Math.floor(progress * entries.length));
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
	class="min-h-[max(720px,140vh)] border-t border-rule-strong pt-[clamp(24px,4vw,44px)]"
	bind:this={root}
>
	<div class="sticky top-[clamp(88px,13vh,126px)]">
		<header><span class="meta">{label}</span></header>

		<div
			class="pt-[clamp(26px,4vw,42px)]"
		>
			<ol
				class="relative m-0 grid max-w-[760px] list-none gap-[3px] pt-0 pr-0 pb-0 pl-[14px] before:absolute before:top-[11px] before:bottom-[11px] before:left-[3px] before:w-px before:bg-rule before:content-['']"
			>
				{#each entries as entry, index (entry.period)}
					<li
						class={`relative [transition:margin_480ms_cubic-bezier(.16,1,.3,1)] before:absolute before:top-[13px] before:left-[-14px] before:h-[7px] before:w-[7px] before:rounded-full before:border before:bg-canvas before:content-[''] before:[transition:background-color_220ms_ease,transform_420ms_cubic-bezier(.16,1,.3,1)] ${
							selected === index
								? 'my-3 before:scale-[1.65] before:border-accent-strong before:bg-accent'
								: 'my-0 before:border-rule-strong'
						}`}
					>
						<button
							class={`group grid w-full cursor-pointer grid-cols-[92px_minmax(0,1fr)] items-start gap-3 rounded-ui-sm border-0 py-2.5 pr-3 pl-3 text-left [transition:background-color_320ms_ease,padding_420ms_cubic-bezier(.16,1,.3,1)] max-[520px]:grid-cols-[76px_minmax(0,1fr)] ${
								selected === index
									? 'bg-[color-mix(in_srgb,var(--accent)_6%,transparent)] py-4'
									: 'bg-transparent'
							}`}
							type="button"
							aria-pressed={selected === index}
							onclick={() => selectEntry(index)}
						>
							<span
								class={`pt-[2px] text-[0.68rem] uppercase [font-variant-numeric:tabular-nums] [transition:color_220ms_ease] ${selected === index ? 'text-accent-strong' : 'text-ink-faint'}`}
							>
								{entry.period}
							</span>
							<span class="grid min-w-0 gap-0">
								<span
									class={`leading-[1.35] [transition:color_220ms_ease,font-size_420ms_cubic-bezier(.16,1,.3,1),transform_420ms_cubic-bezier(.16,1,.3,1)] group-hover:text-accent-strong ${
										selected === index
											? 'text-[clamp(.9rem,1.5vw,1.08rem)] text-accent-strong'
											: 'text-[.76rem] text-ink-dim'
									}`}
								>
									{entry.degree}
								</span>
								<span
									class={`grid [transition:grid-template-rows_480ms_cubic-bezier(.16,1,.3,1),opacity_300ms_ease] ${
										selected === index
											? 'grid-rows-[1fr] opacity-100'
											: 'grid-rows-[0fr] opacity-0'
									}`}
									aria-hidden={selected !== index}
								>
									<span class="overflow-hidden">
										<span class="mt-1.5 block text-[.72rem] leading-[1.45] text-ink-faint">
											{entry.institution}
										</span>
									</span>
								</span>
							</span>
						</button>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
