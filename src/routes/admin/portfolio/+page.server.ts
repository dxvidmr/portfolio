import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { parseEnabled, parseEntryKey } from '$lib/server/admin/controls';
import {
	addPortfolioRelation,
	getPortfolioAdminData,
	parsePortfolioSlug,
	removePortfolioRelation,
	setPortfolioFeatured
} from '$lib/server/admin/portfolio';

export const load: PageServerLoad = async ({ setHeaders, url }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const data = await getPortfolioAdminData();
	return {
		...data,
		selectedSlug: parsePortfolioSlug(url.searchParams.get('ficha')) ?? data.projects[0]?.slug ?? '',
		initialQuery: (url.searchParams.get('q') ?? '').trim().slice(0, 120)
	};
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const portfolioSlug = parsePortfolioSlug(formData.get('portfolioSlug'));
		const entry = parseEntryKey(formData);
		if (!portfolioSlug || !entry) {
			return fail(400, { success: false, message: 'Relación no válida.' });
		}

		try {
			const relation = await addPortfolioRelation(portfolioSlug, entry);
			return { success: true, message: 'Entrada añadida a la ficha.', relation };
		} catch (cause) {
			console.error('[admin] Error al relacionar una entrada con el portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo añadir la entrada.' });
		}
	},
	remove: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const portfolioSlug = parsePortfolioSlug(formData.get('portfolioSlug'));
		const entry = parseEntryKey(formData);
		if (!portfolioSlug || !entry) {
			return fail(400, { success: false, message: 'Relación no válida.' });
		}

		try {
			await removePortfolioRelation(portfolioSlug, entry);
			return { success: true, message: 'Entrada retirada de la ficha.', removed: { portfolioSlug, ...entry } };
		} catch (cause) {
			console.error('[admin] Error al retirar una relación del portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo retirar la entrada.' });
		}
	},
	featured: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const portfolioSlug = parsePortfolioSlug(formData.get('portfolioSlug'));
		const entry = parseEntryKey(formData);
		const featured = parseEnabled(formData.get('featured'));
		if (!portfolioSlug || !entry || featured == null) {
			return fail(400, { success: false, message: 'Destacado no válido.' });
		}

		try {
			const relation = await setPortfolioFeatured(portfolioSlug, entry, featured);
			return {
				success: true,
				message: featured ? 'Entrada destacada en la ficha.' : 'Destacado retirado.',
				relation
			};
		} catch (cause) {
			console.error('[admin] Error al actualizar el destacado del portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo actualizar el destacado.' });
		}
	}
};
