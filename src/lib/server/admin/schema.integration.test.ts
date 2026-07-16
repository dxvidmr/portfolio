import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('esquema posterior a la limpieza 013', () => {
	it('migra el portfolio estático a un catálogo editable sin relaciones huérfanas', async () => {
		const db = createClient({ url: 'file::memory:' });
		try {
			await db.executeMultiple(`
				CREATE TABLE portfolio_items (
					portfolio_slug TEXT NOT NULL,
					entity_type TEXT NOT NULL,
					entity_id INTEGER NOT NULL,
					sort_order INTEGER DEFAULT 0,
					featured INTEGER DEFAULT 0,
					PRIMARY KEY (portfolio_slug, entity_type, entity_id)
				);
				CREATE INDEX idx_portfolio_items_slug
					ON portfolio_items(portfolio_slug, sort_order);
				INSERT INTO portfolio_items VALUES
					('todos-a-una', 'publications', 1, 0, 1),
					('slug-obsoleto', 'publications', 2, 0, 0);
			`);
			await db.executeMultiple(readFileSync('db/migrations/014_portfolio_projects.sql', 'utf8'));
			await db.executeMultiple(readFileSync('db/migrations/015_portfolio_publication_status.sql', 'utf8'));

			expect((await db.execute('SELECT COUNT(*) AS total FROM portfolio_projects')).rows[0]?.total).toBe(6);
			expect((await db.execute(
				`SELECT show_home, publication_status FROM portfolio_projects WHERE slug = 'versologia-metadrama'`
			)).rows[0]).toMatchObject({ show_home: 0, publication_status: 'published' });
			expect((await db.execute('SELECT portfolio_slug FROM portfolio_items')).rows).toMatchObject([
				{ portfolio_slug: 'todos-a-una' }
			]);
			expect((await db.execute('PRAGMA foreign_key_check')).rows).toHaveLength(0);
		} finally {
			db.close();
		}
	});

	it('separa fechas de evento y roles y representa intervalos abiertos con date_end NULL', async () => {
		const db = createClient({ url: 'file::memory:' });
		try {
			await db.executeMultiple(readFileSync('db/schema.sql', 'utf8'));
			await db.batch([
				{
					sql: `INSERT INTO type_vocab (code, domain, label_es, label_en)
					      VALUES ('conference_paper', 'contribution_type', 'Comunicación', 'Talk')`,
					args: []
				},
				{
					sql: `INSERT INTO type_vocab (code, domain, label_es, label_en)
					      VALUES ('event_organization', 'activity_type', 'Organización', 'Organisation')`,
					args: []
				},
				{
					sql: `INSERT INTO events (id, title, date_start, date_end, year)
					      VALUES (18, 'Noviembre HD', '2020-11-01', '2020-11-30', 2020)`,
					args: []
				},
				{
					sql: `INSERT INTO talks
					      (id, title, contribution_type, authors_text, date_start, date_end, canonical_event_id)
					      VALUES (18, 'Comunicación', 'conference_paper', 'Autor', '2020-11-20', '2020-11-20', 18)`,
					args: []
				},
				{
					sql: `INSERT INTO service_activities
					      (id, activity_type, title, date_start, date_end, canonical_event_id)
					      VALUES (5, 'event_organization', 'Noviembre HD', '2020-11-01', '2020-11-30', 18)`,
					args: []
				},
				{
					sql: `INSERT INTO education
					      (id, degree_title, institution, date_start, date_end)
					      VALUES (1, 'Doctorado', 'Universidad', '2020', NULL)`,
					args: []
				},
				{
					sql: `INSERT INTO entry_controls (entity_type, entity_id, is_public)
					      VALUES ('talks', 18, 1), ('service_activities', 5, 1), ('education', 1, 1)`,
					args: []
				}
			], 'write');

			const source = await db.execute(
				`SELECT entity_type, sort_date FROM entry_source
				 WHERE (entity_type = 'talks' AND entity_id = 18)
				    OR (entity_type = 'service_activities' AND entity_id = 5)
				    OR (entity_type = 'education' AND entity_id = 1)
				 ORDER BY entity_type`
			);
			expect(source.rows).toMatchObject([
				{ entity_type: 'education', sort_date: '2020' },
				{ entity_type: 'service_activities', sort_date: '2020-11-01' },
				{ entity_type: 'talks', sort_date: '2020-11-20' }
			]);

			await db.execute(
				`UPDATE events SET date_start = '2020-10-01', date_end = '2020-12-01' WHERE id = 18`
			);
			const roles = await db.execute(
				`SELECT
				   (SELECT date_start FROM talks WHERE id = 18) AS talk_date,
				   (SELECT date_start FROM service_activities WHERE id = 5) AS service_date`
			);
			expect(roles.rows[0]).toMatchObject({
				talk_date: '2020-11-20',
				service_date: '2020-11-01'
			});

			const educationColumns = await db.execute('PRAGMA table_info(education)');
			const projectColumns = await db.execute('PRAGMA table_info(projects)');
			expect(educationColumns.rows.map((row) => row.name)).not.toContain('is_ongoing');
			expect(projectColumns.rows.map((row) => row.name)).not.toEqual(
				expect.arrayContaining(['public', 'featured', 'show_home', 'sort_order'])
			);

			const portfolioProjects = await db.execute(
				`SELECT slug, title_es, show_home FROM portfolio_projects ORDER BY sort_order`
			);
			expect(portfolioProjects.rows).toHaveLength(6);
			expect(portfolioProjects.rows.find((row) => row.slug === 'versologia-metadrama')).toMatchObject({
				title_es: 'Versología',
				show_home: 0
			});
			await db.execute({
				sql: `INSERT INTO portfolio_projects
					(slug, title_es, title_en, kind_es, kind_en, kicker_es, kicker_en,
					 summary_es, summary_en, status_es, status_en, period)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				args: [
					'proyecto-sin-narrativa', 'Proyecto básico', 'Basic project', 'Proyecto', 'Project',
					'Proyecto', 'Project', 'Descripción', 'Description', 'En desarrollo', 'In development', '2026—'
				]
			});
			expect((await db.execute(
				`SELECT show_home, publication_status, tags_json, links_json FROM portfolio_projects
				 WHERE slug = 'proyecto-sin-narrativa'`
			)).rows[0]).toMatchObject({ show_home: 1, publication_status: 'published', tags_json: '[]', links_json: '[]' });
			expect((await db.execute('PRAGMA foreign_key_check')).rows).toHaveLength(0);
		} finally {
			db.close();
		}
	});
});
