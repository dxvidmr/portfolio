import { describe, expect, it } from 'vitest';
import { plainInlineTitle, renderInlineMarkup, renderInlineTitle } from './inline-markup';

describe('formato inline seguro', () => {
	it('conserva cursivas y negritas permitidas', () => {
		expect(renderInlineMarkup('<i>Fuenteovejuna</i> y <strong>Lope</strong>')).toBe(
			'<i>Fuenteovejuna</i> y <strong>Lope</strong>'
		);
	});

	it('escapa etiquetas, atributos y caracteres no permitidos', () => {
		expect(renderInlineMarkup('<script>alert(1)</script> <i class="x">obra</i> & texto')).toBe(
			'&lt;script&gt;alert(1)&lt;/script&gt; &lt;i class=&quot;x&quot;&gt;obra</i> &amp; texto'
		);
	});
});

describe('títulos con cursiva', () => {
	it('convierte *obra* en cursiva y escapa el resto', () => {
		expect(renderInlineTitle('*Fuenteovejuna* en la era digital')).toBe('<i>Fuenteovejuna</i> en la era digital');
		expect(renderInlineTitle("'Todos a una': Towards a Social *Fuenteovejuna*")).toBe('&#39;Todos a una&#39;: Towards a Social <i>Fuenteovejuna</i>');
		expect(renderInlineTitle('*La dama boba* y *El perro del hortelano* <b>x</b>')).toBe('<i>La dama boba</i> y <i>El perro del hortelano</i> <b>x</b>');
	});

	it('no toma por cursiva asteriscos sueltos ni separados del texto', () => {
		expect(renderInlineTitle('Nota * al margen * y 5*3')).toBe('Nota * al margen * y 5*3');
		expect(renderInlineTitle(null)).toBe('');
	});

	it('quita las marcas para buscar y para usos sin formato', () => {
		expect(plainInlineTitle('*Fuenteovejuna* en <i>la</i> era')).toBe('Fuenteovejuna en la era');
	});
});
