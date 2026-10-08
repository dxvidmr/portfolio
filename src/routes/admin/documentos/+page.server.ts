import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	entityTypeOptions,
	getAdminDocumentIndex,
	getDocumentOwnerOptions,
	getDocumentTypeOptions
} from '$lib/server/admin/document-index';
import { isEntityType } from '$lib/server/admin/entity-definitions';
import { addDocument, parseDocumentValues } from '$lib/server/admin/documents';

function parseOwner(value: FormDataEntryValue | null) {
	const [entityType, rawId, ...rest] = String(value ?? '').split(':');
	const entityId = Number(rawId);
	if (
		rest.length > 0 ||
		!isEntityType(entityType) ||
		!Number.isSafeInteger(entityId) ||
		entityId <= 0
	) return null;
	return { kind: 'entry' as const, entry: { entityType, entityId } };
}

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	await requireAdmin(locals);
	setHeaders({ 'cache-control': 'private, no-store' });
	const [documents, owners, documentTypes] = await Promise.all([
		getAdminDocumentIndex(),
		getDocumentOwnerOptions(),
		getDocumentTypeOptions()
	]);
	return { documents, owners, documentTypes, entityTypes: entityTypeOptions };
};

export const actions: Actions = {
	crear: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const owner = parseOwner(formData.get('owner'));
		const values = parseDocumentValues(formData);
		if (!owner || !values) {
			return fail(400, {
				success: false,
				message: 'Selecciona un mérito y revisa el tipo, la URL y la fecha.'
			});
		}
		try {
			await addDocument(owner, values);
			return { success: true, message: 'Documento añadido al mérito.' };
		} catch (cause) {
			return fail(409, {
				success: false,
				message: cause instanceof Error ? cause.message : 'No se pudo añadir el documento.'
			});
		}
	}
};
