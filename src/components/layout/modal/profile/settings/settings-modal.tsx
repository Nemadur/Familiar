"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import type { TFunction } from "i18next";
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
	X,
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
	DialogClose,
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
import { Kbd } from "@/components/ui/kbd";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
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

// TODO: do not open modal on isMobile, instead redirect to fullpage settings page

function getSettingsNavigation(t: TFunction): SettingsNavigationItem[] {
	return [
		{
			id: "profile",
			name: t("settings.navigation.profile.title", "Profile"),
			description: t(
				"settings.navigation.profile.description",
				"Public profile information",
			),
			icon: UserRound,
		},
		{
			id: "account",
			name: t("settings.navigation.account.title", "Account"),
			description: t(
				"settings.navigation.account.description",
				"Email, password and account access",
			),
			icon: KeyRound,
		},
		{
			id: "appearance",
			name: t("settings.navigation.appearance.title", "Appearance"),
			description: t(
				"settings.navigation.appearance.description",
				"Theme and interface preferences",
			),
			icon: Palette,
		},
		{
			id: "notifications",
			name: t("settings.navigation.notifications.title", "Notifications"),
			description: t(
				"settings.navigation.notifications.description",
				"Control when we notify you",
			),
			icon: Bell,
		},
		{
			id: "privacy",
			name: t("settings.navigation.privacy.title", "Privacy & visibility"),
			description: t(
				"settings.navigation.privacy.description",
				"Manage profile visibility",
			),
			icon: Shield,
		},
		{
			id: "language",
			name: t("settings.navigation.language.title", "Language & region"),
			description: t(
				"settings.navigation.language.description",
				"Language, region and formatting",
			),
			icon: Globe,
		},
		{
			id: "accessibility",
			name: t("settings.navigation.accessibility.title", "Accessibility"),
			description: t(
				"settings.navigation.accessibility.description",
				"Motion and visual preferences",
			),
			icon: Accessibility,
		},
		{
			id: "connections",
			name: t("settings.navigation.connections.title", "Connected accounts"),
			description: t(
				"settings.navigation.connections.description",
				"Manage external services",
			),
			icon: Link2,
		},
	];
}

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
	const { t } = useTranslation();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className={cn(
					"inset-0! size-auto! max-h-none! max-w-none! translate-x-0! translate-y-0! overflow-visible rounded-none border-0 p-0 shadow-none!",
					"sm:inset-auto! sm:left-1/2! sm:top-1/2! sm:h-[calc(100dvh-2rem)]! sm:w-[calc(100vw-2rem)]! sm:-translate-x-1/2! sm:-translate-y-1/2! sm:rounded-2xl sm:border sm:ring-1 sm:ring-border",
					"xl:max-h-190! xl:max-w-5xl!",
				)}
			>
				<div className="absolute right-4 top-2 z-20 flex flex-col items-center gap-1.5 xl:-right-14 xl:top-0">
					<DialogClose asChild>
						<Button
							type="button"
							variant="secondary"
							size="icon-xl"
							className="rounded-full bg-background ring-1 ring-border"
							aria-label={t(
								"settings.dialog.close",
								"Close settings dialog",
							)}
						>
							<X aria-hidden="true" />
						</Button>
					</DialogClose>
					<Kbd className="hidden bg-background/90 xl:inline-flex">
						{t("settings.dialog.escape_key", "ESC")}
					</Kbd>
				</div>

				<div className="flex size-full min-h-0 overflow-hidden rounded-[inherit]">
					<DialogTitle className="sr-only">
						{t("settings.title", "User settings")}
					</DialogTitle>

					<DialogDescription className="sr-only">
						{t(
							"settings.description",
							"Manage your profile, account and application preferences.",
						)}
					</DialogDescription>

					<UserSettingsPanel
						className="min-h-0"
						onCancel={() => onOpenChange(false)}
						onSave={onSave}
					/>
				</div>
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
	const { t } = useTranslation();
	const { user } = useAuth();
	const navigation = useMemo(() => getSettingsNavigation(t), [t]);
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
			<Sidebar collapsible="none" className="hidden h-full border-r xl:flex">
				<SidebarContent>
					<div className="flex h-16 shrink-0 items-center px-4">
						<div>
							<p className="font-semibold">
								{t("settings.sidebar.title", "Settings")}
							</p>

							<p className="text-xs text-muted-foreground">
								{t("settings.sidebar.description", "Manage your account")}
							</p>
						</div>
					</div>

					<Separator />

					<SidebarGroup className="py-4">
						<SidebarGroupLabel>
							{t("settings.sidebar.group", "User settings")}
						</SidebarGroupLabel>

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
				<header className="flex h-16 shrink-0 items-center px-4 pr-20 sm:px-6 xl:h-20 xl:px-8 xl:pr-6">
					<div className="min-w-0">
						<p className="truncate font-semibold xl:hidden">
							{t("settings.title", "User settings")}
						</p>

						<p className="hidden truncate font-semibold xl:block">
							{activeItem.name}
						</p>

						<p className="hidden truncate text-sm text-muted-foreground xl:block">
							{activeItem.description}
						</p>
					</div>
				</header>

				<div className="shrink-0 border-b px-4 pb-4 pt-2 sm:px-6 xl:hidden">
					<label htmlFor="mobile-settings-section" className="sr-only">
						{t("settings.mobile.section_label", "Settings section")}
					</label>

					<Select
						value={activeSection}
						onValueChange={(value) =>
							setActiveSection(value as SettingsSection)
						}
					>
						<SelectTrigger
							id="mobile-settings-section"
							className="h-11! w-full rounded-xl bg-muted/40"
						>
							<SelectValue
								placeholder={t(
									"settings.mobile.select_section",
									"Select a settings section",
								)}
							/>
						</SelectTrigger>

						<SelectContent>
							{navigation.map((item) => (
								<SelectItem key={item.id} value={item.id}>
									{item.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
					<div className="mx-auto w-full max-w-3xl p-4 sm:p-6 xl:p-8">
						<SettingsSectionContent
							section={activeSection}
							profileInitialValues={profileInitialValues}
							accountEmail={accountEmail}
							onSave={onSave}
						/>
					</div>
				</div>

				<footer className="flex shrink-0 items-center justify-end gap-2 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
					{onCancel && (
						<Button
							size="responsive-xl"
							type="button"
							variant="outline"
							className="min-w-0 flex-1 sm:flex-none"
							onClick={onCancel}
						>
							{t("common.cancel", "Cancel")}
						</Button>
					)}

					<Button
						size="responsive-xl"
						type="submit"
						form={`${activeSection}-settings-form`}
						className="min-w-0 flex-1 sm:flex-none"
					>
						{t("common.save_changes", "Save changes")}
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
	const { t } = useTranslation();
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
					title={t("settings.account.email.title", "Email address")}
					description={t(
						"settings.account.email.description",
						"Used for signing in and account notifications.",
					)}
				>
					<FieldGroup>
						<form.Field
							name="email"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name} className="sr-only">
										{t("settings.account.email.label", "Email address")}
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
											placeholder={t(
												"settings.account.email.placeholder",
												"Email address",
											)}
											readOnly
										/>
										<InputGroupAddon align="inline-end">
											<InputGroupButton type="button" variant="secondary">
												{t("settings.account.email.change", "Change")}
											</InputGroupButton>
										</InputGroupAddon>
									</InputGroup>
								</Field>
							)}
						/>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title={t("settings.account.password.title", "Password")}
					description={t(
						"settings.account.password.description",
						"Choose a strong and unique password.",
					)}
				>
					<FieldGroup>
						<Field>
							<Button
								type="button"
								variant="secondary"
								size="responsive-xl"
							>
								<KeyRound data-icon="inline-start" />
								{t("settings.account.password.change", "Change password")}
							</Button>
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title={t("settings.account.sessions.title", "Account sessions")}
					description={t(
						"settings.account.sessions.description",
						"Sign out from other browsers and devices.",
					)}
				>
					<FieldGroup>
						<Field>
							<Button
								type="button"
								variant="secondary"
								size="responsive-xl"
							>
								<LogOut data-icon="inline-start" />
								{t(
									"settings.account.sessions.sign_out_others",
									"Sign out other sessions",
								)}
							</Button>
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title={t("settings.account.danger.title", "Danger zone")}
					description={t(
						"settings.account.danger.description",
						"These actions cannot easily be undone.",
					)}
					style={DANGER_ZONE_STYLE}
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>
									{t("settings.account.delete.title", "Delete account")}
								</FieldLabel>
								<FieldDescription>
									{t(
										"settings.account.delete.description",
										"Permanently delete your account and content.",
									)}
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
								{t("settings.account.delete.action", "Delete account")}
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
	const { t } = useTranslation();
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
					title={t("settings.appearance.theme.title", "Theme")}
					description={t(
						"settings.appearance.theme.description",
						"Select your preferred interface appearance.",
					)}
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>
									{t(
										"settings.appearance.theme.interface_label",
										"Interface theme",
									)}
								</FieldLabel>
								<FieldDescription>
									{t(
										"settings.appearance.theme.applied_description",
										"Applied immediately across the application.",
									)}
								</FieldDescription>
							</FieldContent>
							<SettingsThemeSelect />
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title={t("settings.appearance.interface.title", "Interface")}
				>
					<FieldGroup>
						<form.Field
							name="compactLayout"
							children={(field) => (
								<SettingSwitch
									id={field.name}
									title={t(
										"settings.appearance.compact_layout.title",
										"Compact layout",
									)}
									description={t(
										"settings.appearance.compact_layout.description",
										"Reduce spacing and display more information.",
									)}
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
									title={t(
										"settings.appearance.media_animations.title",
										"Show media animations",
									)}
									description={t(
										"settings.appearance.media_animations.description",
										"Automatically play animated portfolio media.",
									)}
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
	const { t } = useTranslation();
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
			title: t("settings.notifications.messages.title", "Messages"),
			description: t(
				"settings.notifications.messages.description",
				"Notify me when I receive a new message.",
			),
		},
		{
			name: "comments",
			title: t("settings.notifications.comments.title", "Comments"),
			description: t(
				"settings.notifications.comments.description",
				"Notify me about comments on my posts.",
			),
		},
		{
			name: "likes",
			title: t("settings.notifications.likes.title", "Likes"),
			description: t(
				"settings.notifications.likes.description",
				"Notify me when someone likes my work.",
			),
		},
		{
			name: "newFollowers",
			title: t(
				"settings.notifications.new_followers.title",
				"New followers",
			),
			description: t(
				"settings.notifications.new_followers.description",
				"Notify me when somebody follows my profile.",
			),
		},
		{
			name: "emailNotifications",
			title: t(
				"settings.notifications.email.title",
				"Email notifications",
			),
			description: t(
				"settings.notifications.email.description",
				"Send important notifications to my email.",
			),
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
				title={t(
					"settings.notifications.preferences.title",
					"Notification preferences",
				)}
				description={t(
					"settings.notifications.preferences.description",
					"Choose which activity should notify you.",
				)}
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
	const { t } = useTranslation();
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
			title: t("settings.privacy.public_profile.title", "Public profile"),
			description: t(
				"settings.privacy.public_profile.description",
				"Allow anyone to view your profile.",
			),
		},
		{
			name: "showOnlineStatus",
			title: t(
				"settings.privacy.online_status.title",
				"Show online status",
			),
			description: t(
				"settings.privacy.online_status.description",
				"Allow other users to see when you are active.",
			),
		},
		{
			name: "showLikedPosts",
			title: t(
				"settings.privacy.liked_posts.title",
				"Show liked posts",
			),
			description: t(
				"settings.privacy.liked_posts.description",
				"Display your liked posts on your profile.",
			),
		},
		{
			name: "allowSearchEngines",
			title: t(
				"settings.privacy.search_engines.title",
				"Allow search engines",
			),
			description: t(
				"settings.privacy.search_engines.description",
				"Allow external search engines to index your profile.",
			),
		},
	] as const;
	const contentPreferences = [
		{
			name: "blurSensitiveContent",
			title: t(
				"settings.privacy.sensitive_content.blur.title",
				"Always blur sensitive content",
			),
			description: t(
				"settings.privacy.sensitive_content.blur.description",
				"Require confirmation before sensitive media is shown.",
			),
		},
		{
			name: "rememberRevealedPosts",
			title: t(
				"settings.privacy.sensitive_content.remember.title",
				"Remember revealed posts",
			),
			description: t(
				"settings.privacy.sensitive_content.remember.description",
				"Keep sensitive posts revealed during the current session.",
			),
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
					title={t(
						"settings.privacy.visibility.title",
						"Profile visibility",
					)}
					description={t(
						"settings.privacy.visibility.description",
						"Control who can see your profile and activity.",
					)}
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
					title={t(
						"settings.privacy.sensitive_content.title",
						"Sensitive content",
					)}
					description={t(
						"settings.privacy.sensitive_content.description",
						"Control how content warnings are handled.",
					)}
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
	const { t } = useTranslation();
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
					title={t("settings.language.language.title", "Language")}
					description={t(
						"settings.language.language.description",
						"Choose the language used throughout the application.",
					)}
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel>
									{t(
										"settings.language.application_language.label",
										"Application language",
									)}
								</FieldLabel>
								<FieldDescription>
									{t(
										"settings.language.application_language.description",
										"Applied immediately without reloading the current page.",
									)}
								</FieldDescription>
							</FieldContent>
							<SettingsLanguageSelect />
						</Field>
					</FieldGroup>
				</SettingsCard>

				<SettingsCard
					title={t("settings.language.region.title", "Region")}
					description={t(
						"settings.language.region.description",
						"Used for dates, numbers and currency.",
					)}
				>
					<FieldGroup className="grid sm:grid-cols-2">
						<form.Field
							name="region"
							children={(field) => (
								<Field>
									<FieldLabel htmlFor={field.name}>
										{t("settings.language.region.label", "Region")}
									</FieldLabel>
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
									<FieldLabel htmlFor={field.name}>
										{t("settings.language.time_zone.label", "Time zone")}
									</FieldLabel>
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
	const { t } = useTranslation();
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
			title: t(
				"settings.accessibility.reduce_motion.title",
				"Reduce motion",
			),
			description: t(
				"settings.accessibility.reduce_motion.description",
				"Reduce interface animations and transitions.",
			),
		},
		{
			name: "highContrast",
			title: t(
				"settings.accessibility.high_contrast.title",
				"High contrast",
			),
			description: t(
				"settings.accessibility.high_contrast.description",
				"Increase contrast between interface elements.",
			),
		},
		{
			name: "underlineLinks",
			title: t(
				"settings.accessibility.underline_links.title",
				"Underline links",
			),
			description: t(
				"settings.accessibility.underline_links.description",
				"Always show underlines beneath links.",
			),
		},
		{
			name: "largerInterfaceText",
			title: t(
				"settings.accessibility.larger_text.title",
				"Larger interface text",
			),
			description: t(
				"settings.accessibility.larger_text.description",
				"Increase the base text size throughout the application.",
			),
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
				title={t(
					"settings.accessibility.preferences.title",
					"Accessibility preferences",
				)}
				description={t(
					"settings.accessibility.preferences.description",
					"Adjust the interface to make it more comfortable to use.",
				)}
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
	const { t } = useTranslation();
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
			label: t("settings.connections.google.label", "Google"),
			description: t(
				"settings.connections.google.description",
				"Use Google to sign in.",
			),
		},
		{
			name: "discord",
			label: t("settings.connections.discord.label", "Discord"),
			description: t(
				"settings.connections.discord.description",
				"Connect your Discord profile.",
			),
		},
		{
			name: "twitch",
			label: t("settings.connections.twitch.label", "Twitch"),
			description: t(
				"settings.connections.twitch.description",
				"Display your Twitch channel.",
			),
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
				title={t("settings.connections.title", "Connected accounts")}
				description={t(
					"settings.connections.description",
					"Connect external services to your account.",
				)}
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
			className={cn(
				"flex flex-col gap-4 rounded-xl bg-surface-1 p-4 sm:gap-5 sm:rounded-2xl sm:p-5",
				className,
			)}
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
	const { t } = useTranslation();

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
				{connected
					? t("settings.connections.disconnect", "Disconnect")
					: t("settings.connections.connect", "Connect")}
			</Button>
		</Field>
	);
}
