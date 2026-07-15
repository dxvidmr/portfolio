import { db } from '$lib/server/db';
import {
	entityDefinitions,
	entityTypeOptions,
	isEntityType,
	type EntityType
} from './entity-definitions';

export type VisibilityFilter = 'all' | 'public' | 'draft';
export type HomeFilter = 'all' | 'yes' | 'no';
export type RelationsFilter = 'all' | 'with' | 'without';

export interface EntryFilters {
	query: string;
	type: EntityType | '';
	year: string;
	visibility: VisibilityFilter;
	home: HomeFilter;
	relations: RelationsFilter;
}

export interface AdminEntry {
	entityType: EntityType;
	entityId: number;
	typeLabel: string;
	title: string;
	sortDate: string | null;
	isPublic: boolean;
	showHome: boolean;
	homeOrder: number;
	updatedAt: string | null;
	relationCount: number;
}

export interface AdminSummary {
	total: number;
	publicCount: number;
	draftCount: number;
	homeCount: number;
	relatedCount: number;
	recent: AdminEntry[];
}

export const emptyEntryFilters: EntryFilters = {
	query: '',
	type: '',
	year: '',
	visibility: 'all',
	home: 'all',
	relations: 'all'
};

const relationCountSql = `
	(SELECT COUNT(*) FROM portfolio_items AS pi
	 WHERE pi.entity_type = source.entity_type AND pi.entity_id = source.entity_id)
	+ (SELECT COUNT(*) FROM entity_tags AS et
	   WHERE et.entity_type = source.entity_type AND et.entity_id = source.entity_id)
	+ (SELECT COUNT(*) FROM documents AS document
	   WHERE document.entity_type = source.entity_type AND document.entity_id = source.entity_id)
	+ (SELECT COUNT(*) FROM links AS link
	   WHERE link.entity_type = source.entity_type AND link.entity_id = source.entity_id)`;

const entrySelectSql = `
	SELECT
		source.entity_type,
		source.entity_id,
		source.title,
		source.sort_date,
		COALESCE(control.is_public, 0) AS is_public,
		COALESCE(control.show_home, 0) AS show_home,
		COALESCE(control.home_order, 0) AS home_order,
		control.updated_at,
		${relationCountSql} AS relation_count
	FROM entry_source AS source
	LEFT JOIN entry_controls AS control
		ON control.entity_type = source.entity_type
		AND control.entity_id = source.entity_id`;

const asBoolean = (value: unknown): boolean => Number(value) === 1;

const rowToEntry = (row: Record<string, unknown>): AdminEntry => {
	const entityType = String(row.entity_type);
	if (!isEntityType(entityType)) {
		throw new Error(`Tipo de entidad inesperado en entry_source: ${entityType}`);
	}

	return {
		entityType,
		entityId: Number(row.entity_id),
		typeLabel: entityDefinitions[entityType],
		title: String(row.title),
		sortDate: row.sort_date == null ? null : String(row.sort_date),
		isPublic: asBoolean(row.is_public),
		showHome: asBoolean(row.show_home),
		homeOrder: Number(row.home_order),
		updatedAt: row.updated_at == null ? null : String(row.updated_at),
		relationCount: Number(row.relation_count)
	};
};

const oneOf = <T extends string>(value: string | null, allowed: readonly T[], fallback: T): T =>
	allowed.includes(value as T) ? (value as T) : fallback;

export function parseEntryFilters(searchParams: URLSearchParams): EntryFilters {
	const rawType = searchParams.get('tipo') ?? '';
	const rawYear = searchParams.get('anio')?.trim() ?? '';

	return {
		query: (searchParams.get('q') ?? '').trim().slice(0, 120),
		type: isEntityType(rawType) ? rawType : '',
		year: /^\d{4}$/.test(rawYear) ? rawYear : '',
		visibility: oneOf(searchParams.get('estado'), ['all', 'public', 'draft'], 'all'),
		home: oneOf(searchParams.get('portada'), ['all', 'yes', 'no'], 'all'),
		relations: oneOf(searchParams.get('relaciones'), ['all', 'with', 'without'], 'all')
	};
}

export async function getAdminEntries(filters: EntryFilters): Promise<AdminEntry[]> {
	const conditions: string[] = [];
	const args: Array<string | number> = [];

	if (filters.query) {
		conditions.push('source.title LIKE ? COLLATE NOCASE');
		args.push(`%${filters.query}%`);
	}
	if (filters.type) {
		conditions.push('source.entity_type = ?');
		args.push(filters.type);
	}
	if (filters.year) {
		conditions.push("substr(source.sort_date, 1, 4) = ?");
		args.push(filters.year);
	}
	if (filters.visibility === 'public') conditions.push('COALESCE(control.is_public, 0) = 1');
	if (filters.visibility === 'draft') conditions.push('COALESCE(control.is_public, 0) = 0');
	if (filters.home === 'yes') conditions.push('COALESCE(control.show_home, 0) = 1');
	if (filters.home === 'no') conditions.push('COALESCE(control.show_home, 0) = 0');
	if (filters.relations === 'with') conditions.push(`(${relationCountSql}) > 0`);
	if (filters.relations === 'without') conditions.push(`(${relationCountSql}) = 0`);

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const result = await db.execute({
		sql: `${entrySelectSql}
			${where}
			ORDER BY (source.sort_date IS NULL) ASC, source.sort_date DESC,
			         source.title COLLATE NOCASE ASC`,
		args
	});

	return result.rows.map((row) => rowToEntry(row));
}

export async function getHomeEntries(): Promise<AdminEntry[]> {
	const result = await db.execute(`${entrySelectSql}
		WHERE COALESCE(control.show_home, 0) = 1
		ORDER BY control.home_order ASC, (source.sort_date IS NULL) ASC,
		         source.sort_date DESC, source.title COLLATE NOCASE ASC`);

	return result.rows.map((row) => rowToEntry(row));
}

export async function getAdminSummary(): Promise<AdminSummary> {
	const [counts, recent] = await Promise.all([
		db.execute(`
			SELECT
				COUNT(*) AS total,
				SUM(CASE WHEN COALESCE(control.is_public, 0) = 1 THEN 1 ELSE 0 END) AS public_count,
				SUM(CASE WHEN COALESCE(control.is_public, 0) = 0 THEN 1 ELSE 0 END) AS draft_count,
				SUM(CASE WHEN COALESCE(control.show_home, 0) = 1 THEN 1 ELSE 0 END) AS home_count,
				SUM(CASE WHEN (${relationCountSql}) > 0 THEN 1 ELSE 0 END) AS related_count
			FROM entry_source AS source
			LEFT JOIN entry_controls AS control
				ON control.entity_type = source.entity_type
				AND control.entity_id = source.entity_id`),
		db.execute(`${entrySelectSql}
			ORDER BY control.updated_at DESC NULLS LAST,
			         (source.sort_date IS NULL) ASC, source.sort_date DESC
			LIMIT 5`)
	]);

	const row = counts.rows[0];
	return {
		total: Number(row?.total ?? 0),
		publicCount: Number(row?.public_count ?? 0),
		draftCount: Number(row?.draft_count ?? 0),
		homeCount: Number(row?.home_count ?? 0),
		relatedCount: Number(row?.related_count ?? 0),
		recent: recent.rows.map((entry) => rowToEntry(entry))
	};
}

export { entityTypeOptions };
