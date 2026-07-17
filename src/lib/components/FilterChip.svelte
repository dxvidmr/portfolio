<script lang="ts">
	type FilterChipVariant = 'default' | 'all';

	let {
		label,
		active = false,
		variant = 'default',
		onclick
	}: {
		label: string;
		active?: boolean;
		variant?: FilterChipVariant;
		onclick: () => void;
	} = $props();

	const baseClass =
		'meta min-h-[34px] cursor-pointer rounded-full border px-3.5 py-2 leading-none [transition:background-color_180ms_ease,border-color_180ms_ease,color_180ms_ease]';
	const activeClass = 'border-accent-strong bg-accent text-[var(--on-accent)]';
	const defaultClass =
		'border-rule-strong bg-transparent text-ink-dim hover:border-accent-strong hover:text-accent-strong';
	const allClass =
		'mr-1 border-accent-strong bg-accent-wash font-bold text-accent-strong hover:bg-accent hover:text-[var(--on-accent)]';
	const className = $derived(
		`${baseClass} ${active ? activeClass : variant === 'all' ? allClass : defaultClass}`
	);
</script>

<button class={className} type="button" aria-pressed={active} {onclick}>{label}</button>
