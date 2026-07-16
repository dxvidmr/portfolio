import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hasProjectStory } from '$lib/content/project-story-registry';
import { requireAdmin } from '$lib/server/admin/auth';
import { parseEnabled, parseEntryKey } from '$lib/server/admin/controls';
import {
	addPortfolioRelation,
	getPortfolioAdminData,
	parsePortfolioProjectInput,
	parsePortfolioSlug,
	removePortfolioRelation,
	setPortfolioFeatured,
	updatePortfolioProject
} from '$lib/server/admin/portfolio';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const slug = parsePortfolioSlug(params.slug);
	if (!slug) error(404, 'Proyecto no encontrado');
	const data = await getPortfolioAdminData(slug);
	if (!data.project) error(404, 'Proyecto no encontrado');
	return { ...data, project: data.project, hasNarrative: hasProjectStory(slug) };
};

const matchingSlug = (formData: FormData, routeSlug: string) => {
	const portfolioSlug = parsePortfolioSlug(formData.get('portfolioSlug') ?? formData.get('slug'));
	return portfolioSlug === routeSlug ? portfolioSlug : null;
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		await requireAdmin(locals);
		const routeSlug = parsePortfolioSlug(params.slug);
		const formData = await request.formData();
		const project = parsePortfolioProjectInput(formData);
		if (!routeSlug || !project || project.slug !== routeSlug) {
			return fail(400, { success: false, message: 'Revisa los datos del proyecto.' });
		}
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
	add: async ({ request, locals, params }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const routeSlug = parsePortfolioSlug(params.slug);
		const portfolioSlug = routeSlug ? matchingSlug(formData, routeSlug) : null;
		const entry = parseEntryKey(formData);
		if (!portfolioSlug || !entry) return fail(400, { success: false, message: 'Relación no válida.' });
		try {
			const relation = await addPortfolioRelation(portfolioSlug, entry);
			return { success: true, message: 'Entrada añadida a la ficha.', relation };
		} catch (cause) {
			console.error('[admin] Error al relacionar una entrada con el portfolio', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(500, { success: false, message: 'No se pudo añadir la entrada.' });
		}
	},
	remove: async ({ request, locals, params }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const routeSlug = parsePortfolioSlug(params.slug);
		const portfolioSlug = routeSlug ? matchingSlug(formData, routeSlug) : null;
		const entry = parseEntryKey(formData);
		if (!portfolioSlug || !entry) return fail(400, { success: false, message: 'Relación no válida.' });
		try {
			await removePortfolioRelation(portfolioSlug, entry);
			return { success: true, message: 'Entrada retirada de la ficha.' };
		} catch (cause) {
			console.error('[admin] Error al retirar una relación del portfolio', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(500, { success: false, message: 'No se pudo retirar la entrada.' });
		}
	},
	featured: async ({ request, locals, params }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const routeSlug = parsePortfolioSlug(params.slug);
		const portfolioSlug = routeSlug ? matchingSlug(formData, routeSlug) : null;
		const entry = parseEntryKey(formData);
		const featured = parseEnabled(formData.get('featured'));
		if (!portfolioSlug || !entry || featured == null) return fail(400, { success: false, message: 'Destacado no válido.' });
		try {
			const relation = await setPortfolioFeatured(portfolioSlug, entry, featured);
			return { success: true, message: featured ? 'Entrada destacada en la ficha.' : 'Destacado retirado.', relation };
		} catch (cause) {
			console.error('[admin] Error al actualizar el destacado del portfolio', { message: cause instanceof Error ? cause.message : 'Error desconocido' });
			return fail(500, { success: false, message: 'No se pudo actualizar el destacado.' });
		}
	}
};
