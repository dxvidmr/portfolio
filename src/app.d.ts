// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { DefaultSession } from '@auth/sveltekit';

declare global {
	namespace App {
		// interface Error {}
		// Locals.auth() lo aporta la augmentación de @auth/sveltekit.
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@auth/sveltekit' {
	interface Session {
		user?: {
			// ID numérico inmutable de GitHub, fijado en el callback jwt/session.
			githubId?: string;
		} & DefaultSession['user'];
	}
}

export {};
