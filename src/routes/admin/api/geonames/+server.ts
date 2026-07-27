import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';

const GEONAMES_ENDPOINT = 'https://secure.geonames.org/searchJSON';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	await requireAdmin(locals);
	const query = url.searchParams.get('q')?.trim().slice(0, 120) ?? '';
	if (query.length < 2) return json({ results: [] });

	const params = new URLSearchParams({
		q: query,
		maxRows: '8',
		featureClass: 'P',
		lang: 'es',
		orderby: 'relevance',
		isNameRequired: 'true',
		username: env.GEONAMES_USERNAME || 'davidmerinorecalde'
	});

	try {
		const response = await fetch(`${GEONAMES_ENDPOINT}?${params}`, {
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) return json({ results: [] }, { status: 502 });
		const payload = (await response.json()) as {
			status?: { message?: string };
			geonames?: Array<Record<string, unknown>>;
		};
		if (payload.status) return json({ results: [] }, { status: 502 });

		const results = (payload.geonames ?? []).flatMap((place) => {
			const geonameId = Number(place.geonameId);
			const lat = Number(place.lat);
			const lng = Number(place.lng);
			if (!Number.isSafeInteger(geonameId) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
				return [];
			}
			const name = String(place.name ?? place.toponymName ?? '');
			const countryName = String(place.countryName ?? '');
			const adminName1 = String(place.adminName1 ?? '');
			return [
				{
					geonameId,
					name,
					countryName,
					countryCode: String(place.countryCode ?? ''),
					adminName1,
					lat,
					lng,
					label: [name, adminName1, countryName].filter(Boolean).join(', ')
				}
			];
		});
		return json({ results });
	} catch {
		return json({ results: [] }, { status: 502 });
	}
};
