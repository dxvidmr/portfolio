<script lang="ts">
	import SearchableSelect from './SearchableSelect.svelte';
	interface FieldSpec {
		name: string;
		label: string;
		kind: string;
		required?: boolean;
		help?: string;
		isPrivate?: boolean;
	}

	interface Option {
		value: string;
		label: string;
		meta?: string;
	}

	let {
		field,
		value = '',
		error = null,
		options = []
	}: {
		field: FieldSpec;
		value?: string;
		error?: string | null;
		options?: Option[];
	} = $props();

	const inputId = $derived(`campo-${field.name}`);
	const errorId = $derived(`error-${field.name}`);
	const describedBy = $derived(error ? errorId : undefined);
	// El campo url es el enlace canónico público del ítem; los archivos (PDF,
	// certificados, Drive) se gestionarán aparte en «Documentos» (plan §14).
	const help = $derived(
		field.help ??
			(field.kind === 'url'
				? 'Enlace público del ítem (DOI, web del evento, editorial…). Los archivos de Drive irán en Documentos.'
				: undefined)
	);
	const controlClass =
		'w-full rounded-ui-sm border border-rule bg-[var(--admin-surface)] px-[0.65rem] py-2 font-[inherit] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong';
	const invalidControlClass = $derived(error ? 'border-danger!' : '');
</script>

<div class="grid gap-[0.35rem]">
	{#if field.kind === 'boolean'}
		<label class="flex items-center gap-[0.6rem] text-ink" for={inputId}>
			<input
				class="size-[1.05rem] accent-accent-strong"
				id={inputId}
				type="checkbox"
				name={field.name}
				value="1"
				checked={value === '1'}
				aria-describedby={describedBy}
			/>
			<span>{field.label}</span>
		</label>
	{:else}
		<label class="grid gap-[0.35rem]" for={inputId}>
			<span class="text-[0.8rem] text-ink-dim">
				{field.label}
				{#if field.required}<span class="ml-[0.15rem] text-accent-strong" aria-hidden="true"
						>*</span
					>{/if}
				{#if field.isPrivate}<span
						class="ml-2 border border-rule px-[0.35rem] py-[0.05rem] text-[0.65rem] tracking-[0.08em] text-ink-faint uppercase"
						>privado</span
					>{/if}
			</span>
			{#if field.kind === 'textarea'}
				<textarea
					class="{controlClass} {invalidControlClass} min-h-22 resize-y"
					id={inputId}
					name={field.name}
					rows="4"
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}>{value}</textarea>
			{:else if field.kind === 'fk'}
				<SearchableSelect
					id={inputId}
					name={field.name}
					{value}
					{options}
					required={field.required === true}
					describedBy={describedBy}
					invalid={Boolean(error)}
				/>
			{:else if field.kind === 'vocab'}
				<select
					class="{controlClass} {invalidControlClass}"
					id={inputId}
					name={field.name}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}
				>
					<option value="">—</option>
					{#each options as option (option.value)}
						<option value={option.value} selected={option.value === value}>{option.label}</option>
					{/each}
				</select>
			{:else}
				<input
					class="{controlClass} {invalidControlClass}"
					id={inputId}
					type={field.kind === 'url' ? 'url' : 'text'}
					inputmode={field.kind === 'integer' ? 'numeric' : field.kind === 'real' ? 'decimal' : undefined}
					placeholder={field.kind === 'date' ? 'AAAA-MM-DD' : undefined}
					name={field.name}
					{value}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}
				/>
			{/if}
		</label>
	{/if}
	{#if help}
		<p class="m-0 text-[0.72rem] text-ink-faint">{help}</p>
	{/if}
	{#if error}
		<p class="m-0 text-[0.78rem] text-danger" id={errorId}>{error}</p>
	{/if}
</div>
