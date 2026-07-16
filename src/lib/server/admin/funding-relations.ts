import { db } from '$lib/server/db';
import { entityDefinitions, isEntityType, type EntityType } from './entity-definitions';
import type { EntryKey } from './controls';

export const fundingRelationKinds = [
	{ value: 'supports', label: 'Financia o sustenta' },
	{ value: 'recognizes', label: 'Premia o reconoce' },
	{ value: 'related', label: 'Relación contextual' }
] as const;

export type FundingRelationKind = (typeof fundingRelationKinds)[number]['value'];

const targetTypes = [
	'projects',
	'education',
	'research_stays',
	'courses',
	'publications',
	'academic_works',
	'talks',
	'teaching',
	'service_activities'
] as const satisfies readonly EntityType[];

type FundingTargetType = (typeof targetTypes)[number];
const targetTypeSet = new Set<EntityType>(targetTypes);

export interface FundingRelation {
	fundingAwardId: number;
	fundingTitle: string;
	fundingAwardType: string | null;
	entityType: FundingTargetType;
	entityId: number;
	entityTitle: string;
	typeLabel: string;
	fundingSortDate: string | null;
	entitySortDate: string | null;
	fundingIsPublic: boolean;
	entityIsPublic: boolean;
	relationKind: FundingRelationKind;
}

export interface FundingRelationCandidate extends Omit<FundingRelation, 'relationKind'> {
	suggestedKind: FundingRelationKind;
}

export interface FundingRelationEditor {
	mode: 'funding' | 'entry';
	relations: FundingRelation[];
	candidates: FundingRelationCandidate[];
	kinds: Array<{ value: FundingRelationKind; label: string }>;
}

const nullable = (value: unknown) => (value == null ? null : String(value));

export function isFundingTargetType(value: EntityType): value is FundingTargetType {
	return targetTypeSet.has(value);
}

export function parseFundingRelationKind(value: FormDataEntryValue | null): FundingRelationKind | null {
	if (typeof value !== 'string') return null;
	return fundingRelationKinds.some((option) => option.value === value)
		? (value as FundingRelationKind)
		: null;
}

function suggestedKind(awardType: string | null): FundingRelationKind {
	return awardType === 'prize' ? 'recognizes' : 'supports';
}

function parseRelationRow(row: Record<string, unknown>): FundingRelation {
	const entityType = String(row.entity_type);
	if (!isEntityType(entityType) || !isFundingTargetType(entityType)) {
		throw new Error(`Tipo relacionado no permitido: ${entityType}`);
	}
	const relationKind = parseFundingRelationKind(String(row.relation_kind));
	if (!relationKind) throw new Error('Tipo de relación de financiación no permitido');
	return {
		fundingAwardId: Number(row.funding_award_id),
		fundingTitle: String(row.funding_title),
		fundingAwardType: nullable(row.award_type),
		entityType,
		entityId: Number(row.entity_id),
		entityTitle: String(row.entity_title),
		typeLabel: entityDefinitions[entityType],
		fundingSortDate: nullable(row.funding_sort_date),
		entitySortDate: nullable(row.entity_sort_date),
		fundingIsPublic: Number(row.funding_is_public) === 1,
		entityIsPublic: Number(row.entity_is_public) === 1,
		relationKind
	};
}

async function getRelations(entry: EntryKey): Promise<FundingRelation[]> {
	const condition = entry.entityType === 'funding_awards'
		? 'relation.funding_award_id = ?'
		: 'relation.entity_type = ? AND relation.entity_id = ?';
	const args = entry.entityType === 'funding_awards'
		? [entry.entityId]
		: [entry.entityType, entry.entityId];
	const result = await db.execute({
		sql: `SELECT relation.funding_award_id, relation.entity_type, relation.entity_id,
			       relation.relation_kind, funding_source.title AS funding_title,
			       funding.award_type, target.title AS entity_title,
			       funding_source.sort_date AS funding_sort_date,
			       target.sort_date AS entity_sort_date,
			       COALESCE(funding_control.is_public, 0) AS funding_is_public,
			       COALESCE(target_control.is_public, 0) AS entity_is_public
			FROM funding_relations AS relation
			JOIN funding_awards AS funding ON funding.id = relation.funding_award_id
			JOIN entry_source AS funding_source
			  ON funding_source.entity_type = 'funding_awards'
			 AND funding_source.entity_id = relation.funding_award_id
			JOIN entry_source AS target
			  ON target.entity_type = relation.entity_type
			 AND target.entity_id = relation.entity_id
			LEFT JOIN entry_controls AS funding_control
			  ON funding_control.entity_type = 'funding_awards'
			 AND funding_control.entity_id = relation.funding_award_id
			LEFT JOIN entry_controls AS target_control
			  ON target_control.entity_type = relation.entity_type
			 AND target_control.entity_id = relation.entity_id
			WHERE ${condition}
			ORDER BY (target.sort_date IS NULL) ASC, target.sort_date DESC,
			         target.title COLLATE NOCASE ASC`,
		args
	});
	return result.rows.map((row) => parseRelationRow(row as unknown as Record<string, unknown>));
}

async function getFundingCandidate(entry: EntryKey): Promise<FundingRelationCandidate[]> {
	const result = await db.execute({
		sql: `SELECT funding.id AS funding_award_id, funding.award_type,
			       source.title AS funding_title, source.sort_date,
			       COALESCE(control.is_public, 0) AS funding_is_public
			FROM funding_awards AS funding
			JOIN entry_source AS source
			  ON source.entity_type = 'funding_awards' AND source.entity_id = funding.id
			LEFT JOIN entry_controls AS control
			  ON control.entity_type = 'funding_awards' AND control.entity_id = funding.id
			ORDER BY (source.sort_date IS NULL) ASC, source.sort_date DESC,
			         source.title COLLATE NOCASE ASC`
	});
	const target = await db.execute({
		sql: `SELECT source.title, source.sort_date,
			       COALESCE(control.is_public, 0) AS entity_is_public
			FROM entry_source AS source
			LEFT JOIN entry_controls AS control
			  ON control.entity_type = source.entity_type AND control.entity_id = source.entity_id
			WHERE source.entity_type = ? AND source.entity_id = ?`,
		args: [entry.entityType, entry.entityId]
	});
	if (target.rows.length === 0 || !isFundingTargetType(entry.entityType)) return [];
	return result.rows.map((row) => ({
		fundingAwardId: Number(row.funding_award_id),
		fundingTitle: String(row.funding_title),
		fundingAwardType: nullable(row.award_type),
		entityType: entry.entityType as FundingTargetType,
		entityId: entry.entityId,
		entityTitle: String(target.rows[0].title),
		typeLabel: entityDefinitions[entry.entityType],
		fundingSortDate: nullable(row.sort_date),
		entitySortDate: nullable(target.rows[0].sort_date),
		fundingIsPublic: Number(row.funding_is_public) === 1,
		entityIsPublic: Number(target.rows[0].entity_is_public) === 1,
		suggestedKind: suggestedKind(nullable(row.award_type))
	}));
}

async function getTargetCandidates(fundingAwardId: number): Promise<FundingRelationCandidate[]> {
	const funding = await db.execute({
		sql: `SELECT source.title, source.sort_date, funding.award_type,
			       COALESCE(control.is_public, 0) AS funding_is_public
			FROM funding_awards AS funding
			JOIN entry_source AS source
			  ON source.entity_type = 'funding_awards' AND source.entity_id = funding.id
			LEFT JOIN entry_controls AS control
			  ON control.entity_type = 'funding_awards' AND control.entity_id = funding.id
			WHERE funding.id = ?`,
		args: [fundingAwardId]
	});
	if (funding.rows.length === 0) return [];
	const targets = await db.execute(`
		SELECT source.entity_type, source.entity_id, source.title, source.sort_date,
		       COALESCE(control.is_public, 0) AS entity_is_public
		FROM entry_source AS source
		LEFT JOIN entry_controls AS control
		  ON control.entity_type = source.entity_type AND control.entity_id = source.entity_id
		WHERE source.entity_type IN (
		  'projects', 'education', 'research_stays', 'courses', 'publications',
		  'academic_works', 'talks', 'teaching', 'service_activities'
		)
		ORDER BY (source.sort_date IS NULL) ASC, source.sort_date DESC,
		         source.title COLLATE NOCASE ASC`);
	const awardType = nullable(funding.rows[0].award_type);
	return targets.rows.flatMap((row) => {
		const entityType = String(row.entity_type);
		if (!isEntityType(entityType) || !isFundingTargetType(entityType)) return [];
		return [{
			fundingAwardId,
			fundingTitle: String(funding.rows[0].title),
			fundingAwardType: awardType,
			entityType,
			entityId: Number(row.entity_id),
			entityTitle: String(row.title),
			typeLabel: entityDefinitions[entityType],
			fundingSortDate: nullable(funding.rows[0].sort_date),
			entitySortDate: nullable(row.sort_date),
			fundingIsPublic: Number(funding.rows[0].funding_is_public) === 1,
			entityIsPublic: Number(row.entity_is_public) === 1,
			suggestedKind: suggestedKind(awardType)
		}];
	});
}

export async function getFundingRelationEditor(entry: EntryKey): Promise<FundingRelationEditor | null> {
	if (entry.entityType !== 'funding_awards' && !isFundingTargetType(entry.entityType)) return null;
	const [relations, candidates] = await Promise.all([
		getRelations(entry),
		entry.entityType === 'funding_awards'
			? getTargetCandidates(entry.entityId)
			: getFundingCandidate(entry)
	]);
	return {
		mode: entry.entityType === 'funding_awards' ? 'funding' : 'entry',
		relations,
		candidates,
		kinds: fundingRelationKinds.map((kind) => ({ ...kind }))
	};
}

async function assertParticipants(fundingAwardId: number, target: EntryKey): Promise<void> {
	if (!isFundingTargetType(target.entityType)) throw new Error('Este tipo no admite financiación relacionada');
	const [funding, entry] = await Promise.all([
		db.execute({ sql: 'SELECT 1 FROM funding_awards WHERE id = ? LIMIT 1', args: [fundingAwardId] }),
		db.execute({
			sql: 'SELECT 1 FROM entry_controls WHERE entity_type = ? AND entity_id = ? LIMIT 1',
			args: [target.entityType, target.entityId]
		})
	]);
	if (funding.rows.length === 0 || entry.rows.length === 0) throw new Error('La entrada relacionada no existe');
}

export function relationBelongsToEntry(
	current: EntryKey,
	fundingAwardId: number,
	target: EntryKey
): boolean {
	return current.entityType === 'funding_awards'
		? current.entityId === fundingAwardId
		: current.entityType === target.entityType && current.entityId === target.entityId;
}

export async function addFundingRelation(
	fundingAwardId: number,
	target: EntryKey,
	relationKind: FundingRelationKind
): Promise<void> {
	await assertParticipants(fundingAwardId, target);
	await db.execute({
		sql: `INSERT INTO funding_relations
				(funding_award_id, entity_type, entity_id, relation_kind)
			VALUES (?, ?, ?, ?)
			ON CONFLICT (funding_award_id, entity_type, entity_id)
			DO UPDATE SET relation_kind = excluded.relation_kind`,
		args: [fundingAwardId, target.entityType, target.entityId, relationKind]
	});
}

export async function removeFundingRelation(fundingAwardId: number, target: EntryKey): Promise<void> {
	await db.execute({
		sql: `DELETE FROM funding_relations
			WHERE funding_award_id = ? AND entity_type = ? AND entity_id = ?`,
		args: [fundingAwardId, target.entityType, target.entityId]
	});
}

export async function updateFundingRelationKind(
	fundingAwardId: number,
	target: EntryKey,
	relationKind: FundingRelationKind
): Promise<void> {
	const result = await db.execute({
		sql: `UPDATE funding_relations SET relation_kind = ?
			WHERE funding_award_id = ? AND entity_type = ? AND entity_id = ?`,
		args: [relationKind, fundingAwardId, target.entityType, target.entityId]
	});
	if (result.rowsAffected === 0) throw new Error('La relación no existe');
}
