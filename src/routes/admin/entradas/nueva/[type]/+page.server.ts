import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	entityDefinitions,
	entityForms,
	isFormEntityType
} from '$lib/server/admin/entity-definitions';
import { parseEntityForm } from '$lib/server/admin/validation';
import { createEntity, getFieldOptions, validateReferences } from '$lib/server/admin/crud';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireAdmin(locals);
	if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');

	return {
		entityType: params.type,
		typeLabel: entityDefinitions[params.type],
		fields: entityForms[params.type].fields,
		options: await getFieldOptions(params.type)
	};
};

export const actions: Actions = {
	crear: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');

		const parsed = parseEntityForm(entityForms[params.type], await request.formData());
		await validateReferences(params.type, parsed);
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.raw });
		}

		const id = await createEntity(params.type, parsed.values);
		redirect(303, `/admin/entradas/${params.type}/${id}?creada=1`);
	}
};
