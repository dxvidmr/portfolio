<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { LinkEditor } from '$lib/server/admin/links';
	import AdminField from './AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Save from '@lucide/svelte/icons/save';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Plus from '@lucide/svelte/icons/plus';

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

<section id="links-section" class="scroll-mt-36 mt-10 border-t border-rule pt-6" aria-labelledby="additional-links-title">
	<h2 class="mt-0 mb-5 text-sm font-medium tracking-[0.08em] text-ink-dim uppercase" id="additional-links-title">Recursos y enlaces</h2>
	{#if editor.links.length > 0}
		<p class="max-w-[68ch] leading-[1.6] text-ink-dim">
			El campo URL del contenido es su destino canónico. Aquí se gestionan los recursos complementarios.
		</p>
	{/if}

	<div class="grid gap-3">
		{#if editor.links.length > 0}
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
						<Button type="submit" disabled={pending.includes(`save:${link.id}`)}><Save size={14} strokeWidth={1.7} aria-hidden="true" />Guardar enlace</Button>
					</form>
					<div class="flex flex-wrap items-center justify-end gap-2 max-[850px]:justify-start">
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`up:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="up" />
							<Button size="icon" type="submit" aria-label="Subir enlace" title="Subir" disabled={index === 0 || pending.includes(`up:${link.id}`)}><ChevronUp size={15} aria-hidden="true" /></Button>
						</form>
						<form method="POST" action="?/moverEnlace" use:enhance={enhancedSubmit(`down:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} /><input type="hidden" name="direction" value="down" />
							<Button size="icon" type="submit" aria-label="Bajar enlace" title="Bajar" disabled={index === editor.links.length - 1 || pending.includes(`down:${link.id}`)}><ChevronDown size={15} aria-hidden="true" /></Button>
						</form>
						<form method="POST" action="?/eliminarEnlace" use:enhance={enhancedSubmit(`remove:${link.id}`)}>
							<input type="hidden" name="linkId" value={link.id} />
							<Button variant="danger" type="submit" disabled={pending.includes(`remove:${link.id}`)}><Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />Eliminar</Button>
						</form>
					</div>
				</article>
			{/each}
		{/if}
	</div>

	<details class="mt-3 rounded-ui border border-rule bg-[var(--admin-surface)] p-4">
		<summary class="flex cursor-pointer list-none items-center gap-1.5 text-xs text-accent-strong marker:hidden">
			<Plus size={14} strokeWidth={1.7} aria-hidden="true" />{editor.links.length === 0 ? 'Añadir el primer enlace' : 'Añadir enlace'}
		</summary>
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
			<Button type="submit" disabled={pending.includes('create')}><Plus size={14} strokeWidth={1.7} aria-hidden="true" />Añadir enlace</Button>
		</form>
	</details>
</section>
