// Línea de contexto de un mérito en la web: el tipo y un único dato que diga para quién o con
// quién se hizo. Se toma el primer candidato que no repita el título ni sea demasiado largo; el
// resto (códigos, investigadores, nombres de proyecto, descripción) queda para el CV exportado.
const MAX_CONTEXT_LENGTH = 50;

const fold = (value: string) =>
	value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es').replace(/\s+/g, ' ').trim();

export function contextLine(title: string, lead: string | null, candidates: (string | null | undefined)[], separator: string) {
	const seen = fold(`${title} ${lead ?? ''}`);
	const anchor = candidates
		.map((candidate) => candidate?.trim())
		.find((candidate): candidate is string => Boolean(candidate) && candidate!.length <= MAX_CONTEXT_LENGTH && !seen.includes(fold(candidate!)));
	return [lead, anchor].filter(Boolean).join(separator);
}
