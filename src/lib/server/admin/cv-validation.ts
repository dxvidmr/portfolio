import { cvEntityLabels, type CvProfile, type CvBlock, type CvSelection } from '$lib/types/cv';

const str = (value: unknown, max: number, label: string) => {
  if (typeof value !== 'string' || value.length > max) throw new Error(`${label}: texto no válido (máximo ${max} caracteres).`);
  return value.trim();
};
const skillOptions = (v:unknown) => {
  if (v == null) return {resources:[],evidence:[]};
  if (typeof v !== 'object') throw new Error('Selección de recursos no válida.');
  const o=v as Record<string,unknown>;
  const list=(x:unknown)=>{if(!Array.isArray(x)||x.length>100||x.some(k=>typeof k!=='string'||k.length>200)) throw new Error('Selección de recursos no válida.');return [...new Set(x)] as string[];};
  return {resources:list(o.resources),evidence:list(o.evidence)};
};
export function parseCv(value: unknown): Omit<CvProfile, 'id'> {
  if (!value || typeof value !== 'object') throw new Error('CV no válido.');
  const p = value as Record<string, unknown>;
  if (!Number.isSafeInteger(p.version) || Number(p.version) < 1) throw new Error('Versión no válida.');
  if (p.language !== 'es' && p.language !== 'en') throw new Error('Idioma no válido.');
  const name = str(p.name, 200, 'Nombre interno');
  const personName = str(p.personName, 200, 'Nombre');
  const title = str(p.title, 300, 'Título');
  if (!name || !personName || !title) throw new Error('Completa el nombre interno, el nombre y el título.');
  if (!Array.isArray(p.blocks) || p.blocks.length > 60) throw new Error('Máximo 60 bloques.');
  let count = 0;
  const blocks: CvBlock[] = p.blocks.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw new Error('Bloque no válido.');
    const b = raw as Record<string, unknown>;
    if (b.skillsDisplay != null && !['names','descriptions'].includes(String(b.skillsDisplay))) throw new Error('Presentación de competencias no válida.');
    if (b.kind !== 'text' && b.kind !== 'entries') throw new Error('Tipo de bloque no válido.');
    if (!Array.isArray(b.entries) || b.entries.length > 300 || (b.kind === 'text' && b.entries.length)) throw new Error('Selección no válida.');
    const seen = new Set<string>();
    const entries: CvSelection[] = b.entries.map((rawEntry, entryIndex) => {
      const e = rawEntry as Record<string, unknown>;
      if (!e || typeof e !== 'object' || typeof e.entityType !== 'string' || !Object.hasOwn(cvEntityLabels, e.entityType) || !Number.isSafeInteger(e.entityId) || Number(e.entityId) < 1) throw new Error('Referencia de mérito no válida.');
      const key = `${e.entityType}:${e.entityId}`;
      if (seen.has(key)) throw new Error('Hay méritos duplicados en un apartado.');
      seen.add(key); count++;
      const contributionMode = e.contributionMode ?? 'inherit';
      if (!['inherit','custom','hidden'].includes(String(contributionMode))) throw new Error('Modo de aportación no válido.');
      return { key: `${index}-${entryIndex}`, entityType: e.entityType as CvSelection['entityType'], entityId: Number(e.entityId), commentary: str(e.commentary, 10000, 'Comentario'),
        skillOptions: skillOptions(e.skillOptions), contributionMode: contributionMode as CvSelection['contributionMode'], contributionText: str(e.contributionText ?? '', 10000, 'Aportación adaptada') };
    });
    return { key: String(index), kind: b.kind, skillsDisplay: (b.skillsDisplay ?? 'names') as 'names'|'descriptions', title: str(b.title, 300, 'Título del bloque'), body: str(b.body, 30000, 'Texto'), entries };
  });
  if (count > 1000) throw new Error('Máximo 1000 méritos por CV.');
  const email = str(p.email ?? '', 254, 'Correo electrónico');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Correo electrónico no válido.');
  let website = str(p.website ?? '', 1000, 'Web');
  if (website) {
    try {
      const url = new URL(website.includes('://') ? website : `https://${website}`);
      if (!['https:', 'http:'].includes(url.protocol) || /\s/.test(website) || url.username || url.password) throw new Error();
      website = url.href;
    } catch { throw new Error('Web: indica una dirección http o https válida.'); }
  }
  return { name, title, personName, affiliation: str(p.affiliation, 1000, 'Afiliación'), website, position: str(p.position ?? '', 500, 'Posición'), email, language: p.language, version: Number(p.version), blocks };
}
