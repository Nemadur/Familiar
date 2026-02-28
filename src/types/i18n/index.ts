export type Locale = {
	seo: {
		defaults: {
			title: string;
			description: string;
			keywords: string;
		};
		home: {
			title: string;
			description: string;
		};
		profile: {
			title: string;
			description: string;
		};
	};
	meta: {
		app_name: string;
		description?: string;
		keywords?: string;
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
		portfolio: {
			filters: {
				all: string;
				commissions_only: string;
			};
			folder: {
				items: string;
			};
			search_placeholder: string;
		};
		profile: {
			tabs: {
				commissions: string;
				portfolio: string;
				characters: string;
				saved: string;
				liked: string;
			};
			private_content: {
				title: string;
				description: string;
			};
			actions: {
				follow: string;
				unfollow: string;
				edit_profile: string;
				followers: string;
				following: string;
				work_queue: string;
			};
			info: {
				local_time: string;
				suspended: string;
				about_me: string;
			};
			details: {
				stats: {
					followers: string;
					following: string;
					works: string;
				};
				joined: string;
				local: string;
				bio: string;
				languages: string;
			};
			languages: {
				levels: {
					native: string;
					fluent: string;
					communicative: string;
					learning: string;
					basic: string;
				};
			};
			commissions: {
				card: {
					from: string;
					start_request: string;
					join_waitlist: string;
					get_notified: string;
					content_warning: string;
					sensitive_content: string;
					contains_tags: string;
					show_content: string;
					hide_content: string;
					show_details_18_plus: string;
					license: {
						title: string;
						info: string;
						included: string;
						personal: string;
						personal_desc: string;
						monetized: string;
						monetized_desc: string;
						commercial: string;
						commercial_desc: string;
						unavailable: string;
						other_licenses_count: string;
					};
				};
				empty: {
					title: string;
					description: string;
				};
			};
			feeds: {
				empty: {
					title: string;
					description: string;
				};
			};
		};
	};
	info_selection_modal: {
		service: {
			title: string;
			description: string;
		};
		communication: {
			title: string;
			description: string;
		};
		process: {
			title: string;
			description: string;
		};
	};
	license_info_modal: {
		title: string;
		subtitle: string;
		personal: {
			title: string;
			description: string;
			allowed: {
				personal_use: string;
			};
			forbidden: {
				monetized: string;
				commercial: string;
			};
		};
		monetized: {
			title: string;
			description: string;
			allowed: {
				personal_use: string;
				monetized_content: string;
			};
			forbidden: {
				commercial: string;
			};
		};
		commercial: {
			title: string;
			description: string;
			licensee: {
				label: string;
				value: string;
			};
			commercial_use: {
				label: string;
				allowed: {
					creation: string;
					distribution: string;
				};
				forbidden: {
					reselling: string;
				};
			};
			credit: {
				label: string;
				value: string;
			};
		};
		custom_licenses: {
			title: string;
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
