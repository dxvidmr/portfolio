import { redirect } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/admin/auth';
import { createCv, listCvs } from '$lib/server/admin/cvs';
import { cvFailure, cvId } from '$lib/server/admin/cv-route';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ setHeaders }) => {
  setHeaders({ 'cache-control': 'private, no-store' });
  return { cvs: await listCvs() };
};
export const actions: Actions = {
  create: async ({ request, locals }) => {
    await requireAdmin(locals);
    const form = await request.formData();
    let id: number;
    try { id = await createCv(String(form.get('name') || '')); } catch (e) { return cvFailure(e); }
    redirect(303, `/admin/cv/${id}`);
  },
  duplicate: async ({ request, locals }) => {
    await requireAdmin(locals);
    const form = await request.formData();
    let id: number;
    try { id = await createCv(String(form.get('name') || ''), cvId(String(form.get('id')))); } catch (e) { return cvFailure(e); }
    redirect(303, `/admin/cv/${id}`);
  }
};
