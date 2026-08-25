"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import {
	Accessibility,
	Bell,
	Globe,
	KeyRound,
	Link2,
	LogOut,
	Mail,
	Palette,
	Shield,
	Trash2,
	UserRound,
} from "lucide-react";
import {
	type ComponentType,
	type CSSProperties,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineCheck,
	OutlineChevronDown,
	OutlineClearNight,
	OutlineMonitor,
	OutlineSunny,
} from "@/components/icons/icons";
import type { ProfileEditorValues } from "@/components/layout/profile/profile-editor";
import { SettingsProfileEditor } from "@/components/layout/profile/settings-profile-editor";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { deriveShadeFromHex, getSwatchStyles } from "@/lib/colors";
import {
	languages,
	localizePath,
	stripLocaleFromPathname,
	syncLanguage,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import type { TUserResponse } from "@/types/user";

type SettingsSection =
	| "profile"
	| "account"
	| "appearance"
	| "notifications"
	| "privacy"
	| "language"
	| "accessibility"
	| "connections";

interface SettingsNavigationItem {
	id: SettingsSection;
	name: string;
	description: string;
	icon: ComponentType<{ className?: string }>;
}

interface UserSettingsModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave?: () => void;
}

const navigation: SettingsNavigationItem[] = [
	{
		id: "profile",
		name: "Profile",
		description: "Public profile information",
		icon: UserRound,
	},
	{
		id: "account",
		name: "Account",
		description: "Email, password and account access",
		icon: KeyRound,
	},
	{
		id: "appearance",
		name: "Appearance",
		description: "Theme and interface preferences",
		icon: Palette,
	},
	{
		id: "notifications",
		name: "Notifications",
		description: "Control when we notify you",
		icon: Bell,
	},
	{
		id: "privacy",
		name: "Privacy & visibility",
		description: "Manage profile visibility",
		icon: Shield,
	},
	{
		id: "language",
		name: "Language & region",
		description: "Language, region and formatting",
		icon: Globe,
	},
	{
		id: "accessibility",
		name: "Accessibility",
		description: "Motion and visual preferences",
		icon: Accessibility,
	},
	{
		id: "connections",
		name: "Connected accounts",
		description: "Manage external services",
		icon: Link2,
	},
];

// Danger 500: oklch(63.7% 0.237 25.331)
const DANGER_500_HEX = "#fb2c36";
const DANGER_PALETTE_OPTIONS = { baseShade: 500 } as const;
const DANGER_ZONE_SWATCH = getSwatchStyles(
	DANGER_500_HEX,
	100,
	DANGER_PALETTE_OPTIONS,
);
const DANGER_ACTION_SWATCH = getSwatchStyles(
	DANGER_500_HEX,
	500,
	DANGER_PALETTE_OPTIONS,
);
const DANGER_MUTED_FOREGROUND = deriveShadeFromHex(
	DANGER_500_HEX,
	"700",
	DANGER_PALETTE_OPTIONS,
);
const DANGER_ZONE_STYLE = {
	...DANGER_ZONE_SWATCH,
	"--foreground": DANGER_ZONE_SWATCH.color,
	"--muted-foreground": DANGER_MUTED_FOREGROUND,
	"--destructive": DANGER_ACTION_SWATCH.backgroundColor,
	"--destructive-foreground": DANGER_ACTION_SWATCH.color,
} as CSSProperties;

const EMPTY_PROFILE_VALUES: ProfileEditorValues = {
	avatar_url: "",
	cover_url: "",
	display_name: "",
	username: "",
	bio: "",
	accent_color: "",
};

interface SettingsMediaSource {
	fullSize?: { path?: string | null } | null;
	thumbnail?: { path?: string | null } | null;
}

type SettingsUser = TUserResponse & {
	avatarPath?: string | null;
	avatarUrl?: string | null;
	avatar?: SettingsMediaSource | null;
	coverPath?: string | null;
	coverUrl?: string | null;
	cover?: SettingsMediaSource | null;
	bio?: string | null;
	accentColor?: string | null;
};

function getMediaPath(media?: SettingsMediaSource | null) {
	return media?.fullSize?.path ?? media?.thumbnail?.path ?? "";
}

function getProfileEditorValues(user?: TUserResponse | null): ProfileEditorValues {
	if (!user) {
		return EMPTY_PROFILE_VALUES;
	}

	const settingsUser = user as SettingsUser;

	return {
		avatar_url:
			settingsUser.avatarPath ??
			settingsUser.avatarUrl ??
			getMediaPath(settingsUser.avatar),
		cover_url:
			settingsUser.coverPath ??
			settingsUser.coverUrl ??
			getMediaPath(settingsUser.cover),
		display_name: settingsUser.displayName ?? "",
		username: settingsUser.username ?? "",
		bio: settingsUser.bio ?? "",
		accent_color: settingsUser.accentColor ?? "",
	};
}

export function UserSettingsModal({
	open,
	onOpenChange,
	onSave,
}: UserSettingsModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					"flex h-[calc(100dvh-2rem)] max-h-190 w-[calc(100vw-2rem)] overflow-hidden p-0",
					"sm:!max-w-5xl",
				)}
			>
				<DialogTitle className="sr-only">User settings</DialogTitle>

				<DialogDescription className="sr-only">
					Manage your profile, account and application preferences.
				</DialogDescription>

				<UserSettingsPanel
					className="min-h-0"
					onCancel={() => onOpenChange(false)}
					onSave={onSave}
				/>
			</DialogContent>
		</Dialog>
	);
}

interface UserSettingsPanelProps {
	className?: string;
	onCancel?: () => void;
	onSave?: () => void;
}

export function UserSettingsPanel({
	className,
	onCancel,
	onSave,
}: UserSettingsPanelProps) {
	const { user } = useAuth();
	const [activeSection, setActiveSection] =
		useState<SettingsSection>("profile");
	const profileInitialValues = useMemo(
		() => getProfileEditorValues(user),
		[user],
	);
	const accountEmail = (user as { email?: string } | null | undefined)?.email ?? "";

	const activeItem =
		navigation.find((item) => item.id === activeSection) ?? navigation[0];

	return (
		<SidebarProvider
			className={cn("min-h-0 items-stretch", className)}
			style={
				{
					"--sidebar-width": "16rem",
				} as CSSProperties
			}
		>
			<Sidebar collapsible="none" className="hidden h-full border-r md:flex">
				<SidebarContent>
					<div className="flex h-16 shrink-0 items-center px-4">
						<div>
							<p className="font-semibold">Settings</p>

							<p className="text-xs text-muted-foreground">
								Manage your account
							</p>
						</div>
					</div>

					<Separator />

					<SidebarGroup className="py-4">
						<SidebarGroupLabel>User settings</SidebarGroupLabel>

						<SidebarGroupContent>
							{/* TODO: change URL to active section and make breadcrumb work */}
							<SidebarMenu>
								{navigation.map((item) => {
									const isActive = activeSection === item.id;

									return (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton
												type="button"
												isActive={isActive}
												tooltip={item.name}
												className="h-auto items-center py-2.5"
												onClick={() => setActiveSection(item.id)}
											>
												<item.icon className="size-4" />

												<div className="min-w-0 text-left">
													<p className="truncate text-sm font-medium">
														{item.name}
													</p>
												</div>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
				<header className="flex min-h-16 shrink-0 items-center border-b px-4 pr-12 md:px-6">
					<Breadcrumb className="hidden md:block">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink
									href="#"
									onClick={(event) => event.preventDefault()}
								>
									Settings
								</BreadcrumbLink>
							</BreadcrumbItem>

							<BreadcrumbSeparator />

							<BreadcrumbItem>
								<BreadcrumbPage>{activeItem.name}</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>

					<div className="min-w-0 md:hidden">
						<p className="truncate font-semibold">User settings</p>

						<p className="truncate text-xs text-muted-foreground">
							{activeItem.name}
						</p>
					</div>
				</header>

				<div className="shrink-0 border-b p-3 md:hidden">
					<label htmlFor="mobile-settings-section" className="sr-only">
						Settings section
					</label>

					<select
						id="mobile-settings-section"
						value={activeSection}
						className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onChange={(event) =>
							setActiveSection(event.target.value as SettingsSection)
						}
					>
						{navigation.map((item) => (
							<option key={item.id} value={item.id}>
								{item.name}
							</option>
						))}
					</select>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
					<div className="mx-auto w-full max-w-3xl p-4 md:p-8">
						<SettingsSectionContent
							section={activeSection}
							profileInitialValues={profileInitialValues}
							accountEmail={accountEmail}
							onSave={onSave}
						/>
					</div>
				</div>

				<footer className="flex shrink-0 items-center justify-end gap-2 border-t p-4">
					{onCancel && (
						<Button
							size="responsive-xl"
							type="button"
							variant="outline"
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}

					<Button
						size="responsive-xl"
						type="submit"
						form={`${activeSection}-settings-form`}
					>
						Save changes
					</Button>
				</footer>
			</main>
		</SidebarProvider>
	);
}

function SettingsSectionContent({
	section,
	profileInitialValues,
	accountEmail,
	onSave,
}: {
	section: SettingsSection;
	profileInitialValues: ProfileEditorValues;
	accountEmail: string;
	onSave?: () => void;
}) {
	switch (section) {
		case "profile":
			return (
				<ProfileSettings
					initialValues={profileInitialValues}
					onSubmit={() => onSave?.()}
				/>
			);

		case "account":
			return <AccountSettings email={accountEmail} onSubmit={onSave} />;

		case "appearance":
			return <AppearanceSettings onSubmit={onSave} />;

		case "notifications":
			return <NotificationSettings onSubmit={onSave} />;

		case "privacy":
			return <PrivacySettings onSubmit={onSave} />;

		case "language":
			return <LanguageSettings onSubmit={onSave} />;

		case "accessibility":
			return <AccessibilitySettings onSubmit={onSave} />;

		case "connections":
			return <ConnectedAccountsSettings onSubmit={onSave} />;

		default:
			return null;
	}
}

interface ProfileSettingsProps {
	initialValues?: ProfileEditorValues;
	onSubmit?: (values: ProfileEditorValues) => void;
}

export function ProfileSettings({
	initialValues,
	onSubmit,
}: ProfileSettingsProps) {
	return (
		<SettingsProfileEditor
			initialValues={initialValues}
			bioClassName="min-h-32"
			onSubmit={onSubmit}
		/>
	);
}

function AccountSettings({
	email,
	onSubmit,
}: {
	email: string;
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: { email },
		onSubmit: async () => {
			await onSubmit?.();
		},
	});

	useEffect(() => {
		form.reset({ email });
	}, [email, form]);

	return (
		<form
			id="account-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<div className="flex flex-col gap-6">
				<SettingsCard
					title="Email address"
					description="Used for signing in and account notifications."
				>
					<FieldGroup>
						<form.Field
							name="email"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name} className="sr-only">
										Email address
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<Mail />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											type="email"
											value={field.state.value}
											placeholder="Email address"
											readOnly
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton type="button" variant="secondary">
												Change
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
								</Field>
							)}
						/>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title="Password"
					description="Choose a strong and unique password."
				>
					<FieldGroup>
						<Field>
							<Button
								type="button"
								variant="secondary"
								size="responsive-xl"
							>
								<KeyRound data-icon="inline-start" />
								Change password
							</Button>
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title="Account sessions"
					description="Sign out from other browsers and devices."
				>
					<FieldGroup>
						<Field>
							<Button
								type="button"
								variant="secondary"
								size="responsive-xl"
							>
								<LogOut data-icon="inline-start" />
								Sign out other sessions
							</Button>
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title="Danger zone"
					description="These actions cannot easily be undone."
					style={DANGER_ZONE_STYLE}
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>Delete account</FieldLabel>
								<FieldDescription>
									Permanently delete your account and content.
								</FieldDescription>
							</FieldContent>
							<Button
								type="button"
								variant="destructive"
								size="responsive-xl"
								style={DANGER_ACTION_SWATCH}
								className="hover:opacity-90"
							>
								<Trash2 data-icon="inline-start" />
								Delete account
							</Button>
						</Field>
					</FieldGroup>
				</SettingsCard>
			</div>
		</form>
	);
}

function AppearanceSettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			compactLayout: false,
			showMediaAnimations: true,
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});

	return (
		<form
			id="appearance-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<div className="flex flex-col gap-6">
				<SettingsCard
					title="Theme"
					description="Select your preferred interface appearance."
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>Interface theme</FieldLabel>
								<FieldDescription>
									Applied immediately across the application.
								</FieldDescription>
							</FieldContent>
							<SettingsThemeSelect />
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard title="Interface">
					<FieldGroup>
						<form.Field
							name="compactLayout"
							children={(field) => (
								<SettingSwitch
									id={field.name}
									title="Compact layout"
									description="Reduce spacing and display more information."
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						/>

						<form.Field
							name="showMediaAnimations"
							children={(field) => (
								<SettingSwitch
									id={field.name}
									title="Show media animations"
									description="Automatically play animated portfolio media."
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						/>
					</FieldGroup>
				</SettingsCard>
			</div>
		</form>
	);
}

function NotificationSettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			messages: true,
			comments: true,
			likes: false,
			newFollowers: true,
			emailNotifications: false,
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});
	const preferences = [
		{
			name: "messages",
			title: "Messages",
			description: "Notify me when I receive a new message.",
		},
		{
			name: "comments",
			title: "Comments",
			description: "Notify me about comments on my posts.",
		},
		{
			name: "likes",
			title: "Likes",
			description: "Notify me when someone likes my work.",
		},
		{
			name: "newFollowers",
			title: "New followers",
			description: "Notify me when somebody follows my profile.",
		},
		{
			name: "emailNotifications",
			title: "Email notifications",
			description: "Send important notifications to my email.",
		},
	] as const;

	return (
		<form
			id="notifications-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<SettingsCard
				title="Notification preferences"
				description="Choose which activity should notify you."
			>
				<FieldGroup>
					{preferences.map((preference) => (
						<form.Field
							key={preference.name}
							name={preference.name}
							children={(field) => (
								<SettingSwitch
									id={field.name}
									title={preference.title}
									description={preference.description}
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						/>
					))}
				</FieldGroup>
			</SettingsCard>
		</form>
	);
}

function PrivacySettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			publicProfile: true,
			showOnlineStatus: true,
			showLikedPosts: false,
			allowSearchEngines: false,
			blurSensitiveContent: true,
			rememberRevealedPosts: false,
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});
	const visibilityPreferences = [
		{
			name: "publicProfile",
			title: "Public profile",
			description: "Allow anyone to view your profile.",
		},
		{
			name: "showOnlineStatus",
			title: "Show online status",
			description: "Allow other users to see when you are active.",
		},
		{
			name: "showLikedPosts",
			title: "Show liked posts",
			description: "Display your liked posts on your profile.",
		},
		{
			name: "allowSearchEngines",
			title: "Allow search engines",
			description: "Allow external search engines to index your profile.",
		},
	] as const;
	const contentPreferences = [
		{
			name: "blurSensitiveContent",
			title: "Always blur sensitive content",
			description: "Require confirmation before sensitive media is shown.",
		},
		{
			name: "rememberRevealedPosts",
			title: "Remember revealed posts",
			description:
				"Keep sensitive posts revealed during the current session.",
		},
	] as const;

	return (
		<form
			id="privacy-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<div className="flex flex-col gap-6">
				<SettingsCard
					title="Profile visibility"
					description="Control who can see your profile and activity."
				>
					<FieldGroup>
						{visibilityPreferences.map((preference) => (
							<form.Field
								key={preference.name}
								name={preference.name}
								children={(field) => (
									<SettingSwitch
										id={field.name}
										title={preference.title}
										description={preference.description}
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
								)}
							/>
						))}
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title="Sensitive content"
					description="Control how content warnings are handled."
				>
					<FieldGroup>
						{contentPreferences.map((preference) => (
							<form.Field
								key={preference.name}
								name={preference.name}
								children={(field) => (
									<SettingSwitch
										id={field.name}
										title={preference.title}
										description={preference.description}
										checked={field.state.value}
										onCheckedChange={field.handleChange}
									/>
								)}
							/>
						))}
					</FieldGroup>
				</SettingsCard>
			</div>
		</form>
	);
}

function LanguageSettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			region: "Poland",
			timeZone: "Europe/Warsaw",
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});

	return (
		<form
			id="language-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<div className="flex flex-col gap-6">
				<SettingsCard
					title="Language"
					description="Choose the language used throughout the application."
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>Application language</FieldLabel>
								<FieldDescription>
									Applied immediately without reloading the current page.
								</FieldDescription>
							</FieldContent>
							<SettingsLanguageSelect />
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title="Region"
					description="Used for dates, numbers and currency."
				>
					<FieldGroup className="grid sm:grid-cols-2">
						<form.Field
							name="region"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Region</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<Globe />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											list="settings-region-options"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</InputGroup>
								</Field>
							)}
						/>
						<datalist id="settings-region-options">
							<option value="Poland" />
							<option value="United States" />
							<option value="United Kingdom" />
							<option value="Germany" />
						</datalist>

						<form.Field
							name="timeZone"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>Time zone</FieldLabel>
									<InputGroup>
										<InputGroupAddon>
											<Globe />
										</InputGroupAddon>
										<InputGroupInput
											id={field.name}
											name={field.name}
											list="settings-time-zone-options"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) =>
												field.handleChange(event.target.value)
											}
										/>
									</InputGroup>
								</Field>
							)}
						/>
						<datalist id="settings-time-zone-options">
							<option value="Europe/Warsaw" />
							<option value="UTC" />
						</datalist>
					</FieldGroup>
				</SettingsCard>
			</div>
		</form>
	);
}

function SettingsLanguageSelect() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const selectedLanguage = languages.find((language) =>
		i18n.language.startsWith(language.value),
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					role="combobox"
					variant="secondary"
					size="responsive-xl"
					aria-expanded={open}
				>
					{selectedLanguage ? (
						<>
							<span className="text-lg" aria-hidden="true">
								{selectedLanguage.flag}
							</span>
							<span>{selectedLanguage.label}</span>
						</>
					) : (
						t("components.language_switcher.select", "Select language")
					)}
					<OutlineChevronDown data-icon="inline-end" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				className="w-56 overflow-hidden rounded-(--command-content-radius) p-0"
			>
				<Command>
					<CommandInput
						placeholder={t("components.language_select.search", "Search language")}
					/>
					<CommandList>
						<CommandEmpty>
							{t("components.language_select.no_results", "No language found")}
						</CommandEmpty>
						<CommandGroup>
							{languages.map((language) => (
								<CommandItem
									key={language.value}
									value={language.label}
									onSelect={async () => {
										await syncLanguage(language.value);
										const nextPathname = localizePath(
											stripLocaleFromPathname(window.location.pathname),
											language.value,
										);
										setOpen(false);
										router.history.push(
											`${nextPathname}${window.location.search}${window.location.hash}`,
										);
									}}
								>
									<span className="mr-2 text-lg leading-none" aria-hidden="true">
										{language.flag}
									</span>
									{language.label}
									<OutlineCheck
										className={cn(
											"ml-auto",
											i18n.language.startsWith(language.value)
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function SettingsThemeSelect() {
	const { t } = useTranslation();
	const { userTheme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);
	const themes = [
		{
			value: "light",
			label: t("components.theme_switcher.light", "Light"),
			icon: OutlineSunny,
		},
		{
			value: "dark",
			label: t("components.theme_switcher.dark", "Dark"),
			icon: OutlineClearNight,
		},
		{
			value: "oled",
			label: t("components.theme_switcher.oled", "OLED"),
			icon: OutlineClearNight,
		},
		{
			value: "system",
			label: t("components.theme_switcher.system", "System"),
			icon: OutlineMonitor,
		},
	] as const;
	const selectedTheme = themes.find((theme) => theme.value === userTheme);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					role="combobox"
					variant="secondary"
					size="responsive-xl"
					aria-expanded={open}
					aria-controls="settings-theme-options"
				>
					{selectedTheme ? (
						<>
							<selectedTheme.icon data-icon="inline-start" />
							<span>{selectedTheme.label}</span>
						</>
					) : (
						t("components.theme_switcher.toggle", "Select theme")
					)}
					<OutlineChevronDown data-icon="inline-end" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-44 overflow-hidden p-0">
				<Command>
					<CommandList id="settings-theme-options">
						<CommandGroup>
							{themes.map((theme) => (
								<CommandItem
									key={theme.value}
									value={theme.value}
									onSelect={() => {
										setTheme(theme.value);
										setOpen(false);
									}}
								>
									<theme.icon />
									{theme.label}
									<OutlineCheck
										className={cn(
											"ml-auto",
											userTheme === theme.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function AccessibilitySettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			reduceMotion: false,
			highContrast: false,
			underlineLinks: false,
			largerInterfaceText: false,
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});
	const preferences = [
		{
			name: "reduceMotion",
			title: "Reduce motion",
			description: "Reduce interface animations and transitions.",
		},
		{
			name: "highContrast",
			title: "High contrast",
			description: "Increase contrast between interface elements.",
		},
		{
			name: "underlineLinks",
			title: "Underline links",
			description: "Always show underlines beneath links.",
		},
		{
			name: "largerInterfaceText",
			title: "Larger interface text",
			description: "Increase the base text size throughout the application.",
		},
	] as const;

	return (
		<form
			id="accessibility-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<SettingsCard
				title="Accessibility preferences"
				description="Adjust the interface to make it more comfortable to use."
			>
				<FieldGroup>
					{preferences.map((preference) => (
						<form.Field
							key={preference.name}
							name={preference.name}
							children={(field) => (
								<SettingSwitch
									id={field.name}
									title={preference.title}
									description={preference.description}
									checked={field.state.value}
									onCheckedChange={field.handleChange}
								/>
							)}
						/>
					))}
				</FieldGroup>
			</SettingsCard>
		</form>
	);
}

function ConnectedAccountsSettings({
	onSubmit,
}: {
	onSubmit?: () => void | Promise<void>;
}) {
	const form = useForm({
		defaultValues: {
			google: true,
			discord: false,
			twitch: false,
		},
		onSubmit: async () => {
			await onSubmit?.();
		},
	});
	const connections = [
		{
			name: "google",
			label: "Google",
			description: "Use Google to sign in.",
		},
		{
			name: "discord",
			label: "Discord",
			description: "Connect your Discord profile.",
		},
		{
			name: "twitch",
			label: "Twitch",
			description: "Display your Twitch channel.",
		},
	] as const;

	return (
		<form
			id="connections-settings-form"
			onSubmit={(event) => {
				event.preventDefault();
				void form.handleSubmit();
			}}
		>
			<SettingsCard
				title="Connected accounts"
				description="Connect external services to your account."
			>
				<FieldGroup>
					{connections.map((connection) => (
						<form.Field
							key={connection.name}
							name={connection.name}
							children={(field) => (
								<ConnectionRow
									name={connection.label}
									description={connection.description}
									connected={field.state.value}
									onConnectedChange={field.handleChange}
								/>
							)}
						/>
					))}
				</FieldGroup>
			</SettingsCard>
		</form>
	);
}

interface SettingsCardProps {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
}

function SettingsCard({
	title,
	description,
	children,
	className,
	style,
}: SettingsCardProps) {
	return (
		<section
			className={cn("flex flex-col gap-5 rounded-2xl bg-surface-1 p-5", className)}
			style={style}
		>
			<FieldContent className="gap-1">
				<FieldTitle>{title}</FieldTitle>
				{description ? (
					<FieldDescription>{description}</FieldDescription>
				) : null}
			</FieldContent>
			{children}
		</section>
	);
}

interface SettingSwitchProps {
	id: string;
	title: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
}

function SettingSwitch({
	id,
	title,
	description,
	checked,
	onCheckedChange,
}: SettingSwitchProps) {
	return (
		<Field orientation="horizontal">
			<FieldContent>
				<FieldLabel htmlFor={id}>{title}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>

			<Switch
				id={id}
				name={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				className="shrink-0"
			/>
		</Field>
	);
}

interface ConnectionRowProps {
	name: string;
	description: string;
	connected: boolean;
	onConnectedChange: (connected: boolean) => void;
}

function ConnectionRow({
	name,
	description,
	connected,
	onConnectedChange,
}: ConnectionRowProps) {
	return (
		<Field orientation="horizontal">
			<FieldContent>
				<FieldLabel>{name}</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</FieldContent>

			<Button
				type="button"
				variant={connected ? "secondary" : "default"}
				size="responsive-xl"
				onClick={() => onConnectedChange(!connected)}
			>
				{connected ? "Disconnect" : "Connect"}
			</Button>
		</Field>
	);
}