import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
	throw new Error('Faltan TURSO_DATABASE_URL o TURSO_AUTH_TOKEN en .env');
}

type Mapping = {
	portfolio: string;
	type: string;
	id: number;
	order: number;
	featured?: boolean;
	note: string;
};

const mappings: Mapping[] = [
	// Todos a una
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 6, order: 10, featured: true, note: 'Fuenteovejuna en la era digital' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 5, order: 20, featured: true, note: 'Transmisión y recepción del teatro áureo' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 1, order: 30, note: 'Afectos revolucionarios' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 11, order: 40, note: 'Mil y una Fuenteovejuna' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 9, order: 50, note: 'Towards a Social Fuenteovejuna' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 7, order: 60, note: 'Fuenteovejuna social' },
	{ portfolio: 'todos-a-una', type: 'academic_events', id: 10, order: 70, note: 'Social and Collaborative Scholarly Editing' },

	// Versología / METADRAMA
	{ portfolio: 'versologia-metadrama', type: 'projects', id: 3, order: 10, featured: true, note: 'Proyecto METADRAMA' },

	// ETSO
	{ portfolio: 'etso-plataforma-web', type: 'projects', id: 8, order: 10, featured: true, note: 'ETSO' },
	{ portfolio: 'etso-plataforma-web', type: 'academic_events', id: 19, order: 20, note: 'Estilometría y atribución de autoría' },

	// Redes de personajes teatrales
	{ portfolio: 'redes-personajes-teatrales', type: 'academic_works', id: 1, order: 10, featured: true, note: 'TFM' },
	{ portfolio: 'redes-personajes-teatrales', type: 'publications', id: 4, order: 20, featured: true, note: 'Programming Historian, parte 1' },
	{ portfolio: 'redes-personajes-teatrales', type: 'publications', id: 3, order: 30, featured: true, note: 'Programming Historian, parte 2' },
	{ portfolio: 'redes-personajes-teatrales', type: 'publications', id: 5, order: 40, note: 'Estructuras de personajes' },
	{ portfolio: 'redes-personajes-teatrales', type: 'publications', id: 2, order: 50, note: 'De la escena al grafo' },
	{ portfolio: 'redes-personajes-teatrales', type: 'academic_events', id: 14, order: 60, note: 'Póster HDH 2023' },
	{ portfolio: 'redes-personajes-teatrales', type: 'academic_events', id: 16, order: 70, note: 'JISO 2022' },
	{ portfolio: 'redes-personajes-teatrales', type: 'teaching', id: 3, order: 80, note: 'Taller sobre grafos y Edad de Plata' },

	// Edición digital y corpus teatrales
	{ portfolio: 'edicion-digital-corpus', type: 'projects', id: 7, order: 10, featured: true, note: 'Fray Andrés de San Miguel' },
	{ portfolio: 'edicion-digital-corpus', type: 'academic_events', id: 2, order: 20, featured: true, note: 'Edición crítica digital de PROLOPE' },
	{ portfolio: 'edicion-digital-corpus', type: 'academic_events', id: 4, order: 30, featured: true, note: 'Spanish Drama Corpus' },
	{ portfolio: 'edicion-digital-corpus', type: 'projects', id: 6, order: 40, note: 'HDATEATROUNIR' },
	{ portfolio: 'edicion-digital-corpus', type: 'publications', id: 7, order: 50, note: 'Minimal Computing' },
	{ portfolio: 'edicion-digital-corpus', type: 'academic_events', id: 17, order: 60, note: 'Digital Publishing with Minimal Computing' },
	{ portfolio: 'edicion-digital-corpus', type: 'teaching', id: 2, order: 70, note: 'Taller XML-TEI' },
	{ portfolio: 'edicion-digital-corpus', type: 'teaching', id: 4, order: 80, note: 'Introducción a XML-TEI' },

	// Del documento a la escena
	{ portfolio: 'documento-escena', type: 'publications', id: 1, order: 10, featured: true, note: 'Documentos en acción' },
	{ portfolio: 'documento-escena', type: 'academic_events', id: 8, order: 20, featured: true, note: 'Técnica del actor barroco' },
	{ portfolio: 'documento-escena', type: 'projects', id: 3, order: 30, note: 'METADRAMA' }
];

const db = createClient({ url, authToken });

for (const mapping of mappings) {
	const found = await db.execute({
		sql: 'SELECT 1 FROM entries WHERE entity_type = ? AND entity_id = ? LIMIT 1',
		args: [mapping.type, mapping.id]
	});
	if (found.rows.length === 0) {
		throw new Error(`No existe ${mapping.type}:${mapping.id} (${mapping.note})`);
	}
}

await db.batch(
	[
		`CREATE TABLE IF NOT EXISTS portfolio_items (
			portfolio_slug TEXT NOT NULL,
			entity_type TEXT NOT NULL,
			entity_id INTEGER NOT NULL,
			sort_order INTEGER DEFAULT 0,
			featured INTEGER DEFAULT 0,
			PRIMARY KEY (portfolio_slug, entity_type, entity_id)
		)`,
		'CREATE INDEX IF NOT EXISTS idx_portfolio_items_slug ON portfolio_items(portfolio_slug, sort_order)',
		...mappings.map((mapping) => ({
			sql: `INSERT INTO portfolio_items
			      (portfolio_slug, entity_type, entity_id, sort_order, featured)
			      VALUES (?, ?, ?, ?, ?)
			      ON CONFLICT (portfolio_slug, entity_type, entity_id)
			      DO UPDATE SET sort_order = excluded.sort_order, featured = excluded.featured`,
			args: [mapping.portfolio, mapping.type, mapping.id, mapping.order, mapping.featured ? 1 : 0]
		}))
	],
	'write'
);

const result = await db.execute(
	`SELECT portfolio_slug, count(*) AS total
	 FROM portfolio_items
	 GROUP BY portfolio_slug
	 ORDER BY portfolio_slug`
);

console.log(JSON.stringify(result.rows, null, 2));
await db.close();
