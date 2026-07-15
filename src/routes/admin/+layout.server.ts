import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { isAdmin } from '../../auth';

// Defensa en profundidad: la guardia principal vive en hooks.server.ts y cubre
// también las acciones POST. Aquí se repite para cualquier load anidado.
export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!isAdmin(session)) {
		redirect(303, '/auth/signin?callbackUrl=/admin');
	}
	return { session };
};
