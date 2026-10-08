import type { PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { meritTypeGroups, meritTypes } from '$lib/server/admin/entity-definitions';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	return {
		groups: meritTypeGroups.map((group) => ({
			title: group.title,
			types: group.types.map((type) => ({ type, ...meritTypes[type] }))
		}))
	};
};
