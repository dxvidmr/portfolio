<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';
	import AdminToast from '$lib/components/AdminToast.svelte';
	import AdminPageHeader from '$lib/components/admin/AdminPageHeader.svelte';
	import AdminField from '$lib/components/admin/AdminField.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let pending = $state<string[]>([]);
	const rowGridClass =
		'grid grid-cols-[minmax(9rem,0.9fr)_1.2fr_1.2fr_4.5rem_3rem_6rem_6rem] items-center gap-2 border-b border-rule px-3 py-2 last:border-b-0 max-[900px]:block max-[900px]:rounded-ui max-[900px]:border max-[900px]:bg-admin-surface max-[900px]:p-4';
	const cellClass = 'min-w-0 max-[900px]:grid max-[900px]:content-end max-[900px]:gap-1';
	const mobileLabelClass =
		'hidden text-[0.58rem] uppercase tracking-[0.1em] text-ink-faint max-[900px]:block';

	// Igual que en los editores de enlaces/documentos: sin reset del formulario
	// al terminar (el reset dejaría vacíos los campos, cuyo valor por defecto
	// en cliente es ''); la recarga de `data` tras la acción pinta el estado real.
	const enhancedSubmit = (key: string, reset = false): SubmitFunction =>
		() => {
			pending = [...pending, key];
			return async ({ update }) => {
				try {
					await update({ reset });
				} finally {
					pending = pending.filter((item) => item !== key);
				}
			};
		};
</script>

<svelte:head><title>Taxonomías · cv/admin</title></svelte:head>

<AdminPageHeader
	title="Taxonomías"
	eyebrow="Control"
	description="Edita las etiquetas y el orden de los tipos. Los que están en uso se pueden modificar, pero no eliminar."
/>

{#if form?.message}
	{#key form}
		<AdminToast message={form.message} success={form.success ?? false} />
	{/key}
{/if}

{#each data.domains as group (group.domain)}
	<section class="mb-8 border-t border-rule pt-5" aria-labelledby={`dominio-${group.domain}`}>
		<h2 class="mb-3 flex items-baseline gap-2 text-base text-ink" id={`dominio-${group.domain}`}>
			{group.label}
			<code class="text-xs font-normal text-ink-faint">{group.domain}</code>
		</h2>

		{#if group.types.length > 0}
			<div class="grid overflow-hidden rounded-ui border border-rule text-[0.82rem] max-[900px]:gap-3 max-[900px]:overflow-visible max-[900px]:border-0" role="table" aria-label={group.label}>
				<div class="grid grid-cols-[minmax(9rem,0.9fr)_1.2fr_1.2fr_4.5rem_3rem_6rem_6rem] items-center gap-2 border-b border-rule bg-admin-surface-raised px-3 py-2 text-ink-faint max-[900px]:hidden" role="row">
					<span role="columnheader">Código</span>
					<span role="columnheader">Etiqueta ES</span>
					<span role="columnheader">Etiqueta EN</span>
					<span role="columnheader">Orden</span>
					<span role="columnheader">Usos</span>
					<span role="columnheader" class="sr-only">Guardar</span>
					<span role="columnheader" class="sr-only">Eliminar</span>
				</div>
				{#each group.types as type (type.code)}
					<div class={rowGridClass} role="row">
						<form class="contents max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:gap-3 max-[560px]:grid-cols-1" method="POST" action="?/guardar" use:enhance={enhancedSubmit(`save:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							<span class={`${cellClass} max-[900px]:col-span-full`} role="cell">
								<span class={mobileLabelClass}>Código</span>
								<code class="[overflow-wrap:anywhere] text-[0.85em] text-accent-strong">{type.code}</code>
							</span>
							<span class={cellClass} role="cell">
								<span class={mobileLabelClass}>Etiqueta ES</span>
								<Input name="label_es" value={type.labelEs} aria-label={`Etiqueta en español de ${type.code}`} />
							</span>
							<span class={cellClass} role="cell">
								<span class={mobileLabelClass}>Etiqueta EN</span>
								<Input name="label_en" value={type.labelEn} aria-label={`Etiqueta en inglés de ${type.code}`} />
							</span>
							<span class={cellClass} role="cell">
								<span class={mobileLabelClass}>Orden</span>
								<Input name="sort_order" value={String(type.sortOrder)} inputmode="numeric" class="max-w-[4.5rem] max-[560px]:max-w-none" aria-label={`Orden de ${type.code}`} />
							</span>
							<span class="text-center text-ink-faint max-[900px]:grid max-[900px]:content-end max-[900px]:gap-1 max-[900px]:text-left" role="cell">
								<span class={mobileLabelClass}>Usos</span>
								{type.usageCount}
							</span>
							<span class="max-[900px]:self-end" role="cell">
								<Button class="w-full" size="sm" type="submit" disabled={pending.includes(`save:${type.code}`)}>Guardar</Button>
							</span>
						</form>
						<form class="contents max-[900px]:mt-3 max-[900px]:flex max-[900px]:justify-end max-[900px]:border-t max-[900px]:border-rule max-[900px]:pt-3" method="POST" action="?/eliminar" use:enhance={enhancedSubmit(`del:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							{#if type.usageCount === 0}
								<Button class="w-full" size="sm" variant="danger" type="submit" disabled={pending.includes(`del:${type.code}`)}>Eliminar</Button>
							{:else}
								<span class="inline-flex min-h-8 w-full items-center justify-center text-[0.65rem] text-ink-faint" aria-hidden="true">En uso</span>
							{/if}
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-[0.82rem] text-ink-faint">Sin tipos todavía.</p>
		{/if}

		<form class="mt-3 grid grid-cols-[repeat(3,minmax(9rem,1fr))_5rem_auto] items-end gap-3 rounded-ui border border-dashed border-rule bg-[color-mix(in_srgb,var(--bg-panel)_45%,transparent)] p-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1" method="POST" action="?/crear" use:enhance={enhancedSubmit(`add:${group.domain}`, true)}>
			<input type="hidden" name="domain" value={group.domain} />
			<AdminField label="Código nuevo">
				<Input
					name="code"
					placeholder="minusculas_y_guion_bajo"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.code ?? '') : ''}
				/>
			</AdminField>
			<AdminField label="Etiqueta ES">
				<Input
					name="label_es"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.label_es ?? '') : ''}
				/>
			</AdminField>
			<AdminField label="Etiqueta EN">
				<Input
					name="label_en"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.label_en ?? '') : ''}
				/>
			</AdminField>
			<AdminField label="Orden">
				<Input
					name="sort_order"
					inputmode="numeric"
					value={form?.domain === group.domain && !form?.success ? (form?.raw?.sort_order ?? '') : ''}
				/>
			</AdminField>
			<Button class="w-full" variant="primary" type="submit" disabled={pending.includes(`add:${group.domain}`)}>Añadir tipo</Button>
		</form>
	</section>
{/each}
