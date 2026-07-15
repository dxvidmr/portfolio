import { createClient } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from '$env/static/private';

// Cliente libSQL (Turso). Vive bajo $lib/server: SvelteKit garantiza que nunca
// se incluya en el bundle de cliente. Usar solo en +page.server.ts / +server.ts / hooks.
export const db = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
});
