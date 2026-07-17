<script lang="ts">
	import type { Locale } from '$lib/paraglide/runtime';
	import type { EntryMetadata as EntryMetadataValue } from '$lib/types/entry-metadata';

	let { metadata, locale }: { metadata: EntryMetadataValue; locale: Locale } = $props();

	const withoutTerminalPunctuation = (value: string) => value.trim().replace(/[.,;:]\s*$/, '');
	const sentence = (value: string) => `${withoutTerminalPunctuation(value)}.`;
	const ownAuthorNames = ['david merino recalde', 'merino recalde, david'];
	const normalizedAuthorText = (value: string) =>
		withoutTerminalPunctuation(value).replace(/\s+/g, ' ').toLocaleLowerCase('es');
	const isSoleAuthor = (value: string | null) =>
		value ? ownAuthorNames.includes(normalizedAuthorText(value)) : false;
	const isEditorialPublication = (role: string | null) =>
		role === 'publication_editor' || role === 'publication_coeditor';
	const editorialLead = (role: string | null) => {
		if (locale === 'en') return role === 'publication_coeditor' ? 'Co-edited by' : 'Edited by';
		return role === 'publication_coeditor' ? 'Coedición de' : 'Edición de';
	};
	const authorSegments = (value: string) => {
		const segments: Array<{ text: string; own: boolean }> = [];
		const pattern = /David Merino Recalde|Merino Recalde,\s*David/gi;
		let cursor = 0;
		for (const match of value.matchAll(pattern)) {
			const index = match.index ?? 0;
			if (index > cursor) segments.push({ text: value.slice(cursor, index), own: false });
			segments.push({ text: match[0], own: true });
			cursor = index + match[0].length;
		}
		if (cursor < value.length) segments.push({ text: value.slice(cursor), own: false });
		return segments;
	};
	const fundingTypeLabel = (funding: Extract<EntryMetadataValue, { kind: 'stay' }>['funding'][number]) =>
		(locale === 'en' ? funding.type_label_en : funding.type_label_es) ??
		funding.type?.replaceAll('_', ' ') ??
		(locale === 'es' ? 'Ayuda' : 'Funding');
	const compactFundingBody = (value: string | null, fallback: string) => {
		if (!value) return fallback;
		const acronym = value.match(/\(([A-ZÀ-Ý][A-ZÀ-Ý0-9-]{2,})\)\s*$/)?.[1];
		return acronym ?? value.split(',')[0]?.trim() ?? value;
	};
	const eventSelection = (metadata: Extract<EntryMetadataValue, { kind: 'event' }>) =>
		locale === 'en' ? metadata.selection_label_en : metadata.selection_label_es;
	const eventSession = (metadata: Extract<EntryMetadataValue, { kind: 'event' }>) =>
		locale === 'en' ? metadata.session_label_en : metadata.session_label_es;
	const publicationContext = (metadata: Extract<EntryMetadataValue, { kind: 'publication' }>) =>
		[
			locale === 'en' ? metadata.container_type_label_en : metadata.container_type_label_es,
			locale === 'en' ? metadata.conference_format_label_en : metadata.conference_format_label_es,
			locale === 'en' ? metadata.review_status_label_en : metadata.review_status_label_es
		].filter((value): value is string => Boolean(value));
</script>

{#if metadata.kind === 'publication'}
	{#if isEditorialPublication(metadata.my_role) && metadata.editors}
		<span>{editorialLead(metadata.my_role)} {#each authorSegments(withoutTerminalPunctuation(metadata.editors)) as segment, index (index)}{#if segment.own && !isSoleAuthor(metadata.editors)}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>
	{:else if metadata.authors && !isSoleAuthor(metadata.authors)}
		<span>{#each authorSegments(withoutTerminalPunctuation(metadata.authors)) as segment, index (index)}{#if segment.own}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>
	{/if}
	{#if metadata.container_title}
		{#if metadata.container_kind === 'book'}<span>{locale === 'es' ? 'En ' : 'In '}</span>{/if}<em>{withoutTerminalPunctuation(metadata.container_title)}</em>{#if metadata.editors}<span>, {locale === 'es' ? 'editado por' : 'edited by'} {withoutTerminalPunctuation(metadata.editors)}</span>{/if}{#if metadata.volume}<span>, vol. {withoutTerminalPunctuation(metadata.volume)}</span>{/if}{#if metadata.issue}<span>, {locale === 'es' ? 'n.º' : 'no.'} {withoutTerminalPunctuation(metadata.issue)}</span>{/if}{#if metadata.pages}<span>{metadata.container_kind === 'book' ? ', ' : ': '}{withoutTerminalPunctuation(metadata.pages)}</span>{/if}{#if metadata.publisher}<span>. {withoutTerminalPunctuation(metadata.publisher)}</span>{/if}<span>.</span>
	{:else if metadata.publisher}
		<span>{sentence(metadata.publisher)}</span>
	{/if}
	{#if publicationContext(metadata).length}<span> {publicationContext(metadata).join('; ')}.</span>{/if}
{:else if metadata.kind === 'event'}
	{#if metadata.authors && !isSoleAuthor(metadata.authors)}<span>{#each authorSegments(withoutTerminalPunctuation(metadata.authors)) as segment, index (index)}{#if segment.own}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>{/if}
	{#if metadata.event_title}<em>{withoutTerminalPunctuation(metadata.event_title)}</em><span>{metadata.institution || metadata.country ? '. ' : '.'}</span>{/if}{#if metadata.institution}<span>{withoutTerminalPunctuation(metadata.institution)}</span>{/if}{#if metadata.country}<span>{metadata.institution ? ' (' : ''}{withoutTerminalPunctuation(metadata.country)}{metadata.institution ? ')' : ''}</span>{/if}{#if metadata.institution || metadata.country}<span>.</span>{/if}
	{#if eventSelection(metadata) || eventSession(metadata) || metadata.session_title}<span> {#if eventSelection(metadata)}{eventSelection(metadata)}{/if}{#if eventSession(metadata)}{eventSelection(metadata) ? ', ' : ''}{eventSession(metadata)}{/if}{#if metadata.session_title}{eventSelection(metadata) || eventSession(metadata) ? ': ' : ''}{withoutTerminalPunctuation(metadata.session_title)}{/if}.</span>{/if}
{:else if metadata.kind === 'stay'}
	{#if metadata.text}<span>{sentence(metadata.text)}</span>{/if}
	{#if metadata.funding.length}
		<span class="mt-1 block"><span class="text-accent-strong">{locale === 'es' ? 'Financiación' : 'Funding'}:</span> {#each metadata.funding as funding, index (funding.title)}{#if index > 0}<span>; </span>{/if}<span>{fundingTypeLabel(funding)} · {compactFundingBody(funding.awarding_body, funding.title)}</span>{/each}.</span>
	{/if}
{:else}
	<span>{sentence(metadata.text)}</span>
{/if}
