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
		'tw:grid tw:grid-cols-[minmax(9rem,0.9fr)_1.2fr_1.2fr_4.5rem_3rem_6rem_6rem] tw:items-center tw:gap-2 tw:border-b tw:border-rule tw:px-3 tw:py-2 last:tw:border-b-0 tw:max-[900px]:block tw:max-[900px]:rounded-ui tw:max-[900px]:border tw:max-[900px]:bg-admin-surface tw:max-[900px]:p-4';
	const cellClass = 'tw:min-w-0 tw:max-[900px]:grid tw:max-[900px]:content-end tw:max-[900px]:gap-1';
	const mobileLabelClass =
		'tw:hidden tw:text-[0.58rem] tw:uppercase tw:tracking-[0.1em] tw:text-ink-faint tw:max-[900px]:block';

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
	<section class="tw:mb-8 tw:border-t tw:border-rule tw:pt-5" aria-labelledby={`dominio-${group.domain}`}>
		<h2 class="tw:mb-3 tw:flex tw:items-baseline tw:gap-2 tw:text-base tw:text-ink" id={`dominio-${group.domain}`}>
			{group.label}
			<code class="tw:text-xs tw:font-normal tw:text-ink-faint">{group.domain}</code>
		</h2>

		{#if group.types.length > 0}
			<div class="tw:grid tw:overflow-hidden tw:rounded-ui tw:border tw:border-rule tw:text-[0.82rem] tw:max-[900px]:gap-3 tw:max-[900px]:overflow-visible tw:max-[900px]:border-0" role="table" aria-label={group.label}>
				<div class="tw:grid tw:grid-cols-[minmax(9rem,0.9fr)_1.2fr_1.2fr_4.5rem_3rem_6rem_6rem] tw:items-center tw:gap-2 tw:border-b tw:border-rule tw:bg-admin-surface-raised tw:px-3 tw:py-2 tw:text-ink-faint tw:max-[900px]:hidden" role="row">
					<span role="columnheader">Código</span>
					<span role="columnheader">Etiqueta ES</span>
					<span role="columnheader">Etiqueta EN</span>
					<span role="columnheader">Orden</span>
					<span role="columnheader">Usos</span>
					<span role="columnheader" class="tw:sr-only">Guardar</span>
					<span role="columnheader" class="tw:sr-only">Eliminar</span>
				</div>
				{#each group.types as type (type.code)}
					<div class={rowGridClass} role="row">
						<form class="tw:contents tw:max-[900px]:grid tw:max-[900px]:grid-cols-2 tw:max-[900px]:gap-3 tw:max-[560px]:grid-cols-1" method="POST" action="?/guardar" use:enhance={enhancedSubmit(`save:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							<span class={`${cellClass} tw:max-[900px]:col-span-full`} role="cell">
								<span class={mobileLabelClass}>Código</span>
								<code class="tw:[overflow-wrap:anywhere] tw:text-[0.85em] tw:text-accent-strong">{type.code}</code>
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
								<Input name="sort_order" value={String(type.sortOrder)} inputmode="numeric" class="tw:max-w-[4.5rem] tw:max-[560px]:max-w-none" aria-label={`Orden de ${type.code}`} />
							</span>
							<span class="tw:text-center tw:text-ink-faint tw:max-[900px]:grid tw:max-[900px]:content-end tw:max-[900px]:gap-1 tw:max-[900px]:text-left" role="cell">
								<span class={mobileLabelClass}>Usos</span>
								{type.usageCount}
							</span>
							<span class="tw:max-[900px]:self-end" role="cell">
								<Button class="tw:w-full" size="sm" type="submit" disabled={pending.includes(`save:${type.code}`)}>Guardar</Button>
							</span>
						</form>
						<form class="tw:contents tw:max-[900px]:mt-3 tw:max-[900px]:flex tw:max-[900px]:justify-end tw:max-[900px]:border-t tw:max-[900px]:border-rule tw:max-[900px]:pt-3" method="POST" action="?/eliminar" use:enhance={enhancedSubmit(`del:${type.code}`)}>
							<input type="hidden" name="domain" value={group.domain} />
							<input type="hidden" name="code" value={type.code} />
							{#if type.usageCount === 0}
								<Button class="tw:w-full" size="sm" variant="danger" type="submit" disabled={pending.includes(`del:${type.code}`)}>Eliminar</Button>
							{:else}
								<span class="tw:inline-flex tw:min-h-8 tw:w-full tw:items-center tw:justify-center tw:text-[0.65rem] tw:text-ink-faint" aria-hidden="true">En uso</span>
							{/if}
						</form>
					</div>
				{/each}
			</div>
		{:else}
			<p class="tw:text-[0.82rem] tw:text-ink-faint">Sin tipos todavía.</p>
		{/if}

		<form class="tw:mt-3 tw:grid tw:grid-cols-[repeat(3,minmax(9rem,1fr))_5rem_auto] tw:items-end tw:gap-3 tw:rounded-ui tw:border tw:border-dashed tw:border-rule tw:bg-[color-mix(in_srgb,var(--bg-panel)_45%,transparent)] tw:p-3.5 tw:max-[900px]:grid-cols-2 tw:max-[560px]:grid-cols-1" method="POST" action="?/crear" use:enhance={enhancedSubmit(`add:${group.domain}`, true)}>
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
			<Button class="tw:w-full" variant="primary" type="submit" disabled={pending.includes(`add:${group.domain}`)}>Añadir tipo</Button>
		</form>
	</section>
{/each}
