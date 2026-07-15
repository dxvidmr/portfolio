import { db } from '$lib/server/db';
import { entityDefinitions, type FormEntityType } from './entity-definitions';
import type { EntryKey } from './controls';

type StructuralEntityType =
	| 'publications'
	| 'academic_works'
	| 'academic_events'
	| 'teaching'
	| 'funding_awards';

export interface StructuralRelationItem {
	entityType: StructuralEntityType;
	entityId: number;
	typeLabel: string;
	title: string;
	sortDate: string | null;
	isPublic: boolean;
}

export interface StructuralRelationGroup {
	entityType: StructuralEntityType;
	label: string;
	description: string;
	items: StructuralRelationItem[];
}

const projectGroups: Array<Omit<StructuralRelationGroup, 'items'>> = [
	{
		entityType: 'publications',
		label: 'Publicaciones',
		description: 'Publicaciones cuyo campo «Proyecto de investigación» apunta a esta entrada.'
	},
	{
		entityType: 'academic_events',
		label: 'Eventos académicos',
		description: 'Eventos vinculados a este proyecto de investigación.'
	},
	{
		entityType: 'teaching',
		label: 'Docencia',
		description: 'Actividad docente vinculada a este proyecto de investigación.'
	},
	{
		entityType: 'funding_awards',
		label: 'Financiación y premios',
		description: 'Financiación o premios vinculados a este proyecto de investigación.'
	}
];

const eventGroups: Array<Omit<StructuralRelationGroup, 'items'>> = [
	{
		entityType: 'publications',
		label: 'Publicaciones derivadas',
		description: 'Publicaciones cuyo campo «Evento de origen» apunta a esta entrada.'
	}
];

const educationGroups: Array<Omit<StructuralRelationGroup, 'items'>> = [
	{
		entityType: 'academic_works',
		label: 'Trabajos académicos',
		description: 'TFM o TFG realizados dentro de esta titulación.'
	}
];

const nullable = (value: unknown) => (value == null ? null : String(value));

export function supportsStructuralRelations(entityType: FormEntityType): boolean {
	return entityType === 'projects' || entityType === 'academic_events' || entityType === 'education';
}

export async function getStructuralRelations(entry: EntryKey): Promise<StructuralRelationGroup[]> {
	if (!supportsStructuralRelations(entry.entityType as FormEntityType)) return [];

	const isProject = entry.entityType === 'projects';
	const isEvent = entry.entityType === 'academic_events';
	const relationSql = isProject
		? `SELECT 'publications' AS entity_type, id AS entity_id, 1 AS group_order
			FROM publications WHERE project_id = ?
			UNION ALL
			SELECT 'academic_events', id, 2
			FROM academic_events WHERE project_id = ?
			UNION ALL
			SELECT 'teaching', id, 3
			FROM teaching WHERE project_id = ?
			UNION ALL
			SELECT 'funding_awards', id, 4
			FROM funding_awards WHERE project_id = ?`
		: isEvent
			? `SELECT 'publications' AS entity_type, id AS entity_id, 1 AS group_order
				FROM publications WHERE event_id = ?`
			: `SELECT 'academic_works' AS entity_type, id AS entity_id, 1 AS group_order
				FROM academic_works WHERE education_id = ?`;

	const args = isProject
		? [entry.entityId, entry.entityId, entry.entityId, entry.entityId]
		: [entry.entityId];
	const result = await db.execute({
		sql: `WITH related AS (${relationSql})
			SELECT related.entity_type, related.entity_id, source.title, source.sort_date,
			       COALESCE(control.is_public, 0) AS is_public
			FROM related
			JOIN entry_source AS source
			  ON source.entity_type = related.entity_type
			 AND source.entity_id = related.entity_id
			LEFT JOIN entry_controls AS control
			  ON control.entity_type = related.entity_type
			 AND control.entity_id = related.entity_id
			ORDER BY related.group_order, (source.sort_date IS NULL) ASC,
			         source.sort_date DESC, source.title COLLATE NOCASE ASC`,
		args
	});

	const items = result.rows.map((row) => {
		const entityType = String(row.entity_type) as StructuralEntityType;
		return {
			entityType,
			entityId: Number(row.entity_id),
			typeLabel: entityDefinitions[entityType],
			title: String(row.title),
			sortDate: nullable(row.sort_date),
			isPublic: Number(row.is_public) === 1
		};
	});

	const groups = isProject ? projectGroups : isEvent ? eventGroups : educationGroups;
	return groups.map((group) => ({
		...group,
		items: items.filter((item) => item.entityType === group.entityType)
	}));
}
