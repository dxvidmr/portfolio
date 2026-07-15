import 'dotenv/config';
import { createClient } from '@libsql/client';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Runner de migraciones (plan §6): aplica db/migrations/*.sql en orden y
// registra las aplicadas en schema_migrations. Ejecutar con: npm run migrate
const db = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

const dir = 'db/migrations';

await db.execute(
	`CREATE TABLE IF NOT EXISTS schema_migrations (
	   name TEXT PRIMARY KEY,
	   applied_at TEXT NOT NULL DEFAULT (datetime('now'))
	 )`
);

const applied = new Set(
	(await db.execute('SELECT name FROM schema_migrations')).rows.map((r) => String(r.name))
);

const files = readdirSync(dir)
	.filter((f) => f.endsWith('.sql'))
	.sort();

for (const file of files) {
	if (applied.has(file)) {
		console.log(`ya aplicada: ${file}`);
		continue;
	}
	console.log(`aplicando:   ${file}`);
	const sql = readFileSync(join(dir, file), 'utf8');
	await db.executeMultiple(sql);
	await db.execute({ sql: 'INSERT INTO schema_migrations (name) VALUES (?)', args: [file] });
	console.log(`aplicada:    ${file}`);
}

console.log('migraciones al día');
