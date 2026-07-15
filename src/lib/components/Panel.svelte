<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		children,
		padded = true,
		class: klass = ''
	}: { children: Snippet; padded?: boolean; class?: string } = $props();
</script>

<div class="panel {klass}" class:padded>
	<span class="c c-tl"></span>
	<span class="c c-tr"></span>
	<span class="c c-bl"></span>
	<span class="c c-br"></span>
	{@render children()}
</div>

<style>
	.panel {
		position: relative;
		border: 1px solid var(--line);
		background: var(--bg-panel);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.padded {
		padding: clamp(16px, 2.4vw, 26px);
	}
	/* corchetes de escuadra */
	.c {
		position: absolute;
		width: 9px;
		height: 9px;
		pointer-events: none;
	}
	.c-tl { top: -1px; left: -1px; border-top: 1px solid var(--fg); border-left: 1px solid var(--fg); border-top-left-radius: var(--radius-sm); }
	.c-tr { top: -1px; right: -1px; border-top: 1px solid var(--fg); border-right: 1px solid var(--fg); border-top-right-radius: var(--radius-sm); }
	.c-bl { bottom: -1px; left: -1px; border-bottom: 1px solid var(--fg); border-left: 1px solid var(--fg); border-bottom-left-radius: var(--radius-sm); }
	.c-br { bottom: -1px; right: -1px; border-bottom: 1px solid var(--fg); border-right: 1px solid var(--fg); border-bottom-right-radius: var(--radius-sm); }
</style>
