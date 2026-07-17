import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	entityDefinitions,
	entityForms,
	isFormEntityType
} from '$lib/server/admin/entity-definitions';
import { parseEntityForm } from '$lib/server/admin/validation';
import {
	createEntity,
	getFieldOptions,
	validateEntitySemantics,
	validateReferences
} from '$lib/server/admin/crud';
import { getCanonicalEventDefaults } from '$lib/server/admin/events';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	await requireAdmin(locals);
	if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');

	const eventId = Number(url.searchParams.get('eventId'));
	const initialValues =
		Number.isSafeInteger(eventId) && eventId > 0 &&
		(params.type === 'talks' || params.type === 'service_activities')
			? await getCanonicalEventDefaults(eventId, params.type)
			: {};

	return {
		entityType: params.type,
		typeLabel: entityDefinitions[params.type],
		fields: entityForms[params.type].fields,
		options: await getFieldOptions(params.type),
		initialValues
	};
};

export const actions: Actions = {
	crear: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');

		const parsed = parseEntityForm(entityForms[params.type], await request.formData());
		await validateReferences(params.type, parsed);
		validateEntitySemantics(params.type, parsed);
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.raw });
		}

		const id = await createEntity(params.type, parsed.values);
		redirect(303, `/admin/entradas/${params.type}/${id}?creada=1`);
	}
};
