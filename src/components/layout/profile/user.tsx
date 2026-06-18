import { Link } from "@tanstack/react-router";
import { Calligraph } from "calligraph";
import { SprayCanIcon } from "lucide-react";
import { useState } from "react";
import {
	OutlineCheck,
	OutlineClearNight,
	OutlineLogout,
	OutlineMonitor,
	OutlineReceipt,
	OutlineSettings,
	OutlineSunny,
	OutlineUser,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { useTheme } from "@/providers/theme";
import type { TUserProfile, TUserResponse } from "@/types/user";
import UserAvatar from "./avatar";

type UserButtonContentProps = {
	user: TUserResponse;
	showInfo?: boolean;
	showAvatar?: boolean;
	showUsername?: boolean;
	description?: React.ReactNode;
	avatarSize?: "sm" | "default" | "lg" | "xl";
	status?: string;
	isOnline?: boolean;
	avatarBadgeClassName?: string;
};

function UserButtonContent({
	user,
	showInfo = true,
	showAvatar = true,
	showUsername = true,
	description,
	avatarSize,
	status,
	isOnline,
	avatarBadgeClassName,
}: UserButtonContentProps) {
	return (
		<>
			{showAvatar && (
				<UserAvatar
					user={user as TUserProfile}
					size={avatarSize}
					isOnline={isOnline}
					badgeClassName={avatarBadgeClassName}
				/>
			)}
			{showInfo && (
				<div className="flex flex-col items-start text-left min-w-0 flex-1">
					<span
						className={cn(
							"text-sm font-medium truncate w-full",
							status === "active"
								? "text-accent-foreground"
								: "text-foreground",
						)}
					>
						{user?.displayName || "Unknown"}
					</span>
					{description ? (
						<span
							className={cn(
								"mt-0.5 text-xs truncate w-full",
								status === "active"
									? "text-accent-foreground/80"
									: "text-muted-foreground",
							)}
						>
							{description}
						</span>
					) : status ? (
						<span
							className={cn(
								"mt-0.5 text-xs truncate w-full",
								isOnline && status === "Online"
									? "text-green-500 font-medium"
									: "text-muted-foreground",
							)}
						>
							{status}
						</span>
					) : (
						showUsername && (
							<span
								className={cn(
									"mt-0.5 text-xs truncate w-full",
									status === "active"
										? "text-accent-foreground/80"
										: "text-muted-foreground",
								)}
							>
								@{user?.username || "Unknown"}
							</span>
						)
					)}
				</div>
			)}
		</>
	);
}

type UserProps = {
	user: TUserResponse;
	showInfo?: boolean;
	showAvatar?: boolean;
	showUsername?: boolean;
	description?: React.ReactNode;
	avatarSize?: "sm" | "default" | "lg" | "xl";
	isDropdown?: boolean;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	buttonClassName?: string;
	nonDropdownButtonClassName?: string;
	dropdownContentClassName?: string;
	drawerTitle?: string;
	status?: string;
	isOnline?: boolean;
	avatarBadgeClassName?: string;
};

// eslint-disable-next-line react-doctor/no-many-boolean-props
export default function User({
	user,
	showInfo = true,
	showAvatar = true,
	showUsername = true,
	description,
	avatarSize,
	isDropdown = false,
	open: openProp,
	onOpenChange,
	buttonClassName,
	nonDropdownButtonClassName,
	dropdownContentClassName,
	drawerTitle = "User Menu",
	status,
	isOnline,
	avatarBadgeClassName,
}: UserProps) {
	const { logout } = useAuth();
	const isTablet = useIsTablet();
	const [internalOpen, setInternalOpen] = useState(false);
	const { userTheme, setTheme } = useTheme();

	const open = openProp ?? internalOpen;
	const setOpen = onOpenChange ?? setInternalOpen;

	const themes = [
		{ value: "light", label: "Light", icon: OutlineSunny },
		{ value: "dark", label: "Dark", icon: OutlineClearNight },
		{ value: "oled", label: "OLED", icon: OutlineClearNight },
		{ value: "system", label: "System", icon: OutlineMonitor },
	] as const;

	const triggerClassName = cn(
		"flex items-center gap-2 p-0 hover:text-foreground",
		showInfo
			? "h-auto w-full justify-start rounded-xl"
			: "size-10 justify-center rounded-full",
		isDropdown ? "hover:bg-secondary/80" : "hover:bg-transparent",
		!isDropdown && nonDropdownButtonClassName,
		buttonClassName,
	);

	const triggerContent = (
		<UserButtonContent
			user={user}
			showInfo={showInfo}
			showAvatar={showAvatar}
			showUsername={showUsername}
			description={description}
			avatarSize={avatarSize}
			status={status}
			isOnline={isOnline}
			avatarBadgeClassName={avatarBadgeClassName}
		/>
	);

	const menuItems = [
		{
			label: "Profile",
			icon: <OutlineUser />,
			to: "/$username",
			params: { username: user?.username || "" },
		},
		{
			label: "Requests",
			icon: <OutlineReceipt />,
			to: "/my-requests",
		},
		{
			label: "Orders",
			icon: <OutlineSettings />,
			to: "/orders" as any,
		},
		{
			label: "Characters",
			icon: <OutlineSettings />,
			to: "/$username/$tab",
			params: { username: user?.username, tab: "characters" },
		},
		// TODO: only show if not connected to Mollie
		// TODO: only show if user has permissions to connect to Mollie (e.g., is admin)
		// TODO: move scopes and state to env variables or generate dynamically
		// TODO: get client_id from env variable
		{
			label: "Connect To Mollie",
			icon: <OutlineSettings />,
			to: "https://my.mollie.com/oauth2/authorize",
			params: {
				client_id: import.meta.env.VITE_MOLLIE_CLIENT_ID,
				redirect_uri: "https://www.familiar.art/auth/mollie/callback",
				state: "random_state_string",
				scope: "profiles.read payments.read payments.write",
			},
		},
	];

	const secondaryMenuItems = [
		{
			label: "Settings",
			icon: <OutlineSettings />,
			to: "/settings" as any,
		},
		{
			label: "Help",
			icon: <OutlineSettings />,
			to: "https://help.familiar.art" as any,
			target: "_blank",
		},
	];

	const menuItemsContent = (
		<>
			<div className="flex flex-col gap-1 p-1">
				{menuItems.map((item) => (
					<Button key={item.label} variant="ghost" size="xl" asChild>
						<Link
							to={item.to}
							params={item.params}
							target={(item as any).target}
							preload={false}
							onClick={() => setOpen(false)}
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					</Button>
				))}
			</div>
			<DropdownMenuSeparator />
			<div className="flex flex-col gap-1 p-1">
				{secondaryMenuItems.map((item) => (
					<Button key={item.label} variant="ghost" size="xl" asChild>
						<Link
							to={item.to}
							target={item.target}
							preload={false}
							onClick={() => setOpen(false)}
						>
							{item.icon}
							<span>{item.label}</span>
						</Link>
					</Button>
				))}
			</div>
			<DropdownMenuSeparator />
			<div className="flex flex-col gap-2 p-2 px-3">
				<span className="text-xs font-medium text-muted-foreground">Theme</span>
				<div className="flex gap-2">
					{themes.map((theme) => (
						<Button
							key={theme.value}
							variant={userTheme === theme.value ? "secondary" : "ghost"}
							size="icon"
							className="flex-1"
							onClick={() => {
								setTheme(theme.value);
								setOpen(false);
							}}
							title={theme.label}
						>
							<theme.icon className="size-4" />
						</Button>
					))}
				</div>
			</div>
			<DropdownMenuSeparator />
			<div className="p-1">
				<Button
					variant="destructive"
					onClick={() => {
						logout();
						setOpen(false);
					}}
				>
					<OutlineLogout className="size-4" />
					<span>Logout</span>
				</Button>
			</div>
		</>
	);

	if (!isDropdown) {
		return (
			<Button
				type="button"
				variant="ghost"
				aria-haspopup="true"
				className={triggerClassName}
			>
				{triggerContent}
			</Button>
		);
	}

	if (!isTablet) {
		return (
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button type="button" variant="ghost" className={triggerClassName}>
						{triggerContent}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className={cn("w-56", dropdownContentClassName)}
					align="end"
				>
					<DropdownMenuGroup>
						{menuItems.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									to={item.to}
									params={item.params}
									preload={false}
									className="w-full cursor-pointer"
									onClick={() => setOpen(false)}
								>
									{item.icon}
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{secondaryMenuItems.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									to={item.to}
									target={item.target}
									preload={false}
									className="w-full cursor-pointer"
									onClick={() => setOpen(false)}
								>
									{item.icon}
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuSub>
							<DropdownMenuSubTrigger>
								<OutlineMonitor />
								Theme
							</DropdownMenuSubTrigger>
							<DropdownMenuPortal>
								<DropdownMenuSubContent>
									{themes.map((theme) => (
										<DropdownMenuItem
											key={theme.value}
											onClick={() => {
												setTheme(theme.value);
												setOpen(false);
											}}
										>
											<theme.icon />
											{theme.label}
											{userTheme === theme.value && (
												<OutlineCheck className="ml-auto size-4" />
											)}
										</DropdownMenuItem>
									))}
								</DropdownMenuSubContent>
							</DropdownMenuPortal>
						</DropdownMenuSub>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							logout();
							setOpen(false);
						}}
					>
						<OutlineLogout />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button type="button" variant="ghost" className={triggerClassName}>
					{triggerContent}
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{drawerTitle}</DrawerTitle>
				</DrawerHeader>
				<div className="pb-4">{menuItemsContent}</div>
			</DrawerContent>
		</Drawer>
	);
}
