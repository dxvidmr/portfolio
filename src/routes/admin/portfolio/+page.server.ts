import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { parseEnabled } from '$lib/server/admin/controls';
import {
	getPortfolioProjectList,
	parsePortfolioSlug,
	reorderPortfolioProjects,
	setPortfolioProjectVisibility
} from '$lib/server/admin/portfolio';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	return { projects: await getPortfolioProjectList() };
};

export const actions: Actions = {
	reorder: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		let slugs: string[] = [];
		try {
			const parsed = JSON.parse(String(formData.get('order') ?? '[]'));
			if (Array.isArray(parsed)) slugs = parsed.map((slug) => parsePortfolioSlug(String(slug))).filter((slug): slug is string => Boolean(slug));
		} catch {
			return fail(400, { success: false, message: 'Orden no válido.' });
		}
		try {
			await reorderPortfolioProjects(slugs);
			return { success: true, message: 'Orden del portfolio actualizado.' };
		} catch (cause) {
			console.error('[admin] Error al reordenar el portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(400, { success: false, message: 'No se pudo actualizar el orden.' });
		}
	},
	visibility: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const portfolioSlug = parsePortfolioSlug(formData.get('portfolioSlug'));
		const showHome = parseEnabled(formData.get('showHome'));
		if (!portfolioSlug || showHome == null) {
			return fail(400, { success: false, message: 'Visibilidad no válida.' });
		}
		try {
			await setPortfolioProjectVisibility(portfolioSlug, showHome);
			return {
				success: true,
				message: showHome ? 'Proyecto visible en la portada.' : 'Proyecto oculto de la portada.'
			};
		} catch (cause) {
			console.error('[admin] Error al actualizar la visibilidad del proyecto', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo actualizar la visibilidad.' });
		}
	}
};
