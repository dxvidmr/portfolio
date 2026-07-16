import { describe, expect, it } from 'vitest';
import { parseEntityForm } from './validation';
import type { EntityFormDef, FieldDef } from './entity-definitions';

// Pruebas de la lógica de validación (plan §16). Sin BD: parseEntityForm es
// puro sobre FormData; la revalidación vocab/FK contra Turso vive en crud.ts.

const field = (name: string, kind: FieldDef['kind'], extra: Partial<FieldDef> = {}): FieldDef => ({
	name,
	label: name,
	kind,
	...extra
});

const def = (...fields: FieldDef[]): EntityFormDef => ({ fields });

const formData = (entries: Record<string, string>): FormData => {
	const data = new FormData();
	for (const [key, value] of Object.entries(entries)) data.set(key, value);
	return data;
};

describe('campos obligatorios y vacíos', () => {
	it('rechaza un obligatorio vacío', () => {
		const parsed = parseEntityForm(def(field('title', 'text', { required: true })), formData({}));
		expect(parsed.errors.title).toBe('Este campo es obligatorio');
	});

	it('convierte un opcional vacío en null', () => {
		const parsed = parseEntityForm(def(field('doi', 'text')), formData({ doi: '' }));
		expect(parsed.errors.doi).toBeUndefined();
		expect(parsed.values.doi).toBeNull();
	});

	it('recorta espacios antes de validar', () => {
		const parsed = parseEntityForm(
			def(field('title', 'text', { required: true })),
			formData({ title: '   ' })
		);
		expect(parsed.errors.title).toBe('Este campo es obligatorio');
	});
});

describe('texto y textarea', () => {
	it('acepta texto y conserva el valor', () => {
		const parsed = parseEntityForm(def(field('title', 'text')), formData({ title: 'Hola' }));
		expect(parsed.values.title).toBe('Hola');
		expect(parsed.raw.title).toBe('Hola');
	});

	it('rechaza texto de más de 500 caracteres', () => {
		const parsed = parseEntityForm(def(field('title', 'text')), formData({ title: 'x'.repeat(501) }));
		expect(parsed.errors.title).toContain('Máximo 500');
	});

	it('el textarea admite hasta 10000 caracteres', () => {
		const ok = parseEntityForm(def(field('abstract', 'textarea')), formData({ abstract: 'x'.repeat(10_000) }));
		expect(ok.errors.abstract).toBeUndefined();
		const ko = parseEntityForm(def(field('abstract', 'textarea')), formData({ abstract: 'x'.repeat(10_001) }));
		expect(ko.errors.abstract).toContain('Máximo');
	});
});

describe('números', () => {
	it('acepta enteros con signo', () => {
		const parsed = parseEntityForm(def(field('year', 'integer')), formData({ year: '-2024' }));
		expect(parsed.values.year).toBe(-2024);
	});

	it('rechaza enteros no numéricos y decimales', () => {
		for (const raw of ['abc', '3.5', '2e3']) {
			const parsed = parseEntityForm(def(field('year', 'integer')), formData({ year: raw }));
			expect(parsed.errors.year, raw).toBe('Debe ser un número entero');
		}
	});

	it('los reales aceptan coma decimal', () => {
		const parsed = parseEntityForm(def(field('ects', 'real')), formData({ ects: '4,5' }));
		expect(parsed.values.ects).toBe(4.5);
	});

	it('los reales rechazan texto', () => {
		const parsed = parseEntityForm(def(field('ects', 'real')), formData({ ects: 'mucho' }));
		expect(parsed.errors.ects).toBe('Debe ser un número');
	});
});

describe('fechas parciales (formato canónico §5.2)', () => {
	it('acepta AAAA, AAAA-MM y AAAA-MM-DD', () => {
		for (const raw of ['2024', '2024-06', '2024-06-30', '2024-02-29']) {
			const parsed = parseEntityForm(def(field('date_start', 'date')), formData({ date_start: raw }));
			expect(parsed.errors.date_start, raw).toBeUndefined();
			expect(parsed.values.date_start).toBe(raw);
		}
	});

	it('rechaza meses y días imposibles y otros formatos', () => {
		for (const raw of [
			'2024-13',
			'2024-00',
			'2024-06-31',
			'2023-02-29',
			'2024-06-32',
			'2024-06-00',
			'30/06/2024',
			'junio'
		]) {
			const parsed = parseEntityForm(def(field('date_start', 'date')), formData({ date_start: raw }));
			expect(parsed.errors.date_start, raw).toBeTruthy();
		}
	});
});

describe('booleanos (checkbox)', () => {
	it('marcado persiste 1', () => {
		const parsed = parseEntityForm(def(field('is_native', 'boolean')), formData({ is_native: '1' }));
		expect(parsed.values.is_native).toBe(1);
	});

	it('sin marcar persiste 0, nunca null', () => {
		const parsed = parseEntityForm(def(field('is_native', 'boolean')), formData({}));
		expect(parsed.values.is_native).toBe(0);
		expect(parsed.errors.is_native).toBeUndefined();
	});
});

describe('URL', () => {
	it('acepta http y https', () => {
		for (const raw of ['https://example.org/x', 'http://example.org']) {
			const parsed = parseEntityForm(def(field('url', 'url')), formData({ url: raw }));
			expect(parsed.errors.url, raw).toBeUndefined();
		}
	});

	it('rechaza otros protocolos y cadenas no URL', () => {
		for (const raw of ['ftp://example.org', 'javascript:alert(1)', 'example.org', 'no es url']) {
			const parsed = parseEntityForm(def(field('url', 'url')), formData({ url: raw }));
			expect(parsed.errors.url, raw).toBeTruthy();
		}
	});
});

describe('vocabulario y FK (formato; la existencia se revalida contra BD)', () => {
	it('vocab: solo minúsculas, números y guion bajo', () => {
		const ok = parseEntityForm(def(field('t', 'vocab')), formData({ t: 'conference_paper' }));
		expect(ok.values.t).toBe('conference_paper');
		for (const raw of ['Conference', 'con ference', 'a-b', 'x'.repeat(65)]) {
			const ko = parseEntityForm(def(field('t', 'vocab')), formData({ t: raw }));
			expect(ko.errors.t, raw).toBe('Código de tipo no válido');
		}
	});

	it('fk: entero positivo', () => {
		const ok = parseEntityForm(def(field('project_id', 'fk')), formData({ project_id: '7' }));
		expect(ok.values.project_id).toBe(7);
		for (const raw of ['0', '-1', '2.5', 'abc']) {
			const ko = parseEntityForm(def(field('project_id', 'fk')), formData({ project_id: raw }));
			expect(ko.errors.project_id, raw).toBe('Referencia no válida');
		}
	});
});

describe('formulario completo', () => {
	it('acumula errores por campo y conserva raw para redibujar', () => {
		const parsed = parseEntityForm(
			def(
				field('title', 'text', { required: true }),
				field('year', 'integer'),
				field('url', 'url')
			),
			formData({ title: '', year: 'no', url: 'tampoco' })
		);
		expect(Object.keys(parsed.errors).sort()).toEqual(['title', 'url', 'year']);
		expect(parsed.raw.year).toBe('no');
		expect(parsed.raw.url).toBe('tampoco');
	});
});
