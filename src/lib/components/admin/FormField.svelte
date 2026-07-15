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
</script>

<div class="field" class:is-private={field.isPrivate} class:has-error={Boolean(error)}>
	{#if field.kind === 'boolean'}
		<label class="check" for={inputId}>
			<input
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
		<label for={inputId}>
			<span class="field-label">
				{field.label}
				{#if field.required}<span class="required" aria-hidden="true">*</span>{/if}
				{#if field.isPrivate}<span class="private-tag">privado</span>{/if}
			</span>
			{#if field.kind === 'textarea'}
				<textarea
					id={inputId}
					name={field.name}
					rows="4"
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}>{value}</textarea>
			{:else if field.kind === 'vocab' || field.kind === 'fk'}
				<select
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
		<p class="help">{help}</p>
	{/if}
	{#if error}
		<p class="error" id={errorId}>{error}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.35rem;
	}

	label {
		display: grid;
		gap: 0.35rem;
	}

	.field-label {
		font-size: 0.8rem;
		color: #a3a3a3;
	}

	.required {
		color: #00ff88;
		margin-left: 0.15rem;
	}

	.private-tag {
		margin-left: 0.5rem;
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #737373;
		border: 1px solid #404040;
		padding: 0.05rem 0.35rem;
	}

	input[type='text'],
	input[type='url'],
	textarea,
	select {
		font: inherit;
		width: 100%;
		background: #111;
		color: #e5e5e5;
		border: 1px solid #404040;
		padding: 0.5rem 0.65rem;
	}

	textarea {
		resize: vertical;
		min-height: 5.5rem;
	}

	input:focus-visible,
	textarea:focus-visible,
	select:focus-visible {
		outline: 2px solid #00ff88;
		outline-offset: 2px;
	}

	.has-error input,
	.has-error textarea,
	.has-error select {
		border-color: #f87171;
	}

	.check {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: #d4d4d4;
	}

	.check input {
		width: 1.05rem;
		height: 1.05rem;
		accent-color: #00ff88;
	}

	.help {
		margin: 0;
		font-size: 0.72rem;
		color: #737373;
	}

	.error {
		margin: 0;
		font-size: 0.78rem;
		color: #f87171;
	}
</style>
