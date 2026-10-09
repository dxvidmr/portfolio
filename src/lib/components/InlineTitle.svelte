<script lang="ts">
	import { renderInlineTitle } from '$lib/content/inline-markup';

	// Título con *cursiva* para obras. Para atributos, <title> o búsquedas, usa plainInlineTitle.
	let { text }: { text: string | null | undefined } = $props();
</script>

{@html renderInlineTitle(text)}
