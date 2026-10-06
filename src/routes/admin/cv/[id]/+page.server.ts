import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin/auth';
import { getCv, getCvCatalog, getCvExports, saveCv, deleteCv } from '$lib/server/admin/cvs';
import { cvId, cvFailure } from '$lib/server/admin/cv-route';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ params, setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  const id = cvId(params.id);
  const cv = await getCv(id);
  return { cv, catalog: await getCvCatalog(undefined, cv.language), exports: await getCvExports(id) };
};
export const actions: Actions = {
  save: async ({ request, params, locals }) => {
    await requireAdmin(locals);
    const form = await request.formData();
    try {
      const payload = String(form.get('cv') || '');
      if (payload.length > 2_000_000) throw new Error('CV demasiado extenso.');
      await saveCv(cvId(params.id), JSON.parse(payload));
      return { success: true, message: 'CV guardado.' };
    } catch (e) { return cvFailure(e); }
  },
  delete: async ({ request, params, locals }) => {
    await requireAdmin(locals);
    const form = await request.formData();
    try {
      if (form.get('confirm') !== 'ELIMINAR') throw new Error('Escribe ELIMINAR para confirmar.');
      await deleteCv(cvId(params.id), Number(form.get('version')));
    } catch (e) { return cvFailure(e); }
    redirect(303, '/admin/cv');
  }
};
