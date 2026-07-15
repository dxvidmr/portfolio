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

const entitySubtypeLabels: Record<string, { es: string; en: string }> = {
	national_rd: { es: 'Proyecto I+D+i nacional', en: 'National R&D project' },
	transfer: { es: 'Proyecto de transferencia', en: 'Knowledge transfer project' },
	internal: { es: 'Proyecto de investigación', en: 'Research project' },
	external: { es: 'Colaboración externa', en: 'External collaboration' },
	journal_article: { es: 'Artículo en revista', en: 'Journal article' },
	book_chapter: { es: 'Capítulo de libro', en: 'Book chapter' },
	conference_proceedings: { es: 'Contribución en actas', en: 'Conference proceedings' },
	conference_abstract: { es: 'Resumen de congreso', en: 'Conference abstract' },
	book_review: { es: 'Reseña', en: 'Book review' },
	masters_thesis: { es: 'Trabajo de Fin de Máster', en: "Master's thesis" },
	bachelor_thesis: { es: 'Trabajo de Fin de Grado', en: "Bachelor's thesis" },
	conference_paper: { es: 'Comunicación', en: 'Conference paper' },
	invited_lecture: { es: 'Conferencia invitada', en: 'Invited lecture' },
	poster: { es: 'Póster', en: 'Poster' },
	panel: { es: 'Panel o mesa', en: 'Panel' },
	seminar: { es: 'Seminario', en: 'Seminar' },
	showcase: { es: 'Presentación de proyecto', en: 'Project showcase' },
	degree_course: { es: 'Docencia universitaria', en: 'University teaching' },
	workshop: { es: 'Taller', en: 'Workshop' },
	event_organization: { es: 'Organización de evento', en: 'Event organisation' },
	critical_edition_review: { es: 'Revisión de edición crítica', en: 'Critical edition review' },
	conference_review: { es: 'Evaluación de congreso', en: 'Conference review' },
	peer_review: { es: 'Revisión por pares', en: 'Peer review' },
	book_editing: { es: 'Edición de libro', en: 'Book editing' }
};

export function entityLabel(entityType: string, locale: Locale): string {
	const l = entityTypeLabels[entityType];
	if (!l) return entityType;
	return l[locale as 'es' | 'en'] ?? l.es;
}

export function entitySubtypeLabel(subtype: string | null, locale: Locale): string | null {
	if (!subtype) return null;
	const label = entitySubtypeLabels[subtype];
	if (label) return label[locale as 'es' | 'en'] ?? label.es;
	return subtype.replaceAll('_', ' ');
}
