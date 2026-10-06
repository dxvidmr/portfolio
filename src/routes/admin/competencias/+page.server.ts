import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { requireAdmin } from '$lib/server/admin/auth';
import { getSkillDetails } from '$lib/server/skills';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({locals,setHeaders}) => {
  await requireAdmin(locals);
  setHeaders({'cache-control':'private, no-store'});
  const [skills,resources,details]=await Promise.all([
    db.execute(`SELECT s.*,v.label_es AS area_label,c.is_public FROM skills s
      JOIN type_vocab v ON v.code=s.area LEFT JOIN entry_controls c ON c.entity_type='skills' AND c.entity_id=s.id
      ORDER BY v.sort_order,s.sort_order,s.name_es`),
    db.execute(`SELECT r.*,(SELECT COUNT(*) FROM skill_resource_links l WHERE l.resource_id=r.id) AS uses FROM skill_resources r ORDER BY name_es`),
    getSkillDetails()
  ]);
  return {skills:skills.rows.map(r=>({id:Number(r.id),name:String(r.name_es),description:String(r.description_es),area:String(r.area_label),isPublic:Number(r.is_public)===1,details:details.get(Number(r.id))})),
    resources:resources.rows.map(r=>({id:Number(r.id),name:String(r.name_es),nameEn:String(r.name_en || ''),nature:String(r.nature),uses:Number(r.uses)}))};
};
const natures=['method','standard','language','tool','platform'];
export const actions: Actions = {
  guardarRecurso: async ({locals,request}) => {
    await requireAdmin(locals);
    const f=await request.formData();
    const id=Number(f.get('id') || 0);
    const name=String(f.get('name') || '').trim(),nameEn=String(f.get('nameEn') || '').trim(),nature=String(f.get('nature') || '');
    if (!name || name.length>200 || nameEn.length>200 || !natures.includes(nature) || !Number.isSafeInteger(id) || id<0) return fail(400,{message:'Revisa el nombre y la naturaleza del recurso.'});
    try {
      if (id) await db.execute({sql:'UPDATE skill_resources SET name_es=?,name_en=?,nature=? WHERE id=?',args:[name,nameEn || null,nature,id]});
      else await db.execute({sql:'INSERT INTO skill_resources(name_es,name_en,nature) VALUES(?,?,?)',args:[name,nameEn || null,nature]});
      return {message:'Recurso guardado.'};
    } catch {return fail(409,{message:'No se pudo guardar. Comprueba que el nombre no esté duplicado.'});}
  },
  eliminarRecurso: async ({locals,request}) => {
    await requireAdmin(locals);
    const id=Number((await request.formData()).get('id'));
    if (!Number.isSafeInteger(id) || id<=0) return fail(400,{message:'Recurso no válido.'});
    const res=await db.execute({sql:'DELETE FROM skill_resources WHERE id=? AND NOT EXISTS(SELECT 1 FROM skill_resource_links WHERE resource_id=?)',args:[id,id]});
    return res.rowsAffected ? {message:'Recurso eliminado.'} : fail(409,{message:'Desvincula el recurso de sus capacidades antes de eliminarlo.'});
  }
};
