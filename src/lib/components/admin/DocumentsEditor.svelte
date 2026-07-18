<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { DocumentEditor } from '$lib/server/admin/documents';
	import AdminField from './AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Save from '@lucide/svelte/icons/save';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

	let { editor }: { editor: DocumentEditor } = $props();
	let pending = $state<string[]>([]);
	const attendance = $derived(editor.ownerKind === 'attendance');

	const enhancedSubmit = (key: string): SubmitFunction =>
		() => {
			pending = [...pending, key];
			return async ({ update }) => {
				try { await update({ reset: false }); }
				finally { pending = pending.filter((item) => item !== key); }
			};
		};
</script>

<section
	id="documents-section"
	class="scroll-mt-36 mt-10 border-t border-rule pt-6 {attendance
		? 'rounded-ui border border-warning p-5'
		: ''}"
	aria-labelledby="documents-title"
>
	<h2 class="mt-0 mb-5 text-sm font-medium tracking-[0.08em] text-ink-dim uppercase" id="documents-title">
		{attendance ? 'Certificados de asistencia' : 'Documentos'}
	</h2>
	{#if editor.documents.length > 0}
		<p class="max-w-[72ch] leading-[1.6] text-ink-dim">
			{attendance
				? 'Estos certificados son siempre privados y nunca llegan a la web pública.'
				: 'Todos los documentos son privados y nunca llegan a la web pública.'}
		</p>
	{/if}

	<div class="grid gap-3">
		{#if editor.documents.length > 0}
			{#each editor.documents as document, index (document.id)}
				<article
					class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[0.9rem] rounded-ui border border-rule bg-[var(--admin-surface)] p-4 max-[850px]:grid-cols-1"
				>
					<form class="grid gap-[0.8rem]" method="POST" action="?/guardarDocumento" use:enhance={enhancedSubmit(`save:${document.id}`)}>
						<input type="hidden" name="documentId" value={document.id} />
						<div class="grid grid-cols-3 gap-[0.65rem] max-[650px]:grid-cols-1">
							{#if attendance}
								<input type="hidden" name="documentType" value="doc_certificate" />
								<input type="hidden" name="isCertificate" value="1" />
							{:else}
								<AdminField label="Tipo"><Select name="documentType" value={document.documentType}>{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}</Select></AdminField>
							{/if}
							<AdminField label="Título" wide={attendance}><Input name="title" value={document.title} placeholder="Opcional" /></AdminField>
							<AdminField label="URL" wide><Input type="url" name="url" value={document.url} required /></AdminField>
							<AdminField label="ID de Drive"><Input name="driveFileId" value={document.driveFileId} placeholder="Se detecta desde la URL" /></AdminField>
							<AdminField label="Emitido por"><Input name="issuedBy" value={document.issuedBy} /></AdminField>
							<AdminField label="Fecha de emisión"><Input name="issuedDate" value={document.issuedDate} placeholder="AAAA-MM-DD" /></AdminField>
							<AdminField label="Notas privadas" wide><Textarea name="notesPrivate" rows={2} value={document.notesPrivate} /></AdminField>
						</div>
						{#if !attendance}
							<div class="flex flex-wrap items-center gap-2">
								<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isCertificate" value="1" checked={document.isCertificate} /> Certificado (siempre privado)</label>
							</div>
						{/if}
						<Button type="submit" disabled={pending.includes(`save:${document.id}`)}><Save size={14} strokeWidth={1.7} aria-hidden="true" />Guardar documento</Button>
					</form>
					<div class="flex flex-wrap items-center justify-end gap-2 max-[850px]:justify-start">
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`up:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="up" />
							<Button size="icon" type="submit" aria-label="Subir documento" title="Subir" disabled={index === 0 || pending.includes(`up:${document.id}`)}><ChevronUp size={15} aria-hidden="true" /></Button>
						</form>
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`down:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="down" />
							<Button size="icon" type="submit" aria-label="Bajar documento" title="Bajar" disabled={index === editor.documents.length - 1 || pending.includes(`down:${document.id}`)}><ChevronDown size={15} aria-hidden="true" /></Button>
						</form>
						<form method="POST" action="?/eliminarDocumento" use:enhance={enhancedSubmit(`remove:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} />
							<Button variant="danger" type="submit" disabled={pending.includes(`remove:${document.id}`)}><Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />Eliminar</Button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="mt-3 rounded-ui border border-rule bg-[var(--admin-surface)] p-4">
		<summary class="flex cursor-pointer list-none items-center gap-1.5 text-xs text-accent-strong marker:hidden">
			<Plus size={14} strokeWidth={1.7} aria-hidden="true" />{attendance
				? editor.documents.length === 0
					? 'Enlazar certificado'
					: 'Enlazar otro certificado'
				: editor.documents.length === 0
					? 'Añadir el primer documento'
					: 'Añadir documento'}
		</summary>
		<form class="mt-4 grid gap-[0.8rem]" method="POST" action="?/crearDocumento" use:enhance={enhancedSubmit('create')}>
			<div class="grid grid-cols-3 gap-[0.65rem] max-[650px]:grid-cols-1">
				{#if attendance}
					<input type="hidden" name="documentType" value="doc_certificate" />
					<input type="hidden" name="isCertificate" value="1" />
				{:else}
					<AdminField label="Tipo"><Select name="documentType">{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}</Select></AdminField>
				{/if}
				<AdminField label="Título" wide={attendance}><Input name="title" placeholder="Opcional" /></AdminField>
				<AdminField label="URL" wide><Input type="url" name="url" placeholder="https://drive.google.com/…" required /></AdminField>
				<AdminField label="ID de Drive"><Input name="driveFileId" placeholder="Se detecta desde la URL" /></AdminField>
				<AdminField label="Emitido por"><Input name="issuedBy" /></AdminField>
				<AdminField label="Fecha de emisión"><Input name="issuedDate" placeholder="AAAA-MM-DD" /></AdminField>
				<AdminField label="Notas privadas" wide><Textarea name="notesPrivate" rows={2} /></AdminField>
			</div>
			{#if !attendance}
				<div class="flex flex-wrap items-center gap-2">
					<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isCertificate" value="1" /> Certificado (siempre privado)</label>
				</div>
			{/if}
			<Button type="submit" disabled={pending.includes('create')}><Plus size={14} strokeWidth={1.7} aria-hidden="true" />{attendance ? 'Enlazar certificado' : 'Añadir documento'}</Button>
		</form>
	</details>
</section>
