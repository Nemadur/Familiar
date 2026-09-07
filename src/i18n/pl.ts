const pl = {
	seo: {
		defaults: {
			title: "Familiar",
			description: "Twoja twórczość wygląda Znajomo",
			keywords: "sztuka, familiar, zlecenia",
		},
		home: {
			title: "Strona główna",
			description: "Twoja twórczość wygląda Znajomo",
		},
		profile: {
			title: "Profil (@{{username}})",
			description: "Profil użytkownika @{{username}}",
		},
		shop: {
			title: "Sklep - Ilustracje i zlecenia artystyczne na zamówienie",
			description:
				"Przeglądaj zlecenia artystyczne od niezależnych twórców na Familiar. Odkrywaj style, galerie i ceny, a potem zamów ilustrację stworzoną specjalnie dla Ciebie.",
			keywords:
				"ilustracje na zamówienie, zlecenia artystyczne, commission art Polska, zamów grafikę, custom art, digital art commission, ilustrator na zamówienie, grafika postaci, portret na zamówienie, marketplace dla artystów, Familiar shop",
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
			confirm_email:
				"Konto zostało utworzone. Sprawdź skrzynkę i potwierdź adres e-mail.",
			submit: "Zarejestruj",
			pending: "Tworzenie konta...",
			steps: {
				account: "Konto",
				profile: "Profil",
				socials: "Linki",
			},
			profile: {
				title: "Dane profilu",
				description: "Wybierz, jak będzie wyglądał Twój publiczny profil.",
			},
			images: {
				title: "Zdjęcia profilowe",
				description:
					"Dodaj awatar i zdjęcie w tle teraz albo pomiń ten krok i dodaj je później.",
				cover_preview: "Podgląd zdjęcia w tle",
				avatar_preview: "Podgląd awatara",
				no_cover: "Brak zdjęcia w tle",
				change_cover: "Wybierz zdjęcie w tle",
				remove_cover: "Usuń zdjęcie w tle",
				choose_avatar: "Wybierz awatar",
				remove_avatar: "Usuń awatar",
			},
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
		bio: {
			label: "Biografia",
			placeholder: "Napisz kilka słów o sobie...",
		},
		socials: {
			add_label: "Dodaj link do profilu",
			select_placeholder: "Wybierz platformę",
			add: "Dodaj",
			description:
				"Dodaj maksymalnie pięć linków obsługiwanych podczas rejestracji.",
			empty: "Nie dodano jeszcze żadnych linków.",
			remove: "Usuń link do profilu",
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
			invalid_registration: "Sprawdź dane rejestracyjne i kod zaproszenia.",
			email_registered:
				"Konto z tym adresem e-mail lub nazwą użytkownika już istnieje.",
			unsupported_registration_image:
				"Format awatara lub zdjęcia w tle nie jest obsługiwany.",
			registration_provider_failed:
				"Dostawca uwierzytelniania nie mógł utworzyć konta.",
			registration_service_unavailable:
				"Rejestracja jest chwilowo niedostępna. Spróbuj ponownie za moment.",
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
			title: "Strona główna",
			description: "Strona w trakcie renowacji.",
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
			v0_7_5: {
				Added: [
					"Dodano strony [Polityka prywatności](/privacy) i [Regulamin](/tos) do aplikacji.",
				],
				Improved: [
					"Polityka prywatności i Regulamin mają teraz czytelniejszy układ oraz lepszą typografię.",
					"Strony prawne korzystają teraz z tłumaczeń, w tym tytułów, opisów, dat, sekcji i elementów list.",
					"Notatki o wersjach wyglądają teraz lepiej na urządzeniach mobilnych, z układem dającym każdej wersji więcej miejsca.",
					"Stopka jest teraz łatwiejsza w utrzymaniu i zawiera czytelniejsze linki do dokumentów prawnych.",
				],
				Fixed: [
					"Treść notatek o wersjach nie jest już ściskana w wąskich kolumnach na małych ekranach.",
					"Sekcje dokumentów prawnych renderują się teraz poprawnie z tłumaczeń.",
					"Treści Markdown na stronach prawnych nie tworzą już niepoprawnych, zagnieżdżonych akapitów.",
				],
			},
			v0_8_0: {
				Added: [
					"Dodano moduł Sklepu z możliwością przeglądania, kategoriami i filtrowaniem przedmiotów.",
					"Dodano szczegółowe okno przedmiotu w sklepie z opcją dodania do koszyka.",
					"Dodano rozwijany Koszyk w nagłówku i dedykowaną stronę realizacji zamówienia (Checkout).",
				],
			},
		},
	},
	privacyPolicy: {
		title: "Polityka prywatności",
		eyebrow: "Dokument prawny",
		description:
			"Dowiedz się, jak Familiar zbiera, wykorzystuje i chroni Twoje informacje.",
		effectiveDateLabel: "Data obowiązywania",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Wprowadzenie",
				body: [
					"Familiar to platforma społecznościowa dla artystów, klientów i społeczności kreatywnych. Ta Polityka prywatności wyjaśnia, jakie informacje zbieramy, jak ich używamy i jakie masz możliwości kontroli.",
					"Korzystając z Familiar, akceptujesz zasady opisane w tej polityce.",
				],
			},
			{
				title: "Informacje, które zbieramy",
				body: [
					"Zbieramy informacje, które przekazujesz bezpośrednio podczas tworzenia konta, edycji profilu, publikowania treści, składania zleceń lub kontaktu z nami.",
				],
				items: [
					"Informacje o koncie, takie jak email, nazwa użytkownika, nazwa wyświetlana i typ konta.",
					"Informacje profilowe, takie jak avatar, bio, oznaczenia języków, portfolio i publiczne linki.",
					"Treści, które przesyłasz lub udostępniasz, takie jak posty, obrazy, szczegóły zleceń i wiadomości związane z zapytaniami.",
					"Informacje techniczne, takie jak typ urządzenia, przeglądarka, adres IP, dane sesji i podstawowe logi użycia.",
				],
			},
			{
				title: "Jak używamy Twoich informacji",
				body: [
					"Używamy Twoich informacji, aby dostarczać, zabezpieczać, rozwijać i personalizować Familiar.",
				],
				items: [
					"Do tworzenia i obsługi Twojego konta.",
					"Do wyświetlania profilu, portfolio, postów i informacji o zleceniach.",
					"Do obsługi zapytań o zlecenia i powiązanych działań.",
					"Do ochrony platformy przed nadużyciami, spamem, oszustwami i nieautoryzowanym dostępem.",
					"Do poprawy wydajności, dostępności i wygody korzystania z platformy.",
					"Do kontaktu w sprawie ważnych aktualizacji konta, bezpieczeństwa lub działania usługi.",
				],
			},
			{
				title: "Treści publiczne",
				body: [
					"Niektóre informacje w Familiar są publiczne z założenia. Może to obejmować nazwę użytkownika, nazwę wyświetlaną, avatar, stronę profilu, portfolio, publiczne posty, listy zleceń i inne treści, które zdecydujesz się opublikować.",
					"Nie udostępniaj prywatnych lub wrażliwych informacji w publicznych częściach platformy.",
				],
			},
			{
				title: "Pliki cookie i podobne technologie",
				body: [
					"Familiar może używać plików cookie, pamięci lokalnej i podobnych technologii, aby utrzymać zalogowanie, zapamiętać preferencje, poprawić bezpieczeństwo i zrozumieć sposób korzystania z platformy.",
				],
			},
			{
				title: "Jak udostępniamy informacje",
				body: [
					"Nie sprzedajemy Twoich danych osobowych. Możemy udostępniać ograniczone informacje tylko wtedy, gdy jest to potrzebne do działania Familiar, spełnienia obowiązków prawnych, ochrony użytkowników lub korzystania z zaufanych dostawców usług.",
				],
				items: [
					"Dostawcom usług, którzy pomagają nam hostować, zabezpieczać, analizować lub obsługiwać platformę.",
					"Organom lub stronom prawnym, gdy wymagają tego przepisy albo ważna procedura prawna.",
					"Innym użytkownikom, gdy publikujesz treści lub korzystasz z funkcji publicznych.",
				],
			},
			{
				title: "Przechowywanie danych",
				body: [
					"Przechowujemy Twoje informacje tak długo, jak jest to potrzebne do działania Familiar, spełnienia obowiązków prawnych, rozwiązywania sporów, zapobiegania nadużyciom i egzekwowania naszych zasad.",
					"Gdy informacje nie są już potrzebne, usuwamy je lub anonimizujemy tam, gdzie jest to rozsądnie możliwe.",
				],
			},
			{
				title: "Twoje wybory i prawa",
				body: [
					"W zależności od Twojej lokalizacji możesz mieć prawo do dostępu, poprawienia, usunięcia, eksportu lub ograniczenia używania swoich danych osobowych.",
				],
				items: [
					"Część informacji o koncie i profilu możesz zaktualizować bezpośrednio w ustawieniach.",
					"Możesz poprosić o usunięcie lub poprawienie wybranych danych osobowych.",
					"Możesz skontaktować się z nami w sprawach dotyczących prywatności.",
				],
			},
			{
				title: "Bezpieczeństwo",
				body: [
					"Stosujemy rozsądne środki techniczne i organizacyjne, aby chronić Twoje informacje. Żadna usługa internetowa nie może jednak zagwarantować pełnego bezpieczeństwa.",
				],
			},
			{
				title: "Prywatność dzieci",
				body: [
					"Familiar nie jest przeznaczony dla dzieci poniżej minimalnego wieku wymaganego przez obowiązujące prawo. Jeśli dowiemy się, że zebraliśmy dane dziecka bez odpowiedniej zgody, podejmiemy właściwe kroki w celu ich usunięcia.",
				],
			},
			{
				title: "Zmiany w tej polityce",
				body: [
					"Możemy od czasu do czasu aktualizować tę Politykę prywatności. Przy ważnych zmianach zaktualizujemy datę obowiązywania i możemy powiadomić użytkowników przez platformę.",
				],
			},
			{
				title: "Kontakt",
				body: [
					"Jeśli masz pytania dotyczące tej Polityki prywatności, możesz skontaktować się z zespołem Familiar przez oficjalne kanały wsparcia lub kontaktu dostępne na platformie.",
				],
			},
		],
	},
	termsOfService: {
		title: "Regulamin",
		eyebrow: "Dokument prawny",
		description: "Przeczytaj te warunki uważnie przed korzystaniem z Familiar.",
		effectiveDateLabel: "Data obowiązywania",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Wprowadzenie",
				body: [
					"Ten Regulamin wyjaśnia zasady korzystania z Familiar. Familiar to platforma społecznościowa dla artystów, klientów i społeczności kreatywnych.",
					"Tworząc konto lub korzystając z Familiar, akceptujesz ten Regulamin. Jeśli się z nim nie zgadzasz, nie korzystaj z platformy.",
				],
			},
			{
				title: "Konta",
				body: [
					"Do korzystania z części funkcji Familiar może być wymagane konto. Odpowiadasz za bezpieczeństwo danych logowania oraz za wszystkie działania wykonywane przez Twoje konto.",
				],
				items: [
					"Podczas tworzenia konta musisz podać prawidłowe informacje.",
					"Nie możesz podszywać się pod inną osobę, markę, artystę ani organizację.",
					"Nie możesz sprzedawać, przekazywać ani udostępniać dostępu do konta bez zgody.",
					"Musisz skontaktować się z nami, jeśli uważasz, że ktoś uzyskał nieautoryzowany dostęp do Twojego konta.",
				],
			},
			{
				title: "Treści użytkownika",
				body: [
					"Zachowujesz prawa własności do treści, które tworzysz i przesyłasz do Familiar. Publikując treści na platformie, pozwalasz nam jednak wyświetlać, przechowywać, przetwarzać i udostępniać je w zakresie potrzebnym do działania Familiar.",
					"Odpowiadasz za upewnienie się, że masz prawa do przesyłania i udostępniania swoich treści.",
				],
				items: [
					"Nie możesz przesyłać treści naruszających prawa innych osób.",
					"Nie możesz przesyłać treści nielegalnych, obraźliwych, nienawistnych, szkodliwych ani wprowadzających w błąd.",
					"Nie możesz przesyłać treści naruszających zasady społeczności lub polityki platformy.",
				],
			},
			{
				title: "Usługi artystów i zlecenia",
				body: [
					"Familiar może umożliwiać artystom i klientom komunikację dotyczącą zleceń, zapytań, portfolio i powiązanych usług.",
					"O ile nie wskazano wyraźnie inaczej, Familiar nie jest stroną indywidualnych ustaleń między artystami i klientami. Artyści i klienci odpowiadają za jasne określenie oczekiwań, cen, terminów, licencji i zasad dostawy.",
				],
				items: [
					"Artyści odpowiadają za rzetelne opisywanie swoich usług.",
					"Klienci odpowiadają za przeczytanie szczegółów usługi przed wysłaniem zapytania.",
					"Obie strony odpowiadają za przestrzeganie uzgodnionych zasad, licencji i ustaleń płatniczych.",
				],
			},
			{
				title: "Dozwolone korzystanie",
				body: [
					"Zobowiązujesz się korzystać z Familiar w sposób bezpieczny, zgodny z prawem i szanujący innych użytkowników.",
				],
				items: [
					"Nie możesz używać Familiar do spamu, oszustw, wyłudzeń, nękania ani nadużyć.",
					"Nie możesz próbować zakłócać, przeciążać, scrapować, odtwarzać kodu ani atakować platformy.",
					"Nie możesz omijać zabezpieczeń, kontroli dostępu, blokad ani ograniczeń konta.",
					"Nie możesz używać Familiar do rozpowszechniania malware lub szkodliwych linków.",
				],
			},
			{
				title: "Moderacja treści",
				body: [
					"Możemy sprawdzać, ukrywać, ograniczać, usuwać lub zgłaszać treści, jeśli uznamy, że naruszają ten Regulamin, nasze polityki, prawo albo bezpieczeństwo platformy.",
					"Możemy również zawiesić lub zakończyć działanie kont, które łamią zasady albo tworzą ryzyko dla Familiar, użytkowników lub społeczności.",
				],
			},
			{
				title: "Własność intelektualna",
				body: [
					"Familiar, w tym jego projekt, branding, interfejs, oprogramowanie i funkcje platformy, jest chroniony przepisami dotyczącymi własności intelektualnej. Nie możesz kopiować, modyfikować, rozpowszechniać ani nadużywać materiałów należących do Familiar bez zgody.",
					"Treści przesyłane przez użytkowników należą do odpowiednich użytkowników lub właścicieli praw, chyba że wskazano inaczej.",
				],
			},
			{
				title: "Usługi zewnętrzne",
				body: [
					"Familiar może korzystać z usług zewnętrznych do hostingu, uwierzytelniania, płatności, analityki, przechowywania danych lub innych funkcji platformy. Te usługi mogą mieć własne regulaminy i polityki prywatności.",
				],
			},
			{
				title: "Dostępność i zmiany",
				body: [
					"Staramy się, aby Familiar był dostępny i niezawodny, ale nie możemy zagwarantować, że platforma zawsze będzie działała bez przerw, błędów lub ograniczeń dostępności.",
					"Możemy aktualizować, zmieniać, zawieszać lub usuwać funkcje w dowolnym momencie, szczególnie gdy jest to potrzebne ze względów bezpieczeństwa, konserwacji, zgodności z prawem lub rozwoju produktu.",
				],
			},
			{
				title: "Zastrzeżenia",
				body: [
					"Familiar jest udostępniany w stanie takim, w jakim jest, oraz w miarę dostępności. W najszerszym zakresie dozwolonym przez prawo nie udzielamy gwarancji dotyczących nieprzerwanego dostępu, pełnego bezpieczeństwa, przydatności do konkretnego celu ani dokładności treści użytkowników.",
				],
			},
			{
				title: "Ograniczenie odpowiedzialności",
				body: [
					"W najszerszym zakresie dozwolonym przez prawo Familiar i jego zespół nie ponoszą odpowiedzialności za pośrednie, przypadkowe, szczególne, następcze ani karne szkody związane z korzystaniem z platformy.",
				],
			},
			{
				title: "Zakończenie korzystania",
				body: [
					"Możesz przestać korzystać z Familiar w dowolnym momencie. Możemy zawiesić lub zakończyć dostęp, jeśli naruszysz ten Regulamin, stworzysz ryzyko prawne, zaszkodzisz innym użytkownikom albo nadużyjesz platformy.",
				],
			},
			{
				title: "Zmiany w Regulaminie",
				body: [
					"Możemy od czasu do czasu aktualizować ten Regulamin. Przy ważnych zmianach zaktualizujemy datę obowiązywania i możemy powiadomić użytkowników przez platformę.",
				],
			},
			{
				title: "Kontakt",
				body: [
					"Jeśli masz pytania dotyczące tego Regulaminu, możesz skontaktować się z zespołem Familiar przez oficjalne kanały wsparcia lub kontaktu dostępne na platformie.",
				],
			},
		],
	},
	roadmap: {
		title: "Co dalej w Familiar",
		eyebrow: "Roadmapa",
		description:
			"Prosty podgląd planowanych funkcji i tego, nad czym teraz pracujemy.",
		status: {
			Planned: "Planowane",
			InProgress: "W trakcie",
			Exploring: "Rozważane",
		},
		items: {
			"item-1": {
				title: "Lepszy panel zleceń",
				description:
					"Czytelniejszy panel dla artystów i klientów, który ułatwi zarządzanie zapytaniami o zlecenia.",
				details: [
					"Czytelniejsze karty statusu zapytań.",
					"Lepsze akcje do akceptowania, odrzucania, anulowania i aktualizowania zleceń.",
					"Wygodniejszy układ mobilny do zarządzania zleceniami na mniejszych ekranach.",
				],
			},
			"item-2": {
				title: "Ulepszone posty portfolio",
				description:
					"Posty portfolio wrócą z czytelniejszym widokiem szczegółów i lepszą obsługą udostępniania.",
				details: [
					"Lepsze strony postów dla prac i przykładów zleceń.",
					"Czytelniejsze wyświetlanie obrazów i podglądów.",
					"Ulepszone linki do udostępniania postów portfolio.",
				],
			},
			"item-3": {
				title: "Powiadomienia",
				description:
					"Rozważamy powiadomienia, które pomogą użytkownikom śledzić ważną aktywność bez ręcznego sprawdzania każdej strony.",
				details: [
					"Aktualizacje dotyczące zmian w zapytaniach o zlecenia.",
					"Możliwe powiadomienia o profilach, obserwacjach i aktywności.",
					"Proste centrum powiadomień w aplikacji.",
				],
			},
		},
	},
};

export default pl;
