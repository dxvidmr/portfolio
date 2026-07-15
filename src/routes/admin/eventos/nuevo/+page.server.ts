import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { createCanonicalEvent, parseCanonicalEventForm } from '$lib/server/admin/events';

export const actions: Actions = {
	crear: async ({ locals, request }) => {
		await requireAdmin(locals);
		const parsed = parseCanonicalEventForm(await request.formData());
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.values });
		}
		const id = await createCanonicalEvent(parsed.values);
		redirect(303, `/admin/eventos/${id}?creado=1`);
	}
};
