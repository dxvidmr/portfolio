import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { parseEnabled, parseEntryKey } from '$lib/server/admin/controls';
import {
	addPortfolioRelation,
	createPortfolioProject,
	getPortfolioAdminData,
	parsePortfolioProjectInput,
	parsePortfolioSlug,
	removePortfolioRelation,
	setPortfolioFeatured,
	setPortfolioProjectVisibility,
	updatePortfolioProject
} from '$lib/server/admin/portfolio';

export const load: PageServerLoad = async ({ setHeaders, url }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const data = await getPortfolioAdminData();
	const requestedSlug = parsePortfolioSlug(url.searchParams.get('ficha'));
	return {
		...data,
		selectedSlug: data.projects.some((project) => project.slug === requestedSlug)
			? requestedSlug!
			: data.projects[0]?.slug ?? '',
		initialQuery: (url.searchParams.get('q') ?? '').trim().slice(0, 120)
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		await requireAdmin(locals);
		const project = parsePortfolioProjectInput(await request.formData());
		if (!project) return fail(400, { success: false, message: 'Revisa los datos del proyecto.' });
		try {
			await createPortfolioProject(project);
		} catch (cause) {
			console.error('[admin] Error al crear un proyecto del portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo crear el proyecto. Comprueba que el slug no esté en uso.' });
		}
		redirect(303, `/admin/portfolio?ficha=${encodeURIComponent(project.slug)}`);
	},
	update: async ({ request, locals }) => {
		await requireAdmin(locals);
		const project = parsePortfolioProjectInput(await request.formData());
		if (!project) return fail(400, { success: false, message: 'Revisa los datos del proyecto.' });
		try {
			await updatePortfolioProject(project);
			return { success: true, message: 'Datos del proyecto actualizados.' };
		} catch (cause) {
			console.error('[admin] Error al actualizar un proyecto del portfolio', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo actualizar el proyecto.' });
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
	},
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
