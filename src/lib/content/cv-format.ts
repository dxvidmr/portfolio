// Formato común de los textos del CV: un único separador entre elementos de una misma línea
// y fechas legibles («16 oct. 2026», «29-30 may. 2025»).
export const CV_SEPARATOR = ' | ';

export const cvJoin = (...parts: unknown[]) =>
	parts
		.map((part) => (part === null || part === undefined ? '' : String(part).trim()))
		.filter(Boolean)
		.join(CV_SEPARATOR);

type Language = 'es' | 'en';
type Parts = { y: string; m?: number; d?: number };

const MONTHS: Record<Language, string[]> = {
	es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'],
	en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

// Acepta AAAA, AAAA-MM y AAAA-MM-DD, los formatos que guarda la base de datos.
const parse = (value: unknown): Parts | null => {
	const match = String(value ?? '').trim().match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/);
	if (!match) return null;
	return { y: match[1], m: match[2] ? Number(match[2]) - 1 : undefined, d: match[3] ? Number(match[3]) : undefined };
};

const dayMonth = (p: Parts, language: Language) =>
	[p.d, p.m === undefined ? '' : MONTHS[language][p.m]].filter((part) => part !== undefined && part !== '').join(' ');

export function formatCvDate(value: unknown, language: Language): string {
	const p = parse(value);
	if (!p) return String(value ?? '').trim();
	return [dayMonth(p, language), p.y].filter(Boolean).join(' ');
}

// Intervalo compacto: comparte el año (y el mes) cuando coinciden y tienen la misma precisión.
export function formatCvRange(start: unknown, end: unknown, language: Language): string {
	const a = parse(start);
	const b = parse(end);
	if (!a || !b) return [formatCvDate(start, language), formatCvDate(end, language)].filter(Boolean).join(' - ');
	const samePrecision = (a.m === undefined) === (b.m === undefined) && (a.d === undefined) === (b.d === undefined);
	if (a.y === b.y && a.m === b.m && a.d === b.d) return formatCvDate(start, language);
	if (!samePrecision) return `${formatCvDate(start, language)} - ${formatCvDate(end, language)}`;
	if (a.m === undefined) return `${a.y}-${b.y}`;
	if (a.y !== b.y) return `${formatCvDate(start, language)} - ${formatCvDate(end, language)}`;
	if (a.d === undefined) return `${MONTHS[language][a.m]}-${MONTHS[language][b.m!]} ${a.y}`;
	if (a.m === b.m) return `${a.d}-${b.d} ${MONTHS[language][a.m]} ${a.y}`;
	return `${dayMonth(a, language)} - ${dayMonth(b, language)} ${a.y}`;
}

// Flecha de enlace dibujada en SVG: las fuentes incrustadas en el PDF (subconjunto latino)
// no incluyen «↗», y el Chromium del servidor no tiene otra fuente de la que tomarla.
export const CV_ARROW_SVG =
	'<svg class="cv-arrow" viewBox="0 0 12 12" width="0.7em" height="0.7em" aria-hidden="true" focusable="false"><path d="M3.5 8.5l5-5M4.5 3.5h4v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
