import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { formEntityTypeOptions } from '$lib/server/admin/entity-definitions';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	return { typeOptions: formEntityTypeOptions };
};
