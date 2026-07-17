export type EntryMetadata =
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
	  }
	| {
			kind: 'plain';
			text: string;
	  };
