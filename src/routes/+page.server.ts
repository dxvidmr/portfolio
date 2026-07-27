import type { PageServerLoad } from './$types';
import { getHomeData } from '$lib/server/home-data';

// La selección de actividad vive en `show_home`. Su orden es cronológico por
// defecto y solo usa el orden editorial cuando se activa expresamente en admin.
export const load: PageServerLoad = async () => getHomeData();
