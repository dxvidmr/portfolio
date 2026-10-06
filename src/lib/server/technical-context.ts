// Solo campos de contexto exportables; nunca importes, notas ni adjuntos privados.
const text = (v: unknown) => v == null ? '' : String(v);
export function technicalContext(row: Record<string, unknown>, project?: Record<string, unknown>, programme = '') {
  const linked = row.project_id != null;
  return {
    contextName: text(linked ? project?.title : row.context_name),
    contextCode: text(linked ? project?.project_code : row.context_code),
    contextProgramme: linked ? programme : text(row.context_programme),
    contextFundingBody: text(linked ? project?.funding_body : row.context_funding_body),
    contextInstitution: text(linked ? project?.institution : row.context_institution),
    contextResponsibles: text(linked ? project?.principal_investigators_text : row.context_responsibles),
    ...(linked ? { linkedProjectId: Number(row.project_id) } : {})
  };
}

// El contexto de un proyecto privado no se expone por publicar su trabajo técnico.
export const publicTechnicalContextSql = {
  joins: `LEFT JOIN entries technical_project_entry ON technical_project_entry.entity_type='projects'
    AND technical_project_entry.entity_id=technical.project_id AND technical_project_entry.public=1
    LEFT JOIN projects technical_project ON technical_project.id=technical_project_entry.entity_id
    LEFT JOIN type_vocab technical_programme ON technical_programme.code=technical_project.programme_code
    LEFT JOIN type_vocab technical_modality ON technical_modality.code=technical.modality`,
  select: `(SELECT json_group_array(json_object('title',title,'code',project_code,'institution',institution,
      'programme_es',programme_es,'programme_en',programme_en,'responsibles',principal_investigators_text))
      FROM (SELECT p.title,p.project_code,p.institution,p.principal_investigators_text,
        v.label_es AS programme_es,v.label_en AS programme_en
        FROM technical_work_projects twp JOIN projects p ON p.id=twp.project_id
        JOIN entry_controls c ON c.entity_type='projects' AND c.entity_id=p.id AND c.is_public=1
        LEFT JOIN type_vocab v ON v.code=p.programme_code
        WHERE twp.technical_work_id=technical.id ORDER BY p.date_start,p.id)) AS metadata_technical_projects,
    technical.recipient AS metadata_recipient,
    technical.contribution_es AS metadata_contribution_es, technical.contribution_en AS metadata_contribution_en,
    technical_modality.label_es AS metadata_modality_es, technical_modality.label_en AS metadata_modality_en,
    CASE WHEN technical.project_id IS NULL THEN technical.context_name ELSE technical_project.title END AS metadata_context_name,
    CASE WHEN technical.project_id IS NULL THEN technical.context_code ELSE technical_project.project_code END AS metadata_context_code,
    CASE WHEN technical.project_id IS NULL THEN technical.context_programme ELSE technical_programme.label_es END AS metadata_context_programme_es,
    CASE WHEN technical.project_id IS NULL THEN technical.context_programme ELSE technical_programme.label_en END AS metadata_context_programme_en,
    CASE WHEN technical.project_id IS NULL THEN technical.context_funding_body ELSE technical_project.funding_body END AS metadata_context_funding,
    CASE WHEN technical.project_id IS NULL THEN technical.context_institution ELSE technical_project.institution END AS metadata_context_institution,
    CASE WHEN technical.project_id IS NULL THEN technical.context_responsibles ELSE technical_project.principal_investigators_text END AS metadata_context_responsibles`
};
