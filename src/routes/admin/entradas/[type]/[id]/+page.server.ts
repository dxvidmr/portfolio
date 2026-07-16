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
import {
	getStructuralRelations,
	supportsStructuralRelations
} from '$lib/server/admin/structural-relations';
import {
	addFundingRelation,
	getFundingRelationEditor,
	parseFundingRelationKind,
	relationBelongsToEntry,
	removeFundingRelation,
	updateFundingRelationKind
} from '$lib/server/admin/funding-relations';
import { parseEntryKey } from '$lib/server/admin/controls';
import { getCanonicalEventForEntry } from '$lib/server/admin/events';
import {
	addLink,
	moveLink,
	parseLinkDirection,
	parseLinkId,
	parseLinkValues,
	getLinkEditor,
	removeLink,
	updateLink
} from '$lib/server/admin/links';
import {
	addDocument,
	getDocumentEditor,
	moveDocument,
	parseDocumentDirection,
	parseDocumentId,
	parseDocumentValues,
	removeDocument,
	updateDocument
} from '$lib/server/admin/documents';

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
	const entry = { entityType, entityId };
	const [options, control, portfolioRelations, structuralRelations, fundingRelations, canonicalEvent, links, documents] = await Promise.all([
		getFieldOptions(entityType),
		getControlState(entityType, entityId),
		getEntryPortfolioRelations({ entityType, entityId }),
		getStructuralRelations({ entityType, entityId }),
		getFundingRelationEditor({ entityType, entityId }),
		getCanonicalEventForEntry(entry),
		getLinkEditor(entry),
		getDocumentEditor({ kind: 'entry', entry })
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
		portfolioRelations,
		structuralRelations,
		hasStructuralRelations: supportsStructuralRelations(entityType),
		fundingRelations,
		canonicalEvent,
		links,
		documents
	};
};

function parseFundingPayload(formData: FormData) {
	const fundingAwardId = Number(formData.get('fundingAwardId'));
	const target = parseEntryKey(formData);
	if (!Number.isSafeInteger(fundingAwardId) || fundingAwardId <= 0 || !target) return null;
	return { fundingAwardId, target };
}

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

	relacionarFinanciacion: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const current = parseParams(params);
		const formData = await request.formData();
		const payload = parseFundingPayload(formData);
		const relationKind = parseFundingRelationKind(formData.get('relationKind'));
		if (
			!payload ||
			!relationKind ||
			!relationBelongsToEntry(current, payload.fundingAwardId, payload.target)
		) {
			return fail(400, { relationMessage: 'Relación de financiación no válida.', relationSuccess: false });
		}
		try {
			await addFundingRelation(payload.fundingAwardId, payload.target, relationKind);
			return { relationMessage: 'Relación de financiación añadida.', relationSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al añadir financiación relacionada', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { relationMessage: 'No se pudo añadir la relación.', relationSuccess: false });
		}
	},

	quitarFinanciacion: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const current = parseParams(params);
		const payload = parseFundingPayload(await request.formData());
		if (!payload || !relationBelongsToEntry(current, payload.fundingAwardId, payload.target)) {
			return fail(400, { relationMessage: 'Relación de financiación no válida.', relationSuccess: false });
		}
		try {
			await removeFundingRelation(payload.fundingAwardId, payload.target);
			return { relationMessage: 'Relación de financiación eliminada.', relationSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al quitar financiación relacionada', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { relationMessage: 'No se pudo eliminar la relación.', relationSuccess: false });
		}
	},

	tipoFinanciacion: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const current = parseParams(params);
		const formData = await request.formData();
		const payload = parseFundingPayload(formData);
		const relationKind = parseFundingRelationKind(formData.get('relationKind'));
		if (
			!payload ||
			!relationKind ||
			!relationBelongsToEntry(current, payload.fundingAwardId, payload.target)
		) {
			return fail(400, { relationMessage: 'Tipo de relación no válido.', relationSuccess: false });
		}
		try {
			await updateFundingRelationKind(payload.fundingAwardId, payload.target, relationKind);
			return { relationMessage: 'Tipo de relación actualizado.', relationSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al cambiar el tipo de relación financiera', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { relationMessage: 'No se pudo actualizar la relación.', relationSuccess: false });
		}
	},

	crearEnlace: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const values = parseLinkValues(await request.formData());
		if (!values) return fail(400, { linkMessage: 'Revisa el tipo y la URL del enlace.', linkSuccess: false });
		try {
			await addLink(entry, values);
			return { linkMessage: 'Enlace añadido.', linkSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al añadir enlace', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(409, { linkMessage: 'No se pudo añadir; comprueba que la URL no esté repetida.', linkSuccess: false });
		}
	},

	guardarEnlace: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const formData = await request.formData();
		const id = parseLinkId(formData);
		const values = parseLinkValues(formData);
		if (!id || !values) return fail(400, { linkMessage: 'Datos de enlace no válidos.', linkSuccess: false });
		try {
			await updateLink(entry, id, values);
			return { linkMessage: 'Enlace actualizado.', linkSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al actualizar enlace', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(409, { linkMessage: 'No se pudo guardar; comprueba que la URL no esté repetida.', linkSuccess: false });
		}
	},

	eliminarEnlace: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const id = parseLinkId(await request.formData());
		if (!id) return fail(400, { linkMessage: 'Enlace no válido.', linkSuccess: false });
		try {
			await removeLink(entry, id);
			return { linkMessage: 'Enlace eliminado.', linkSuccess: true };
		} catch {
			return fail(404, { linkMessage: 'El enlace ya no existe.', linkSuccess: false });
		}
	},

	moverEnlace: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const formData = await request.formData();
		const id = parseLinkId(formData);
		const direction = parseLinkDirection(formData.get('direction'));
		if (!id || !direction) return fail(400, { linkMessage: 'Movimiento no válido.', linkSuccess: false });
		try {
			await moveLink(entry, id, direction);
			return { linkMessage: 'Orden de enlaces actualizado.', linkSuccess: true };
		} catch {
			return fail(404, { linkMessage: 'El enlace ya no existe.', linkSuccess: false });
		}
	},

	crearDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const owner = { kind: 'entry' as const, entry };
		const values = parseDocumentValues(await request.formData(), owner.kind);
		if (!values) return fail(400, { documentMessage: 'Revisa el tipo, la URL y la fecha del documento.', documentSuccess: false });
		try {
			await addDocument(owner, values);
			return { documentMessage: 'Documento añadido.', documentSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al añadir documento', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(409, { documentMessage: 'No se pudo añadir; comprueba que la URL no esté repetida.', documentSuccess: false });
		}
	},

	guardarDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const owner = { kind: 'entry' as const, entry };
		const formData = await request.formData();
		const id = parseDocumentId(formData);
		const values = parseDocumentValues(formData, owner.kind);
		if (!id || !values) return fail(400, { documentMessage: 'Datos de documento no válidos.', documentSuccess: false });
		try {
			await updateDocument(owner, id, values);
			return { documentMessage: 'Documento actualizado.', documentSuccess: true };
		} catch (cause) {
			console.error('[admin] Error al actualizar documento', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(409, { documentMessage: 'No se pudo guardar; comprueba que la URL no esté repetida.', documentSuccess: false });
		}
	},

	eliminarDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const id = parseDocumentId(await request.formData());
		if (!id) return fail(400, { documentMessage: 'Documento no válido.', documentSuccess: false });
		try {
			await removeDocument({ kind: 'entry', entry }, id);
			return { documentMessage: 'Documento eliminado.', documentSuccess: true };
		} catch {
			return fail(404, { documentMessage: 'El documento ya no existe.', documentSuccess: false });
		}
	},

	moverDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const entry = parseParams(params);
		const formData = await request.formData();
		const id = parseDocumentId(formData);
		const direction = parseDocumentDirection(formData.get('direction'));
		if (!id || !direction) return fail(400, { documentMessage: 'Movimiento no válido.', documentSuccess: false });
		try {
			await moveDocument({ kind: 'entry', entry }, id, direction);
			return { documentMessage: 'Orden de documentos actualizado.', documentSuccess: true };
		} catch {
			return fail(404, { documentMessage: 'El documento ya no existe.', documentSuccess: false });
		}
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
