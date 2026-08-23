"use client";

import { Typography } from "@heroui/react";
import {
	Accessibility,
	Bell,
	Globe,
	KeyRound,
	Link2,
	LogOut,
	Palette,
	Shield,
	Trash2,
	UserRound,
} from "lucide-react";
import { type ComponentType, type CSSProperties, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
	ProfileEditor,
	type ProfileEditorValues,
} from "@/components/layout/profile/profile-editor";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { Elevated } from "@/lib/elevated";
import { cn } from "@/lib/utils";

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

// TODO: get user data and put into fields (if user is logged in)
export function UserSettingsPanel({
	className,
	onCancel,
	onSave,
}: UserSettingsPanelProps) {
	const [activeSection, setActiveSection] =
		useState<SettingsSection>("profile");

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
						<SettingsSectionContent section={activeSection} onSave={onSave} />
					</div>
				</div>

				<footer className="flex shrink-0 items-center justify-end gap-2 border-t p-4">
					{onCancel && (
						<Button
							size="xl"
							type="button"
							variant="outline"
							onClick={onCancel}
						>
							Cancel
						</Button>
					)}

					<Button
						size="xl"
						type="submit"
						form={
							activeSection === "profile" ? "profile-settings-form" : undefined
						}
						onClick={activeSection === "profile" ? undefined : onSave}
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
	onSave,
}: {
	section: SettingsSection;
	onSave?: () => void;
}) {
	switch (section) {
		case "profile":
			return <ProfileSettings onSubmit={() => onSave?.()} />;

		case "account":
			return <AccountSettings />;

		case "appearance":
			return <AppearanceSettings />;

		case "notifications":
			return <NotificationSettings />;

		case "privacy":
			return <PrivacySettings />;

		case "language":
			return <LanguageSettings />;

		case "accessibility":
			return <AccessibilitySettings />;

		case "connections":
			return <ConnectedAccountsSettings />;

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
	const form = useForm<ProfileEditorValues>({
		defaultValues: initialValues,
	});

	return (
		<FormProvider {...form}>
			<form
				id="profile-settings-form"
				onSubmit={form.handleSubmit((values) => onSubmit?.(values))}
			>
				<ProfileEditor bioClassName="min-h-32" />
			</form>
		</FormProvider>
	);
}

function AccountSettings() {
	return (
		<div className="space-y-8">
			<SettingsCard
				title="Email address"
				description="Used for signing in and account notifications."
			>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Input type="email" defaultValue="draconek@example.com" />

					<Button type="button" variant="outline" className="shrink-0">
						Change email
					</Button>
				</div>
			</SettingsCard>

			<SettingsCard
				title="Password"
				description="Choose a strong and unique password."
			>
				<Button type="button" variant="outline">
					<KeyRound />
					Change password
				</Button>
			</SettingsCard>

			<SettingsCard
				title="Account sessions"
				description="Sign out from other browsers and devices."
			>
				<Button type="button" variant="outline">
					<LogOut />
					Sign out other sessions
				</Button>
			</SettingsCard>

			<SettingsCard
				title="Danger zone"
				description="These actions cannot easily be undone."
				className="border-destructive/30"
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-sm font-medium">Delete account</p>

						<p className="text-xs text-muted-foreground">
							Permanently delete your account and content.
						</p>
					</div>

					<Button type="button" variant="destructive">
						<Trash2 />
						Delete account
					</Button>
				</div>
			</SettingsCard>
		</div>
	);
}

function AppearanceSettings() {
	return (
		<div className="space-y-8">
			<SettingsCard
				title="Theme"
				description="Select your preferred interface appearance."
			>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
					{["Light", "Dark", "System"].map((theme) => (
						<button
							key={theme}
							type="button"
							className={cn(
								"rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
								theme === "System" &&
									"border-primary bg-primary/5 ring-1 ring-primary",
							)}
						>
							<div
								className={cn(
									"mb-3 aspect-video rounded-lg border",
									theme === "Light" && "bg-white",
									theme === "Dark" && "bg-neutral-950",
									theme === "System" &&
										"bg-linear-to-r from-white to-neutral-950",
								)}
							/>

							<p className="text-sm font-medium">{theme}</p>
						</button>
					))}
				</div>
			</SettingsCard>

			<SettingsCard title="Interface">
				<div className="divide-y">
					<SettingSwitch
						title="Compact layout"
						description="Reduce spacing and display more information."
					/>

					<SettingSwitch
						title="Show media animations"
						description="Automatically play animated portfolio media."
						defaultChecked
					/>
				</div>
			</SettingsCard>
		</div>
	);
}

function NotificationSettings() {
	return (
		<SettingsCard
			title="Notification preferences"
			description="Choose which activity should notify you."
		>
			<div className="divide-y">
				<SettingSwitch
					title="Messages"
					description="Notify me when I receive a new message."
					defaultChecked
				/>

				<SettingSwitch
					title="Comments"
					description="Notify me about comments on my posts."
					defaultChecked
				/>

				<SettingSwitch
					title="Likes"
					description="Notify me when someone likes my work."
				/>

				<SettingSwitch
					title="New followers"
					description="Notify me when somebody follows my profile."
					defaultChecked
				/>

				<SettingSwitch
					title="Email notifications"
					description="Send important notifications to my email."
				/>
			</div>
		</SettingsCard>
	);
}

function PrivacySettings() {
	return (
		<div className="space-y-8">
			<SettingsCard
				title="Profile visibility"
				description="Control who can see your profile and activity."
			>
				<div className="divide-y">
					<SettingSwitch
						title="Public profile"
						description="Allow anyone to view your profile."
						defaultChecked
					/>

					<SettingSwitch
						title="Show online status"
						description="Allow other users to see when you are active."
						defaultChecked
					/>

					<SettingSwitch
						title="Show liked posts"
						description="Display your liked posts on your profile."
					/>

					<SettingSwitch
						title="Allow search engines"
						description="Allow external search engines to index your profile."
					/>
				</div>
			</SettingsCard>

			<SettingsCard
				title="Sensitive content"
				description="Control how content warnings are handled."
			>
				<div className="divide-y">
					<SettingSwitch
						title="Always blur sensitive content"
						description="Require confirmation before sensitive media is shown."
						defaultChecked
					/>

					<SettingSwitch
						title="Remember revealed posts"
						description="Keep sensitive posts revealed during the current session."
					/>
				</div>
			</SettingsCard>
		</div>
	);
}

function LanguageSettings() {
	return (
		<div className="space-y-8">
			<SettingsCard
				title="Language"
				description="Choose the language used throughout the application."
			>
				<SettingsField label="Application language" htmlFor="settings-language">
					<select
						id="settings-language"
						defaultValue="en"
						className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="en">English</option>
						<option value="pl">Polski</option>
						<option value="de">Deutsch</option>
						<option value="fr">Français</option>
						<option value="es">Español</option>
					</select>
				</SettingsField>
			</SettingsCard>

			<SettingsCard
				title="Region"
				description="Used for dates, numbers and currency."
			>
				<div className="grid gap-5 sm:grid-cols-2">
					<SettingsField label="Region" htmlFor="settings-region">
						<select
							id="settings-region"
							defaultValue="pl"
							className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<option value="pl">Poland</option>
							<option value="us">United States</option>
							<option value="gb">United Kingdom</option>
							<option value="de">Germany</option>
						</select>
					</SettingsField>

					<SettingsField label="Time zone" htmlFor="settings-time-zone">
						<select
							id="settings-time-zone"
							defaultValue="europe-warsaw"
							className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<option value="europe-warsaw">Europe/Warsaw</option>
							<option value="utc">UTC</option>
						</select>
					</SettingsField>
				</div>
			</SettingsCard>
		</div>
	);
}

function AccessibilitySettings() {
	return (
		<SettingsCard
			title="Accessibility preferences"
			description="Adjust the interface to make it more comfortable to use."
		>
			<div className="divide-y">
				<SettingSwitch
					title="Reduce motion"
					description="Reduce interface animations and transitions."
				/>

				<SettingSwitch
					title="High contrast"
					description="Increase contrast between interface elements."
				/>

				<SettingSwitch
					title="Underline links"
					description="Always show underlines beneath links."
				/>

				<SettingSwitch
					title="Larger interface text"
					description="Increase the base text size throughout the application."
				/>
			</div>
		</SettingsCard>
	);
}

function ConnectedAccountsSettings() {
	return (
		<SettingsCard
			title="Connected accounts"
			description="Connect external services to your account."
		>
			<div className="divide-y">
				<ConnectionRow
					name="Google"
					description="Use Google to sign in."
					connected
				/>

				<ConnectionRow
					name="Discord"
					description="Connect your Discord profile."
				/>

				<ConnectionRow
					name="Twitch"
					description="Display your Twitch channel."
				/>
			</div>
		</SettingsCard>
	);
}

interface SettingsCardProps {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

function SettingsCard({
	title,
	description,
	children,
	className,
}: SettingsCardProps) {
	return (
		<Elevated offset={0} className={cn("rounded-xl p-5", className)}>
			<div className="mb-5">
				<Typography.Heading level={4}>{title}</Typography.Heading>

				{description && (
					<Typography.Paragraph size={"sm"} className="text-muted-foreground!">
						{description}
					</Typography.Paragraph>
				)}
			</div>

			{children}
		</Elevated>
	);
}

interface SettingsFieldProps {
	label: string;
	htmlFor: string;
	description?: string;
	children: React.ReactNode;
}

function SettingsField({
	label,
	htmlFor,
	description,
	children,
}: SettingsFieldProps) {
	return (
		<div className="space-y-2">
			<label htmlFor={htmlFor} className="text-sm font-medium">
				{label}
			</label>

			{children}

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
		</div>
	);
}

interface SettingSwitchProps {
	title: string;
	description: string;
	defaultChecked?: boolean;
}

function SettingSwitch({
	title,
	description,
	defaultChecked,
}: SettingSwitchProps) {
	return (
		<div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
			<div className="min-w-0">
				<p className="text-sm font-medium">{title}</p>

				<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
					{description}
				</p>
			</div>

			<Switch
				defaultChecked={defaultChecked}
				aria-label={title}
				className="shrink-0"
			/>
		</div>
	);
}

interface ConnectionRowProps {
	name: string;
	description: string;
	connected?: boolean;
}

function ConnectionRow({ name, description, connected }: ConnectionRowProps) {
	return (
		<div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
			<div className="min-w-0">
				<p className="text-sm font-medium">{name}</p>

				<p className="mt-1 text-xs text-muted-foreground">{description}</p>
			</div>

			<Button
				type="button"
				variant={connected ? "outline" : "default"}
				size="sm"
			>
				{connected ? "Disconnect" : "Connect"}
			</Button>
		</div>
	);
}
