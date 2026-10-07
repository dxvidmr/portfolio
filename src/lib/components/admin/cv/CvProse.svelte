<script lang="ts">
  import type { Snippet } from 'svelte';
  import { renderCvMarkdown } from '$lib/content/cv-markdown';
  let { body, lead }: { body: string; lead?: Snippet } = $props();
</script>
{#if body.trim() || lead}
  <div class="cv-prose text-[0.95rem] leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#41583d] [&_a]:underline [&_a]:underline-offset-2 [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:font-title [&_h4]:font-medium [&_blockquote]:border-l [&_blockquote]:border-[#d4d7ce] [&_blockquote]:pl-4">
    {#if lead}<p>{@render lead()}</p>{/if}
    {@html renderCvMarkdown(body)}
  </div>
{/if}
