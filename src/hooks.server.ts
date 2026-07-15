import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection, locales, baseLocale } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { authHandle, isAdmin } from './auth';

// La raíz `/` no está localizada (ambos idiomas van prefijados): redirige a /es o /en.
const handleRootRedirect: Handle = ({ event, resolve }) => {
	if (event.url.pathname === '/') {
		const cookie = event.cookies.get('PARAGLIDE_LOCALE');
		const accept = event.request.headers.get('accept-language') ?? '';
		const preferred = accept.toLowerCase().startsWith('en') ? 'en' : baseLocale;
		const locale = (locales as readonly string[]).includes(cookie ?? '') ? cookie : preferred;
		redirect(307, `/${locale}${event.url.search}`);
	}
	return resolve(event);
};

// noindex de /admin y /auth a nivel de cabecera. Debe ir ANTES del handler de
// Auth.js en la sequence: Auth.js responde /auth/* sin llamar a resolve(), y solo
// los handles anteriores ven esas respuestas al burbujear de vuelta.
const handleNoindex: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	const path = event.url.pathname;
	if (path === '/admin' || path.startsWith('/admin/') || path === '/auth' || path.startsWith('/auth/')) {
		// Auth.js puede devolver Response.redirect(), cuyas cabeceras son
		// inmutables. Crear una respuesta nueva conserva la redirección y permite
		// añadir noindex sin provocar `TypeError: immutable`.
		const headers = new Headers(response.headers);
		headers.set('X-Robots-Tag', 'noindex, nofollow');
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers
		});
	}
	return response;
};

// Guardia única de /admin (plan §8): toda petición bajo el prefijo exige la sesión
// del administrador; se ejecuta también para acciones POST, que no pasan por los
// load de layout. Los layouts de /admin repiten la comprobación como defensa en
// profundidad.
const handleAdminGuard: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname;
	if (path === '/admin' || path.startsWith('/admin/')) {
		const session = await event.locals.auth();
		if (!isAdmin(session)) {
			redirect(303, `/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
		}
	}
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(
	handleRootRedirect,
	handleNoindex,
	authHandle,
	handleAdminGuard,
	handleParaglide
);
