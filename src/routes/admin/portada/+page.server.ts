import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import { getHomeEntries } from '$lib/server/admin/entries';
import {
	parseEntryKey,
	parseHomeOrder,
	saveHomeOrder,
	updateEntryControl
} from '$lib/server/admin/controls';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	return { entries: await getHomeEntries() };
};

export const actions: Actions = {
	saveOrder: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const order = parseHomeOrder(formData.get('order'));
		if (!order) {
			return fail(400, { success: false, message: 'Orden de portada no válido.' });
		}

		try {
			await saveHomeOrder(order);
			return { success: true, message: 'Orden de portada guardado.' };
		} catch (cause) {
			console.error('[admin] Error al reordenar la portada', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo actualizar el orden.' });
		}
	},
	remove: async ({ request, locals }) => {
		await requireAdmin(locals);
		const key = parseEntryKey(await request.formData());
		if (!key) return fail(400, { success: false, message: 'Entrada no válida.' });

		try {
			await updateEntryControl(key, 'home', false);
			return { success: true, message: 'Entrada retirada de la portada.' };
		} catch (cause) {
			console.error('[admin] Error al retirar una entrada de portada', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo retirar la entrada.' });
		}
	}
};
