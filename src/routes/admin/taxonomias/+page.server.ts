import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	addTaxonomyType,
	deleteTaxonomyType,
	getTaxonomies,
	isTaxonomyDomain,
	parseTaxonomyValues,
	updateTaxonomyType
} from '$lib/server/admin/taxonomies';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	await requireAdmin(locals);
	setHeaders({ 'cache-control': 'private, no-store' });
	return { domains: await getTaxonomies() };
};

// `raw` viaja en todas las variantes (aunque sea undefined) para que ActionData
// sea una unión homogénea y la página pueda leerlo sin discriminar el caso.
const message = (text: string, success: boolean, domain: string, raw?: Record<string, string>) => ({
	message: text,
	success,
	domain,
	raw
});

export const actions: Actions = {
	crear: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const domain = String(formData.get('domain') ?? '');
		if (!isTaxonomyDomain(domain)) return fail(400, message('Dominio no permitido.', false, ''));

		const { values, error } = parseTaxonomyValues(formData, { requireCode: true });
		if (error) {
			return fail(400, message(error, false, domain, {
				code: values.code,
				label_es: values.labelEs,
				label_en: values.labelEn,
				sort_order: values.sortOrder ? String(values.sortOrder) : ''
			}));
		}
		try {
			await addTaxonomyType(domain, values);
			return message(`Tipo «${values.code}» añadido.`, true, domain);
		} catch (cause) {
			const text = cause instanceof Error ? cause.message : 'No se pudo añadir el tipo.';
			console.error('[admin] Error al añadir tipo de vocabulario', { message: text });
			return fail(409, message(text, false, domain));
		}
	},

	guardar: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const domain = String(formData.get('domain') ?? '');
		const code = String(formData.get('code') ?? '');
		if (!isTaxonomyDomain(domain)) return fail(400, message('Dominio no permitido.', false, ''));

		const { values, error } = parseTaxonomyValues(formData, { requireCode: false });
		if (error) return fail(400, message(error, false, domain));
		try {
			await updateTaxonomyType(domain, code, values);
			return message(`Tipo «${code}» actualizado.`, true, domain);
		} catch (cause) {
			const text = cause instanceof Error ? cause.message : 'No se pudo guardar el tipo.';
			console.error('[admin] Error al actualizar tipo de vocabulario', { message: text });
			return fail(409, message(text, false, domain));
		}
	},

	eliminar: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const domain = String(formData.get('domain') ?? '');
		const code = String(formData.get('code') ?? '');
		if (!isTaxonomyDomain(domain)) return fail(400, message('Dominio no permitido.', false, ''));
		try {
			await deleteTaxonomyType(domain, code);
			return message(`Tipo «${code}» eliminado.`, true, domain);
		} catch (cause) {
			const text = cause instanceof Error ? cause.message : 'No se pudo eliminar el tipo.';
			console.error('[admin] Error al eliminar tipo de vocabulario', { message: text });
			return fail(409, message(text, false, domain));
		}
	}
};
