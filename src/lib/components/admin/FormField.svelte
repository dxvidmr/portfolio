<script lang="ts">
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
		'tw:w-full tw:border tw:border-rule tw:bg-[var(--admin-surface)] tw:px-[0.65rem] tw:py-2 tw:font-[inherit] tw:text-ink tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-accent-strong';
	const invalidControlClass = $derived(error ? 'tw:border-danger!' : '');
</script>

<div class="tw:grid tw:gap-[0.35rem]">
	{#if field.kind === 'boolean'}
		<label class="tw:flex tw:items-center tw:gap-[0.6rem] tw:text-ink" for={inputId}>
			<input
				class="tw:size-[1.05rem] tw:accent-accent-strong"
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
		<label class="tw:grid tw:gap-[0.35rem]" for={inputId}>
			<span class="tw:text-[0.8rem] tw:text-ink-dim">
				{field.label}
				{#if field.required}<span class="tw:ml-[0.15rem] tw:text-accent-strong" aria-hidden="true"
						>*</span
					>{/if}
				{#if field.isPrivate}<span
						class="tw:ml-2 tw:border tw:border-rule tw:px-[0.35rem] tw:py-[0.05rem] tw:text-[0.65rem] tw:tracking-[0.08em] tw:text-ink-faint tw:uppercase"
						>privado</span
					>{/if}
			</span>
			{#if field.kind === 'textarea'}
				<textarea
					class="{controlClass} {invalidControlClass} tw:min-h-22 tw:resize-y"
					id={inputId}
					name={field.name}
					rows="4"
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}>{value}</textarea>
			{:else if field.kind === 'vocab' || field.kind === 'fk'}
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
		<p class="tw:m-0 tw:text-[0.72rem] tw:text-ink-faint">{help}</p>
	{/if}
	{#if error}
		<p class="tw:m-0 tw:text-[0.78rem] tw:text-danger" id={errorId}>{error}</p>
	{/if}
</div>
