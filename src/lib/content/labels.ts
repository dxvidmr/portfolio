import type { Locale } from '$lib/paraglide/runtime';

// Etiquetas de tipo (códigos estables en BD -> texto mostrable). Diccionario
// separado del de UI (paraglide). Aquí: entity_type de `entries`.
const entityTypeLabels: Record<string, { es: string; en: string }> = {
	projects: { es: 'Proyecto', en: 'Project' },
	publications: { es: 'Publicación', en: 'Publication' },
	academic_works: { es: 'Trabajo académico', en: 'Academic work' },
	academic_events: { es: 'Evento', en: 'Event' },
	teaching: { es: 'Docencia', en: 'Teaching' },
	service_activities: { es: 'Actividad', en: 'Service' },
	funding_awards: { es: 'Financiación', en: 'Funding' },
	research_stays: { es: 'Estancia', en: 'Research stay' },
	courses: { es: 'Curso', en: 'Course' },
	education: { es: 'Formación', en: 'Education' },
	memberships: { es: 'Asociación', en: 'Membership' },
	skills: { es: 'Competencias', en: 'Skills' },
	languages: { es: 'Idiomas', en: 'Languages' }
};

// Las etiquetas de subtipo (book_review, conference_paper…) viven en la tabla
// type_vocab desde la migración 004 (decisión 16): las consultas del servidor
// devuelven label_es/label_en y cada componente elige por locale.

export function entityLabel(entityType: string, locale: Locale): string {
	const l = entityTypeLabels[entityType];
	if (!l) return entityType;
	return l[locale as 'es' | 'en'] ?? l.es;
}
