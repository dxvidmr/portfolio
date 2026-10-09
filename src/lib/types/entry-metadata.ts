export type EntryMetadata =
	| { kind: 'professional'; recipient: string | null;
		projects?: {title:string;code:string|null;institution:string|null;programme_es:string|null;programme_en:string|null;responsibles:string|null}[];
		modality_es: string | null; modality_en: string | null;
		contribution_es: string | null; contribution_en: string | null;
		context_name: string | null; context_code: string | null;
		context_programme_es: string | null; context_programme_en: string | null;
		context_funding: string | null; context_institution: string | null; context_responsibles: string | null }
	| { kind: 'project'; institution: string | null; code: string | null; investigators: string | null;
		role_es: string | null; role_en: string | null; programme_es: string | null; programme_en: string | null;
		nature_es: string | null; nature_en: string | null; contribution_es: string | null; contribution_en: string | null }
	| {
			kind: 'publication';
			authors: string | null;
			my_role: string | null;
			publication_type: string | null;
			container_type_label_es: string | null;
			container_type_label_en: string | null;
			conference_format_label_es: string | null;
			conference_format_label_en: string | null;
			review_status_label_es: string | null;
			review_status_label_en: string | null;
			container_title: string | null;
			container_kind: 'book' | 'journal' | null;
			editors: string | null;
			publisher: string | null;
			volume: string | null;
			issue: string | null;
			pages: string | null;
	  }
	| {
			kind: 'event';
			authors: string | null;
			event_title: string | null;
			institution: string | null;
			city: string | null;
			country: string | null;
			selection_label_es: string | null;
			selection_label_en: string | null;
			session_label_es: string | null;
			session_label_en: string | null;
			session_title: string | null;
			date_start?: string | null;
			date_end?: string | null;
			invited?: boolean;
	  }
	| {
			kind: 'stay';
			text: string | null;
			funding: Array<{
				type: string | null;
				type_label_es: string | null;
				type_label_en: string | null;
				awarding_body: string | null;
				title: string;
			}>;
			date_start?: string | null;
			date_end?: string | null;
			supervisor?: string | null;
			city?: string | null;
	  }
	| {
			kind: 'plain';
			text: string;
	  };
