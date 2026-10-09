import { describe, expect, it } from 'vitest';
import { cvJoin, formatCvDate, formatCvRange } from './cv-format';

describe('Formato de fechas del CV', () => {
	it('formatea fechas sueltas según su precisión', () => {
		expect(formatCvDate('2026-10-16', 'es')).toBe('16 oct. 2026');
		expect(formatCvDate('2025-09', 'es')).toBe('sept. 2025');
		expect(formatCvDate('2024', 'es')).toBe('2024');
		expect(formatCvDate('2026-10-16', 'en')).toBe('16 Oct 2026');
		expect(formatCvDate('texto libre', 'es')).toBe('texto libre');
	});

	it('compacta los intervalos que comparten año o mes', () => {
		expect(formatCvRange('2025-05-29', '2025-05-30', 'es')).toBe('29-30 may. 2025');
		expect(formatCvRange('2024-11-27', '2024-12-02', 'es')).toBe('27 nov. - 2 dic. 2024');
		expect(formatCvRange('2024-12-29', '2025-01-02', 'es')).toBe('29 dic. 2024 - 2 ene. 2025');
		expect(formatCvRange('2025-09', '2025-12', 'es')).toBe('sept.-dic. 2025');
		expect(formatCvRange('2022', '2025', 'es')).toBe('2022-2025');
		expect(formatCvRange('2026-01-18', '2026-04-19', 'en')).toBe('18 Jan - 19 Apr 2026');
	});

	it('trata los casos sin fin, iguales o de distinta precisión', () => {
		expect(formatCvRange('2025-11-14', '', 'es')).toBe('14 nov. 2025');
		expect(formatCvRange('2025-11-14', '2025-11-14', 'es')).toBe('14 nov. 2025');
		expect(formatCvRange('2025', '2025-03-01', 'es')).toBe('2025 - 1 mar. 2025');
	});

	it('une elementos con el separador común y descarta vacíos', () => {
		expect(cvJoin('Taller', '', null, 'UNIR', ' 1 h ')).toBe('Taller | UNIR | 1 h');
	});
});
