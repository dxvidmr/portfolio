import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import type { Session } from '@auth/sveltekit';
import {
	AUTH_SECRET,
	AUTH_GITHUB_ID,
	AUTH_GITHUB_SECRET,
	ADMIN_GITHUB_ID
} from '$env/static/private';

// Vercel conserva literalmente los espacios de borde de las variables de
// entorno. Normalizarlas aquí evita generar credenciales OAuth inválidas.
const authSecret = AUTH_SECRET.trim();
const githubClientId = AUTH_GITHUB_ID.trim();
const githubClientSecret = AUTH_GITHUB_SECRET.trim();
const adminGitHubId = ADMIN_GITHUB_ID.trim();

// Autenticación del dashboard privado (plan §8): GitHub OAuth con sesión JWT en
// cookie, sin adaptador de base de datos. Solo puede iniciar sesión el ID numérico
// inmutable de ADMIN_GITHUB_ID; cualquier otra cuenta de GitHub se rechaza.
export const { handle: authHandle, signIn, signOut } = SvelteKitAuth({
	secret: authSecret,
	trustHost: true,
	providers: [
		GitHub({
			clientId: githubClientId,
			clientSecret: githubClientSecret
		})
	],
	callbacks: {
		signIn: ({ profile }) => String(profile?.id) === adminGitHubId,
		jwt({ token, profile }) {
			if (profile?.id != null) token.githubId = String(profile.id);
			return token;
		},
		session({ session, token }) {
			if (session.user && typeof token.githubId === 'string') {
				session.user.githubId = token.githubId;
			}
			return session;
		}
	}
});

// Comprobación única de autorización: usarla en la guardia de hooks, en los
// layouts de /admin y dentro de cada acción de servidor sensible.
export const isAdmin = (session: Session | null): boolean =>
	session?.user?.githubId === adminGitHubId;
