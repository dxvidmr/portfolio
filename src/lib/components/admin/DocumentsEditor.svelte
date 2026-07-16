<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { DocumentEditor } from '$lib/server/admin/documents';

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

<section class:attendance aria-labelledby="documents-title">
	<h2 id="documents-title">{attendance ? 'Certificados de asistencia' : 'Documentos'}</h2>
	<p class="intro">
		{attendance
			? 'Enlaza el certificado de Drive u otra ubicación. Estos archivos son siempre privados y nunca llegan a la web pública.'
			: 'Gestiona archivos enlazados sin subirlos a la aplicación. Los certificados son siempre privados; los demás solo se publican con autorización explícita.'}
	</p>

	<div class="document-list">
		{#if editor.documents.length === 0}
			<p class="empty">{attendance ? 'No hay certificado enlazado.' : 'No hay documentos enlazados.'}</p>
		{:else}
			{#each editor.documents as document, index (document.id)}
				<article>
					<form method="POST" action="?/guardarDocumento" use:enhance={enhancedSubmit(`save:${document.id}`)}>
						<input type="hidden" name="documentId" value={document.id} />
						<div class="fields">
							{#if attendance}
								<input type="hidden" name="documentType" value="doc_certificate" />
								<input type="hidden" name="isCertificate" value="1" />
							{:else}
								<label><span>Tipo</span><select name="documentType" value={document.documentType}>{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}</select></label>
							{/if}
							<label class:wide={attendance}><span>Título</span><input name="title" value={document.title} placeholder="Opcional" /></label>
							<label class="wide"><span>URL</span><input type="url" name="url" value={document.url} required /></label>
							<label><span>ID de Drive</span><input name="driveFileId" value={document.driveFileId} placeholder="Se detecta desde la URL" /></label>
							<label><span>Emitido por</span><input name="issuedBy" value={document.issuedBy} /></label>
							<label><span>Fecha de emisión</span><input name="issuedDate" value={document.issuedDate} placeholder="AAAA-MM-DD" /></label>
							<label class="wide"><span>Notas privadas</span><textarea name="notesPrivate" rows="2">{document.notesPrivate}</textarea></label>
						</div>
						{#if !attendance}
							<div class="checks">
								<label><input type="checkbox" name="isCertificate" value="1" checked={document.isCertificate} /> Certificado (siempre privado)</label>
								<label><input type="checkbox" name="isPublic" value="1" checked={document.isPublic} disabled={document.isCertificate} /> Público</label>
							</div>
						{/if}
						<button type="submit" disabled={pending.includes(`save:${document.id}`)}>Guardar documento</button>
					</form>
					<div class="row-actions">
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`up:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="up" />
							<button type="submit" aria-label="Subir documento" disabled={index === 0 || pending.includes(`up:${document.id}`)}>↑</button>
						</form>
						<form method="POST" action="?/moverDocumento" use:enhance={enhancedSubmit(`down:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} /><input type="hidden" name="direction" value="down" />
							<button type="submit" aria-label="Bajar documento" disabled={index === editor.documents.length - 1 || pending.includes(`down:${document.id}`)}>↓</button>
						</form>
						<form method="POST" action="?/eliminarDocumento" use:enhance={enhancedSubmit(`remove:${document.id}`)}>
							<input type="hidden" name="documentId" value={document.id} />
							<button class="remove" type="submit" disabled={pending.includes(`remove:${document.id}`)}>Eliminar</button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="add">
		<summary>+ {attendance ? 'Enlazar certificado' : 'Añadir documento'}</summary>
		<form method="POST" action="?/crearDocumento" use:enhance={enhancedSubmit('create')}>
			<div class="fields">
				{#if attendance}
					<input type="hidden" name="documentType" value="doc_certificate" />
					<input type="hidden" name="isCertificate" value="1" />
				{:else}
					<label><span>Tipo</span><select name="documentType">{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}</select></label>
				{/if}
				<label class:wide={attendance}><span>Título</span><input name="title" placeholder="Opcional" /></label>
				<label class="wide"><span>URL</span><input type="url" name="url" placeholder="https://drive.google.com/…" required /></label>
				<label><span>ID de Drive</span><input name="driveFileId" placeholder="Se detecta desde la URL" /></label>
				<label><span>Emitido por</span><input name="issuedBy" /></label>
				<label><span>Fecha de emisión</span><input name="issuedDate" placeholder="AAAA-MM-DD" /></label>
				<label class="wide"><span>Notas privadas</span><textarea name="notesPrivate" rows="2"></textarea></label>
			</div>
			{#if !attendance}
				<div class="checks">
					<label><input type="checkbox" name="isCertificate" value="1" /> Certificado (siempre privado)</label>
					<label><input type="checkbox" name="isPublic" value="1" /> Público</label>
				</div>
			{/if}
			<button type="submit" disabled={pending.includes('create')}>{attendance ? 'Enlazar certificado' : 'Añadir documento'}</button>
		</form>
	</details>
</section>

<style>
	section { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid #262626; }
	section.attendance { padding: 1.2rem; border: 1px solid #6b532b; }
	h2 { margin: 0 0 1rem; color: #a3a3a3; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; }
	.intro { max-width: 72ch; color: #a3a3a3; line-height: 1.6; }
	.document-list { display: grid; gap: 0.75rem; }
	article, .add { border: 1px solid #262626; background: #0d0d0d; padding: 1rem; }
	article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.9rem; align-items: end; }
	article > form, .add form { display: grid; gap: 0.8rem; }
	.fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.65rem; }
	.fields label { display: grid; gap: 0.3rem; color: #737373; font-size: 0.62rem; letter-spacing: 0.05em; text-transform: uppercase; }
	.fields .wide { grid-column: 1 / -1; }
	input, select, textarea { min-width: 0; border: 1px solid #404040; background: #0a0a0a; color: #d4d4d4; padding: 0.5rem; font: inherit; font-size: 0.7rem; }
	textarea { resize: vertical; }
	.checks, .row-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
	.checks label { display: flex; gap: 0.35rem; align-items: center; color: #a3a3a3; font-size: 0.68rem; }
	.checks input { accent-color: #00ff88; }
	button { border: 1px solid #525252; background: transparent; color: #d4d4d4; padding: 0.45rem 0.6rem; font: inherit; font-size: 0.67rem; cursor: pointer; }
	button:hover:not(:disabled) { border-color: #00ff88; color: #00ff88; }
	button.remove:hover:not(:disabled) { border-color: #f87171; color: #f87171; }
	button:disabled { opacity: 0.35; cursor: not-allowed; }
	.row-actions { justify-content: end; }
	.add { margin-top: 0.75rem; }
	.add summary { color: #00ff88; cursor: pointer; font-size: 0.75rem; }
	.add form { margin-top: 1rem; }
	.empty { margin: 0; padding: 1rem; border: 1px dashed #262626; color: #737373; font-size: 0.75rem; }
	@media (max-width: 850px) { article { grid-template-columns: 1fr; } .row-actions { justify-content: start; } }
	@media (max-width: 650px) { .fields { grid-template-columns: 1fr; } .fields .wide { grid-column: auto; } }
</style>
