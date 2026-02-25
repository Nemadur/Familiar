import type { Locale } from "@/types/i18n";

const pl: Locale = {
	seo: {
		defaults: {
			title: "Familiar",
			description: "Twoja artystyczna przystań",
			keywords: "sztuka, familiar, zlecenia",
		},
		home: {
			title: "Witamy w Familiar",
			description: "Twoja artystyczna przystań",
		},
		profile: {
			title: "Profil (@{{username}})",
			description: "Profil użytkownika @{{username}}",
		},
	},
	meta: {
		app_name: "Familiar",
		label: "Polski",
		flag: "🇵🇱",
		currency: {
			value: "PLN",
			label: "PLN",
			symbol: "zł",
		},
	},
	header: {
		title: "$t(meta.app_name)",
		navigation: {
			home: "Strona główna",
			shop: "Sklep",
			blog: "Blog",
			users: "Użytkownicy",
		},
		user_navigation: {
			profile: "Profil",
			settings: "Ustawienia",
			logout: "Wyloguj",
		},
		theme: {
			toggle: "Zmień motyw",
			light: "Jasny",
			dark: "Ciemny",
			system: "Systemowy",
		},
	},
	auth: {
		login: {
			cta: "Zaloguj",
			title: "Witaj ponownie",
			description: "Zaloguj się do swojego konta, aby kontynuować",
		},
		terms_agree: {
			label: "Rejestrjąc się w $t(header.title), akceptujesz nasz",
			terms: "Regulamin",
			and: "i",
			privacy: "Politykę Prywatności",
		},
		register: {
			cta: "Zarejestruj",
			title: "Utwórz konto",
			description: "Wprowadź swoje dane poniżej, aby utworzyć konto",
			already_have_account: "Posiadasz już konto?",
		},
		forgot: {
			cta: "Zapomniałeś hasła?",
			title: "Zapomniałeś hasła?",
			register_question: "Nie masz konta?",
			description: "Wprowadź swój email, aby zresetować hasło",
			submit: "Wyślij link resetowania",
			back_to_login: "Wróć do Logowania",
			reset_password: "Resetuj Hasło",
		},
		email: {
			label: "Email",
			placeholder: "example@familiar.art",
		},
		back: "Wróć",
		continue: "Kontynuuj",
		invite_key: {
			label: "Klucz zaproszeniowy",
			placeholder: "FAM-xxxx-xxxx-xxx",
			prefix: "FAM-",
		},
		display_name: {
			label: "Twoja Nazwa",
			placeholder: "Twoje Nazwa",
		},
		username: {
			label: "Nazwa Użytkownika",
			placeholder: "nazwa_uzytkownika",
		},
		password: {
			label: "Hasło",
			placeholder: "Haslo",
		},
		create_account: {
			cta: "Utwórz Konto",
			pending: "Tworzenie Konta...",
		},
		account_type: {
			label: "Typ Konta",
			client_title: "Konto Klienta",
			client_description: "Dla osób szukających połączeń z artystami.",
			artist_title: "Konto Artysty",
			artist_description: "Dla artystów szukających połączeń z klientami.",
			client_badge: "Domyślne",
		},
	},
	pages: {
		home: {
			title: "Witamy u Familiara - Twoja artystyczna przystań",
		},
	},
	states: {
		empty: {
			under_construction: "W budowie",
		},
	},
	components: {
		language_select: {
			search: "Szukaj języka",
			select: "Wybierz język",
		},
		portfolio: {
			filters: {
				all: "Wszystkie",
				commissions_only: "Tylko zlecenia",
			},
			folder: {
				items: "{{count}} elementów",
			},
			search_placeholder: "Szukaj folderów...",
		},
		profile: {
			tabs: {
				commissions: "Zlecenia",
				portfolio: "Portfolio",
				characters: "Postacie",
				saved: "Zapisane",
				liked: "Polubione",
			},
			private_content: {
				title: "Ta zawartość jest prywatna",
				description: "Nie masz uprawnień do wyświetlania tej zawartości.",
			},
			actions: {
				follow: "Obserwuj",
				unfollow: "Przestań obserwować",
				edit_profile: "Edytuj profil",
				followers: "Obserwujący",
				following: "Obserwowani",
				work_queue: "Kolejka prac",
			},
			info: {
				local_time: "Czas lokalny",
				suspended: "To konto jest zawieszone.",
				about_me: "O mnie",
			},
			details: {
				stats: {
					followers: "Obserwujący",
					following: "Obserwowani",
					works: "Prace",
				},
				joined: "Dołączył(a)",
				local: "lokalnie",
				bio: "Biografia",
				languages: "Języki",
			},
			languages: {
				levels: {
					native: "Ojczysty",
					fluent: "Biegły",
					communicative: "Komunikatywny",
					learning: "Uczący się",
					basic: "Podstawowy",
				},
			},
			commissions: {
				card: {
					from: "Od",
					start_request: "Zleć",
					join_waitlist: "Dołącz do kolejki",
					get_notified: "Powiadom mnie",
					content_warning: "Treść wrażliwa",
					sensitive_content: "Treść wrażliwa",
					contains_tags: "Ten materiał zawiera {{tags}}",
					show_content: "Pokaż",
					hide_content: "Ukryj",
				},
				empty: {
					title: "Brak zleceń",
					description: "Ten użytkownik nie utworzył jeszcze żadnych zleceń.",
				},
			},
			feeds: {
				empty: {
					title: "Brak zawartości",
					description: "Ten użytkownik jeszcze nic nie opublikował.",
				},
			},
		},
	},
	footer: {
		about: {
			title: "$t(meta.app_name)",
			description:
				"$t(meta.app_name) to platforma społecznościowa dla artystów, aby łączyć się ze sobą.",
		},
		sections: {
			socials: "Sociale",
			navigation: "Nawigacja",
			resources: "Zasoby",
		},
		links: {
			home: "Strona główna",
			blog: "Blog",
			faq: "FAQ",
			sponsors: "Sponsorzy",
			terms: "Regulamin",
			documentation: "Dokumentacja",
		},
		copyright: {
			rights: "Wszelkie prawa zastrzeżone",
			made_with: "Stworzone z ❤️",
		},
	},
};

export default pl;
