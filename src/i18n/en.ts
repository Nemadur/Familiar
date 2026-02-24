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
		},
		terms_agree: {
			label: "Registering on $t(header.title) you agree to our",
			terms: "Terms of Service",
			and: "and",
			privacy: "Privacy Policy",
		},
		register: {
			cta: "Sign in",
			title: "Create an account",
			description: "Enter your details below to create your account",
			already_have_account: "Already have an account?",
		},
		forgot: {
			cta: "Reset Password",
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
			placeholder: "FAM-xxxx-xxxx-xxx",
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
			pending: "Creating Account...",
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
					content_warning: "Content Warning",
					sensitive_content: "Sensitive content",
					contains_tags: "This media contains {{tags}}",
					show_content: "Show Content",
					hide_content: "Hide Content",
				},
				empty: {
					title: "No commissions available",
					description: "This user hasn't set up any commissions yet.",
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
};

export default en;
