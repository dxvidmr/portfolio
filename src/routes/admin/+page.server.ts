import type { Actions, PageServerLoad } from './$types';
import { signOut } from '../../auth';
import { getAdminSummary } from '$lib/server/admin/entries';

export const load: PageServerLoad = async () => ({
	summary: await getAdminSummary()
});

export const actions: Actions = {
	salir: signOut
};
