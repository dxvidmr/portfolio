import type { EntityFormDef, FieldDef } from './entity-definitions';
import { isValidPartialDate } from './date-validation';

// Validación de formularios (plan §11). Se evaluó zod y se descartó: con las
// definiciones de campo declarativas, un validador por tipo de campo es menos
// código que el equivalente en esquemas dinámicos. Errores junto al campo y
// conservación de valores: el llamador redibuja con `raw` + `errors`.

export type FieldValue = string | number | null;

export interface ParsedForm {
	values: Record<string, FieldValue>;
	raw: Record<string, string>;
	errors: Record<string, string>;
}

const MAX_TEXT = 500;
const MAX_TEXTAREA = 10_000;

function parseField(field: FieldDef, raw: string): { value?: FieldValue; error?: string } {
	if (raw === '') {
		if (field.required) return { error: 'Este campo es obligatorio' };
		return { value: null };
	}

	switch (field.kind) {
		case 'text':
			if (raw.length > MAX_TEXT) return { error: `Máximo ${MAX_TEXT} caracteres` };
			return { value: raw };
		case 'textarea':
			if (raw.length > MAX_TEXTAREA) return { error: `Máximo ${MAX_TEXTAREA} caracteres` };
			return { value: raw };
		case 'integer': {
			if (!/^-?\d+$/.test(raw)) return { error: 'Debe ser un número entero' };
			const n = Number(raw);
			if (!Number.isSafeInteger(n)) return { error: 'Número fuera de rango' };
			return { value: n };
		}
		case 'real': {
			const n = Number(raw.replace(',', '.'));
			if (!Number.isFinite(n)) return { error: 'Debe ser un número' };
			return { value: n };
		}
		case 'date':
			if (!isValidPartialDate(raw)) return { error: 'Formato: AAAA, AAAA-MM o AAAA-MM-DD' };
			return { value: raw };
		case 'boolean':
			// Los checkbox llegan como '1' (marcado) o '' (tratado arriba como null→0).
			return { value: raw === '1' ? 1 : 0 };
		case 'url': {
			let parsed: URL;
			try {
				parsed = new URL(raw);
			} catch {
				return { error: 'URL no válida (incluye https://)' };
			}
			if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
				return { error: 'Solo se admiten URL http(s)' };
			}
			if (raw.length > MAX_TEXT) return { error: `Máximo ${MAX_TEXT} caracteres` };
			return { value: raw };
		}
		case 'vocab':
			// El código debe existir en type_vocab con el dominio correcto: se
			// comprueba contra la BD en crud.ts (la FK lo respalda a nivel de motor).
			if (!/^[a-z0-9_]{1,64}$/.test(raw)) return { error: 'Código de tipo no válido' };
			return { value: raw };
		case 'fk': {
			if (!/^\d+$/.test(raw)) return { error: 'Referencia no válida' };
			const id = Number(raw);
			if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Referencia no válida' };
			return { value: id };
		}
	}
}

export function parseEntityForm(def: EntityFormDef, formData: FormData): ParsedForm {
	const values: Record<string, FieldValue> = {};
	const raw: Record<string, string> = {};
	const errors: Record<string, string> = {};

	for (const field of def.fields) {
		const entry = formData.get(field.name);
		const rawValue =
			field.kind === 'boolean'
				? entry == null
					? ''
					: '1'
				: typeof entry === 'string'
					? entry.trim()
					: '';
		raw[field.name] = rawValue;

		// Los boolean sin marcar deben persistirse como 0, no como NULL.
		if (field.kind === 'boolean' && rawValue === '') {
			values[field.name] = 0;
			continue;
		}

		const result = parseField(field, rawValue);
		if (result.error) errors[field.name] = result.error;
		else values[field.name] = result.value ?? null;
	}

	return { values, raw, errors };
}
