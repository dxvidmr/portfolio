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
	class="tw:mt-10 tw:border-t tw:border-rule tw:pt-6 {attendance
		? 'tw:rounded-ui tw:border tw:border-warning tw:p-5'
		: ''}"
	aria-labelledby="documents-title"
>
	<h2 class="tw:mt-0 tw:mb-4 tw:text-base" id="documents-title">
		{attendance ? 'Certificados de asistencia' : 'Documentos'}
	</h2>
	<p class="tw:max-w-[72ch] tw:leading-[1.6] tw:text-ink-dim">
		{attendance
			? 'Enlaza el certificado de Drive u otra ubicación. Estos archivos son siempre privados y nunca llegan a la web pública.'
			: 'Gestiona archivos enlazados sin subirlos a la aplicación. Los certificados son siempre privados; los demás solo se publican con autorización explícita.'}
	</p>

	<div class="tw:grid tw:gap-3">
		{#if editor.documents.length === 0}
			<p class="tw:m-0 tw:border tw:border-dashed tw:border-rule tw:p-4 tw:text-xs tw:text-ink-faint">
				{attendance ? 'No hay certificado enlazado.' : 'No hay documentos enlazados.'}
			</p>
		{:else}
			{#each editor.documents as document, index (document.id)}
				<article
					class="tw:grid tw:grid-cols-[minmax(0,1fr)_auto] tw:items-end tw:gap-[0.9rem] tw:rounded-ui tw:border tw:border-rule tw:bg-[var(--admin-surface)] tw:p-4 tw:max-[850px]:grid-cols-1"
				>
					<form class="tw:grid tw:gap-[0.8rem]" method="POST" action="?/guardarDocumento" use:enhance={enhancedSubmit(`save:${document.id}`)}>
						<input type="hidden" name="documentId" value={document.id} />
						<div class="tw:grid tw:grid-cols-3 tw:gap-[0.65rem] tw:max-[650px]:grid-cols-1">
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
							<div class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
								<label class="tw:flex tw:items-center tw:gap-1.5 tw:text-[0.68rem] tw:text-ink-dim"><Checkbox name="isCertificate" value="1" checked={document.isCertificate} /> Certificado (siempre privado)</label>
								<label class="tw:flex tw:items-center tw:gap-1.5 tw:text-[0.68rem] tw:text-ink-dim"><Checkbox name="isPublic" value="1" checked={document.isPublic} disabled={document.isCertificate} /> Público</label>
							</div>
						{/if}
						<Button type="submit" disabled={pending.includes(`save:${document.id}`)}>Guardar documento</Button>
					</form>
					<div class="tw:flex tw:flex-wrap tw:items-center tw:justify-end tw:gap-2 tw:max-[850px]:justify-start">
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`up:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="up" />
							<Button size="icon" type="submit" aria-label="Subir documento" disabled={index === 0 || pending.includes(`up:${document.id}`)}>↑</Button>
						</form>
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`down:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="down" />
							<Button size="icon" type="submit" aria-label="Bajar documento" disabled={index === editor.documents.length - 1 || pending.includes(`down:${document.id}`)}>↓</Button>
						</form>
						<form method="POST" action="?/eliminarDocumento" use:enhance={enhancedSubmit(`remove:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} />
							<Button variant="danger" type="submit" disabled={pending.includes(`remove:${document.id}`)}>Eliminar</Button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="tw:mt-3 tw:rounded-ui tw:border tw:border-rule tw:bg-[var(--admin-surface)] tw:p-4">
		<summary class="tw:cursor-pointer tw:text-xs tw:text-accent-strong">+ {attendance ? 'Enlazar certificado' : 'Añadir documento'}</summary>
		<form class="tw:mt-4 tw:grid tw:gap-[0.8rem]" method="POST" action="?/crearDocumento" use:enhance={enhancedSubmit('create')}>
			<div class="tw:grid tw:grid-cols-3 tw:gap-[0.65rem] tw:max-[650px]:grid-cols-1">
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
				<div class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
					<label class="tw:flex tw:items-center tw:gap-1.5 tw:text-[0.68rem] tw:text-ink-dim"><Checkbox name="isCertificate" value="1" /> Certificado (siempre privado)</label>
					<label class="tw:flex tw:items-center tw:gap-1.5 tw:text-[0.68rem] tw:text-ink-dim"><Checkbox name="isPublic" value="1" /> Público</label>
				</div>
			{/if}
			<Button type="submit" disabled={pending.includes('create')}>{attendance ? 'Enlazar certificado' : 'Añadir documento'}</Button>
		</form>
	</details>
</section>
