<script lang="ts">
	import InlineTitle from '$lib/components/InlineTitle.svelte';
	import type { Locale } from '$lib/paraglide/runtime';
	import type { EntryMetadata as EntryMetadataValue } from '$lib/types/entry-metadata';
	import PracticeMetadata from './PracticeMetadata.svelte';
	import { CV_SEPARATOR, formatCvRange } from '$lib/content/cv-format';
	import { plainInlineTitle } from '$lib/content/inline-markup';

	// hideInvitation: la página ya muestra «Por invitación» como distintivo y no se repite aquí.
	// title: nombre del mérito, para no repetirlo cuando el evento se llama igual.
	// compact: trabajos técnicos en una línea, sin descripción.
	let { metadata, locale, hideInvitation = false, title = '', compact = false }: { metadata: EntryMetadataValue; locale: Locale; hideInvitation?: boolean; title?: string; compact?: boolean } = $props();

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
	const shownSelection = (metadata: Extract<EntryMetadataValue, { kind: 'event' }>) =>
		hideInvitation && metadata.invited ? null : eventSelection(metadata);
	const folded = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');
	// «Institución, ciudad (país), fechas»; la ciudad no se repite si forma parte de la institución.
	const eventPlace = (metadata: Extract<EntryMetadataValue, { kind: 'event' }>) => {
		// Como en el CV: la institución se omite si ya forma parte del nombre del evento.
		const named = metadata.institution ? withoutTerminalPunctuation(metadata.institution) : '';
		const institution = named && !folded(metadata.event_title ?? '').includes(folded(named)) ? named : '';
		const city = metadata.city && !folded(`${named} ${metadata.event_title ?? ''}`).includes(folded(metadata.city)) ? metadata.city : '';
		const place = [institution, city].filter(Boolean).join(', ');
		const withCountry = metadata.country ? (place ? `${place} (${withoutTerminalPunctuation(metadata.country)})` : withoutTerminalPunctuation(metadata.country)) : place;
		const dates = metadata.date_start ? formatCvRange(metadata.date_start, metadata.date_end, locale) : '';
		return [withCountry, dates].filter(Boolean).join(', ');
	};
	const stayLine = (metadata: Extract<EntryMetadataValue, { kind: 'stay' }>) => {
		const text = metadata.text ? withoutTerminalPunctuation(metadata.text) : '';
		const city = metadata.city && !folded(text).includes(folded(metadata.city)) ? metadata.city : '';
		const dates = metadata.date_start ? formatCvRange(metadata.date_start, metadata.date_end, locale) : '';
		return [text, metadata.supervisor, city, dates].filter(Boolean).join(CV_SEPARATOR);
	};
	const eventSession = (metadata: Extract<EntryMetadataValue, { kind: 'event' }>) =>
		locale === 'en' ? metadata.session_label_en : metadata.session_label_es;
	const publicationContext = (metadata: Extract<EntryMetadataValue, { kind: 'publication' }>) =>
		[
			locale === 'en' ? metadata.container_type_label_en : metadata.container_type_label_es,
			locale === 'en' ? metadata.conference_format_label_en : metadata.conference_format_label_es,
			locale === 'en' ? metadata.review_status_label_en : metadata.review_status_label_es
		].filter((value): value is string => Boolean(value));
</script>

{#if metadata.kind === 'project' || metadata.kind === 'professional'}
	<PracticeMetadata {metadata} {locale} {compact} />
{:else if metadata.kind === 'publication'}
	{#if isEditorialPublication(metadata.my_role) && metadata.editors}
		<span>{editorialLead(metadata.my_role)} {#each authorSegments(withoutTerminalPunctuation(metadata.editors)) as segment, index (index)}{#if segment.own && !isSoleAuthor(metadata.editors)}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>
	{:else if metadata.authors && !isSoleAuthor(metadata.authors)}
		<span>{#each authorSegments(withoutTerminalPunctuation(metadata.authors)) as segment, index (index)}{#if segment.own}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>
	{/if}
	{#if metadata.container_title}
		{#if metadata.container_kind === 'book'}<span>{locale === 'es' ? 'En ' : 'In '}</span>{/if}<em><InlineTitle text={withoutTerminalPunctuation(metadata.container_title)} /></em>{#if metadata.editors}<span>, {locale === 'es' ? 'editado por' : 'edited by'} {withoutTerminalPunctuation(metadata.editors)}</span>{/if}{#if metadata.volume}<span>, vol. {withoutTerminalPunctuation(metadata.volume)}</span>{/if}{#if metadata.issue}<span>, {locale === 'es' ? 'n.º' : 'no.'} {withoutTerminalPunctuation(metadata.issue)}</span>{/if}{#if metadata.pages}<span>{metadata.container_kind === 'book' ? ', ' : ': '}{withoutTerminalPunctuation(metadata.pages)}</span>{/if}{#if metadata.publisher}<span>. {withoutTerminalPunctuation(metadata.publisher)}</span>{/if}<span>.</span>
	{:else if metadata.publisher}
		<span>{sentence(metadata.publisher)}</span>
	{/if}
	{#if publicationContext(metadata).length}<span> {publicationContext(metadata).join('; ')}.</span>{/if}
{:else if metadata.kind === 'event'}
	{#if metadata.authors && !isSoleAuthor(metadata.authors)}<span>{#each authorSegments(withoutTerminalPunctuation(metadata.authors)) as segment, index (index)}{#if segment.own}<span class="underline decoration-[.08em] underline-offset-[.14em]">{segment.text}</span>{:else}{segment.text}{/if}{/each}. </span>{/if}
	{#if metadata.event_title && folded(withoutTerminalPunctuation(metadata.event_title)) !== folded(withoutTerminalPunctuation(plainInlineTitle(title)))}<em><InlineTitle text={withoutTerminalPunctuation(metadata.event_title)} /></em><span>{eventPlace(metadata) ? '. ' : '.'}</span>{/if}{#if eventPlace(metadata)}<span>{eventPlace(metadata)}.</span>{/if}
	{#if shownSelection(metadata) || eventSession(metadata) || metadata.session_title}<span> {#if shownSelection(metadata)}{shownSelection(metadata)}{/if}{#if eventSession(metadata)}{shownSelection(metadata) ? ', ' : ''}{eventSession(metadata)}{/if}{#if metadata.session_title}{shownSelection(metadata) || eventSession(metadata) ? ': ' : ''}{withoutTerminalPunctuation(metadata.session_title)}{/if}.</span>{/if}
{:else if metadata.kind === 'stay'}
	{#if stayLine(metadata)}<span>{sentence(stayLine(metadata))}</span>{/if}
	{#if metadata.funding.length}
		<span class="mt-1 block"><span class="text-accent-strong">{locale === 'es' ? 'Financiación' : 'Funding'}:</span> {#each metadata.funding as funding, index (funding.title)}{#if index > 0}{'; '}{/if}<span>{fundingTypeLabel(funding)} | {compactFundingBody(funding.awarding_body, funding.title)}</span>{/each}.</span>
	{/if}
{:else if folded(withoutTerminalPunctuation(metadata.text)) !== folded(withoutTerminalPunctuation(plainInlineTitle(title)))}
	<span>{sentence(metadata.text)}</span>
{/if}
