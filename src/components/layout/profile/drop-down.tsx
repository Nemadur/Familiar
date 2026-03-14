import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { User } from "@/types/user";
import UserAvatar from "./avatar";

export default function UserDropDown({
	user,
	showInfo = false,
}: {
	user: User;
	showInfo?: boolean;
}) {
	const { logout } = useAuth();
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = useState(false);

	const TriggerButton = (
		<Button
			variant="ghost"
			className={cn(
				"flex items-center gap-2 rounded-xl hover:bg-secondary/80",
				showInfo
					? "w-full justify-start p-2 pr-4 h-auto"
					: "h-10 w-10 rounded-full p-0 justify-center",
			)}
		>
			<UserAvatar user={user} />
			{showInfo && (
				<div className="flex flex-col items-start text-left">
					<span className="font-medium text-sm leading-none">
						{user.display_name}
					</span>
					<span className="text-xs text-muted-foreground leading-none mt-1">
						@{user.username}
					</span>
				</div>
			)}
		</Button>
	);

	const MenuItems = [
		{
			label: "Profile",
			icon: <OutlineUser />,
			to: "/$username",
			params: { username: user.username },
		},
		{
			label: "Requests",
			icon: <OutlineReceipt />,
			to: "/requests" as any,
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
			params: { username: user.username, tab: "characters" },
		},
	];

	const SecondaryMenuItems = [
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

	const MenuItemsContent = (
		<>
			<div className="flex flex-col gap-1 p-1">
				{MenuItems.map((item) => (
					<Button
						key={item.label}
						variant="ghost"
						className="w-full justify-start cursor-pointer h-9 px-2"
						asChild
					>
						<Link
							to={item.to}
							params={item.params}
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
				{SecondaryMenuItems.map((item) => (
					<Button
						key={item.label}
						variant="ghost"
						className="w-full justify-start cursor-pointer h-9 px-2"
						asChild
					>
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
			<div className="p-1">
				<Button
					variant="destructive-ghost"
					className="w-full justify-start cursor-pointer h-9 px-2"
					onClick={() => {
						logout();
						setOpen(false);
					}}
				>
					<OutlineLogout className="mr-2 h-4 w-4" />
					<span>Logout</span>
				</Button>
			</div>
		</>
	);

	if (isDesktop) {
		return (
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>{TriggerButton}</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end">
					<DropdownMenuGroup>
						{MenuItems.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									to={item.to}
									params={item.params}
									preload={false}
									className="cursor-pointer w-full"
								>
									{item.icon}
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						{SecondaryMenuItems.map((item) => (
							<DropdownMenuItem key={item.label} asChild>
								<Link
									to={item.to}
									target={item.target}
									preload={false}
									className="cursor-pointer w-full"
								>
									{item.icon}
									{item.label}
								</Link>
							</DropdownMenuItem>
						))}
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem variant={"destructive"} onClick={() => logout()}>
						<OutlineLogout />
						Logout
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{TriggerButton}</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>User Menu</DrawerTitle>
				</DrawerHeader>
				<div className="pb-4">{MenuItemsContent}</div>
			</DrawerContent>
		</Drawer>
	);
}
