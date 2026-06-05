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
			Breaking: "Broken",
		},
		releases: {
			v0_1_0: {
				Added: ["Familiar is now live. This is our first public release."],
			},
			v0_2_0: {
				Added: [
					"Profiles are now available with avatars, bios, cover images, and feed tabs.",
					"You can now sign in and out with a real Supabase-powered account.",
					"Profiles now support language badges and cleaner, SEO-friendly URLs.",
				],
			},
			v0_3_0: {
				Added: [
					"You can now browse and request commissions directly from artist profiles.",
					"Content access is now handled automatically based on your account type.",
				],
			},
			v0_3_1: {
				Improved: [
					"Commission cards now look cleaner, with smoother corners and better image rounding.",
					"Sensitive content labels are shorter and easier to understand.",
				],
				Fixed: [
					"The hide content button now includes a tooltip, so its purpose is easier to understand.",
				],
			},
			v0_4_0: {
				Added: [
					"Added new profile modals for info selection, terms of service, and reviews.",
					"Commission detail pages can now be opened directly from artist profiles.",
				],
				Improved: ["Commission previews now load faster and look cleaner."],
			},
			v0_5_0: {
				Added: [
					"Mobile now has its own navigation menu, making the app easier to use on smaller screens.",
					"Portfolio posts can now be opened directly and shared with a link.",
					"Sensitive content is now blurred by default, with a quick tap to reveal it.",
				],
				Improved: [
					"The user menu now adapts to your device, with a dropdown on desktop and a drawer on mobile.",
					"Feed images can now autoplay on mobile as you scroll past them.",
					"FAM codes are now formatted automatically when typed or pasted.",
				],
			},
			v0_5_1: {
				Improved: [
					"Reels now feel steadier, with better progress tracking and smoother transitions.",
					"Links in posts now show a preview tooltip when you hover over them.",
					"Commission request forms now have a cleaner step-by-step flow.",
				],
				Added: ["Added a new filter icon for use across the app."],
			},
			v0_5_2: {
				Fixed: [
					"Reels no longer flicker or get stuck when switching between items.",
					"Profile pictures now load correctly, even while media is still being processed.",
					"Closed commissions can no longer be opened by accident.",
					"Staying logged in after refreshing the page is now more reliable.",
					"The app no longer briefly shows you as logged out when it first loads.",
					"Your selected theme now applies immediately, without flashing on startup.",
				],
				Improved: [
					"Folder cards now support custom colors and icons.",
					"License selection in commission modals is clearer and easier to use.",
					"Scrollable areas inside modals now behave more consistently.",
				],
			},
			v0_5_3: {
				Improved: [
					"Calendar, carousel, and multi-step form components are now more reliable and easier to use with a keyboard.",
				],
			},
			v0_5_4: {
				Improved: [
					"Reels now play more smoothly and pause correctly when you scroll away.",
					"The app should feel a bit faster thanks to general performance improvements.",
				],
				Fixed: [
					"The sign-up flow no longer gets stuck on the continue button in certain cases.",
				],
			},
			v0_6_0: {
				Added: [
					"Added a new filtering system for narrowing lists by date, text, numbers, or multiple options at once.",
					"Filters now work nicely on mobile too.",
				],
			},
			v0_7_0: {
				Added: [
					"You can now send and manage commission requests from start to finish.",
					"Added a new My Requests page where you can track the progress.",
				],
			},
			v0_7_1: {
				Improved: [
					"Commission requests now have clearer actions for submitting, accepting, rejecting, canceling, and attaching media.",
					"The request details page has a cleaner design, clearer status cards, and a hold-to-confirm button for sensitive actions.",
					"Artists now have a dashboard shortcut directly in the header.",
					"Filters now support grouped and nested options, making browsing easier.",
				],
			},
			v0_7_2: {
				Improved: [
					"Commission previews now load faster and look clearer.",
					"Archived commissions are now hidden from your list more reliably.",
				],
				Removed: [
					"Removed old placeholder data that was no longer needed.",
					"Portfolio post view is temporarily hidden while it is being reworked.",
				],
			},
			v0_7_3: {
				Added: [
					"Added release notes, so you can quickly see what is new, improved, and fixed in Familiar.",
				],
			},
			v0_7_4: {
				Improved: [
					"Release notes now support multiple languages, so more users can follow what changed.",
				],
				Fixed: [
					"Login and registration now share the same layout, so the pages feel more consistent.",
				],
			},
		},
	},
};

export default en;
