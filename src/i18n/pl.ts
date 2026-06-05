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
	releaseNotes: {
		title: "Nowinki Familiarowe",
		eyebrow: "Lista zmian",
		latest: "Najnowsze",
		latestRelease: "Najnowsza wersja",
		tags: {
			Added: "Dodano",
			Improved: "Ulepszono",
			Fixed: "Poprawiono",
			Deprecated: "Deprecowano",
			Removed: "Usunięto",
			Security: "Bezpieczństwo",
			Breaking: "Zepsuto",
		},
		releases: {
			v0_1_0: {
				Added: [
					"Familiar jest już dostępny. To nasze pierwsze publiczne wydanie.",
				],
			},
			v0_2_0: {
				Added: [
					"Profile są już dostępne, razem z avatarami, opisami, obrazami w tle i zakładkami feedu.",
					"Możesz teraz logować się i wylogowywać z prawdziwego konta obsługiwanego przez Supabase.",
					"Profile obsługują teraz oznaczenia języków i czytelniejsze adresy URL przyjazne SEO.",
				],
			},
			v0_3_0: {
				Added: [
					"Możesz teraz przeglądać i zamawiać zlecenia bezpośrednio z profili artystów.",
					"Dostęp do treści jest teraz obsługiwany automatycznie na podstawie typu konta.",
				],
			},
			v0_3_1: {
				Improved: [
					"Karty zleceń wyglądają teraz czyściej, z płynniejszymi zaokrągleniami i lepiej dopasowanymi obrazami.",
					"Etykiety treści wrażliwych są krótsze i łatwiejsze do zrozumienia.",
				],
				Fixed: [
					"Przycisk ukrywania treści ma teraz podpowiedź, dzięki czemu jego działanie jest łatwiejsze do zrozumienia.",
				],
			},
			v0_4_0: {
				Added: [
					"Dodano nowe okna profilu do wyboru informacji, regulaminu usług i opinii.",
					"Szczegóły zleceń można teraz otwierać bezpośrednio z profili artystów.",
				],
				Improved: [
					"Podglądy zleceń ładują się szybciej i wyglądają czytelniej.",
				],
			},
			v0_5_0: {
				Added: [
					"Wersja mobilna ma teraz własne menu nawigacji, dzięki czemu łatwiej korzystać z aplikacji na mniejszych ekranach.",
					"Posty portfolio można teraz otwierać bezpośrednio i udostępniać linkiem.",
					"Treści wrażliwe są teraz domyślnie rozmyte i można je szybko odsłonić jednym dotknięciem.",
				],
				Improved: [
					"Menu użytkownika dopasowuje się do urządzenia, z listą rozwijaną na desktopie i panelem wysuwanym na mobile.",
					"Obrazy w feedzie mogą teraz odtwarzać się automatycznie na mobile podczas przewijania.",
					"Kody FAM są teraz automatycznie formatowane podczas wpisywania lub wklejania.",
				],
			},
			v0_5_1: {
				Improved: [
					"Rolki działają stabilniej, z lepszym śledzeniem postępu i płynniejszymi przejściami.",
					"Linki w postach pokazują teraz podgląd po najechaniu kursorem.",
					"Formularze zleceń mają teraz czytelniejszy układ krok po kroku.",
				],
				Added: ["Dodano nową ikonę filtrowania do użycia w aplikacji."],
			},
			v0_5_2: {
				Fixed: [
					"Rolki nie migoczą już ani nie blokują się podczas przełączania między elementami.",
					"Zdjęcia profilowe ładują się poprawnie, nawet gdy media są jeszcze przetwarzane.",
					"Zamkniętych zleceń nie da się już przypadkowo otworzyć.",
					"Pozostawanie zalogowanym po odświeżeniu strony działa teraz pewniej.",
					"Aplikacja nie pokazuje już przez chwilę, że jesteś wylogowany podczas pierwszego ładowania.",
					"Wybrany motyw stosuje się od razu, bez migania przy uruchomieniu.",
				],
				Improved: [
					"Karty folderów obsługują teraz własne kolory i ikony.",
					"Wybór licencji w oknach zleceń jest czytelniejszy i łatwiejszy w obsłudze.",
					"Przewijane obszary w oknach działają teraz bardziej spójnie.",
				],
			},
			v0_5_3: {
				Improved: [
					"Kalendarz, karuzela i formularze wieloetapowe są teraz stabilniejsze i wygodniejsze w obsłudze klawiaturą.",
				],
			},
			v0_5_4: {
				Improved: [
					"Rolki odtwarzają się płynniej i poprawnie pauzują, gdy przewiniesz dalej.",
					"Aplikacja powinna działać trochę szybciej dzięki ogólnym usprawnieniom wydajności.",
				],
				Fixed: [
					"Proces rejestracji nie blokuje się już na przycisku kontynuacji w niektórych przypadkach.",
				],
			},
			v0_6_0: {
				Added: [
					"Dodano nowy system filtrowania list według daty, tekstu, liczb albo wielu opcji naraz.",
					"Filtry dobrze działają teraz również na mobile.",
				],
			},
			v0_7_0: {
				Added: [
					"Możesz teraz wysyłać i obsługiwać zlecenia od początku do końca.",
					'Dodano stronę "Moje zlecenia", gdzie możesz śledzić ich progres.',
				],
			},
			v0_7_1: {
				Improved: [
					"Zlecenia mają teraz czytelniejsze akcje do wysyłania, akceptowania, odrzucania, anulowania i dodawania mediów.",
					"Strona szczegółów zlecenia ma czytelniejszy wygląd, lepsze karty statusu i przycisk przytrzymania do ważnych akcji.",
					"Artyści mają teraz skrót do panelu bezpośrednio w nagłówku.",
					"Filtry obsługują teraz grupowane i zagnieżdżone opcje, dzięki czemu łatwiej przeglądać listy.",
				],
			},
			v0_7_2: {
				Improved: [
					"Podglądy zleceń ładują się szybciej i wyglądają czytelniej.",
					"Zarchiwizowane zlecenia są teraz skuteczniej ukrywane z listy.",
				],
				Removed: [
					"Usunięto stare dane testowe, które nie były już potrzebne.",
					"Widok posta portfolio jest tymczasowo ukryty, dopóki go przebudowujemy.",
				],
			},
			v0_7_3: {
				Added: [
					'Dodano notatki o "nowych wersjach", żeby szybko sprawdzić, co nowego, co ulepszono i co naprawiono w Familiar.',
				],
			},
			v0_7_4: {
				Improved: [
					'Notatki o "nowych wersjach" obsługują teraz wiele języków, żeby więcej użytkowników mogło śledzić zmiany.',
				],
				Fixed: [
					"Logowanie i rejestracja korzystają teraz z tego samego układu, więc strony wyglądają spójniej.",
				],
			},
		},
	},
};

export default pl;
