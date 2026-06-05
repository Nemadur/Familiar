import type { Locale } from "@/types/i18n";

const en: Locale = {
	seo: {
		defaults: {
			title: "Familiar",
			description: "Your art station",
			keywords: "art, familiar, commission",
		},
		home: {
			title: "Welcome to Familiar",
			description: "Your art station",
		},
		profile: {
			title: "Profile (@{{username}})",
			description: "User profile for @{{username}}",
		},
	},
	meta: {
		app_name: "Familiar",
		label: "English",
		flag: "🇺🇸",
		currency: {
			value: "USD",
			label: "USD",
			symbol: "$",
		},
	},
	header: {
		title: "$t(meta.app_name)",
		navigation: {
			home: "Home",
			shop: "Shop",
			blog: "Blog",
			users: "Users",
		},
		user_navigation: {
			profile: "Profile",
			settings: "Settings",
			logout: "Logout",
		},
		theme: {
			toggle: "Toggle theme",
			light: "Light",
			dark: "Dark",
			system: "System",
		},
	},
	auth: {
		login: {
			cta: "Login",
			title: "Welcome back",
			description: "Login to your account to continue",
			success: "Logged in successfully",
			pending: "Logging in...",
		},
		terms_agree: {
			label: "Registering on $t(header.title) you agree to our ",
			terms: "Terms of Service",
			and: " and ",
			privacy: "Privacy Policy",
		},
		register: {
			cta: "Sign in",
			title: "Create an account",
			description: "Enter your details below to create your account",
			already_have_account: "Already have an account?",
			success: "Account created successfully",
			submit: "Submit",
			pending: "Creating account...",
		},
		forgot: {
			cta: "Forgot your password?",
			title: "Forgot password?",
			register_question: "Don't have an account?",
			description: "Enter your email to reset your password",
			submit: "Send reset link",
			back_to_login: "Back to Login",
			reset_password: "Reset Password",
		},
		email: {
			label: "Email",
			placeholder: "example@familiar.art",
		},
		back: "Back",
		continue: "Continue",
		invite_key: {
			label: "Invite Key",
			placeholder: "FAM-XXXX-XXXX-XXX",
			prefix: "FAM-",
		},
		display_name: {
			label: "Display Name",
			placeholder: "Your name",
		},
		username: {
			label: "Username",
			placeholder: "username",
		},
		password: {
			label: "Password",
			placeholder: "Password",
		},
		create_account: {
			cta: "Create Account",
		},
		errors: {
			rate_limit: "Too many attempts. Please try again later.",
			invalid_credentials: "Invalid email or password",
			registration_failed: "Registration failed: {{error}}",
			login_failed: "Login failed: {{error}}",
			logout_failed: "Logout failed: {{error}}",
			create_profile_failed: "Failed to create user profile: {{error}}",
			auth_session_missing: "Auth session missing!",
			user_authenticated_not_found:
				"User authenticated in Supabase but not found in database.",
			failed_refresh_session: "Failed to refresh session: {{error}}",
			failed_get_user: "Failed to get user: {{error}}",
			failed_auto_create_profile: "Failed to auto-create profile: {{error}}",
			failed_fetch_user_auth_change:
				"Failed to fetch user in onAuthStateChange: {{error}}",
			use_auth_provider: "useAuth must be used within an AuthProvider",
		},
		account_type: {
			label: "Account Type",
			client_title: "Client Account",
			client_description: "For individuals looking to connect with artists.",
			artist_title: "Artist Account",
			artist_description: "For artists looking to connect with clients.",
			client_badge: "Default",
		},
	},
	pages: {
		home: {
			title: "Welcome to Familiar - Your art station",
		},
	},
	states: {
		empty: {
			under_construction: "Under construction",
		},
	},
	components: {
		language_select: {
			search: "Search languages",
			select: "Select language",
		},
		portfolio: {
			filters: {
				all: "All",
				commissions_only: "Commissions only",
			},
			folder: {
				items: "{{count}} items",
			},
			search_placeholder: "Search folders...",
		},
		profile: {
			tabs: {
				commissions: "Commissions",
				portfolio: "Portfolio",
				characters: "Characters",
				saved: "Saved",
				liked: "Liked",
			},
			private_content: {
				title: "This content is private",
				description: "You do not have permission to view this content.",
			},
			actions: {
				follow: "Follow",
				unfollow: "Unfollow",
				edit_profile: "Edit Profile",
				followers: "Followers",
				following: "Following",
				work_queue: "Work Queue",
			},
			info: {
				local_time: "Local time",
				suspended: "This account is suspended.",
				about_me: "About me",
			},
			details: {
				stats: {
					followers: "Followers",
					following: "Following",
					works: "Works",
				},
				joined: "Joined",
				local: "local",
				bio: "Bio",
				languages: "Languages",
			},
			languages: {
				levels: {
					native: "Native",
					fluent: "Fluent",
					communicative: "Communicative",
					learning: "Learning",
					basic: "Basic",
				},
			},
			commissions: {
				card: {
					from: "From",
					start_request: "Start Request",
					join_waitlist: "Join Waitlist",
					get_notified: "Get notified",
					open: "Open",
					closed: "Closed",
					waitlist: "Waitlist",
					content_warning: "Content Warning",
					sensitive_content: "Sensitive content",
					contains_tags: "This media contains {{tags}}",
					show_content: "Show",
					hide_content: "Hide",
					show_details_18_plus: "Show details, I'm 18+",
				},
				post_modal: {
					title: "Post Details",
					content_warning: "Content Warning",
					sensitive_content_desc:
						"This artwork contains content that some viewers may find sensitive",
					commissioned_by: "Commissioned by client",
					featured: "Featured",
					view_in_gallery: "View in gallery",
					commission_similar: "Commission me for something similar",
					no_tags: "No tags",
					tags_label: "Tags",
					content_warnings_label: "Content Warnings",
					no_cw_tags: "No content warnings",
					highlights: "Highlights",
					character: "Character",
					no_media: "No media available",
					default_highlights: {
						delivery: "On time delivery",
						responsive: "Very responsive",
						updates: "Proactive updates",
					},
				},
				empty: {
					title: "No commissions available",
					description: "This user hasn't set up any commissions yet.",
				},
				modal: {
					title: "Commission Details",
					category_label: "Commission",
					no_media: "No media available",
					license: {
						title: "License Type",
						info: "License Info",
						included: "Included",
						personal: "Personal",
						personal_desc: "For personal use only",
						monetized: "Monetized content",
						monetized_desc: "For use in monetized content",
						commercial: "Commercial",
						commercial_desc: "For commercial use",
						unavailable: "Unavailable",
						other_licenses_count: "{{count}} other licenses",
					},
					service: {
						custom: {
							title: "Custom service",
							tooltip: "Made from scratch based on your requirements",
							description: "Made from scratch",
						},
						ych: {
							title: "Personalized YCH",
							tooltip: "Your Character Here - fixed pose/scene",
							description: "Fixed pose, your character",
						},
						communication: {
							title: "Open communication",
							tooltip: "Regular updates and feedback loops",
							description: "WIP updates + revisions available",
						},
						surprise: {
							title: "Surprise me",
							tooltip: "Artist has creative freedom",
							description: "Artist choice / Artistic freedom",
						},
						proposal: {
							title: "Custom proposal",
							tooltip: "Standard commission workflow",
							description: "Request → proposal → commit (pay)",
						},
						instant: {
							title: "Instant order",
							tooltip: "Directly order without proposal phase",
							description: "Order & Pay directly",
						},
					},
					tabs: {
						description: "Description",
					},
					tos: {
						title: "{{artist_displayname}}'s Terms of Service",
						updated_at: "Updated {{updated_at}}",
						agreement_prefix: "By commissioning me, you agree to:",
						read_full: "Read full Terms of Service",
					},
					reviews: {
						empty: "No reviews yet.",
						total_count: "{{count}} reviews",
					},
					info_selection_modal: {
						service: {
							title: "Service type",
							description:
								"The kind of service that the artist provides for a commission.",
						},
						communication: {
							title: "Communication style",
							description:
								"The style of communication that you should expect with the artist for a commission.",
						},
						process: {
							title: "Requesting process",
							description:
								"The way you submit your commission request for a service.",
						},
					},
					license_info_modal: {
						title: "Available licenses",
						subtitle:
							"The artist is the commissioned asset licensor and may include additional license terms in their Terms of Service or the service's description.",
						personal: {
							title: "Personal",
							description:
								"For individual, non-commercial and non-monetized uses only",
							allowed: {
								personal_use:
									"Personal use (e.g. social media pfp, wallpaper, personal print)",
							},
							forbidden: {
								monetized: "Monetized content (e.g. streaming, youtube videos)",
								commercial:
									"Commercial merchandising (e.g. t-shirts, stickers)",
							},
						},
						monetized: {
							title: "Monetized content",
							description:
								"For content creators and businesses who want to use the commissioned asset as part of creating and distributing commercial and monetized digital content",
							allowed: {
								personal_use: "Personal use",
								monetized_content:
									"Monetized content (streaming, videos, etc.)",
							},
							forbidden: {
								commercial: "Commercial merchandising",
							},
						},
						commercial: {
							title: "Commercial merchandising",
							description:
								"For businesses who want to create, promote, and re-sell their own digital or physical end products made with the commissioned asset",
							licensee: {
								label: "Licensee",
								value: "Individual or Legal Entity (Company)",
							},
							commercial_use: {
								label: "Commercial use",
								allowed: {
									creation:
										"Creation, re-selling, and distribution of value-add or derivative digital or physical end products made with the commissioned asset by the Licensee",
									distribution:
										"Creation and distribution of digital and physical content to promote the re-selling of value-add digital or physical end products created by the Licensee",
								},
								forbidden: {
									reselling:
										'Re-selling the commissioned asset "as-is" without any value-add activities',
								},
							},
							credit: {
								label: "Credit the artist",
								value: "Required for all public uses unless agreed otherwise",
							},
						},
						custom_licenses: {
							title: "Artist's Custom Licenses",
						},
						system_licenses: {
							title: "Familiar Standard Licenses",
						},
					},
					footer: {
						accept_tos_label: "I accept {{artist}}'s Terms of Service",
						tos_disclaimer:
							"By checking this box, you agree to the artist's terms.",
						terms_summary: "Terms Summary:",
						no_terms: "No terms available",
						accept_start: "Accept terms to start request",
						feature_disabled: "Feature is temporary disabled",
					},
				},
			},
			feeds: {
				empty: {
					title: "No content yet",
					description: "This user hasn't posted anything yet.",
				},
			},
		},
	},
	footer: {
		about: {
			title: "$t(meta.app_name)",
			description:
				"$t(meta.app_name) is a social platform for artists to connect with each other.",
		},
		sections: {
			socials: "Socials",
			navigation: "Navigation",
			resources: "Resources",
		},
		links: {
			home: "Home",
			blog: "Blog",
			faq: "FAQ",
			sponsors: "Sponsors",
			terms: "Terms",
			documentation: "Documentation",
		},
		copyright: {
			rights: "All rights reserved",
			made_with: "Made with ❤️",
		},
	},
	releaseNotes: {
		title: "What's new with Familiar",
		eyebrow: "Changelog",
		latest: "Latest",
		latestRelease: "Latest release",
		tags: {
			Added: "Added",
			Improved: "Improved",
			Fixed: "Fixed",
			Deprecated: "Deprecated",
			Removed: "Removed",
			Security: "Security",
			Breaking: "Breaking",
		},
		releases: {
			v0_1_0: {
				Added: ["Initial release of the Familiar platform."],
			},
			v0_2_0: {
				Added: [
					"Full profile pages are live with avatars, bios, cover images, and feed tabs.",
					"You can now sign in and out with a real account backed by Supabase.",
					"Profiles support spoken language badges and SEO-friendly URLs.",
				],
			},
			v0_3_0: {
				Added: [
					"You can now browse and request commissions directly from artist profiles.",
					"Content permissions are now handled behind the scenes based on your account type.",
				],
			},
			v0_3_1: {
				Improved: [
					"Commission cards look more polished with refined corners and image rounding.",
					"Show and hide content labels are shorter and clearer.",
				],
				Fixed: [
					"The hide content button now shows a tooltip so its purpose is clearer.",
				],
			},
			v0_4_0: {
				Added: [
					"New profile modals for info selection, terms of service, and reviews.",
					"Commission detail pages are now reachable directly from your profile.",
				],
				Improved: ["Commission previews now load faster and look sharper."],
			},
			v0_5_0: {
				Added: [
					"The app now works great on mobile with a new slide out navigation menu.",
					"Portfolio posts can be linked directly and shared with a URL.",
					"Sensitive content is blurred by default with a one tap option to reveal it.",
				],
				Improved: [
					"The user menu adapts to your device, showing a dropdown on desktop and a drawer on mobile.",
					"Images in the feed autoplay on mobile when you scroll past them.",
					"Your FAM code is cleaned up automatically when you type or paste it.",
				],
			},
			v0_5_1: {
				Improved: [
					"Reels feel more stable with better progress tracking and smoother transitions.",
					"Links inside posts now show a preview tooltip when you hover over them.",
					"Commission request forms have a cleaner step by step layout.",
				],
				Added: ["New filter icon available across the app."],
			},
			v0_5_2: {
				Fixed: [
					"Reels no longer flicker or get stuck when switching between items.",
					"Profile pictures load correctly even when media is still coming in.",
					"You can only open a commission if it is actually available, not accidentally on closed ones.",
					"Staying logged in across page refreshes is much more reliable now.",
					"The app no longer briefly shows you as logged out when you first open it.",
					"Your chosen theme is applied immediately on load with no flash.",
				],
				Improved: [
					"Folder cards now support custom colors and icons.",
					"License selection inside commission modals is clearer and easier to interact with.",
					"Scrollable sections in modals behave more consistently.",
				],
			},
			v0_5_3: {
				Improved: [
					"Calendar, carousel, and multi-step forms are more reliable and easier to use with a keyboard.",
				],
			},
			v0_5_4: {
				Improved: [
					"Reels play more smoothly and pause correctly when you scroll away.",
					"The app feels snappier overall thanks to some under the hood performance work.",
				],
				Fixed: [
					"Sign up flow no longer gets stuck on the continue button in certain situations.",
				],
			},
			v0_6_0: {
				Added: [
					"New filtering system lets you narrow down lists by date, text, number, or multiple options at once.",
					"Filters work great on mobile too.",
				],
			},
			v0_7_0: {
				Added: [
					"You can now send and manage commission requests end to end.",
					"A new My Requests page lets you track the status of everything you have sent.",
				],
			},
			v0_7_1: {
				Improved: [
					"Commission requests now have dedicated actions: submit, accept, reject, cancel, and attach media.",
					"The request details page got a full redesign with clearer status cards and a hold-to-confirm button for sensitive actions.",
					"Artists now see a dashboard shortcut right in the header.",
					"Filters now support grouped and nested options for easier browsing.",
				],
			},
			v0_7_2: {
				Improved: [
					"Commission previews now load faster and look sharper.",
					"Archived commissions are filtered out more reliably from your list.",
				],
				Removed: [
					"Cleaned up some old placeholder data that was no longer needed.",
					"Portfolio post view is temporarily hidden while we rework it.",
				],
			},
			v0_7_3: {
				Added: [
					"Release notes, you can be updated on the latest features and improvements.",
				],
			},
			v0_7_4: {
				Improved: [
					"Reworked the release notes page to support multiple languages.",
				],
				Fixed: [
					"Register and Login page share now one layout, no more weird offsets.",
				],
			},
		},
	},
};

export default en;
