import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Ruta antigua: «Entradas» pasó a llamarse «Méritos» (/admin/meritos).
export const GET: RequestHandler = ({ params, url }) => {
	const path = params.path.replace(/^nueva(?=\/|$)/, 'nuevo');
	redirect(308, `/admin/meritos${path ? `/${path}` : ''}${url.search}`);
};
