import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { requireAdmin } from '$lib/server/admin/auth';
import {
	createEventWithRoles,
	parseCanonicalEventForm,
	unifiedTalkFields,
	unifiedServiceFields,
	type UnifiedRoles
} from '$lib/server/admin/events';
import type { FieldDef, FormEntityType } from '$lib/server/admin/entity-definitions';
import { parseEntityForm, type ParsedForm } from '$lib/server/admin/validation';
import {
	getFieldOptions,
	validateEntitySemantics,
	validateReferences,
	type SelectOption
} from '$lib/server/admin/crud';

// Alta unificada (decisión 23): el evento canónico y sus roles (contribución,
// servicio, asistencia privada) se crean en una sola pantalla y transacción.
// Los campos de cada rol van prefijados para no colisionar entre secciones.

const TALK_PREFIX = 'talk__';
const SERVICE_PREFIX = 'serv__';

const prefixFields = (fields: FieldDef[], prefix: string): FieldDef[] =>
	fields.map((field) => ({ ...field, name: `${prefix}${field.name}` }));

const prefixKeys = <T>(record: Record<string, T>, prefix: string): Record<string, T> =>
	Object.fromEntries(Object.entries(record).map(([key, value]) => [`${prefix}${key}`, value]));

// Analiza y revalida (vocabulario/FK contra BD) la sección de un rol; devuelve
// los valores sin prefijo y vuelca los errores con prefijo en `errors`.
async function parseRoleSection(
	type: FormEntityType,
	fields: FieldDef[],
	prefix: string,
	formData: FormData,
	errors: Record<string, string>,
	raw: Record<string, string>
): Promise<ParsedForm['values']> {
	const parsed = parseEntityForm({ fields }, formData);
	const stripped: ParsedForm = {
		values: Object.fromEntries(
			Object.entries(parsed.values).map(([key, value]) => [key.slice(prefix.length), value])
		),
		raw: {},
		errors: Object.fromEntries(
			Object.entries(parsed.errors).map(([key, value]) => [key.slice(prefix.length), value])
		)
	};
	await validateReferences(type, stripped);
	validateEntitySemantics(type, stripped);
	Object.assign(errors, prefixKeys(stripped.errors, prefix));
	Object.assign(raw, parsed.raw);
	return stripped.values;
}

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	const [talkOptions, serviceOptions] = await Promise.all([
		getFieldOptions('talks'),
		getFieldOptions('service_activities')
	]);
	const options: Record<string, SelectOption[]> = {
		...prefixKeys(talkOptions, TALK_PREFIX),
		...prefixKeys(serviceOptions, SERVICE_PREFIX)
	};
	return {
		talkFields: prefixFields(unifiedTalkFields, TALK_PREFIX),
		serviceFields: prefixFields(unifiedServiceFields, SERVICE_PREFIX),
		options
	};
};

export const actions: Actions = {
	crear: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();

		const wantsTalk = formData.get('rol_contribucion') === '1';
		const wantsService = formData.get('rol_servicio') === '1';
		const wantsAttendance = formData.get('rol_asistencia') === '1';

		const event = parseCanonicalEventForm(formData);
		const errors: Record<string, string> = { ...event.errors };
		const raw: Record<string, string> = {
			...event.values,
			rol_contribucion: wantsTalk ? '1' : '',
			rol_servicio: wantsService ? '1' : '',
			rol_asistencia: wantsAttendance ? '1' : '',
			at_role_label: String(formData.get('at_role_label') ?? '').trim(),
			at_notes: String(formData.get('at_notes') ?? '').trim()
		};

		const roles: UnifiedRoles = {};
		if (wantsTalk) {
			roles.talk = await parseRoleSection(
				'talks',
				prefixFields(unifiedTalkFields, TALK_PREFIX),
				TALK_PREFIX,
				formData,
				errors,
				raw
			);
		}
		if (wantsService) {
			// El título del servicio suele coincidir con el del evento: si queda
			// vacío se rellena con el nombre del evento antes de validar.
			if (!String(formData.get(`${SERVICE_PREFIX}title`) ?? '').trim() && event.values.title) {
				formData.set(`${SERVICE_PREFIX}title`, event.values.title);
			}
			roles.service = await parseRoleSection(
				'service_activities',
				prefixFields(unifiedServiceFields, SERVICE_PREFIX),
				SERVICE_PREFIX,
				formData,
				errors,
				raw
			);
		}
		if (wantsAttendance) {
			roles.attendance = {
				roleLabel: raw.at_role_label,
				notesPrivate: raw.at_notes
			};
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, raw });
		}

		const id = await createEventWithRoles(event.values, roles);
		redirect(303, `/admin/eventos/${id}?creado=1`);
	}
};
