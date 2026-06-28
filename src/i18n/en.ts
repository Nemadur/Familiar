const en = {
	seo: {
		defaults: {
			title: "Familiar",
			description: "Your art looks $t(meta.app_name)",
			keywords: "art, familiar, commission",
		},
		home: {
			title: "Home",
			description: "Your art looks $t(meta.app_name)",
		},
		profile: {
			title: "Profile (@{{username}})",
			description: "User profile for @{{username}}",
		},
		shop: {
			title: "Shop - Discover Custom Art Commissions",
			description:
				"Browse custom art commissions from independent artists on $t(meta.app_name). Discover unique styles, compare offers, view galleries, and request artwork made just for you.",
			keywords:
				"custom art commissions, art commission marketplace, commission artists, digital art commissions, character art commission, illustration commission, artist shop, custom artwork, freelance artists, Familiar shop",
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
			title: "Home",
			description: "Page is under construction.",
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
			terms: "Terms of Service",
			privacy: "Privacy Policy",
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
			v0_7_5: {
				Added: [
					"Added [Privacy Policy](/privacy) and [Terms of Service](/tos) pages.",
				],
				Improved: [
					"Privacy Policy and Terms of Service now have a cleaner reading layout with better typography.",
					"Legal pages now use translated content, including titles, descriptions, dates, sections, and list items.",
					"Release notes now look better on mobile, with a layout that gives each version more space.",
					"The footer is now easier to maintain and includes clearer links to legal resources.",
				],
				Fixed: [
					"Release note content no longer gets squeezed into narrow columns on small screens.",
					"Legal document sections now render correctly from translations.",
					"Markdown content in legal pages no longer creates invalid nested paragraph elements.",
				],
			},
			v0_8_0: {
				Added: [
					"Added the Shop feature with browsing, categories, and item filtering.",
					"Added a detailed Shop Item modal to view items and add them to your basket.",
					"Added a Basket dropdown in the header and a dedicated Checkout page.",
				],
			},
		},
	},
	privacyPolicy: {
		title: "Privacy Policy",
		eyebrow: "Legal",
		description:
			"Learn how Familiar collects, uses, and protects your information.",
		effectiveDateLabel: "Effective date",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Introduction",
				body: [
					"Familiar is a social platform for artists, clients, and creative communities. This Privacy Policy explains what information we collect, how we use it, and what choices you have.",
					"By using Familiar, you agree to the practices described in this policy.",
				],
			},
			{
				title: "Information we collect",
				body: [
					"We collect information that you provide directly when you create an account, edit your profile, post content, request commissions, or contact us.",
				],
				items: [
					"Account information, such as your email, username, display name, and account type.",
					"Profile information, such as avatar, bio, language badges, portfolio content, and public links.",
					"Content you upload or share, such as posts, images, commission details, and messages connected to requests.",
					"Technical information, such as device type, browser, IP address, session data, and basic usage logs.",
				],
			},
			{
				title: "How we use your information",
				body: [
					"We use your information to provide, secure, improve, and personalize Familiar.",
				],
				items: [
					"To create and manage your account.",
					"To display your profile, portfolio, posts, and commission information.",
					"To process commission requests and related actions.",
					"To protect the platform from abuse, spam, fraud, and unauthorized access.",
					"To improve performance, accessibility, and user experience.",
					"To contact you about important account, safety, or service updates.",
				],
			},
			{
				title: "Public content",
				body: [
					"Some information on Familiar is public by design. This may include your username, display name, avatar, profile page, portfolio, public posts, commission listings, and other content you choose to publish.",
					"Please avoid sharing private or sensitive information in public areas of the platform.",
				],
			},
			{
				title: "Cookies and similar technologies",
				body: [
					"Familiar may use cookies, local storage, and similar technologies to keep you signed in, remember your preferences, improve security, and understand how the platform is used.",
				],
			},
			{
				title: "How we share information",
				body: [
					"We do not sell your personal information. We may share limited information only when necessary to operate Familiar, comply with legal obligations, protect users, or use trusted service providers.",
				],
				items: [
					"Service providers that help us host, secure, analyze, or operate the platform.",
					"Authorities or legal parties when required by law or valid legal process.",
					"Other users, when you publish content or interact with public features.",
				],
			},
			{
				title: "Data retention",
				body: [
					"We keep your information for as long as needed to provide Familiar, comply with legal obligations, resolve disputes, prevent abuse, and enforce our terms.",
					"When your information is no longer needed, we will delete it or anonymize it where reasonably possible.",
				],
			},
			{
				title: "Your choices and rights",
				body: [
					"Depending on your location, you may have rights to access, correct, delete, export, or restrict the use of your personal information.",
				],
				items: [
					"You can update some account and profile information directly in your settings.",
					"You may request deletion or correction of certain personal information.",
					"You may contact us if you have privacy questions or requests.",
				],
			},
			{
				title: "Security",
				body: [
					"We use reasonable technical and organizational measures to protect your information. However, no online service can guarantee perfect security.",
				],
			},
			{
				title: "Children's privacy",
				body: [
					"Familiar is not intended for children below the minimum age required by applicable law. If we learn that we collected personal information from a child without proper consent, we will take appropriate steps to remove it.",
				],
			},
			{
				title: "Changes to this policy",
				body: [
					"We may update this Privacy Policy from time to time. When we make important changes, we will update the effective date and may notify users through the platform.",
				],
			},
			{
				title: "Contact",
				body: [
					"If you have questions about this Privacy Policy, you can contact the Familiar team through the official support or contact channels provided on the platform.",
				],
			},
		],
	},
	termsOfService: {
		title: "Terms of Service",
		eyebrow: "Legal",
		description: "Please read these terms carefully before using Familiar.",
		effectiveDateLabel: "Effective date",
		effectiveDate: "2026-06-07",
		sections: [
			{
				title: "Introduction",
				body: [
					"These Terms of Service explain the rules for using Familiar. Familiar is a social platform for artists, clients, and creative communities.",
					"By creating an account or using Familiar, you agree to these terms. If you do not agree, please do not use the platform.",
				],
			},
			{
				title: "Accounts",
				body: [
					"You may need an account to use some features of Familiar. You are responsible for keeping your login details safe and for all activity that happens through your account.",
				],
				items: [
					"You must provide accurate information when creating an account.",
					"You may not impersonate another person, brand, artist, or organization.",
					"You may not sell, transfer, or share access to your account without permission.",
					"You must contact us if you believe your account has been accessed without permission.",
				],
			},
			{
				title: "User content",
				body: [
					"You keep ownership of the content you create and upload to Familiar. However, by posting content on the platform, you allow us to display, store, process, and share that content as needed to operate Familiar.",
					"You are responsible for making sure that you have the rights to upload and share your content.",
				],
				items: [
					"You may not upload content that infringes someone else's rights.",
					"You may not upload illegal, abusive, hateful, harmful, or misleading content.",
					"You may not upload content that violates our community rules or platform policies.",
				],
			},
			{
				title: "Artist services and commissions",
				body: [
					"Familiar may allow artists and clients to communicate about commissions, requests, portfolios, and related services.",
					"Unless clearly stated otherwise, Familiar is not a party to individual agreements between artists and clients. Artists and clients are responsible for setting clear expectations, prices, deadlines, licenses, and delivery terms.",
				],
				items: [
					"Artists are responsible for describing their services accurately.",
					"Clients are responsible for reading service details before submitting a request.",
					"Both sides are responsible for respecting agreed terms, licenses, and payment arrangements.",
				],
			},
			{
				title: "Acceptable use",
				body: [
					"You agree to use Familiar in a safe, lawful, and respectful way.",
				],
				items: [
					"You may not use Familiar for spam, scams, fraud, harassment, or abuse.",
					"You may not attempt to disrupt, overload, scrape, reverse engineer, or attack the platform.",
					"You may not bypass security systems, access controls, bans, or account restrictions.",
					"You may not use Familiar to distribute malware or harmful links.",
				],
			},
			{
				title: "Content moderation",
				body: [
					"We may review, hide, restrict, remove, or report content if we believe it violates these terms, our policies, the law, or the safety of the platform.",
					"We may also suspend or terminate accounts that break the rules or create risk for Familiar, its users, or its community.",
				],
			},
			{
				title: "Intellectual property",
				body: [
					"Familiar, including its design, branding, interface, software, and platform features, is protected by intellectual property laws. You may not copy, modify, distribute, or misuse Familiar's own materials without permission.",
					"Content uploaded by users belongs to the relevant users or rights holders, unless stated otherwise.",
				],
			},
			{
				title: "Third-party services",
				body: [
					"Familiar may use third-party services for hosting, authentication, payments, analytics, storage, or other platform features. These services may have their own terms and privacy policies.",
				],
			},
			{
				title: "Availability and changes",
				body: [
					"We work to keep Familiar available and reliable, but we cannot guarantee that the platform will always be uninterrupted, error-free, or available.",
					"We may update, change, suspend, or remove features at any time, especially when needed for security, maintenance, legal compliance, or product improvement.",
				],
			},
			{
				title: "Disclaimers",
				body: [
					"Familiar is provided on an as-is and as-available basis. To the fullest extent allowed by law, we do not make warranties about uninterrupted access, perfect security, suitability for a specific purpose, or the accuracy of user content.",
				],
			},
			{
				title: "Limitation of liability",
				body: [
					"To the fullest extent allowed by law, Familiar and its team will not be liable for indirect, incidental, special, consequential, or punitive damages related to your use of the platform.",
				],
			},
			{
				title: "Termination",
				body: [
					"You may stop using Familiar at any time. We may suspend or terminate access if you violate these terms, create legal risk, harm other users, or misuse the platform.",
				],
			},
			{
				title: "Changes to these terms",
				body: [
					"We may update these Terms of Service from time to time. When we make important changes, we will update the effective date and may notify users through the platform.",
				],
			},
			{
				title: "Contact",
				body: [
					"If you have questions about these Terms of Service, you can contact the Familiar team through the official support or contact channels provided on the platform.",
				],
			},
		],
	},
	roadmap: {
		title: "Coming next to Familiar",
		eyebrow: "Roadmap",
		description:
			"A simple look at planned features and what we are working on next.",
		status: {
			Planned: "Planned",
			InProgress: "In progress",
			Exploring: "Exploring",
		},
		items: {
			"item-1": {
				title: "Better commission dashboard",
				description:
					"A clearer dashboard for artists and clients to manage commission requests more easily.",
				details: [
					"Clearer request status cards.",
					"Better actions for accepting, rejecting, canceling, and updating requests.",
					"Cleaner mobile layout for managing commissions on smaller screens.",
				],
			},
			"item-2": {
				title: "Improved portfolio posts",
				description:
					"Portfolio posts will return with a cleaner detail view and better sharing support.",
				details: [
					"Better post pages for artwork and commission examples.",
					"Cleaner media display for images and previews.",
					"Improved links for sharing portfolio posts.",
				],
			},
			"item-3": {
				title: "Notifications",
				description:
					"Notifications are being explored to help users follow important activity without checking every page manually.",
				details: [
					"Updates for commission request changes.",
					"Possible profile, follow, and activity notifications.",
					"Simple notification center inside the app.",
				],
			},
		},
	},
};

export default en;
