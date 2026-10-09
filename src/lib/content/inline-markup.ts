const escapeHtml = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

/**
 * Formato inline deliberadamente pequeño para textos editoriales del dashboard.
 * Todo se escapa primero y solo se restauran etiquetas sin atributos conocidas.
 */
export function renderInlineMarkup(value: string): string {
	return escapeHtml(value).replace(
		/&lt;(\/?)(i|em|b|strong)&gt;/gi,
		(_match, closing: string, tag: string) => `<${closing}${tag.toLowerCase()}>`
	);
}

// *Título de obra*: asteriscos pegados al texto, sin cruzar saltos de línea.
const ITALIC_MARK = /\*(?=\S)([^*\n]*?\S)\*/g;

/**
 * Títulos de méritos, eventos y obras: admite *cursiva* (como los textos del CV)
 * además de las etiquetas de renderInlineMarkup.
 */
export function renderInlineTitle(value: string | null | undefined): string {
	return renderInlineMarkup(value ?? '').replace(ITALIC_MARK, '<i>$1</i>');
}

/** El mismo título sin marcas, para buscar, ordenar y usar donde no cabe formato. */
export function plainInlineTitle(value: string | null | undefined): string {
	return (value ?? '').replace(ITALIC_MARK, '$1').replace(/<\/?(i|em|b|strong)>/gi, '');
}
