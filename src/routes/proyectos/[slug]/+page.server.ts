import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { findProject } from '$lib/content/projects';
import { getHomeData } from '$lib/server/home-data';

export const load: PageServerLoad = async ({ params }) => {
	const project = findProject(params.slug);
	if (!project) error(404, 'Proyecto no encontrado');

	return getHomeData();
};
