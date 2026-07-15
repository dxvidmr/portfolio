import { error } from '@sveltejs/kit';
import { isAdmin } from '../../../auth';

export async function requireAdmin(locals: App.Locals): Promise<void> {
	const session = await locals.auth();
	if (!isAdmin(session)) {
		error(403, 'No autorizado');
	}
}

