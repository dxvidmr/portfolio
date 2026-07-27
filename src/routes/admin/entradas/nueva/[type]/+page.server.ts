import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	entityDefinitions,
	entityForms,
	getEntityCapabilities,
	isFormEntityType,
	type EntityFormDef
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

	const requestedContext = url.searchParams.get('context');
	const creationContext =
		params.type === 'service_activities' &&
		(requestedContext === 'event' || requestedContext === 'standalone')
			? requestedContext
			: 'general';
	const eventId = Number(url.searchParams.get('eventId'));
	let initialValues: Record<string, string> = {};
	if (params.type === 'event_attendance') {
		initialValues = {
			event_id: Number.isSafeInteger(eventId) && eventId > 0 ? String(eventId) : '',
			role: 'attendance_attendee'
		};
	} else if (
		Number.isSafeInteger(eventId) &&
		eventId > 0 &&
		(params.type === 'talks' || params.type === 'service_activities')
	) {
		initialValues = await getCanonicalEventDefaults(eventId, params.type);
	}
	const baseFormDefinition: EntityFormDef = entityForms[params.type];
	const formDefinition: EntityFormDef =
		params.type === 'service_activities' && creationContext !== 'general'
			? {
					...baseFormDefinition,
					fields: baseFormDefinition.fields
						.filter(
							(field) =>
								creationContext !== 'standalone' || field.name !== 'canonical_event_id'
						)
						.map((field) =>
							creationContext === 'event' && field.name === 'canonical_event_id'
								? { ...field, required: true, help: undefined }
								: field
						)
				}
			: baseFormDefinition;

	return {
		entityType: params.type,
		typeLabel: entityDefinitions[params.type],
		creationContext,
		capabilities: getEntityCapabilities(params.type),
		fields: formDefinition.fields,
		groups: formDefinition.groups ?? [],
		options: await getFieldOptions(params.type),
		initialValues
	};
};

export const actions: Actions = {
	crear: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');

		const formData = await request.formData();
		const creationContext = String(formData.get('creation_context') ?? '');
		const parsed = parseEntityForm(entityForms[params.type], formData);
		if (
			params.type === 'service_activities' &&
			creationContext === 'event' &&
			parsed.values.canonical_event_id === null
		) {
			parsed.errors.canonical_event_id = 'Selecciona un evento';
		}
		await validateReferences(params.type, parsed);
		validateEntitySemantics(params.type, parsed);
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.raw });
		}

		const id = await createEntity(params.type, parsed.values);
		redirect(303, `/admin/entradas/${params.type}/${id}?creada=1`);
	}
};
