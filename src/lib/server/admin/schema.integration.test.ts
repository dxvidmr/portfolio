import { createClient } from '@libsql/client';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('esquema posterior a la limpieza 013', () => {
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
			expect((await db.execute('PRAGMA foreign_key_check')).rows).toHaveLength(0);
		} finally {
			db.close();
		}
	});
});
