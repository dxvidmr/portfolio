export const cvEntityLabels = {
  projects: 'Proyectos', technical_works: 'Trabajos técnicos y profesionales', publications: 'Publicaciones', talks: 'Contribuciones a eventos',
  teaching: 'Docencia', research_stays: 'Estancias', education: 'Formación',
  funding_awards: 'Financiación y premios', academic_works: 'Trabajos académicos',
  courses: 'Cursos', memberships: 'Asociaciones', skills: 'Competencias',
  languages: 'Idiomas', service_activities: 'Servicio académico'
} as const;
export type CvEntityType = keyof typeof cvEntityLabels;
export type CvSelection = { key: string; entityType: CvEntityType; entityId: number; commentary: string;
  contributionMode?: 'inherit' | 'custom' | 'hidden'; contributionText?: string; skillOptions?: {resources:string[];evidence:string[]} };
export type CvBlock = { key: string; kind: 'text' | 'entries'; title: string; body: string; entryScope?: 'merits'|'skills'; skillsDisplay?: 'names'|'descriptions'; entries: CvSelection[] };
export type CvProfile = {
  id: number; version: number; name: string; title: string; personName: string;
  affiliation: string; website: string; position: string; email: string; language: 'es' | 'en'; blocks: CvBlock[];
};
export type CvPresentation =
  | { kind: 'responsibility'; organization: string; role: string }
  | { kind: 'eventOrganization'; role: string; venue: string; dates: string }
  | { kind: 'funding'; awardType: string; awardingBody: string; context: string; amount?: number | null; currency?: string }
  | { kind: 'skill'; area: string; resources: {key:string;label:string}[]; evidence: {key:string;label:string;url:string}[] }
  | { kind: 'education'; year: string; dateBasis: 'start' | 'end'; ongoing: boolean; expected?: boolean }
  | { kind: 'publication'; authors: string; editors: string; publicationType: string;
      container: string; publisher: string; volume: string; issue: string; pages: string }
  | { kind: 'talk'; authors: string; contributionType: string; selectionMode: string;
      event: string; institution: string; city: string; sessionFormat: string; sessionTitle: string }
  | { kind: 'project'; role: string; institution: string; code: string; principalInvestigators: string; description: string; programme?: string; nature?: string }
  | { kind: 'technical'; workType: string; modality: string; recipient: string;
      contextName: string; contextCode: string; contextProgramme: string; contextFundingBody: string;
      contextInstitution: string; contextResponsibles: string; linkedProjectId?: number;
      projects?: { title: string; code: string; programme: string; institution: string; fundingBody: string; responsibles: string }[] };
export type CvEntry = {
  key: string; entityType: CvEntityType; entityId: number; title: string;
  detail: string; date: string; sortDate: string; url: string; isPublic: boolean;
  presentation?: CvPresentation;
  contribution?: string;
};
export type CvSnapshot = {
  name: string; title: string; personName: string; language: 'es' | 'en';
  affiliation?: string; website?: string; contact?: string;
  position?: string; email?: string;
  generatedAt: string; profileVersion: number;
  blocks: { key: string; kind: 'text' | 'entries'; title: string; body: string; skillsDisplay?: 'names'|'descriptions';
    entries: (CvEntry & { commentary: string })[] }[];
};
