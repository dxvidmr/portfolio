import { db } from '$lib/server/db';
import { projects } from '$lib/content/projects';
import { entityDefinitions, isEntityType, type EntityType } from './entity-definitions';
import type { EntryKey } from './controls';

export interface PortfolioOption {
	slug: string;
	title: string;
	kind: string;
	year: string;
}

export interface PortfolioCandidate {
	entityType: EntityType;
	entityId: number;
	typeLabel: string;
	title: string;
	sortDate: string | null;
	isPublic: boolean;
}

export interface PortfolioRelation extends EntryKey {
	portfolioSlug: string;
	featured: boolean;
}

export const portfolioOptions: PortfolioOption[] = projects.map((project) => ({
	slug: project.slug,
	title: project.title.es,
	kind: project.kind.es,
	year: project.year
}));

const portfolioSlugs = new Set(portfolioOptions.map((project) => project.slug));

export function parsePortfolioSlug(value: FormDataEntryValue | null): string | null {
	if (typeof value !== 'string' || !portfolioSlugs.has(value)) return null;
	return value;
}

export async function getPortfolioAdminData(): Promise<{
	projects: PortfolioOption[];
	entries: PortfolioCandidate[];
	relations: PortfolioRelation[];
}> {
	const [entriesResult, relationsResult] = await Promise.all([
		db.execute(`
			SELECT source.entity_type, source.entity_id, source.title, source.sort_date,
			       COALESCE(control.is_public, 0) AS is_public
			FROM entry_source AS source
			LEFT JOIN entry_controls AS control
			  ON control.entity_type = source.entity_type
			 AND control.entity_id = source.entity_id
			ORDER BY (source.sort_date IS NULL) ASC, source.sort_date DESC,
			         source.title COLLATE NOCASE ASC`),
		db.execute(`
			SELECT portfolio_slug, entity_type, entity_id, featured
			FROM portfolio_items`)
	]);

	const entries: PortfolioCandidate[] = entriesResult.rows.map((row) => {
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
			isPublic: Number(row.is_public) === 1
		};
	});

	const relations: PortfolioRelation[] = relationsResult.rows.flatMap((row) => {
		const portfolioSlug = String(row.portfolio_slug);
		const entityType = String(row.entity_type);
		if (!portfolioSlugs.has(portfolioSlug) || !isEntityType(entityType)) return [];
		return [{
			portfolioSlug,
			entityType,
			entityId: Number(row.entity_id),
			featured: Number(row.featured) === 1
		}];
	});

	return { projects: portfolioOptions, entries, relations };
}

export async function getEntryPortfolioRelations(entry: EntryKey): Promise<Array<PortfolioOption & { featured: boolean }>> {
	const result = await db.execute({
		sql: `SELECT portfolio_slug, featured
			FROM portfolio_items
			WHERE entity_type = ? AND entity_id = ?`,
		args: [entry.entityType, entry.entityId]
	});
	const bySlug = new Map(result.rows.map((row) => [String(row.portfolio_slug), Number(row.featured) === 1]));
	return portfolioOptions
		.filter((project) => bySlug.has(project.slug))
		.map((project) => ({ ...project, featured: bySlug.get(project.slug) ?? false }));
}

async function assertEntryExists({ entityType, entityId }: EntryKey): Promise<void> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM entry_source WHERE entity_type = ? AND entity_id = ? LIMIT 1',
		args: [entityType, entityId]
	});
	if (result.rows.length === 0) throw new Error('La entrada no existe');
}

export async function addPortfolioRelation(
	portfolioSlug: string,
	entry: EntryKey
): Promise<PortfolioRelation> {
	if (!portfolioSlugs.has(portfolioSlug)) throw new Error('La ficha del portfolio no existe');
	await assertEntryExists(entry);
	await db.execute({
		sql: `INSERT INTO portfolio_items
				(portfolio_slug, entity_type, entity_id, sort_order, featured)
			VALUES (?, ?, ?, 0, 0)
			ON CONFLICT (portfolio_slug, entity_type, entity_id) DO NOTHING`,
		args: [portfolioSlug, entry.entityType, entry.entityId]
	});
	return { portfolioSlug, ...entry, featured: false };
}

export async function removePortfolioRelation(
	portfolioSlug: string,
	entry: EntryKey
): Promise<void> {
	if (!portfolioSlugs.has(portfolioSlug)) throw new Error('La ficha del portfolio no existe');
	await db.execute({
		sql: `DELETE FROM portfolio_items
			WHERE portfolio_slug = ? AND entity_type = ? AND entity_id = ?`,
		args: [portfolioSlug, entry.entityType, entry.entityId]
	});
}

export async function setPortfolioFeatured(
	portfolioSlug: string,
	entry: EntryKey,
	featured: boolean
): Promise<PortfolioRelation> {
	if (!portfolioSlugs.has(portfolioSlug)) throw new Error('La ficha del portfolio no existe');
	const result = await db.execute({
		sql: `UPDATE portfolio_items
			SET featured = ?
			WHERE portfolio_slug = ? AND entity_type = ? AND entity_id = ?`,
		args: [featured ? 1 : 0, portfolioSlug, entry.entityType, entry.entityId]
	});
	if (result.rowsAffected === 0) throw new Error('La relación no existe');
	return { portfolioSlug, ...entry, featured };
}
