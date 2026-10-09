<script lang="ts">
	import SearchableSelect from './SearchableSelect.svelte';
	import GeoNamesLocationField from './GeoNamesLocationField.svelte';
	interface FieldSpec {
		name: string;
		label: string;
		kind: string;
		required?: boolean;
		help?: string;
		isPrivate?: boolean;
		choices?: Array<{ value: string; label: string }>;
		optionConditions?: Record<string, { field: string; values: string[] }>;
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
		options = [],
		allValues = {}
	}: {
		field: FieldSpec;
		value?: string;
		error?: string | null;
		options?: Option[];
		allValues?: Record<string, string>;
	} = $props();

	let multiSearch=$state('');
  const fold=(s:string)=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const multiMatches=(o:Option)=>value.split(',').includes(o.value) || fold(o.label+' '+(o.meta || '')).includes(fold(multiSearch));
  const inputId = $derived(`campo-${field.name}`);
	const errorId = $derived(`error-${field.name}`);
	const helpId = $derived(`ayuda-${field.name}`);
	// Los campos de título admiten *cursiva* para obras (InlineTitle); se recuerda si no hay otra ayuda.
	const titleHint = 'Títulos de obras en cursiva con asteriscos: *Fuenteovejuna*';
	const help = $derived(field.help ?? (field.kind === 'text' && /(^|_)title$/.test(field.name) ? titleHint : undefined));
	const visibleOptions = $derived((field.choices ?? options).filter(option => {
		const condition = field.optionConditions?.[option.value];
		return !condition || condition.values.includes(allValues[condition.field] ?? '');
	}));
	const describedBy = $derived(
		[help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
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
	{:else if field.kind === 'fk_multi'}
		<fieldset class="grid gap-2 rounded-ui-sm border border-rule p-3" aria-describedby={describedBy}>
			<legend class="px-1 text-[0.8rem] text-ink-dim">{field.label}</legend>
			{#if options.length>10}<label class="grid gap-1 text-xs">Buscar en {field.label.toLowerCase()}<input bind:value={multiSearch} type="search" class="border border-rule bg-canvas p-2" placeholder="Buscar por título o tipo" /></label>{/if}
      <div class="grid max-h-80 gap-2 overflow-y-auto">
      {#each options as option (option.value)}
        <label hidden={!multiMatches(option)} class={multiMatches(option) ? "flex items-start gap-2 text-[0.85rem]" : "hidden"}>

					<input type="checkbox" name={field.name} value={option.value} checked={value.split(',').includes(option.value)} class="mt-1 accent-accent-strong" />
					<span>{option.label}{#if option.meta}<small class="block text-ink-dim">{option.meta}</small>{/if}</span>
				</label>
			{/each}
      </div>
		</fieldset>
	{:else if field.kind === 'location'}
		<div class="grid gap-[0.35rem]">
			<span class="text-[0.8rem] text-ink-dim">{field.label}</span>
			<GeoNamesLocationField
				id={inputId}
				values={allValues}
				invalid={Boolean(error)}
				{describedBy}
			/>
		</div>
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
			{:else if field.kind === 'vocab' || field.kind === 'choice'}
				<select
					class="{controlClass} {invalidControlClass}"
					id={inputId}
					name={field.name}
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={describedBy}
					aria-required={field.required || undefined}
				>
					<option value="">—</option>
						{#each visibleOptions as option (option.value)}
						<option value={option.value} selected={option.value === value}>{option.label}</option>
					{/each}
				</select>
			{:else}
				<input
					class="{controlClass} {invalidControlClass}"
					id={inputId}
					type={field.kind === 'url' ? 'url' : 'text'}
					inputmode={field.kind === 'integer' ? 'numeric' : field.kind === 'real' ? 'decimal' : undefined}
					placeholder={field.kind === 'date' ? 'AAAA, AAAA-MM o AAAA-MM-DD' : undefined}
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
		<p class="m-0 text-[0.72rem] text-ink-faint" id={helpId}>{help}</p>
	{/if}
	{#if error}
		<p class="m-0 text-[0.78rem] text-danger" id={errorId}>{error}</p>
	{/if}
</div>
