import { db } from '$lib/server/db';
import { getPortfolioProjects } from '$lib/server/portfolio-projects';
import { hasProjectStory } from '$lib/content/project-story-registry';
import type {
	PortfolioProjectMetadata,
	PortfolioPublicationStatus,
	PortfolioTaxonomyOption
} from '$lib/types/portfolio';
import { entityDefinitions, isEntityType, type EntityType } from './entity-definitions';
import type { EntryKey } from './controls';

export interface PortfolioOption {
	slug: string;
	title: string;
	kind: string;
	year: string;
}

export type PortfolioProjectInput = {
	slug: string;
	title: { es: string; en: string };
	kindCode: string;
	summary: { es: string; en: string };
	status: { es: string; en: string };
	period: string;
	tagCodes: string[];
	links: Array<{ label: { es: string; en: string }; url: string }>;
	publicationStatus: PortfolioPublicationStatus;
	sortOrder: number | null;
};

export interface PortfolioTaxonomyOptions {
	kinds: PortfolioTaxonomyOption[];
	tags: PortfolioTaxonomyOption[];
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

export type PortfolioProjectListItem = PortfolioProjectMetadata & {
	relationCount: number;
	hasNarrative: boolean;
};

export function parsePortfolioSlug(value: FormDataEntryValue | null): string | null {
	if (typeof value !== 'string') return null;
	const slug = value.trim().toLowerCase();
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100 ? slug : null;
}

const formText = (formData: FormData, name: string, max = 5000) =>
	String(formData.get(name) ?? '').trim().slice(0, max);

export function parsePortfolioProjectInput(formData: FormData): PortfolioProjectInput | null {
	const slug = parsePortfolioSlug(formData.get('slug'));
	const titleEs = formText(formData, 'titleEs', 200);
	const titleEn = formText(formData, 'titleEn', 200) || titleEs;
	const kindCode = formText(formData, 'kindCode', 64);
	const summaryEs = formText(formData, 'summaryEs');
	const summaryEn = formText(formData, 'summaryEn') || summaryEs;
	const statusEs = formText(formData, 'statusEs', 160) || 'Proyecto';
	const statusEn = formText(formData, 'statusEn', 160) || statusEs;
	const period = formText(formData, 'period', 80);
	const tagCodes = [
		...new Set(
			formData
				.getAll('tagCodes')
				.map((tag) => String(tag).trim())
				.filter(Boolean)
		)
	];
	const linkUrl = formText(formData, 'linkUrl', 2000);
	const linkLabelEs = formText(formData, 'linkLabelEs', 160);
	const linkLabelEn = formText(formData, 'linkLabelEn', 160) || linkLabelEs;
	const rawOrder = formText(formData, 'sortOrder', 8);
	const sortOrder = rawOrder === '' ? null : Number(rawOrder);
	const rawPublicationStatus = formText(formData, 'publicationStatus', 20);
	const publicationStatus: PortfolioPublicationStatus =
		rawPublicationStatus === 'published' || rawPublicationStatus === 'archived'
			? rawPublicationStatus
			: 'draft';

	const validTaxonomyCode = (code: string) => /^[a-z0-9_]{2,64}$/.test(code);
	if (
		!slug ||
		!titleEs ||
		!validTaxonomyCode(kindCode) ||
		!summaryEs ||
		!period ||
		tagCodes.length > 10 ||
		tagCodes.some((code) => !validTaxonomyCode(code))
	) return null;
	if (sortOrder !== null && (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999999)) return null;
	if (linkUrl) {
		try {
			const url = new URL(linkUrl);
			if (!['http:', 'https:'].includes(url.protocol)) return null;
		} catch {
			return null;
		}
	}

	return {
		slug,
		title: { es: titleEs, en: titleEn },
		kindCode,
		summary: { es: summaryEs, en: summaryEn },
		status: { es: statusEs, en: statusEn },
		period,
		tagCodes,
		links: linkUrl ? [{ label: { es: linkLabelEs || titleEs, en: linkLabelEn || titleEn }, url: linkUrl }] : [],
		publicationStatus,
		sortOrder
	};
}

export async function getPortfolioTaxonomyOptions(): Promise<PortfolioTaxonomyOptions> {
	const result = await db.execute(`
		SELECT code, domain, label_es, label_en
		FROM type_vocab
		WHERE domain IN ('portfolio_kind', 'portfolio_tag')
		ORDER BY domain, sort_order, label_es COLLATE NOCASE`);
	const options = result.rows.map((row) => ({
		code: String(row.code),
		domain: String(row.domain),
		labelEs: String(row.label_es),
		labelEn: String(row.label_en)
	}));
	return {
		kinds: options
			.filter((option) => option.domain === 'portfolio_kind')
			.map(({ code, labelEs, labelEn }) => ({ code, labelEs, labelEn })),
		tags: options
			.filter((option) => option.domain === 'portfolio_tag')
			.map(({ code, labelEs, labelEn }) => ({ code, labelEs, labelEn }))
	};
}

export async function getPortfolioProjectList(): Promise<PortfolioProjectListItem[]> {
	const [projects, countsResult] = await Promise.all([
		getPortfolioProjects(),
		db.execute(`SELECT portfolio_slug, COUNT(*) AS relation_count
			FROM portfolio_items GROUP BY portfolio_slug`)
	]);
	const counts = new Map(
		countsResult.rows.map((row) => [String(row.portfolio_slug), Number(row.relation_count)])
	);
	return projects.map((project) => ({
		...project,
		relationCount: counts.get(project.slug) ?? 0,
		hasNarrative: hasProjectStory(project.slug)
	}));
}

export async function getPortfolioAdminData(portfolioSlug: string): Promise<{
	project: PortfolioProjectMetadata | null;
	entries: PortfolioCandidate[];
	relations: PortfolioRelation[];
	taxonomy: PortfolioTaxonomyOptions;
}> {
	const [projects, entriesResult, relationsResult, taxonomy] = await Promise.all([
		getPortfolioProjects(),
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
			FROM portfolio_items
			WHERE portfolio_slug = ?`, [portfolioSlug]),
		getPortfolioTaxonomyOptions()
	]);
	const project = projects.find((item) => item.slug === portfolioSlug) ?? null;

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
		if (portfolioSlug !== project?.slug || !isEntityType(entityType)) return [];
		return [{
			portfolioSlug,
			entityType,
			entityId: Number(row.entity_id),
			featured: Number(row.featured) === 1
		}];
	});

	return { project, entries, relations, taxonomy };
}

export async function getEntryPortfolioRelations(entry: EntryKey): Promise<Array<PortfolioOption & { featured: boolean }>> {
	const [projects, result] = await Promise.all([getPortfolioProjects(), db.execute({
		sql: `SELECT portfolio_slug, featured
			FROM portfolio_items
			WHERE entity_type = ? AND entity_id = ?`,
		args: [entry.entityType, entry.entityId]
	})]);
	const bySlug = new Map(result.rows.map((row) => [String(row.portfolio_slug), Number(row.featured) === 1]));
	return projects
		.filter((project) => bySlug.has(project.slug))
		.map((project) => ({
			slug: project.slug,
			title: project.title.es,
			kind: project.kind.es,
			year: project.period,
			featured: bySlug.get(project.slug) ?? false
		}));
}

async function assertPortfolioProjectExists(slug: string): Promise<void> {
	const result = await db.execute({
		sql: 'SELECT 1 FROM portfolio_projects WHERE slug = ? LIMIT 1',
		args: [slug]
	});
	if (result.rows.length === 0) throw new Error('La ficha del portfolio no existe');
}

async function assertPortfolioTaxonomies(project: PortfolioProjectInput): Promise<void> {
	const codes = [project.kindCode, ...project.tagCodes];
	const placeholders = codes.map(() => '?').join(', ');
	const result = await db.execute({
		sql: `SELECT code, domain FROM type_vocab WHERE code IN (${placeholders})`,
		args: codes
	});
	const domains = new Map(result.rows.map((row) => [String(row.code), String(row.domain)]));
	if (domains.get(project.kindCode) !== 'portfolio_kind') {
		throw new Error('El tipo de portfolio no pertenece a la taxonomía permitida');
	}
	if (project.tagCodes.some((code) => domains.get(code) !== 'portfolio_tag')) {
		throw new Error('Alguna etiqueta no pertenece a la taxonomía de portfolio');
	}
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
	await assertPortfolioProjectExists(portfolioSlug);
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
	await assertPortfolioProjectExists(portfolioSlug);
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
	await assertPortfolioProjectExists(portfolioSlug);
	const result = await db.execute({
		sql: `UPDATE portfolio_items
			SET featured = ?
			WHERE portfolio_slug = ? AND entity_type = ? AND entity_id = ?`,
		args: [featured ? 1 : 0, portfolioSlug, entry.entityType, entry.entityId]
	});
	if (result.rowsAffected === 0) throw new Error('La relación no existe');
	return { portfolioSlug, ...entry, featured };
}

const projectArgs = (project: PortfolioProjectInput, sortOrder: number) => [
	project.slug,
	project.title.es,
	project.title.en,
	project.kindCode,
	project.summary.es,
	project.summary.en,
	project.status.es,
	project.status.en,
	project.period,
	JSON.stringify(project.links.map((link) => ({
		label_es: link.label.es,
		label_en: link.label.en,
		url: link.url
	}))),
	project.publicationStatus,
	sortOrder
];

const tagStatements = (project: PortfolioProjectInput) =>
	project.tagCodes.map((tagCode, index) => ({
		sql: `INSERT INTO portfolio_project_tags (portfolio_slug, tag_code, sort_order)
		      VALUES (?, ?, ?)`,
		args: [project.slug, tagCode, (index + 1) * 10]
	}));

export async function createPortfolioProject(project: PortfolioProjectInput): Promise<void> {
	await assertPortfolioTaxonomies(project);
	let sortOrder = project.sortOrder;
	if (sortOrder === null) {
		const result = await db.execute('SELECT COALESCE(MAX(sort_order), 0) + 10 AS next_order FROM portfolio_projects');
		sortOrder = Number(result.rows[0]?.next_order ?? 10);
	}
	await db.batch([
		{
			sql: `INSERT INTO portfolio_projects
				(slug, title_es, title_en, kind_code, summary_es, summary_en,
				 status_es, status_en, period, links_json, publication_status, sort_order)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			args: projectArgs(project, sortOrder)
		},
		...tagStatements(project)
	], 'write');
}

export async function updatePortfolioProject(project: PortfolioProjectInput): Promise<void> {
	await assertPortfolioProjectExists(project.slug);
	await assertPortfolioTaxonomies(project);
	const sortOrder = project.sortOrder ?? 0;
	const args = projectArgs(project, sortOrder);
	await db.batch([
		{
			sql: `UPDATE portfolio_projects SET
				title_es = ?, title_en = ?, kind_code = ?, summary_es = ?, summary_en = ?,
				status_es = ?, status_en = ?, period = ?, links_json = ?,
				publication_status = ?, sort_order = ?, updated_at = datetime('now')
				WHERE slug = ?`,
			args: [...args.slice(1), project.slug]
		},
		{
			sql: 'DELETE FROM portfolio_project_tags WHERE portfolio_slug = ?',
			args: [project.slug]
		},
		...tagStatements(project)
	], 'write');
}

export async function reorderPortfolioProjects(slugs: string[]): Promise<void> {
	const projects = await getPortfolioProjects();
	const existing = new Set(projects.map((project) => project.slug));
	if (slugs.length !== existing.size || new Set(slugs).size !== slugs.length || slugs.some((slug) => !existing.has(slug))) {
		throw new Error('El orden no contiene todos los proyectos');
	}
	await db.batch(
		slugs.map((slug, index) => ({
			sql: `UPDATE portfolio_projects
				SET sort_order = ?, updated_at = datetime('now')
				WHERE slug = ?`,
			args: [(index + 1) * 10, slug]
		})),
		'write'
	);
}
