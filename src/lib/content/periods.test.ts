import {describe,it,expect} from 'vitest';
import {isFutureDate,meritPeriod} from './periods';
describe('periodos de méritos',()=>{
  it('compara fechas parciales sin inventar días',()=>{
    expect(isFutureDate('2026','2026-10-05')).toBe(false);
    expect(isFutureDate('2027','2026-10-05')).toBe(true);
    expect(isFutureDate('2026-11','2026-10-05')).toBe(true);
    expect(isFutureDate('2026-10-06','2026-10-05')).toBe(true);
  });
  it('distingue final vacío, mismo año y final previsto',()=>{
    expect(meritPeriod('2025','','es','2026-10-05')).toBe('2025-actualidad');
    expect(meritPeriod('2022','2022','es','2026-10-05')).toBe('2022');
    expect(meritPeriod('2025','2027','es','2026-10-05')).toBe('2025-2027 (fin previsto)');
  });
});
