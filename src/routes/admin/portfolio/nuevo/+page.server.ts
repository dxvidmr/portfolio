import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	createPortfolioProject,
	parsePortfolioProjectInput
} from '$lib/server/admin/portfolio';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	return {};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		await requireAdmin(locals);
		const project = parsePortfolioProjectInput(await request.formData());
		if (!project) return fail(400, { success: false, message: 'Revisa los datos del elemento.' });
		try {
			await createPortfolioProject(project);
		} catch (cause) {
			console.error('[admin] Error al crear un elemento del portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, {
				success: false,
				message: 'No se pudo crear el elemento. Comprueba que el slug no esté en uso.'
			});
		}
		redirect(303, `/admin/portfolio/${encodeURIComponent(project.slug)}`);
	}
};
