<script lang="ts">
	import { untrack } from 'svelte';
	import Search from '@lucide/svelte/icons/search';
	import MapPin from '@lucide/svelte/icons/map-pin';

	interface LocationValues {
		city?: string;
		country?: string;
		country_code?: string;
		geoname_id?: string;
		latitude?: string;
		longitude?: string;
	}

	interface GeoNamesResult {
		geonameId: number;
		name: string;
		countryName: string;
		countryCode: string;
		adminName1: string;
		lat: number;
		lng: number;
		label: string;
	}

	let {
		id,
		values = {},
		invalid = false,
		describedBy
	}: {
		id: string;
		values?: LocationValues;
		invalid?: boolean;
		describedBy?: string;
	} = $props();

	const initial = untrack(() => values);
	let city = $state(initial.city ?? '');
	let country = $state(initial.country ?? '');
	let countryCode = $state(initial.country_code ?? '');
	let geonameId = $state(initial.geoname_id ?? '');
	let latitude = $state(initial.latitude ?? '');
	let longitude = $state(initial.longitude ?? '');
	const initialQuery =
		initial.city && initial.country ? `${initial.city}, ${initial.country}` : (initial.city ?? '');
	let query = $state(initialQuery);
	let results = $state<GeoNamesResult[]>([]);
	let loading = $state(false);
	let open = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const controlClass =
		'w-full rounded-ui-sm border border-rule bg-[var(--admin-surface)] px-[0.65rem] py-2 font-[inherit] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong';

	function clearCoordinates() {
		countryCode = '';
		geonameId = '';
		latitude = '';
		longitude = '';
	}

	async function searchPlaces(term: string) {
		if (term.trim().length < 2) {
			results = [];
			open = false;
			return;
		}
		loading = true;
		try {
			const response = await fetch(`/admin/api/geonames?q=${encodeURIComponent(term.trim())}`);
			if (!response.ok) throw new Error('GeoNames no disponible');
			const data = (await response.json()) as { results?: GeoNamesResult[] };
			results = data.results ?? [];
			open = results.length > 0;
		} catch {
			results = [];
			open = false;
		} finally {
			loading = false;
		}
	}

	function handleSearch(event: Event) {
		query = (event.currentTarget as HTMLInputElement).value;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => void searchPlaces(query), 280);
	}

	function choose(place: GeoNamesResult) {
		city = place.name;
		country = place.countryName;
		countryCode = place.countryCode;
		geonameId = String(place.geonameId);
		latitude = String(place.lat);
		longitude = String(place.lng);
		query = place.label;
		open = false;
	}

	function editReadableField(event: Event, field: 'city' | 'country') {
		const value = (event.currentTarget as HTMLInputElement).value;
		if (field === 'city') city = value;
		else country = value;
		clearCoordinates();
	}
</script>

<div class="grid gap-3">
	<div class="relative">
		<Search
			class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint"
			size={15}
			strokeWidth={1.7}
			aria-hidden="true"
		/>
		<input
			class="{controlClass} pl-9 {invalid ? 'border-danger!' : ''}"
			{id}
			type="text"
			role="combobox"
			value={query}
			placeholder="Buscar ciudad…"
			autocomplete="off"
			aria-autocomplete="list"
			aria-expanded={open}
			aria-controls={`${id}-results`}
			aria-describedby={describedBy}
			oninput={handleSearch}
			onfocus={() => (open = results.length > 0)}
		/>
		{#if loading}
			<span class="absolute top-1/2 right-3 -translate-y-1/2 text-[0.65rem] text-ink-faint">
				Buscando…
			</span>
		{/if}
		{#if open}
			<ul
				class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-ui-sm border border-rule bg-[var(--admin-surface)] p-1 shadow-lg"
				id={`${id}-results`}
				role="listbox"
			>
				{#each results as place (place.geonameId)}
					<li role="option" aria-selected="false">
						<button
							class="grid w-full gap-0.5 rounded-ui-sm px-3 py-2 text-left hover:bg-[var(--admin-surface-hover)] focus-visible:outline-2 focus-visible:outline-accent-strong"
							type="button"
							onclick={() => choose(place)}
						>
							<span class="text-sm text-ink">{place.name}</span>
							<span class="text-[0.68rem] text-ink-faint">
								{[place.adminName1, place.countryName].filter(Boolean).join(', ')}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<div class="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
		<label class="grid gap-1">
			<span class="text-[0.7rem] text-ink-faint">Ciudad</span>
			<input
				class={controlClass}
				name="city"
				value={city}
				autocomplete="address-level2"
				oninput={(event) => editReadableField(event, 'city')}
			/>
		</label>
		<label class="grid gap-1">
			<span class="text-[0.7rem] text-ink-faint">País</span>
			<input
				class={controlClass}
				name="country"
				value={country}
				autocomplete="country-name"
				oninput={(event) => editReadableField(event, 'country')}
			/>
		</label>
	</div>

	{#if geonameId}
		<p class="m-0 flex items-center gap-1.5 text-[0.68rem] text-ink-faint">
			<MapPin size={13} strokeWidth={1.7} aria-hidden="true" />
			Localización vinculada a GeoNames · {latitude}, {longitude}
		</p>
	{/if}

	<input type="hidden" name="country_code" value={countryCode} />
	<input type="hidden" name="geoname_id" value={geonameId} />
	<input type="hidden" name="latitude" value={latitude} />
	<input type="hidden" name="longitude" value={longitude} />
</div>
