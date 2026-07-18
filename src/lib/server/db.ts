import { createClient } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

// Cliente libSQL (Turso). Vive bajo $lib/server: SvelteKit garantiza que nunca
// se incluya en el bundle de cliente. Usar solo en +page.server.ts / +server.ts / hooks.
// Tras una migración DDL ejecutada fuera de la aplicación, el servidor debe
// recargar este módulo para que la sesión libSQL vea el esquema actualizado.
export const db = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});
