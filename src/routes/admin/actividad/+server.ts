import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Ruta antigua: la selección de «Actividad reciente» se gestiona en /admin/portada.
export const GET: RequestHandler = ({ url }) => {
	redirect(308, `/admin/portada${url.search}`);
};
