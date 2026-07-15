import 'dotenv/config';
import { createClient, type Value } from '@libsql/client';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, writeFileSync } from 'node:fs';

// Respaldo verificable de Turso (plan §6): vuelca esquema y datos a
// backups/curriculum-<fecha-hora>.sql y comprueba que restaura completo en una
// base SQLite local antes de dar el respaldo por bueno. Ejecutar: npm run backup
const db = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

const skip = (name: string) =>
	name.startsWith('sqlite_') || name.startsWith('_litestream') || name === 'libsql_wasm_func_table';

const escapeValue = (v: Value): string => {
	if (v === null || v === undefined) return 'NULL';
	if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'NULL';
	if (typeof v === 'bigint') return v.toString();
	if (v instanceof ArrayBuffer) return `X'${Buffer.from(v).toString('hex')}'`;
	return `'${String(v).replaceAll("'", "''")}'`;
};

const master = await db.execute(
	`SELECT name, type, sql FROM sqlite_master
	 WHERE sql IS NOT NULL
	 ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END, name`
);

const lines: string[] = [
	'-- Respaldo Turso curriculum ' + new Date().toISOString(),
	'PRAGMA foreign_keys=OFF;',
	'BEGIN;'
];
const tables: string[] = [];

for (const row of master.rows) {
	const name = String(row.name);
	if (skip(name)) continue;
	lines.push(String(row.sql).trim() + ';');
	if (row.type === 'table') tables.push(name);
}

const remoteCounts: Record<string, number> = {};
for (const t of tables) {
	const res = await db.execute(`SELECT * FROM "${t}"`);
	remoteCounts[t] = res.rows.length;
	for (const r of res.rows) {
		const vals = res.columns.map((c) => escapeValue(r[c]));
		lines.push(`INSERT INTO "${t}" VALUES (${vals.join(',')});`);
	}
}
lines.push('COMMIT;');

const stamp = new Date().toISOString().slice(0, 16).replaceAll(':', '').replace('T', '-');
mkdirSync('backups', { recursive: true });
const file = `backups/curriculum-${stamp}.sql`;
writeFileSync(file, lines.join('\n'), 'utf8');

// Verificación: restaurar en memoria y comparar recuentos tabla a tabla.
const local = new DatabaseSync(':memory:');
local.exec(lines.join('\n'));
let ok = true;
for (const t of tables) {
	const n = (local.prepare(`SELECT COUNT(*) AS n FROM "${t}"`).get() as { n: number }).n;
	if (n !== remoteCounts[t]) {
		ok = false;
		console.log(`FALLO ${t}: remoto=${remoteCounts[t]} restaurado=${n}`);
	}
}
console.log(`respaldo: ${file} (${tables.length} tablas, ${lines.length} sentencias)`);
console.log(ok ? 'verificación correcta: restaura completo' : 'VERIFICACION FALLIDA');
if (!ok) process.exit(1);
