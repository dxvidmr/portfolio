import type { Locale } from '$lib/paraglide/runtime';

export function localeFromPathname(pathname: string): Locale {
	return pathname.startsWith('/en') ? 'en' : 'es';
}

export function localizedPath(href: string, locale: Locale): string {
	const [pathWithSearch, hash = ''] = href.split('#');
	const [pathname, search = ''] = pathWithSearch.split('?');
	const cleanPathname = pathname === '/' ? '' : pathname.replace(/\/$/, '');
	const localized = `/${locale}${cleanPathname}`;
	return `${localized || `/${locale}`}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}
