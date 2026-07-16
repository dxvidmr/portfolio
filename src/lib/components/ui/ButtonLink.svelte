<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type Size = 'sm' | 'md';

	type Props = Omit<HTMLAnchorAttributes, 'children' | 'class'> & {
		children: Snippet;
		variant?: Variant;
		size?: Size;
		class?: string;
	};

	let {
		children,
		variant = 'secondary',
		size = 'md',
		class: className = '',
		...attributes
	}: Props = $props();

	const base =
		'tw:inline-flex tw:cursor-pointer tw:items-center tw:justify-center tw:gap-1.5 tw:rounded-ui-sm tw:border tw:bg-transparent tw:font-mono tw:leading-[1.2] tw:transition-[border-color,color,background-color] tw:duration-[120ms]';
	const variants: Record<Variant, string> = {
		primary:
			'tw:border-accent-strong tw:text-accent-strong tw:hover:bg-accent-wash tw:hover:text-accent-strong',
		secondary:
			'tw:border-rule-strong tw:text-ink-dim tw:hover:border-accent-strong tw:hover:bg-accent-wash tw:hover:text-accent-strong',
		danger:
			'tw:border-danger tw:text-danger tw:hover:border-danger tw:hover:bg-danger-soft tw:hover:text-danger',
		ghost:
			'tw:border-transparent tw:text-ink-dim tw:hover:bg-accent-wash tw:hover:text-accent-strong'
	};
	const sizes: Record<Size, string> = {
		sm: 'tw:min-h-8 tw:px-2 tw:py-1.5 tw:text-[0.65rem]',
		md: 'tw:min-h-9 tw:px-3 tw:py-2 tw:text-[0.72rem]'
	};
	const classes = $derived(`${base} ${variants[variant]} ${sizes[size]} ${className}`);
</script>

<a {...attributes} class={classes}>
	{@render children()}
</a>
