import { describe, expect, it } from 'vitest';
import { renderInlineMarkup } from './inline-markup';

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
