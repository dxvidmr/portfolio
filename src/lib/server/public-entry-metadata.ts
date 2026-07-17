import type { EntryMetadata } from '$lib/types/entry-metadata';

const nullable = (value: unknown) => (value == null || String(value).trim() === '' ? null : String(value));

const fundingFromRow = (value: unknown) => {
	if (typeof value !== 'string' || value === '') return [];
	try {
		const parsed = JSON.parse(value) as Array<Record<string, unknown>>;
		return parsed.map((funding) => ({
			type: nullable(funding.type),
			type_label_es: nullable(funding.type_label_es),
			type_label_en: nullable(funding.type_label_en),
			awarding_body: nullable(funding.awarding_body),
			title: String(funding.title)
		}));
	} catch {
		return [];
	}
};

export const entryMetadataFromRow = (row: Record<string, unknown>): EntryMetadata | null => {
	const entityType = String(row.entity_type);
	if (entityType === 'publications') {
		const bookTitle = nullable(row.metadata_book_title);
		const journalTitle = nullable(row.metadata_journal_title);
		const metadata: EntryMetadata = {
			kind: 'publication',
			authors: nullable(row.metadata_authors),
			my_role: nullable(row.metadata_my_role),
			publication_type: nullable(row.metadata_publication_type),
			container_type_label_es: nullable(row.metadata_container_type_label_es),
			container_type_label_en: nullable(row.metadata_container_type_label_en),
			conference_format_label_es: nullable(row.metadata_conference_format_label_es),
			conference_format_label_en: nullable(row.metadata_conference_format_label_en),
			review_status_label_es: nullable(row.metadata_review_status_label_es),
			review_status_label_en: nullable(row.metadata_review_status_label_en),
			container_title: bookTitle ?? journalTitle,
			container_kind: bookTitle ? 'book' : journalTitle ? 'journal' : null,
			editors: nullable(row.metadata_editors),
			publisher: nullable(row.metadata_publisher),
			volume: nullable(row.metadata_volume),
			issue: nullable(row.metadata_issue),
			pages: nullable(row.metadata_pages)
		};
		return Object.values(metadata).some((value) => value != null && value !== 'publication')
			? metadata
			: null;
	}
	if (entityType === 'talks') {
		const metadata: EntryMetadata = {
			kind: 'event',
			authors: nullable(row.metadata_authors),
			event_title: nullable(row.metadata_event_title),
			institution: nullable(row.metadata_institution),
			city: nullable(row.metadata_city),
			country: nullable(row.metadata_country),
			selection_label_es: nullable(row.metadata_selection_label_es),
			selection_label_en: nullable(row.metadata_selection_label_en),
			session_label_es: nullable(row.metadata_session_label_es),
			session_label_en: nullable(row.metadata_session_label_en),
			session_title: nullable(row.metadata_session_title)
		};
		return Object.values(metadata).some((value) => value != null && value !== 'event')
			? metadata
			: null;
	}
	const detail = nullable(row.detail);
	if (entityType === 'research_stays') {
		const funding = fundingFromRow(row.metadata_funding);
		return detail || funding.length > 0 ? { kind: 'stay', text: detail, funding } : null;
	}
	return detail ? { kind: 'plain', text: detail } : null;
};

export const publicFundingMetadataSql = (entityRef: 'e' | 'pi' | 'r') => {
	const entityIdColumn = entityRef === 'r' ? 'id' : 'entity_id';
	return `(
	SELECT COALESCE(json_group_array(json_object(
		'type', funding.award_type,
		'type_label_es', funding_type.label_es,
		'type_label_en', funding_type.label_en,
		'awarding_body', funding.awarding_body,
		'title', funding.title
	)), '[]')
	FROM funding_relations AS funding_relation
	JOIN funding_awards AS funding
	  ON funding.id = funding_relation.funding_award_id
	JOIN entries AS funding_entry
	  ON funding_entry.entity_type = 'funding_awards'
	 AND funding_entry.entity_id = funding.id
	 AND funding_entry.public = 1
	LEFT JOIN type_vocab AS funding_type
	  ON funding_type.code = funding.award_type
	WHERE funding_relation.entity_type = 'research_stays'
	  AND funding_relation.entity_id = ${entityRef}.${entityIdColumn}
	  AND funding_relation.relation_kind = 'supports'
)`;
};

// Proyección compartida para presentar entradas públicas en listados editoriales.
// `entityRef` debe ser un alias SQL conocido y controlado por el servidor.
export const publicEntryMetadataSql = (entityRef: 'e' | 'pi') => ({
	select: `COALESCE(
		         pub.publication_type,
		         event.contribution_type,
		         work.work_type,
		         teaching.teaching_type,
		         research_project.project_type,
		         service.activity_type,
		         award.award_type
		       ) AS subtype,
		       tv.label_es AS subtype_label_es,
		       tv.label_en AS subtype_label_en,
		       COALESCE(pub.authors_text, event.authors_text) AS metadata_authors,
		       pub.my_role AS metadata_my_role,
		       pub.publication_type AS metadata_publication_type,
		       container_type.label_es AS metadata_container_type_label_es,
		       container_type.label_en AS metadata_container_type_label_en,
		       conference_format.label_es AS metadata_conference_format_label_es,
		       conference_format.label_en AS metadata_conference_format_label_en,
		       review_status.label_es AS metadata_review_status_label_es,
		       review_status.label_en AS metadata_review_status_label_en,
		       pub.editors_text AS metadata_editors,
		       pub.journal_title AS metadata_journal_title,
		       pub.book_title AS metadata_book_title,
		       pub.publisher AS metadata_publisher,
		       pub.volume AS metadata_volume,
		       pub.issue AS metadata_issue,
		       pub.pages AS metadata_pages,
		       canonical_event.title AS metadata_event_title,
		       canonical_event.institution AS metadata_institution,
		       canonical_event.city AS metadata_city,
		       canonical_event.country AS metadata_country,
		       contribution_selection.label_es AS metadata_selection_label_es,
		       contribution_selection.label_en AS metadata_selection_label_en,
		       session_format.label_es AS metadata_session_label_es,
		       session_format.label_en AS metadata_session_label_en,
		       event.session_title AS metadata_session_title,
		       ${publicFundingMetadataSql(entityRef)} AS metadata_funding,
		       CASE
		         WHEN ${entityRef}.entity_type = 'publications' THEN
		           CASE
		             WHEN NULLIF(TRIM(pub.journal_title), '') IS NOT NULL
		               THEN pub.journal_title
		             WHEN NULLIF(TRIM(pub.book_title), '') IS NOT NULL
		               THEN pub.book_title ||
		                 CASE
		                   WHEN NULLIF(TRIM(pub.publisher), '') IS NOT NULL
		                     THEN ' · ' || pub.publisher
		                   ELSE ''
		                 END
		             ELSE NULLIF(TRIM(pub.publisher), '')
		           END
		         WHEN ${entityRef}.entity_type = 'talks' THEN
		           canonical_event.title ||
		             CASE
		               WHEN NULLIF(TRIM(canonical_event.institution), '') IS NOT NULL
		                 AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.institution)) = 0
		                 THEN ' · ' || canonical_event.institution
		               ELSE ''
		             END ||
		             CASE
		               WHEN NULLIF(TRIM(canonical_event.city), '') IS NOT NULL
		                 AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.city)) = 0
		                 THEN ' · ' || canonical_event.city
		               ELSE ''
		             END ||
		             CASE
		               WHEN NULLIF(TRIM(canonical_event.country), '') IS NOT NULL
		                 AND INSTR(LOWER(canonical_event.title), LOWER(canonical_event.country)) = 0
		                 THEN ' · ' || canonical_event.country
		               ELSE ''
		             END
		         WHEN ${entityRef}.entity_type = 'service_activities' THEN
		           COALESCE(canonical_service_event.title, service.venue_or_journal)
		         WHEN ${entityRef}.entity_type = 'research_stays' THEN
		           COALESCE(stay.faculty_or_dept, stay.city, stay.country)
		         ELSE COALESCE(
		           work.institution,
		           teaching.institution,
		           research_project.research_group,
		           research_project.institution,
		           service.venue_or_journal,
		           education.institution,
		           course.institution,
		           award.awarding_body,
		           membership.role,
		           skill.items_text,
		           language.level
		         )
		       END AS detail,
		       COALESCE(
		         pub.url,
		         event.url,
		         canonical_event.url,
		         work.url,
		         teaching.url,
		         research_project.url,
		         service.url,
		         canonical_service_event.url,
		         education.url,
		         stay.url,
		         course.url,
		         award.url
		       ) AS url`,
	joins: `LEFT JOIN publications pub
		         ON ${entityRef}.entity_type = 'publications' AND pub.id = ${entityRef}.entity_id
		       LEFT JOIN type_vocab container_type
		         ON container_type.code = pub.container_type
		       LEFT JOIN type_vocab conference_format
		         ON conference_format.code = pub.conference_publication_format
		       LEFT JOIN type_vocab review_status
		         ON review_status.code = pub.review_status
		       LEFT JOIN talks event
		         ON ${entityRef}.entity_type = 'talks' AND event.id = ${entityRef}.entity_id
		       LEFT JOIN events canonical_event
		         ON canonical_event.id = event.canonical_event_id
		       LEFT JOIN type_vocab contribution_selection
		         ON contribution_selection.code = event.selection_mode
		       LEFT JOIN type_vocab session_format
		         ON session_format.code = event.session_format
		       LEFT JOIN academic_works work
		         ON ${entityRef}.entity_type = 'academic_works' AND work.id = ${entityRef}.entity_id
		       LEFT JOIN teaching
		         ON ${entityRef}.entity_type = 'teaching' AND teaching.id = ${entityRef}.entity_id
		       LEFT JOIN projects research_project
		         ON ${entityRef}.entity_type = 'projects' AND research_project.id = ${entityRef}.entity_id
		       LEFT JOIN service_activities service
		         ON ${entityRef}.entity_type = 'service_activities' AND service.id = ${entityRef}.entity_id
		       LEFT JOIN events canonical_service_event
		         ON canonical_service_event.id = service.canonical_event_id
		       LEFT JOIN education
		         ON ${entityRef}.entity_type = 'education' AND education.id = ${entityRef}.entity_id
		       LEFT JOIN research_stays stay
		         ON ${entityRef}.entity_type = 'research_stays' AND stay.id = ${entityRef}.entity_id
		       LEFT JOIN courses course
		         ON ${entityRef}.entity_type = 'courses' AND course.id = ${entityRef}.entity_id
		       LEFT JOIN funding_awards award
		         ON ${entityRef}.entity_type = 'funding_awards' AND award.id = ${entityRef}.entity_id
		       LEFT JOIN memberships membership
		         ON ${entityRef}.entity_type = 'memberships' AND membership.id = ${entityRef}.entity_id
		       LEFT JOIN skills skill
		         ON ${entityRef}.entity_type = 'skills' AND skill.id = ${entityRef}.entity_id
		       LEFT JOIN languages language
		         ON ${entityRef}.entity_type = 'languages' AND language.id = ${entityRef}.entity_id
		       LEFT JOIN type_vocab tv
		         ON tv.code = COALESCE(
		           pub.publication_type,
		           event.contribution_type,
		           work.work_type,
		           teaching.teaching_type,
		           research_project.project_type,
		           service.activity_type,
		           award.award_type
		         )`
});
