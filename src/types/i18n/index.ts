export type Locale = {
	meta: {
		app_name: string;
		description: string;
		keywords: string;
		label: string;
		flag: string;
		currency: {
			value: string;
			label: string;
			symbol: string;
		};
	};
	header: {
		title: string;
		navigation: {
			home: string;
			shop: string;
			blog: string;
			users: string;
		};
		user_navigation: {
			profile: string;
			settings: string;
			logout: string;
		};
		theme: {
			toggle: string;
			light: string;
			dark: string;
			system: string;
		};
	};
	auth: {
		login: {
			title: string;
			description: string;
			cta: string;
		};
		terms_agree: {
			label: string;
			terms: string;
			and: string;
			privacy: string;
		};
		register: {
			title: string;
			description: string;
			cta: string;
			already_have_account: string;
		};
		forgot: {
			cta: string;
			title: string;
			register_question: string;
			description: string;
			submit: string;
			back_to_login: string;
			reset_password: string;
		};
		email: {
			label: string;
			placeholder: string;
		};
		invite_key: {
			label: string;
			placeholder: string;
			prefix: string;
		};
		display_name: {
			label: string;
			placeholder: string;
		};
		username: {
			label: string;
			placeholder: string;
		};
		password: {
			label: string;
			placeholder: string;
		};
		create_account: {
			cta: string;
			pending: string;
		};
		back: string;
		continue: string;
		account_type: {
			label: string;
			client_title: string;
			client_description: string;
			artist_title: string;
			artist_description: string;
			client_badge: string;
		};
	};
	pages: {
		home: {
			title: string;
		};
	};
	states: {
		empty: {
			under_construction: string;
		};
	};
	components: {
		language_select: {
			search: string;
			select: string;
		};
	};
	footer: {
		about: {
			title: string;
			description: string;
		};
		sections: {
			socials: string;
			navigation: string;
			resources: string;
		};
		links: {
			home: string;
			blog: string;
			faq: string;
			sponsors: string;
			terms: string;
			documentation: string;
		};
		copyright: {
			rights: string;
			made_with: string;
		};
	};
};
