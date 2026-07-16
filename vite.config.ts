import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			// Locale desde la URL: /es/... y /en/... (ambos prefijados siempre).
			strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
			urlPatterns: [
				// /admin y /auth quedan fuera de la localización (se mapean a sí mismos):
				// sin esto, la estrategia `url` redirigiría /admin a /es/admin y rompería
				// el callback OAuth. Deben ir antes del patrón general.
				{
					pattern: '/admin/:path(.*)?',
					localized: [
						['es', '/admin/:path(.*)?'],
						['en', '/admin/:path(.*)?']
					]
				},
				{
					pattern: '/auth/:path(.*)?',
					localized: [
						['es', '/auth/:path(.*)?'],
						['en', '/auth/:path(.*)?']
					]
				},
				{
					pattern: '/:path(.*)?',
					localized: [
						['es', '/es/:path(.*)?'],
						['en', '/en/:path(.*)?']
					]
				}
			]
		})
	]
});
