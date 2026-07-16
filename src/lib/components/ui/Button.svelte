<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
	type Size = 'icon' | 'sm' | 'md';

	type Props = Omit<HTMLButtonAttributes, 'children' | 'class'> & {
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
		type = 'button',
		...attributes
	}: Props = $props();

	const base =
		'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-ui-sm border bg-transparent font-mono leading-[1.2] transition-[border-color,color,background-color] duration-[120ms] disabled:cursor-not-allowed disabled:opacity-40';
	const variants: Record<Variant, string> = {
		primary:
			'border-accent-strong text-accent-strong hover:bg-accent-wash hover:text-accent-strong',
		secondary:
			'border-rule-strong text-ink-dim hover:border-accent-strong hover:bg-accent-wash hover:text-accent-strong',
		danger:
			'border-danger text-danger hover:border-danger hover:bg-danger-soft hover:text-danger',
		ghost:
			'border-transparent text-ink-dim hover:bg-accent-wash hover:text-accent-strong'
	};
	const sizes: Record<Size, string> = {
		icon: 'size-9 min-h-9 p-0 text-[0.72rem]',
		sm: 'min-h-8 px-2 py-1.5 text-[0.65rem]',
		md: 'min-h-9 px-3 py-2 text-[0.72rem]'
	};
	const classes = $derived(`${base} ${variants[variant]} ${sizes[size]} ${className}`);
</script>

<button {...attributes} {type} class={classes}>
	{@render children()}
</button>
