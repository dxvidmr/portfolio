import type { PageServerLoad } from './$types';
import { getHomeData } from '$lib/server/home-data';

// Índices curados contra la vista `entries` (índice transversal). La home
// muestra todas las entradas con show_home ordenadas por su orden de portada
// y cae a actividad reciente si todavía no hay curación.
export const load: PageServerLoad = async () => getHomeData();
