import { Link } from "@tanstack/react-router";
import {
	OutlineLogout,
	OutlineSettings,
	OutlineUser,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth";
import type { User } from "@/types/user";
import UserAvatar from "./avatar";

export default function UserDropDown({ user }: { user: User }) {
	return (
		<DropdownMenu>
			{/* TRIGGER */}
			<DropdownMenuTrigger asChild>
				<Button variant={"ghost"}>
					<UserAvatar user={user} />
				</Button>
			</DropdownMenuTrigger>
			{/* CONTENT */}
			<DropdownMenuContent className={"w-56"} align={"end"} forceMount>
				<DropdownMenuLabel>
					<div className={"flex gap-1"}>
						<UserAvatar user={user} />
						<div className={"flex flex-col space-y-1"}>
							<p className={"font-medium text-sm leading-none"}>
								{user.display_name}
							</p>
							<p className={"text-xs text-muted-foreground leading-none"}>
								@{user.username}
							</p>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropDownMenuItems />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface MenuItem {
	label: string;
	path: string;
	icon: React.ReactNode;
	callback?: () => Promise<void>;
}

const DropDownMenuItems = () => {
	const { logout } = useAuth();

	const MenuItems: MenuItem[] = [
		{ label: "Profile", path: "/$username", icon: <OutlineUser /> },
		{ label: "Orders", path: "/orders", icon: <OutlineSettings /> },
		{ label: "Settings", path: "/settings", icon: <OutlineSettings /> },
		{
			label: "Logout",
			path: "/logout",
			icon: <OutlineLogout />,
			callback: () => logout(),
		},
	];
	return (
		<>
			{MenuItems.map((item: MenuItem) => (
				<DropdownMenuItem
					key={item.label}
					asChild
					onClick={async () => {
						if (!item.callback) return;
						await item.callback();
					}}
				>
					<Link to={item.path}>{item.label}</Link>
				</DropdownMenuItem>
			))}
		</>
	);
};
