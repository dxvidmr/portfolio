import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	emptyEntryFilters,
	entityTypeOptions,
	getAdminEntries,
	parseEntryFilters
} from '$lib/server/admin/entries';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	parseControlName,
	parseEnabled,
	parseEntryKey,
	updateEntryControl
} from '$lib/server/admin/controls';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const filters = parseEntryFilters(url.searchParams);
	return {
		filters,
		entityTypes: entityTypeOptions,
		entries: await getAdminEntries(emptyEntryFilters)
	};
};

export const actions: Actions = {
	control: async ({ request, locals }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const key = parseEntryKey(formData);
		const control = parseControlName(formData.get('control'));
		const enabled = parseEnabled(formData.get('enabled'));

		if (!key || !control || enabled == null) {
			return fail(400, { success: false, message: 'Control editorial no válido.' });
		}

		try {
			const entry = await updateEntryControl(key, control, enabled);
			const label = control === 'public' ? 'visibilidad pública' : 'aparición en portada';
			return {
				success: true,
				message: `Se actualizó la ${label}.`,
				entry: { ...key, ...entry }
			};
		} catch (cause) {
			console.error('[admin] Error al actualizar un control editorial', {
				message: cause instanceof Error ? cause.message : 'Error desconocido'
			});
			return fail(500, { success: false, message: 'No se pudo guardar el cambio.' });
		}
	}
};
