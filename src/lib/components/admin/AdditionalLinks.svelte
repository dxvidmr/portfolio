<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { LinkEditor } from '$lib/server/admin/links';

	let { editor }: { editor: LinkEditor } = $props();
	let pending = $state<string[]>([]);

	const enhancedSubmit = (key: string): SubmitFunction =>
		() => {
			pending = [...pending, key];
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					pending = pending.filter((item) => item !== key);
				}
			};
		};
</script>

<section aria-labelledby="additional-links-title">
	<h2 id="additional-links-title">Enlaces adicionales</h2>
	<p class="intro">
		El campo URL del contenido es su destino canónico. Añade aquí recursos complementarios;
		solo los marcados como públicos se mostrarán cuando la entrada también sea pública.
	</p>

	<div class="link-list">
		{#if editor.links.length === 0}
			<p class="empty">No hay enlaces adicionales.</p>
		{:else}
			{#each editor.links as link, index (link.id)}
				<article>
					<form method="POST" action="?/guardarEnlace" use:enhance={enhancedSubmit(`save:${link.id}`)}>
						<input type="hidden" name="linkId" value={link.id} />
						<div class="fields">
							<label>
								<span>Tipo</span>
								<select name="linkType" value={link.linkType} required>
									{#each editor.types as type (type.value)}
										<option value={type.value}>{type.label}</option>
									{/each}
								</select>
							</label>
							<label><span>Etiqueta ES</span><input name="labelEs" value={link.labelEs} placeholder="Usa el tipo si se deja vacío" /></label>
							<label><span>Etiqueta EN</span><input name="labelEn" value={link.labelEn} placeholder="Uses the type when empty" /></label>
							<label class="wide"><span>URL</span><input type="url" name="url" value={link.url} required /></label>
						</div>
						<div class="checks">
							<label><input type="checkbox" name="isPublic" value="1" checked={link.isPublic} /> Público</label>
							<label><input type="checkbox" name="isPrimary" value="1" checked={link.isPrimary} /> Destacado</label>
						</div>
						<button type="submit" disabled={pending.includes(`save:${link.id}`)}>Guardar enlace</button>
					</form>
					<div class="row-actions">
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`up:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="up" />
							<button type="submit" aria-label="Subir enlace" disabled={index === 0 || pending.includes(`up:${link.id}`)}>↑</button>
						</form>
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`down:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="down" />
							<button type="submit" aria-label="Bajar enlace" disabled={index === editor.links.length - 1 || pending.includes(`down:${link.id}`)}>↓</button>
						</form>
						<form method="POST" action="?/eliminarEnlace" use:enhance={enhancedSubmit(`remove:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} />
							<button class="remove" type="submit" disabled={pending.includes(`remove:${link.id}`)}>Eliminar</button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="add">
		<summary>+ Añadir enlace</summary>
		<form method="POST" action="?/crearEnlace" use:enhance={enhancedSubmit('create')}>
			<div class="fields">
				<label>
					<span>Tipo</span>
					<select name="linkType" required>
						{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}
					</select>
				</label>
				<label><span>Etiqueta ES</span><input name="labelEs" placeholder="Opcional" /></label>
				<label><span>Etiqueta EN</span><input name="labelEn" placeholder="Optional" /></label>
				<label class="wide"><span>URL</span><input type="url" name="url" placeholder="https://…" required /></label>
			</div>
			<div class="checks">
				<label><input type="checkbox" name="isPublic" value="1" checked /> Público</label>
				<label><input type="checkbox" name="isPrimary" value="1" /> Destacado</label>
			</div>
			<button type="submit" disabled={pending.includes('create')}>Añadir enlace</button>
		</form>
	</details>
</section>

<style>
	section { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--line); }
	h2 { margin: 0 0 1rem; color: var(--fg-dim); font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; }
	.intro { max-width: 68ch; color: var(--fg-dim); line-height: 1.6; }
	.link-list { display: grid; gap: 0.75rem; }
	article, .add { border: 1px solid var(--line); background: var(--admin-surface); padding: 1rem; }
	article { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.9rem; align-items: end; }
	article > form, .add form { display: grid; gap: 0.8rem; }
	.fields { display: grid; grid-template-columns: 12rem minmax(0, 1fr) minmax(0, 1fr); gap: 0.65rem; }
	.fields label { display: grid; gap: 0.3rem; color: var(--fg-faint); font-size: 0.62rem; letter-spacing: 0.05em; text-transform: uppercase; }
	.fields .wide { grid-column: 1 / -1; }
	input, select { min-width: 0; border: 1px solid var(--line); background: var(--bg); color: var(--fg); padding: 0.5rem; font: inherit; font-size: 0.7rem; }
	.checks, .row-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
	.checks label { display: flex; gap: 0.35rem; align-items: center; color: var(--fg-dim); font-size: 0.68rem; }
	.checks input { accent-color: var(--accent-strong); }
	button { border: 1px solid var(--line-strong); background: transparent; color: var(--fg); padding: 0.45rem 0.6rem; font: inherit; font-size: 0.67rem; cursor: pointer; }
	button:hover:not(:disabled) { border-color: var(--accent-strong); color: var(--accent-strong); }
	button.remove:hover:not(:disabled) { border-color: var(--admin-danger); color: var(--admin-danger); }
	button:disabled { opacity: 0.35; cursor: not-allowed; }
	.row-actions { justify-content: end; }
	.add { margin-top: 0.75rem; }
	.add summary { color: var(--accent-strong); cursor: pointer; font-size: 0.75rem; }
	.add form { margin-top: 1rem; }
	.empty { margin: 0; padding: 1rem; border: 1px dashed var(--line); color: var(--fg-faint); font-size: 0.75rem; }
	@media (max-width: 850px) { article { grid-template-columns: 1fr; } .row-actions { justify-content: start; } }
	@media (max-width: 650px) { .fields { grid-template-columns: 1fr; } .fields .wide { grid-column: auto; } }
</style>
