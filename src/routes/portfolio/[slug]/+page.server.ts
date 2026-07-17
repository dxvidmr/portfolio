import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getHomeData } from '$lib/server/home-data';

export const load: PageServerLoad = async ({ params }) => {
	const data = await getHomeData();
	if (!data.portfolioProjects.some((project) => project.slug === params.slug)) {
		error(404, 'Elemento de portfolio no encontrado');
	}
	return data;
};
