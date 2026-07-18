import { db } from '$lib/server/db';

// Gestión de `type_vocab` (Fase 5E, decisión 16): añadir un tipo nuevo es un
// INSERT desde /admin/taxonomias, sin desplegar código. Los dominios y sus
// tablas consumidoras son una allowlist cerrada: nada procede del navegador.

export interface TaxonomyConsumer {
	table: string;
	column: string;
}

export interface TaxonomyDomainDef {
	domain: string;
	label: string;
	consumers: TaxonomyConsumer[];
}

export const TAXONOMY_DOMAINS: TaxonomyDomainDef[] = [
	{
		domain: 'publication_type',
		label: 'Tipos de publicación',
		consumers: [{ table: 'publications', column: 'publication_type' }]
	},
	{
		domain: 'publication_role',
		label: 'Responsabilidades en publicaciones',
		consumers: [{ table: 'publications', column: 'my_role' }]
	},
	{
		domain: 'publication_container_type',
		label: 'Tipos de contenedor bibliográfico',
		consumers: [{ table: 'publications', column: 'container_type' }]
	},
	{
		domain: 'conference_publication_format',
		label: 'Subtipos de artículo en congreso',
		consumers: [{ table: 'publications', column: 'conference_publication_format' }]
	},
	{
		domain: 'publication_review_status',
		label: 'Evaluación editorial de publicaciones',
		consumers: [{ table: 'publications', column: 'review_status' }]
	},
	{
		domain: 'contribution_type',
		label: 'Tipos de comunicación',
		consumers: [{ table: 'talks', column: 'contribution_type' }]
	},
	{
		domain: 'contribution_selection',
		label: 'Vías de acceso a contribuciones',
		consumers: [{ table: 'talks', column: 'selection_mode' }]
	},
	{
		domain: 'session_format',
		label: 'Formatos de sesión',
		consumers: [{ table: 'talks', column: 'session_format' }]
	},
	{
		domain: 'teaching_type',
		label: 'Tipos de docencia',
		consumers: [{ table: 'teaching', column: 'teaching_type' }]
	},
	{
		domain: 'activity_type',
		label: 'Tipos de actividad de servicio',
		consumers: [{ table: 'service_activities', column: 'activity_type' }]
	},
	{
		domain: 'award_type',
		label: 'Tipos de financiación y premio',
		consumers: [{ table: 'funding_awards', column: 'award_type' }]
	},
	{
		domain: 'project_type',
		label: 'Tipos de proyecto',
		consumers: [{ table: 'projects', column: 'project_type' }]
	},
	{
		domain: 'work_type',
		label: 'Tipos de trabajo académico',
		consumers: [{ table: 'academic_works', column: 'work_type' }]
	},
	{
		domain: 'project_role',
		label: 'Roles en proyectos',
		consumers: [{ table: 'projects', column: 'role' }]
	},
	{
		domain: 'service_role',
		label: 'Roles de servicio',
		consumers: [{ table: 'service_activities', column: 'role' }]
	},
	{
		domain: 'link_type',
		label: 'Tipos de enlace',
		consumers: [{ table: 'links', column: 'link_type' }]
	},
	{
		domain: 'document_type',
		label: 'Tipos de documento',
		consumers: [{ table: 'documents', column: 'document_type' }]
	}
];

const domainDef = (domain: string): TaxonomyDomainDef | undefined =>
	TAXONOMY_DOMAINS.find((d) => d.domain === domain);

export const isTaxonomyDomain = (domain: string): boolean => Boolean(domainDef(domain));

export interface TaxonomyType {
	code: string;
	labelEs: string;
	labelEn: string;
	sortOrder: number;
	usageCount: number;
}

export interface TaxonomyDomain {
	domain: string;
	label: string;
	types: TaxonomyType[];
}

export async function getTaxonomies(): Promise<TaxonomyDomain[]> {
	const vocab = await db.execute(
		'SELECT code, domain, label_es, label_en, sort_order FROM type_vocab ORDER BY domain, sort_order, label_es'
	);

	// Usos por código dentro de su dominio (las tablas/columnas salen de la
	// allowlist de arriba, nunca de la petición).
	const usage = new Map<string, number>();
	for (const def of TAXONOMY_DOMAINS) {
		for (const consumer of def.consumers) {
			const res = await db.execute(
				`SELECT ${consumer.column} AS code, COUNT(*) AS n
				 FROM ${consumer.table}
				 WHERE ${consumer.column} IS NOT NULL
				 GROUP BY ${consumer.column}`
			);
			for (const row of res.rows) {
				const key = `${def.domain}:${row.code}`;
				usage.set(key, (usage.get(key) ?? 0) + Number(row.n));
			}
		}
	}

	const grouped = new Map<string, TaxonomyType[]>();
	for (const row of vocab.rows) {
		const domain = String(row.domain);
		const list = grouped.get(domain) ?? [];
		list.push({
			code: String(row.code),
			labelEs: String(row.label_es),
			labelEn: String(row.label_en),
			sortOrder: Number(row.sort_order),
			usageCount: usage.get(`${domain}:${row.code}`) ?? 0
		});
		grouped.set(domain, list);
	}

	return TAXONOMY_DOMAINS.map((def) => ({
		domain: def.domain,
		label: def.label,
		types: grouped.get(def.domain) ?? []
	}));
}

export interface TaxonomyValues {
	code: string;
	labelEs: string;
	labelEn: string;
	sortOrder: number;
}

export function parseTaxonomyValues(
	formData: FormData,
	{ requireCode }: { requireCode: boolean }
): { values: TaxonomyValues; error: string | null } {
	const code = String(formData.get('code') ?? '').trim();
	const labelEs = String(formData.get('label_es') ?? '').trim();
	const labelEn = String(formData.get('label_en') ?? '').trim();
	const sortRaw = String(formData.get('sort_order') ?? '').trim();

	const values: TaxonomyValues = { code, labelEs, labelEn, sortOrder: 0 };

	if (requireCode && !/^[a-z0-9_]{2,64}$/.test(code)) {
		return { values, error: 'Código: solo minúsculas, números y guion bajo (2–64).' };
	}
	if (!labelEs || !labelEn) {
		return { values, error: 'Las etiquetas en español y en inglés son obligatorias.' };
	}
	if (labelEs.length > 200 || labelEn.length > 200) {
		return { values, error: 'Las etiquetas no pueden superar 200 caracteres.' };
	}
	if (sortRaw !== '') {
		if (!/^\d{1,5}$/.test(sortRaw)) {
			return { values, error: 'El orden debe ser un número entero positivo.' };
		}
		values.sortOrder = Number(sortRaw);
	}
	return { values, error: null };
}

export async function addTaxonomyType(domain: string, values: TaxonomyValues): Promise<void> {
	if (!isTaxonomyDomain(domain)) throw new Error('Dominio no permitido');
	// `code` es clave primaria global de type_vocab: único entre TODOS los dominios.
	const existing = await db.execute({
		sql: 'SELECT domain FROM type_vocab WHERE code = ?',
		args: [values.code]
	});
	if (existing.rows.length > 0) {
		throw new Error(`El código ya existe (dominio ${existing.rows[0].domain}).`);
	}
	await db.execute({
		sql: 'INSERT INTO type_vocab (code, domain, label_es, label_en, sort_order) VALUES (?, ?, ?, ?, ?)',
		args: [values.code, domain, values.labelEs, values.labelEn, values.sortOrder]
	});
}

export async function updateTaxonomyType(
	domain: string,
	code: string,
	values: TaxonomyValues
): Promise<void> {
	if (!isTaxonomyDomain(domain)) throw new Error('Dominio no permitido');
	// El código es inmutable: lo referencian FKs de las tablas de contenido.
	const result = await db.execute({
		sql: `UPDATE type_vocab SET label_es = ?, label_en = ?, sort_order = ?
		      WHERE code = ? AND domain = ?`,
		args: [values.labelEs, values.labelEn, values.sortOrder, code, domain]
	});
	if (result.rowsAffected === 0) throw new Error('El tipo no existe en ese dominio.');
}

export async function countTaxonomyUsage(domain: string, code: string): Promise<number> {
	const def = domainDef(domain);
	if (!def) throw new Error('Dominio no permitido');
	let total = 0;
	for (const consumer of def.consumers) {
		const res = await db.execute({
			sql: `SELECT COUNT(*) AS n FROM ${consumer.table} WHERE ${consumer.column} = ?`,
			args: [code]
		});
		total += Number(res.rows[0].n);
	}
	return total;
}

export async function deleteTaxonomyType(domain: string, code: string): Promise<void> {
	if (!isTaxonomyDomain(domain)) throw new Error('Dominio no permitido');
	const inUse = await countTaxonomyUsage(domain, code);
	if (inUse > 0) {
		throw new Error(`No se puede eliminar: lo usan ${inUse} entradas.`);
	}
	// La FK de las tablas consumidoras respalda esta comprobación a nivel de BD.
	const result = await db.execute({
		sql: 'DELETE FROM type_vocab WHERE code = ? AND domain = ?',
		args: [code, domain]
	});
	if (result.rowsAffected === 0) throw new Error('El tipo no existe en ese dominio.');
}
