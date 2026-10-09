import { describe, expect, it } from 'vitest';
import { renderCvMarkdown } from './cv-markdown';

describe('Markdown del CV', () => {
  it('renderiza enlaces, énfasis y listas sin perder diacríticos', () => {
    const html = renderCvMarkdown('Los *Anales* y **edición**: [feniX-ML](https://github.com/prolopeuab/feniX-ML).\n\n- Modelado\n- Documentación');
    expect(html).toContain('<em>Anales</em>');
    expect(html).toContain('<strong>edición</strong>');
    expect(html).toContain('<a href="https://github.com/prolopeuab/feniX-ML">feniX-ML<svg class="cv-arrow"');
    expect(html).toContain('<li>Documentación</li>');
  });
  it('mantiene las cursivas HTML sencillas existentes', () => {
    expect(renderCvMarkdown('La obra <i>Fuenteovejuna</i>.')).toContain('<i>Fuenteovejuna</i>');
  });
  it('no ejecuta HTML ni enlaces con protocolos activos', () => {
    const html = renderCvMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert%281%29)\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('<img');
  });
});
