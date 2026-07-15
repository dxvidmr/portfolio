import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { getCanonicalEvents } from '$lib/server/admin/events';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	await requireAdmin(locals);
	setHeaders({ 'cache-control': 'private, no-store' });
	return { events: await getCanonicalEvents() };
};
