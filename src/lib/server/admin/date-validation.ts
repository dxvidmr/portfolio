// Fecha ISO parcial canónica: AAAA, AAAA-MM o AAAA-MM-DD. La validación es
// compartida por entradas, eventos y documentos para evitar reglas divergentes.
export function isValidPartialDate(value: string): boolean {
	const match = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(value);
	if (!match) return false;
	if (!match[2]) return true;

	const year = Number(match[1]);
	const month = Number(match[2]);
	if (month < 1 || month > 12) return false;
	if (!match[3]) return true;

	const day = Number(match[3]);
	const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const daysByMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return day >= 1 && day <= daysByMonth[month - 1];
}
