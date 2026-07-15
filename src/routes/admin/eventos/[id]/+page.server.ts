import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	deleteCanonicalEvent,
	getCanonicalEvent,
	parseCanonicalEventForm,
	removeEventAttendance,
	saveEventAttendance,
	updateCanonicalEvent
} from '$lib/server/admin/events';

function parseId(value: string): number {
	if (!/^\d+$/.test(value)) error(404, 'Evento no encontrado');
	return Number(value);
}

export const load: PageServerLoad = async ({ locals, params, setHeaders }) => {
	await requireAdmin(locals);
	const event = await getCanonicalEvent(parseId(params.id));
	if (!event) error(404, 'Evento no encontrado');
	setHeaders({ 'cache-control': 'private, no-store' });
	return { event };
};

export const actions: Actions = {
	guardar: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const id = parseId(params.id);
		const parsed = parseCanonicalEventForm(await request.formData());
		if (Object.keys(parsed.errors).length > 0) {
			return fail(400, { errors: parsed.errors, raw: parsed.values, message: 'Revisa los campos.', success: false });
		}
		await updateCanonicalEvent(id, parsed.values);
		return { message: 'Evento actualizado.', success: true };
	},

	asistencia: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const id = parseId(params.id);
		const formData = await request.formData();
		const roleLabel = String(formData.get('roleLabel') ?? '').trim().slice(0, 160);
		const notesPrivate = String(formData.get('notesPrivate') ?? '').trim().slice(0, 5000);
		await saveEventAttendance(id, roleLabel, notesPrivate);
		return { message: 'Rol de oyente/asistente guardado como privado.', success: true };
	},

	quitarAsistencia: async ({ locals, params }) => {
		await requireAdmin(locals);
		const id = parseId(params.id);
		await removeEventAttendance(id);
		return { message: 'Asistencia privada eliminada.', success: true };
	},

	eliminar: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const id = parseId(params.id);
		if ((await request.formData()).get('confirmar') !== '1') {
			return fail(400, { message: 'Confirma la eliminación.', success: false });
		}
		try {
			await deleteCanonicalEvent(id);
		} catch (cause) {
			return fail(409, {
				message: cause instanceof Error ? cause.message : 'No se pudo eliminar el evento.',
				success: false
			});
		}
		redirect(303, '/admin/eventos?eliminado=1');
	}
};
