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
import {
	addDocument,
	getDocumentEditor,
	moveDocument,
	parseDocumentDirection,
	parseDocumentId,
	parseDocumentValues,
	removeDocument,
	updateDocument
} from '$lib/server/admin/documents';

function parseId(value: string): number {
	if (!/^\d+$/.test(value)) error(404, 'Evento no encontrado');
	return Number(value);
}

export const load: PageServerLoad = async ({ locals, params, setHeaders }) => {
	await requireAdmin(locals);
	const event = await getCanonicalEvent(parseId(params.id));
	if (!event) error(404, 'Evento no encontrado');
	setHeaders({ 'cache-control': 'private, no-store' });
	return {
		event,
		attendanceDocuments: event.attendance
			? await getDocumentEditor({ kind: 'attendance', attendanceId: event.attendance.id })
			: null
	};
};

async function getAttendanceOwner(eventId: number) {
	const event = await getCanonicalEvent(eventId);
	if (!event) error(404, 'Evento no encontrado');
	if (!event.attendance) return null;
	return { kind: 'attendance' as const, attendanceId: event.attendance.id };
}

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

	crearDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const owner = await getAttendanceOwner(parseId(params.id));
		if (!owner) return fail(409, { message: 'Registra primero la asistencia.', success: false });
		const values = parseDocumentValues(await request.formData(), owner.kind);
		if (!values) return fail(400, { message: 'Revisa la URL y la fecha del certificado.', success: false });
		try {
			await addDocument(owner, values);
			return { message: 'Certificado privado enlazado.', success: true };
		} catch {
			return fail(409, { message: 'No se pudo enlazar; comprueba que la URL no esté repetida.', success: false });
		}
	},

	guardarDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const owner = await getAttendanceOwner(parseId(params.id));
		if (!owner) return fail(409, { message: 'La asistencia ya no existe.', success: false });
		const formData = await request.formData();
		const id = parseDocumentId(formData);
		const values = parseDocumentValues(formData, owner.kind);
		if (!id || !values) return fail(400, { message: 'Datos de certificado no válidos.', success: false });
		try {
			await updateDocument(owner, id, values);
			return { message: 'Certificado actualizado.', success: true };
		} catch {
			return fail(409, { message: 'No se pudo guardar el certificado.', success: false });
		}
	},

	eliminarDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const owner = await getAttendanceOwner(parseId(params.id));
		const id = parseDocumentId(await request.formData());
		if (!owner || !id) return fail(400, { message: 'Certificado no válido.', success: false });
		try {
			await removeDocument(owner, id);
			return { message: 'Certificado eliminado.', success: true };
		} catch {
			return fail(404, { message: 'El certificado ya no existe.', success: false });
		}
	},

	moverDocumento: async ({ locals, params, request }) => {
		await requireAdmin(locals);
		const owner = await getAttendanceOwner(parseId(params.id));
		const formData = await request.formData();
		const id = parseDocumentId(formData);
		const direction = parseDocumentDirection(formData.get('direction'));
		if (!owner || !id || !direction) return fail(400, { message: 'Movimiento no válido.', success: false });
		try {
			await moveDocument(owner, id, direction);
			return { message: 'Orden de certificados actualizado.', success: true };
		} catch {
			return fail(404, { message: 'El certificado ya no existe.', success: false });
		}
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
