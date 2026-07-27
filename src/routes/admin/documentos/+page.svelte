<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import SearchableSelect from '$lib/components/admin/SearchableSelect.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Plus from '@lucide/svelte/icons/plus';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let query = $state('');
	let entityType = $state('');
	let year = $state('');
	let documentType = $state('doc_certificate');
	let metadata = $state<'all' | 'complete' | 'incomplete'>('all');

	const normalize = (value: string) =>
		value.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	const certificateCount = $derived(
		data.documents.filter((document) => document.documentType === 'doc_certificate').length
	);
	const otherDocumentCount = $derived(data.documents.length - certificateCount);

	const filtered = $derived.by(() => {
		const q = normalize(query.trim());
		const validYear = /^\d{4}$/.test(year.trim()) ? year.trim() : '';
		return data.documents.filter((document) => {
			if (
				q &&
				!normalize(
					`${document.title} ${document.entryTitle} ${document.eventTitle ?? ''} ${document.issuedBy} ${document.documentTypeLabel}`
				).includes(q)
			) return false;
			if (entityType && document.entityType !== entityType) return false;
			if (documentType && document.documentType !== documentType) return false;
			if (
				validYear &&
				!document.issuedDate.startsWith(validYear) &&
				!document.sortDate?.startsWith(validYear)
			) return false;
			const complete = Boolean(document.issuedBy && document.issuedDate);
			if (metadata === 'complete' && !complete) return false;
			if (metadata === 'incomplete' && complete) return false;
			return true;
		});
	});

	function resetFilters() {
		query = '';
		entityType = '';
		year = '';
		documentType = 'doc_certificate';
		metadata = 'all';
	}
</script>

<svelte:head><title>Documentos · cv/admin</title></svelte:head>

<AdminPageHeader
	title="Documentos"
	eyebrow="Archivo transversal"
	description="Cada documento pertenece a una entrada. Los certificados son el tipo prioritario, pero también puedes registrar carteles, programas, textos, informes y materiales complementarios."
>
	{#snippet actions()}
		<div class="flex flex-wrap items-center gap-3 text-xs text-ink-faint">
			<span>{certificateCount} certificados</span>
			<span>{otherDocumentCount} otros documentos</span>
		</div>
	{/snippet}
</AdminPageHeader>

{#if form?.message}
	{#key form}<AdminToast message={form.message} success={form.success === true} />{/key}
{/if}

<details class="mt-6 rounded-ui border border-accent-strong bg-admin-surface p-5" open={data.documents.length === 0}>
	<summary class="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent-strong marker:hidden">
		<Plus size={15} strokeWidth={1.7} aria-hidden="true" />Añadir documento
	</summary>
	<p class="mt-3 mb-5 max-w-[72ch] text-xs leading-[1.6] text-ink-dim">
		Selecciona primero la entrada propietaria. El formulario propone «Certificado» por defecto, pero
		puedes escoger cualquier otro tipo documental.
	</p>
	<form class="grid gap-4" method="POST" action="?/crear">
		<AdminField label="Entrada relacionada" wide>
			<SearchableSelect
				id="document-owner"
				name="owner"
				options={data.owners}
				required
			/>
		</AdminField>
		<div class="grid grid-cols-3 gap-3 max-[850px]:grid-cols-1">
			<AdminField label="Tipo de documento">
				<Select name="documentType" value="doc_certificate">
					{#each data.documentTypes as type (type.value)}
						<option value={type.value}>{type.label}</option>
					{/each}
				</Select>
			</AdminField>
			<AdminField label="Título">
				<Input name="title" placeholder="Opcional" />
			</AdminField>
			<AdminField label="URL" wide>
				<Input type="url" name="url" placeholder="https://drive.google.com/…" required />
			</AdminField>
			<AdminField label="ID de Drive">
				<Input name="driveFileId" placeholder="Se detecta desde la URL" />
			</AdminField>
			<AdminField label="Emitido por">
				<Input name="issuedBy" />
			</AdminField>
			<AdminField label="Fecha de emisión">
				<Input name="issuedDate" placeholder="AAAA-MM-DD" />
			</AdminField>
			<AdminField label="Notas privadas" wide>
				<Textarea name="notesPrivate" rows={2} />
			</AdminField>
		</div>
		<div><Button type="submit"><Plus size={14} strokeWidth={1.7} aria-hidden="true" />Añadir documento</Button></div>
	</form>
</details>

<section class="my-6 grid gap-4 rounded-ui border border-rule bg-admin-surface p-[clamp(0.8rem,2vw,1.15rem)]" aria-label="Filtros de documentos">
	<div class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 max-[650px]:grid-cols-1">
		<AdminField class="max-w-3xl" label="Buscar documentos">
			<Input bind:value={query} type="search" placeholder="Título, entrada, evento, emisor o tipo…" />
		</AdminField>
		<div class="grid min-w-24 text-right text-ink-dim max-[650px]:hidden" aria-live="polite">
			<strong class="font-title text-[1.35rem] font-medium leading-none text-ink">{filtered.length}</strong>
			<span class="text-[0.65rem] text-ink-faint">resultados</span>
		</div>
	</div>
	<div class="grid grid-cols-4 gap-3 max-[1000px]:grid-cols-2 max-[650px]:grid-cols-1">
		<AdminField label="Tipo de documento">
			<Select bind:value={documentType}>
				<option value="">Todos los documentos</option>
				{#each data.documentTypes as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</Select>
		</AdminField>
		<AdminField label="Tipo de entrada">
			<Select bind:value={entityType}>
				<option value="">Todos los tipos</option>
				{#each data.entityTypes as type (type.value)}
					<option value={type.value}>{type.label}</option>
				{/each}
			</Select>
		</AdminField>
		<AdminField label="Año">
			<Input bind:value={year} inputmode="numeric" maxlength={4} pattern="[0-9]{4}" placeholder="AAAA" />
		</AdminField>
		<AdminField label="Metadatos de emisión">
			<Select bind:value={metadata}>
				<option value="all">Completos e incompletos</option>
				<option value="complete">Con emisor y fecha</option>
				<option value="incomplete">Falta emisor o fecha</option>
			</Select>
		</AdminField>
	</div>
	<div class="flex justify-end">
		<Button
			onclick={resetFilters}
			disabled={!query && !entityType && !year && documentType === 'doc_certificate' && metadata === 'all'}
		>Restablecer certificados</Button>
	</div>
</section>

{#if filtered.length > 0}
	<div class="overflow-x-auto border-t border-rule">
		<table class="w-full min-w-[64rem] border-collapse text-left text-xs">
			<thead>
				<tr class="text-[0.65rem] tracking-[0.08em] text-ink-faint uppercase">
					<th class="border-b border-rule p-3">Documento</th>
					<th class="border-b border-rule p-3">Tipo</th>
					<th class="border-b border-rule p-3">Entrada</th>
					<th class="border-b border-rule p-3">Emitido por</th>
					<th class="border-b border-rule p-3">Fecha</th>
					<th class="border-b border-rule p-3">Archivo</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as document (document.id)}
					<tr>
						<td class="border-b border-rule p-3 align-top">
							<strong class="block max-w-[22rem] font-medium text-ink">
								{document.title || document.documentTypeLabel}
							</strong>
							{#if document.eventTitle}
								<small class="mt-1 block max-w-[22rem] text-ink-faint">{document.eventTitle}</small>
							{/if}
						</td>
						<td class="border-b border-rule p-3 align-top text-ink-dim">{document.documentTypeLabel}</td>
						<td class="border-b border-rule p-3 align-top">
							<a class="grid gap-1 text-ink hover:text-accent-strong" href={`/admin/entradas/${document.entityType}/${document.entityId}`}>
								<span>{document.entryTitle}</span>
								<small class="text-ink-faint">{document.typeLabel}</small>
							</a>
						</td>
						<td class="border-b border-rule p-3 align-top text-ink-dim">{document.issuedBy || '—'}</td>
						<td class="border-b border-rule p-3 align-top text-ink-dim">{document.issuedDate || '—'}</td>
						<td class="border-b border-rule p-3 align-top">
							<a class="inline-flex items-center gap-1.5 text-accent-strong" href={document.url} target="_blank" rel="noreferrer">
								Abrir <ExternalLink size={13} strokeWidth={1.7} aria-hidden="true" />
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="border-t border-rule p-8 text-center text-ink-faint">
		No hay documentos que coincidan con los filtros.
	</p>
{/if}
