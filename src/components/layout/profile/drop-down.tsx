import { Link } from "@tanstack/react-router";
import * as React from "react";
import {
	OutlineLogout,
	OutlineReceipt,
	OutlineSettings,
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
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { User } from "@/types/user";
import UserAvatar from "./avatar";

const UserMenuTrigger = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		user: User;
		showInfo?: boolean;
	}
>(({ user, showInfo, className, ...props }, ref) =>
	showInfo ? (
		<Button
			ref={ref}
			variant="ghost"
			className={cn(
				"flex items-center gap-2 p-2 pr-4 w-full justify-start rounded-xl h-auto hover:bg-secondary/80",
				className,
			)}
			{...props}
		>
			<UserAvatar user={user} />
			<div className="flex flex-col items-start text-left">
				<span className="font-medium text-sm leading-none">
					{user.display_name}
				</span>
				<span className="text-xs text-muted-foreground leading-none mt-1">
					@{user.username}
				</span>
			</div>
		</Button>
	) : (
		<Button
			ref={ref}
			variant="ghost"
			size="icon"
			className={className}
			{...props}
		>
			<UserAvatar user={user} />
		</Button>
	),
);
UserMenuTrigger.displayName = "UserMenuTrigger";

export default function UserDropDown({
	user,
	showInfo = false,
}: {
	user: User;
	showInfo?: boolean;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = React.useState(false);

	if (isDesktop) {
		return (
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<UserMenuTrigger user={user} showInfo={showInfo} />
				</DropdownMenuTrigger>
				<DropdownMenuContent className={"w-56"} align={"end"} forceMount>
					<DropDownMenuItems user={user} />
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<UserMenuTrigger user={user} showInfo={showInfo} />
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>User Menu</DrawerTitle>
				</DrawerHeader>
				<div className="px-4 pb-4">
					<DrawerMenuItems user={user} onSelect={() => setOpen(false)} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}

type MenuItem =
	| {
			type: "link";
			label: string;
			path: string;
			icon: React.ReactNode;
			callback?: () => Promise<void>;
	  }
	| {
			type: "separator";
	  };

function useMenuItems(user: User) {
	const { logout } = useAuth();

	const MenuItems: MenuItem[] = [
		{
			type: "link",
			label: "Profile",
			path: `/${user.username}`,
			icon: <OutlineUser />,
		},
		{
			type: "link",
			label: "Requests",
			path: "/requests",
			icon: <OutlineReceipt />,
		},
		{
			type: "link",
			label: "Orders",
			path: "/orders",
			icon: <OutlineSettings />,
		},
		{
			type: "link",
			label: "Characters",
			path: `/${user.username}/characters`,
			icon: <OutlineSettings />,
		},
		{ type: "separator" },
		{
			type: "link",
			label: "Settings",
			path: "/settings",
			icon: <OutlineSettings />,
		},
		{
			type: "link",
			label: "Help",
			path: "https://help.familiar.art",
			icon: <OutlineSettings />,
		},
		{ type: "separator" },
		{
			type: "link",
			label: "Logout",
			path: "/logout",
			icon: <OutlineLogout />,
			callback: () => logout(),
		},
	];

	return MenuItems;
}

const DropDownMenuItems = ({ user }: { user: User }) => {
	const items = useMenuItems(user);
	return (
		<>
			{items.map((item, index) => {
				if (item.type === "separator") {
					return <DropdownMenuSeparator key={`sep-${index}`} />;
				}
				return (
					<DropdownMenuItem
						key={item.label}
						asChild
						onClick={async () => {
							if (!item.callback) return;
							await item.callback();
						}}
					>
						<Link to={item.path}>
							{item.icon}
							{item.label}
						</Link>
					</DropdownMenuItem>
				);
			})}
		</>
	);
};

const DrawerMenuItems = ({
	user,
	onSelect,
}: {
	user: User;
	onSelect?: () => void;
}) => {
	const items = useMenuItems(user);
	return (
		<div className="flex flex-col gap-2">
			{items.map((item, index) => {
				if (item.type === "separator") {
					return <div key={`sep-${index}`} className="h-px bg-border my-2" />;
				}
				return (
					<Button
						key={item.label}
						variant="ghost"
						className={cn(
							"justify-start gap-2 h-12 text-base",
							item.label === "Logout" &&
								"text-destructive bg-destructive/12 hover:bg-destructive/20 hover:text-destructive",
						)}
						asChild
						onClick={async () => {
							if (item.callback) await item.callback();
							onSelect?.();
						}}
					>
						<Link to={item.path}>
							{item.icon}
							{item.label}
						</Link>
					</Button>
				);
			})}
		</div>
	);
};
