<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { LinkEditor } from '$lib/server/admin/links';
	import AdminField from './AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';

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

<section class="mt-10 border-t border-rule pt-6" aria-labelledby="additional-links-title">
	<h2 class="mt-0 mb-4 text-base" id="additional-links-title">Enlaces adicionales</h2>
	<p class="max-w-[68ch] leading-[1.6] text-ink-dim">
		El campo URL del contenido es su destino canónico. Añade aquí recursos complementarios;
		solo los marcados como públicos se mostrarán cuando la entrada también sea pública.
	</p>

	<div class="grid gap-3">
		{#if editor.links.length === 0}
			<p class="m-0 border border-dashed border-rule p-4 text-xs text-ink-faint">
				No hay enlaces adicionales.
			</p>
		{:else}
			{#each editor.links as link, index (link.id)}
				<article
					class="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[0.9rem] rounded-ui border border-rule bg-[var(--admin-surface)] p-4 max-[850px]:grid-cols-1"
				>
					<form
						class="grid gap-[0.8rem]"
						method="POST"
						action="?/guardarEnlace"
						use:enhance={enhancedSubmit(`save:${link.id}`)}
					>
						<input type="hidden" name="linkId" value={link.id} />
						<div class="grid grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)] gap-[0.65rem] max-[650px]:grid-cols-1">
							<AdminField label="Tipo">
								<Select name="linkType" value={link.linkType} required>
									{#each editor.types as type (type.value)}
										<option value={type.value}>{type.label}</option>
									{/each}
								</Select>
							</AdminField>
							<AdminField label="Etiqueta ES"><Input name="labelEs" value={link.labelEs} placeholder="Usa el tipo si se deja vacío" /></AdminField>
							<AdminField label="Etiqueta EN"><Input name="labelEn" value={link.labelEn} placeholder="Uses the type when empty" /></AdminField>
							<AdminField label="URL" wide><Input type="url" name="url" value={link.url} required /></AdminField>
						</div>
						<div class="flex flex-wrap items-center gap-2">
							<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isPublic" value="1" checked={link.isPublic} /> Público</label>
							<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isPrimary" value="1" checked={link.isPrimary} /> Destacado</label>
						</div>
						<Button type="submit" disabled={pending.includes(`save:${link.id}`)}>Guardar enlace</Button>
					</form>
					<div class="flex flex-wrap items-center justify-end gap-2 max-[850px]:justify-start">
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`up:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="up" />
							<Button size="icon" type="submit" aria-label="Subir enlace" disabled={index === 0 || pending.includes(`up:${link.id}`)}>↑</Button>
						</form>
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`down:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="down" />
							<Button size="icon" type="submit" aria-label="Bajar enlace" disabled={index === editor.links.length - 1 || pending.includes(`down:${link.id}`)}>↓</Button>
						</form>
						<form method="POST" action="?/eliminarEnlace" use:enhance={enhancedSubmit(`remove:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} />
							<Button variant="danger" type="submit" disabled={pending.includes(`remove:${link.id}`)}>Eliminar</Button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="mt-3 rounded-ui border border-rule bg-[var(--admin-surface)] p-4">
		<summary class="cursor-pointer text-xs text-accent-strong">+ Añadir enlace</summary>
		<form class="mt-4 grid gap-[0.8rem]" method="POST" action="?/crearEnlace" use:enhance={enhancedSubmit('create')}>
			<div class="grid grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)] gap-[0.65rem] max-[650px]:grid-cols-1">
				<AdminField label="Tipo">
					<Select name="linkType" required>
						{#each editor.types as type (type.value)}<option value={type.value}>{type.label}</option>{/each}
					</Select>
				</AdminField>
				<AdminField label="Etiqueta ES"><Input name="labelEs" placeholder="Opcional" /></AdminField>
				<AdminField label="Etiqueta EN"><Input name="labelEn" placeholder="Optional" /></AdminField>
				<AdminField label="URL" wide><Input type="url" name="url" placeholder="https://…" required /></AdminField>
			</div>
			<div class="flex flex-wrap items-center gap-2">
				<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isPublic" value="1" checked /> Público</label>
				<label class="flex items-center gap-1.5 text-[0.68rem] text-ink-dim"><Checkbox name="isPrimary" value="1" /> Destacado</label>
			</div>
			<Button type="submit" disabled={pending.includes('create')}>Añadir enlace</Button>
		</form>
	</details>
</section>
