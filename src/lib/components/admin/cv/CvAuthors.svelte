<script lang="ts">
  let { text, personName }: { text: string; personName: string } = $props();

  const parts = $derived.by(() => {
    const words = personName.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [{ text, own: false }];
    const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const name = (tokens: string[]) => tokens.map(escape).join('\\s+');
    const variants = [name(words)];
    for (let i = 1; i < words.length; i++) {
      variants.push(`${name(words.slice(i))}\\s*,\\s*${name(words.slice(0, i))}`);
    }
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${variants.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
    const result: { text: string; own: boolean }[] = [];
    let offset = 0;
    for (const match of text.matchAll(pattern)) {
      if (match.index > offset) result.push({ text: text.slice(offset, match.index), own: false });
      result.push({ text: match[0], own: true });
      offset = match.index + match[0].length;
    }
    if (offset < text.length) result.push({ text: text.slice(offset), own: false });
    return result;
  });
</script>

{#each parts as part}{#if part.own}<span class="cv-own-author underline decoration-[#536a4f] decoration-1 underline-offset-[3px]">{part.text}</span>{:else}{part.text}{/if}{/each}
