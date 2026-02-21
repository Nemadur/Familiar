import { Link } from "@tanstack/react-router";
import {
	OutlineLogout,
	OutlineReceipt,
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
				<Button variant={"ghost"} size={"icon"}>
					<UserAvatar user={user} />
				</Button>
			</DropdownMenuTrigger>
			{/* CONTENT */}
			<DropdownMenuContent className={"w-56"} align={"end"} forceMount>
				<DropDownMenuItems user={user} />
			</DropdownMenuContent>
		</DropdownMenu>
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

const DropDownMenuItems = ({ user }: { user: User }) => {
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
	return (
		<>
			{MenuItems.map((item, index) => {
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
