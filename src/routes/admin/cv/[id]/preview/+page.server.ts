import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin/auth';
import { previewCv, exportCv } from '$lib/server/admin/cvs';
import { cvId, cvFailure } from '$lib/server/admin/cv-route';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  return { ...(await previewCv(cvId(params.id))), id: cvId(params.id) };
};
export const actions: Actions = {
  export: async ({ params, request, locals }) => {
    await requireAdmin(locals);
    const form = await request.formData();
    let exportId: number;
    try { exportId = await exportCv(cvId(params.id), Number(form.get('version'))); } catch (e) { return cvFailure(e); }
    redirect(303, `/admin/cv/${params.id}/exports/${exportId}?print=1`);
  }
};
