import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { getHomeEntries } from '$lib/server/admin/entries';
import {
	getActivityOrderMode,
	parseActivityOrderMode,
	setActivityOrderMode
} from '$lib/server/activity-order';
import {
	parseEntryKey,
	parseHomeOrder,
	saveHomeOrder,
	updateEntryControl
} from '$lib/server/admin/controls';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const orderMode = await getActivityOrderMode();
	return { entries: await getHomeEntries(orderMode), orderMode };
};

export const actions: Actions = {
	orderMode: async ({ request, locals }) => {
		await requireAdmin(locals);
		const mode = parseActivityOrderMode((await request.formData()).get('mode'));
		if (!mode) return fail(400, { success: false, message: 'Criterio de orden no válido.' });

		try {
			await setActivityOrderMode(mode);
			return {
				success: true,
				message: mode === 'date' ? 'Actividad ordenada por fecha.' : 'Orden manual activado.'
			};
		} catch (cause) {
			console.error('[admin] Error al cambiar el orden de la actividad', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo cambiar el criterio de orden.' });
		}
	},
	reorder: async ({ request, locals }) => {
		await requireAdmin(locals);
		if ((await getActivityOrderMode()) !== 'manual') {
			return fail(409, {
				success: false,
				message: 'Activa el orden manual antes de reordenar la actividad.'
			});
		}
		const formData = await request.formData();
		const order = parseHomeOrder(formData.get('order'));
		if (!order) return fail(400, { success: false, message: 'Orden de actividad no válido.' });

		try {
			await saveHomeOrder(order);
			return { success: true, message: 'Orden de actividad actualizado.' };
		} catch (cause) {
			console.error('[admin] Error al reordenar la actividad', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo actualizar el orden.' });
		}
	},
	remove: async ({ request, locals }) => {
		await requireAdmin(locals);
		const key = parseEntryKey(await request.formData());
		if (!key) return fail(400, { success: false, message: 'Mérito no válido.' });

		try {
			await updateEntryControl(key, 'home', false);
			return { success: true, message: 'Mérito retirado de la portada.' };
		} catch (cause) {
			console.error('[admin] Error al retirar una entrada de actividad', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo retirar el mérito.' });
		}
	}
};
