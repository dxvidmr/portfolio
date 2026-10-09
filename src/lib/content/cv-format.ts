// Formato común de los textos del CV: un único separador entre elementos de una misma línea.
export const CV_SEPARATOR = ' | ';

export const cvJoin = (...parts: unknown[]) =>
	parts
		.map((part) => (part === null || part === undefined ? '' : String(part).trim()))
		.filter(Boolean)
		.join(CV_SEPARATOR);
