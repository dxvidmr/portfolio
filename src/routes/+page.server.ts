import type { PageServerLoad } from './$types';
import { getHomeData } from '$lib/server/home-data';

// Índices curados directamente contra `entries` (índice transversal). La home
// prioriza featured/show_home y cae a reciente si todavía no hay curación.
export const load: PageServerLoad = async () => getHomeData();
