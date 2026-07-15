import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection, locales, baseLocale } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

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

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;
		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html.replace('%paraglide.lang%', locale).replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleRootRedirect, handleParaglide);
