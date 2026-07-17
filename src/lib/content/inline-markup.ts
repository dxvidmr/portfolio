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
