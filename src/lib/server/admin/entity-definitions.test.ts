import { describe, expect, it } from 'vitest';
import { entityForms, meritTypeGroups } from './entity-definitions';

describe('Selector de «Nuevo mérito»', () => {
	it('muestra cada tipo con formulario en un solo grupo', () => {
		const grouped = meritTypeGroups.flatMap((group) => group.types);
		expect(new Set(grouped).size).toBe(grouped.length);
		expect([...grouped].sort()).toEqual(Object.keys(entityForms).sort());
	});
});
