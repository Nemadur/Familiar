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
			success: "Zalogowano pomyślnie",
			pending: "Logowanie...",
		},
		terms_agree: {
			label: "Rejestrjąc się w $t(header.title), akceptujesz nasz ",
			terms: "Regulamin",
			and: " i ",
			privacy: "Politykę Prywatności",
		},
		register: {
			cta: "Zarejestruj",
			title: "Utwórz konto",
			description: "Wprowadź swoje dane poniżej, aby utworzyć konto",
			already_have_account: "Posiadasz już konto?",
			success: "Konto utworzone pomyślnie",
			pending: "Tworzenie konta...",
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
			placeholder: "FAM-XXXX-XXXX-XXX",
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
		},
		errors: {
			rate_limit: "Zbyt wiele prób. Spróbuj ponownie później.",
			invalid_credentials: "Nieprawidłowy email lub hasło",
			registration_failed: "Rejestracja nie powiodła się: {{error}}",
			login_failed: "Logowanie nie powiodło się: {{error}}",
			logout_failed: "Wylogowanie nie powiodło się: {{error}}",
			create_profile_failed:
				"Nie udało się utworzyć profilu użytkownika: {{error}}",
			auth_session_missing: "Brak sesji uwierzytelniania!",
			user_authenticated_not_found:
				"Użytkownik uwierzytelniony w Supabase, ale nie znaleziony w bazie danych.",
			failed_refresh_session: "Nie udało się odświeżyć sesji: {{error}}",
			failed_get_user: "Nie udało się pobrać użytkownika: {{error}}",
			failed_auto_create_profile:
				"Nie udało się automatycznie utworzyć profilu: {{error}}",
			failed_fetch_user_auth_change:
				"Nie udało się pobrać użytkownika przy zmianie statusu uwierzytelniania: {{error}}",
			use_auth_provider: "useAuth musi być używany wewnątrz AuthProvider",
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
					start_request: "Zleć pracę",
					join_waitlist: "Dołącz do kolejki",
					get_notified: "Otrzymuj powiadomienia",
					open: "Otwarte",
					closed: "Zamknięte",
					waitlist: "Kolejka",
					content_warning: "Ostrzeżenie o treści",
					sensitive_content: "Treści wrażliwe",
					contains_tags: "Ten materiał zawiera {{tags}}",
					show_content: "Pokaż",
					hide_content: "Ukryj",
					show_details_18_plus: "Pokaż szczegóły, mam 18+",
				},
				post_modal: {
					title: "Szczegóły posta",
					content_warning: "Ostrzeżenie o treści",
					sensitive_content_desc:
						"Ta praca zawiera treści, które niektórzy odbiorcy mogą uznać za wrażliwe",
					commissioned_by: "Zlecone przez klienta",
					featured: "Wyróżnione",
					view_in_gallery: "Zobacz w galerii",
					commission_similar: "Zleć mi coś podobnego",
					no_tags: "Brak tagów",
					tags_label: "Tagi",
					content_warnings_label: "Ostrzeżenia o treści",
					no_cw_tags: "Brak ostrzeżeń",
					highlights: "Wyróżnienia",
					character: "Postać",
					no_media: "Brak multimediów",
					default_highlights: {
						delivery: "Terminowa dostawa",
						responsive: "Bardzo responsywny",
						updates: "Proaktywne aktualizacje",
					},
				},
				empty: {
					title: "Brak zleceń",
					description: "Ten użytkownik nie utworzył jeszcze żadnych zleceń.",
				},
				modal: {
					title: "Szczegóły zlecenia",
					category_label: "Zlecenie",
					no_media: "Brak multimediów",
					license: {
						title: "Typ licencji",
						info: "Info o licencji",
						included: "Wliczone",
						personal: "Użytek osobisty",
						personal_desc: "Tylko do użytku osobistego",
						monetized: "Treści monetyzowane",
						monetized_desc: "Do użytku w treściach monetyzowanych",
						commercial: "Komercyjne",
						commercial_desc: "Do użytku komercyjnego",
						unavailable: "Niedostępne",
						other_licenses_count: "Inne licencje ({{count}})",
					},
					service: {
						custom: {
							title: "Usługa niestandardowa",
							tooltip: "Stworzone od podstaw na podstawie Twoich wymagań",
							description: "Stworzone od podstaw",
						},
						ych: {
							title: "Personalizowane YCH",
							tooltip: "Your Character Here - ustalona poza/scena",
							description: "Ustalona poza, Twoja postać",
						},
						communication: {
							title: "Otwarta komunikacja",
							tooltip: "Regularne aktualizacje i pętle informacji zwrotnej",
							description: "Aktualizacje WIP + dostępne poprawki",
						},
						surprise: {
							title: "Zaskocz mnie",
							tooltip: "Artysta ma wolną rękę",
							description: "Wybór artysty / Wolność artystyczna",
						},
						proposal: {
							title: "Niestandardowa propozycja",
							tooltip: "Standardowy przepływ pracy zlecenia",
							description: "Zlecenie → propozycja → zobowiązanie (płatność)",
						},
						instant: {
							title: "Zamówienie natychmiastowe",
							tooltip: "Bezpośrednie zamówienie bez etapu propozycji",
							description: "Zamów i zapłać bezpośrednio",
						},
					},
					tabs: {
						description: "Opis",
					},
					tos: {
						title: "Warunki usługi {{artist_displayname}}",
						updated_at: "Zaktualizowano {{updated_at}}",
						agreement_prefix: "Zlecając mi pracę, zgadzasz się na:",
						read_full: "Przeczytaj pełny Regulamin",
					},
					reviews: {
						empty: "Brak recenzji.",
					},
					info_selection_modal: {
						service: {
							title: "Rodzaj usługi",
							description:
								"Rodzaj usługi, którą artysta świadczy w ramach zlecenia.",
						},
						communication: {
							title: "Styl komunikacji",
							description:
								"Styl komunikacji, którego należy oczekiwać od artysty w przypadku zlecenia.",
						},
						process: {
							title: "Proces składania zamówienia",
							description:
								"Sposób składania zapytania o zlecenie dla danej usługi.",
						},
					},
					license_info_modal: {
						title: "Dostępne licencje",
						subtitle:
							"Artysta jest licencjodawcą zamówionego zasobu i może dołączyć dodatkowe warunki licencji w swoim Regulaminie lub opisie usługi.",
						personal: {
							title: "Osobista",
							description:
								"Tylko do użytku indywidualnego, niekomercyjnego i niemonetyzowanego",
							allowed: {
								personal_use:
									"Użytek osobisty (np. awatar w mediach społecznościowych, tapeta, wydruk osobisty)",
							},
							forbidden: {
								monetized:
									"Treści monetyzowane (np. streaming, filmy na youtube)",
								commercial: "Merchandising komercyjny (np. koszulki, naklejki)",
							},
						},
						monetized: {
							title: "Treści monetyzowane",
							description:
								"Dla twórców treści i firm, które chcą wykorzystać zamówiony zasób jako część tworzenia i dystrybucji komercyjnych i monetyzowanych treści cyfrowych",
							allowed: {
								personal_use: "Użytek osobisty",
								monetized_content:
									"Treści monetyzowane (streaming, filmy itp.)",
							},
							forbidden: {
								commercial: "Merchandising komercyjny",
							},
						},
						commercial: {
							title: "Merchandising komercyjny",
							description:
								"Dla firm, które chcą tworzyć, promować i odsprzedawać własne cyfrowe lub fizyczne produkty końcowe wykonane przy użyciu zamówionego zasobu",
							licensee: {
								label: "Licencjobiorca",
								value: "Osoba fizyczna lub podmiot prawny (Firma)",
							},
							commercial_use: {
								label: "Użytek komercyjny",
								allowed: {
									creation:
										"Tworzenie, odsprzedaż i dystrybucja produktów końcowych cyfrowych lub fizycznych o wartości dodanej lub pochodnych, wykonanych przy użyciu zamówionego zasobu przez Licencjobiorcę",
									distribution:
										"Tworzenie i dystrybucja treści cyfrowych i fizycznych w celu promowania odsprzedaży produktów końcowych cyfrowych lub fizycznych o wartości dodanej stworzonych przez Licencjobiorcę",
								},
								forbidden: {
									reselling:
										'Odsprzedaż zamówionego zasobu "tak jak jest" bez żadnych działań o wartości dodanej',
								},
							},
							credit: {
								label: "Uznanie autorstwa",
								value:
									"Wymagane dla wszystkich zastosowań publicznych, chyba że uzgodniono inaczej",
							},
						},
						custom_licenses: {
							title: "Niestandardowe licencje artysty",
						},
					},
					footer: {
						accept_tos_label: "Akceptuję Regulamin użytkownika {{artist}}",
						tos_disclaimer:
							"Zaznaczając to pole, zgadzasz się na warunki artysty.",
						terms_summary: "Podsumowanie warunków:",
						no_terms: "Brak dostępnych warunków",
						accept_start: "Zaakceptuj warunki, aby zlecić pracę",
						feature_disabled: "Funkcja tymczasowo wyłączona",
					},
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
