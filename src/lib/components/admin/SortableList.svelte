<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import GripVertical from '@lucide/svelte/icons/grip-vertical';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		items = $bindable(),
		getKey,
		getLabel,
		onreorder,
		children,
		actions
	}: {
		items: T[];
		getKey: (item: T) => string;
		getLabel: (item: T) => string;
		onreorder?: (items: T[]) => void;
		children: Snippet<[T, number]>;
		actions?: Snippet<[T, number]>;
	} = $props();

	type DropTarget = { index: number; position: 'before' | 'after' };
	let draggedKey = $state<string | null>(null);
	let dropTarget = $state<DropTarget | null>(null);

	const commit = (next: T[]) => {
		items = next;
		onreorder?.(next);
	};

	const moveBy = (index: number, offset: -1 | 1) => {
		const destination = index + offset;
		if (destination < 0 || destination >= items.length) return;
		const next = [...items];
		[next[index], next[destination]] = [next[destination], next[index]];
		commit(next);
	};

	const startDrag = (event: DragEvent, item: T) => {
		draggedKey = getKey(item);
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', draggedKey);
		}
	};

	const updateDropTarget = (event: DragEvent, index: number) => {
		if (!draggedKey) return;
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		dropTarget = { index, position: event.clientY < rect.top + rect.height / 2 ? 'before' : 'after' };
	};

	const drop = (event: DragEvent) => {
		event.preventDefault();
		if (!draggedKey || !dropTarget) return;
		const fromIndex = items.findIndex((item) => getKey(item) === draggedKey);
		if (fromIndex < 0) return;
		let insertionIndex = dropTarget.index + (dropTarget.position === 'after' ? 1 : 0);
		const next = [...items];
		const [moved] = next.splice(fromIndex, 1);
		if (fromIndex < insertionIndex) insertionIndex -= 1;
		next.splice(insertionIndex, 0, moved);
		if (next.some((item, index) => getKey(item) !== getKey(items[index]))) commit(next);
		draggedKey = null;
		dropTarget = null;
	};

	const endDrag = () => {
		draggedKey = null;
		dropTarget = null;
	};
</script>

<ol class="m-0 list-none border-t border-rule p-0">
	{#each items as item, index (getKey(item))}
		<li
			class={`relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-rule py-4 max-[700px]:grid-cols-[2rem_minmax(0,1fr)] ${draggedKey === getKey(item) ? 'opacity-45' : ''}`}
			ondragover={(event) => updateDropTarget(event, index)}
			ondrop={drop}
		>
			{#if dropTarget?.index === index}
				<span
					class={`pointer-events-none absolute right-0 left-0 z-10 h-0.5 bg-accent-strong shadow-[0_0_0_1px_var(--bg),0_0_10px_color-mix(in_srgb,var(--accent)_45%,transparent)] ${dropTarget.position === 'before' ? 'top-[-1px]' : 'bottom-[-1px]'}`}
					aria-hidden="true"
				></span>
			{/if}
			<button
				type="button"
				class="flex cursor-grab items-center gap-1 border-0 bg-transparent p-0 text-ink-faint active:cursor-grabbing"
				draggable="true"
				ondragstart={(event) => startDrag(event, item)}
				ondragend={endDrag}
				aria-label={`Arrastrar ${getLabel(item)} para reordenar`}
				title="Arrastrar para reordenar"
			>
				<GripVertical size={16} strokeWidth={1.6} aria-hidden="true" />
				<span class="font-mono text-[0.65rem]">{String(index + 1).padStart(2, '0')}</span>
			</button>
			<div class="min-w-0">{@render children(item, index)}</div>
			<div class="flex items-center gap-2 max-[700px]:col-start-2 max-[700px]:justify-end">
				<div class="flex gap-px">
					<Button type="button" variant="ghost" size="icon" disabled={index === 0} onclick={() => moveBy(index, -1)} aria-label={`Subir ${getLabel(item)}`} title="Subir"><ChevronUp size={16} /></Button>
					<Button type="button" variant="ghost" size="icon" disabled={index === items.length - 1} onclick={() => moveBy(index, 1)} aria-label={`Bajar ${getLabel(item)}`} title="Bajar"><ChevronDown size={16} /></Button>
				</div>
				{#if actions}{@render actions(item, index)}{/if}
			</div>
		</li>
	{/each}
</ol>
