import { getCvExport } from '$lib/server/admin/cvs';
import { cvId } from '$lib/server/admin/cv-route';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  return { ...(await getCvExport(cvId(params.id), cvId(params.exportId))), id: cvId(params.id), exportId: cvId(params.exportId) };
};
