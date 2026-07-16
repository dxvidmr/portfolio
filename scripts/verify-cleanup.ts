import { createClient } from '@libsql/client';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const backupDir = 'backups';
const backupName = readdirSync(backupDir)
	.filter((name) => /^curriculum-\d{4}-\d{2}-\d{2}-\d{4}\.sql$/.test(name))
	.sort()
	.at(-1);

if (!backupName) throw new Error('No hay ningún respaldo verificable en backups/');

const db = createClient({ url: 'file::memory:' });
try {
	await db.executeMultiple(readFileSync(join(backupDir, backupName), 'utf8'));
	const before = (await db.execute(
		`SELECT
		   (SELECT COUNT(*) FROM entries) AS entries_count,
		   (SELECT COUNT(*) FROM talks) AS talks_count,
		   (SELECT COUNT(*) FROM service_activities) AS service_count`
	)).rows[0];

	await db.executeMultiple(readFileSync('db/migrations/013_cleanup_legacy_structure.sql', 'utf8'));

	const after = (await db.execute(
		`SELECT
		   (SELECT COUNT(*) FROM entries) AS entries_count,
		   (SELECT COUNT(*) FROM talks) AS talks_count,
		   (SELECT COUNT(*) FROM service_activities) AS service_count`
	)).rows[0];
	if (JSON.stringify(before) !== JSON.stringify(after)) {
		throw new Error(`La migración cambia recuentos: ${JSON.stringify({ before, after })}`);
	}

	const november = (await db.execute(
		`SELECT event.date_start AS event_start, event.date_end AS event_end,
		        talk.date_start AS talk_start, talk.date_end AS talk_end,
		        service.date_start AS service_start, service.date_end AS service_end
		 FROM events AS event
		 JOIN talks AS talk ON talk.id = 18 AND talk.canonical_event_id = event.id
		 JOIN service_activities AS service ON service.id = 5 AND service.canonical_event_id = event.id
		 WHERE event.id = 18`
	)).rows[0];
	const expectedNovember = {
		event_start: '2020-11-01',
		event_end: '2020-11-30',
		talk_start: '2020-11-20',
		talk_end: '2020-11-20',
		service_start: '2020-11-01',
		service_end: '2020-11-30'
	};
	for (const [key, value] of Object.entries(expectedNovember)) {
		if (november?.[key] !== value) throw new Error(`Noviembre HD: ${key} no vale ${value}`);
	}

	const obsolete = await db.execute(
		`SELECT name FROM sqlite_master WHERE name IN ('entries_legacy', 'academic_events')`
	);
	if (obsolete.rows.length) throw new Error(`Quedan estructuras obsoletas: ${JSON.stringify(obsolete.rows)}`);

	const foreignKeys = await db.execute('PRAGMA foreign_key_check');
	if (foreignKeys.rows.length) throw new Error(`FK rotas: ${JSON.stringify(foreignKeys.rows)}`);

	console.log(`013 verificada sobre ${backupName}`);
	console.log(`recuentos conservados: ${before.entries_count} entradas, ${before.talks_count} talks, ${before.service_count} servicios`);
	console.log('Noviembre HD: evento 01→30, comunicación 20→20, servicio 01→30');
	console.log('0 estructuras obsoletas; 0 claves foráneas rotas');
} finally {
	db.close();
}
