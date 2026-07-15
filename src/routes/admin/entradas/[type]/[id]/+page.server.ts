import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	entityDefinitions,
	entityForms,
	isFormEntityType,
	type FormEntityType
} from '$lib/server/admin/entity-definitions';
import { parseEntityForm } from '$lib/server/admin/validation';
import {
	deleteEntity,
	getControlState,
	getEntityFormValues,
	getFieldOptions,
	updateEntity,
	validateReferences
} from '$lib/server/admin/crud';
import { updateEntryControl } from '$lib/server/admin/controls';
import { getEntryPortfolioRelations } from '$lib/server/admin/portfolio';

const HEADING_KEYS = ['title', 'degree_title', 'institution', 'organization'];

function parseParams(params: { type: string; id: string }): {
	entityType: FormEntityType;
	entityId: number;
} {
	if (!isFormEntityType(params.type)) error(404, 'Tipo de entrada no soportado');
	if (!/^\d+$/.test(params.id)) error(404, 'Entrada no encontrada');
	return { entityType: params.type, entityId: Number(params.id) };
}

export const load: PageServerLoad = async ({ locals, params, setHeaders }) => {
	await requireAdmin(locals);
	const { entityType, entityId } = parseParams(params);

	const values = await getEntityFormValues(entityType, entityId);
	if (!values) error(404, 'Entrada no encontrada');

	setHeaders({ 'cache-control': 'private, no-store' });

	const headingKey = HEADING_KEYS.find((key) => values[key]);
	const [options, control, portfolioRelations] = await Promise.all([
		getFieldOptions(entityType),
		getControlState(entityType, entityId),
		getEntryPortfolioRelations({ entityType, entityId })
	]);

	return {
		entityType,
		entityId,
		typeLabel: entityDefinitions[entityType],
		heading: headingKey ? values[headingKey] : `#${entityId}`,
		fields: entityForms[entityType].fields,
		options,
		values,
		control,
		portfolioRelations
	};
};

export const actions: Actions = {
	guardar: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const { entityType, entityId } = parseParams(params);
		if (!(await getEntityFormValues(entityType, entityId))) error(404, 'Entrada no encontrada');

		const parsed = parseEntityForm(entityForms[entityType], await request.formData());
		await validateReferences(entityType, parsed);
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.raw });
		}

		await updateEntity(entityType, entityId, parsed.values);
		return { guardada: true };
	},

	publicar: async ({ locals, params }) => {
		await requireAdmin(locals);
		const { entityType, entityId } = parseParams(params);
		const state = await updateEntryControl({ entityType, entityId }, 'public', true);
		return { visibilidad: state.isPublic ? 'publicada' : 'privada' };
	},

	despublicar: async ({ locals, params }) => {
		await requireAdmin(locals);
		const { entityType, entityId } = parseParams(params);
		const state = await updateEntryControl({ entityType, entityId }, 'public', false);
		return { visibilidad: state.isPublic ? 'publicada' : 'privada' };
	},

	portada: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const { entityType, entityId } = parseParams(params);
		const enabled = (await request.formData()).get('enabled') === '1';
		const state = await updateEntryControl({ entityType, entityId }, 'home', enabled);
		return { portada: state.showHome };
	},

	eliminar: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const { entityType, entityId } = parseParams(params);

		const formData = await request.formData();
		if (formData.get('confirmar') !== '1') {
			return fail(400, { eliminarError: 'Marca la casilla de confirmación para eliminar' });
		}

		await deleteEntity(entityType, entityId);
		redirect(303, '/admin/entradas?eliminada=1');
	}
};
