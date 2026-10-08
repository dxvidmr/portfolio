import { db } from '$lib/server/db';
import type { Client, Transaction } from '@libsql/client';

type Reader = Pick<Client | Transaction, 'execute' | 'batch'>;
export type SkillDetails = {
  resources: { key: string; label: string; labelEn: string }[];
  evidence: { key: string; label: string; labelEn: string; url: string; adminUrl: string }[];
};
const safeUrl = (raw: unknown) => {
  try { const url = new URL(String(raw)); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; }
  catch { return ''; }
};

// Shared live catalogue for admin, public website and CV. Public views exclude
// private merits and unpublished portfolio examples; private CVs can select both.
export async function getSkillDetails(reader: Reader = db, language: 'es' | 'en' = 'es', publicOnly = false) {
  const queries = [
    `SELECT l.skill_id,r.id,r.name_es,r.name_en FROM skill_resource_links l
     JOIN skill_resources r ON r.id=l.resource_id ORDER BY r.name_es`,
    `SELECT l.skill_id,l.entity_type,l.entity_id,e.title_cache,
       COALESCE(t.url,p.url,talk.url,project.url,course.url,teaching.url,'') AS url
     FROM skill_evidence_links l JOIN entries e ON e.entity_type=l.entity_type AND e.entity_id=l.entity_id
     LEFT JOIN technical_works t ON l.entity_type='technical_works' AND t.id=l.entity_id
     LEFT JOIN publications p ON l.entity_type='publications' AND p.id=l.entity_id
     LEFT JOIN talks talk ON l.entity_type='talks' AND talk.id=l.entity_id
     LEFT JOIN projects project ON l.entity_type='projects' AND project.id=l.entity_id
     LEFT JOIN courses course ON l.entity_type='courses' AND course.id=l.entity_id
     LEFT JOIN teaching teaching ON l.entity_type='teaching' AND teaching.id=l.entity_id
     WHERE ${publicOnly ? 'e.public=1' : '1=1'} ORDER BY e.sort_date DESC,e.title_cache`,
    `SELECT l.skill_id,p.slug,p.title_es,p.title_en FROM skill_portfolio_links l
     JOIN portfolio_projects p ON p.slug=l.portfolio_slug
     WHERE ${publicOnly ? "p.publication_status='published'" : '1=1'} ORDER BY p.sort_order,p.slug`
  ];
  const sets = reader === db ? await db.batch(queries, 'read') : await reader.batch(queries);
  const result = new Map<number,SkillDetails>();
  const get = (id: unknown) => {
    const key=Number(id);
    if (!result.has(key)) result.set(key,{resources:[],evidence:[]});
    return result.get(key)!;
  };
  for (const r of sets[0].rows) get(r.skill_id).resources.push({key:String(r.id),label:String(language==='en' ? r.name_en || r.name_es : r.name_es),labelEn:String(r.name_en || r.name_es)});
  for (const r of sets[1].rows) get(r.skill_id).evidence.push({key:`${r.entity_type}:${r.entity_id}`,label:String(r.title_cache),labelEn:String(r.title_cache),url:safeUrl(r.url),adminUrl:`/admin/meritos/${r.entity_type}/${r.entity_id}`});
  for (const r of sets[2].rows) get(r.skill_id).evidence.push({key:`portfolio:${r.slug}`,label:String(language==='en' ? r.title_en : r.title_es),labelEn:String(r.title_en),url:`https://davidmerinorecalde.com/${language}/portfolio/${r.slug}`,adminUrl:`/admin/portfolio/${r.slug}`});
  return result;
}
