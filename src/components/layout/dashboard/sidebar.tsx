import { Link, useLocation } from "@tanstack/react-router";
import type { AnyRoute, LinkProps } from "@tanstack/react-router";
import {
	Briefcase,
	Wallet,
	Target,
	Sparkles,
	Settings,
	FileText,
	ShieldCheck,
	Clock,
	ShoppingBag,
	ExternalLink,
	User as UserIcon,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth";
import { OutlineListBoxes } from "@/components/icons/icons";
import type { FileRoutesByTo } from "@/routeTree.gen";

type ValidRoute = keyof FileRoutesByTo;

interface NavItem {
	title: string;
	url: ValidRoute | `#${string}` | `http${string}`;
	icon: React.ElementType;
	badge?: string;
}

const topNav: NavItem[] = [
	{
		title: "Portfolio",
		url: "#",
		icon: Briefcase,
		badge: "Coming soon",
	},
	{
		title: "Wallet",
		url: "#",
		icon: Wallet,
		badge: "Coming soon",
	},
	{
		title: "Quests",
		url: "#",
		icon: Target,
		badge: "Coming soon",
	},
];

const commissionsNav: NavItem[] = [
	{
		title: "Commissions Requests",
		url: "/dashboard/commissions_requests",
		icon: OutlineListBoxes,
	},
	{
		title: "Services",
		url: "/dashboard/services",
		icon: Settings,
	},
	{
		title: "Forms",
		url: "/dashboard/forms_templates",
		icon: FileText,
	},
	{
		title: "Policies",
		url: "#",
		icon: ShieldCheck,
		badge: "Coming soon",
	},
];

const pipelineNav: NavItem[] = [
	{
		title: "Queue",
		url: "#",
		icon: Clock,
		badge: "Coming soon",
	},
	{
		title: "Shop",
		url: "#",
		icon: ShoppingBag,
		badge: "Coming soon",
	},
];

export function DashboardSidebar() {
	const location = useLocation();
	const { user } = useAuth();

	return (
		<Sidebar variant="inset" className="border-r bg-background">
			<SidebarHeader className="p-4">
				<div className="flex items-center gap-2 font-bold text-xl text-primary">
					Dashboard
				</div>
			</SidebarHeader>

			<SidebarContent>
				<div className="px-4 py-2">
					<Button asChild size={"xl"} className="w-full">
						<Link to={`/user/${user?.username}` as string}>
							Go to my profile
						</Link>
					</Button>
				</div>

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{topNav.map((item) => {
								const isActive = location.pathname.startsWith(
									item.url as string,
								);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="h-4 w-4" />
													<span>{item.title}</span>
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Commissions</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{commissionsNav.map((item) => {
								const isActive = location.pathname.startsWith(
									item.url as string,
								);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`relative flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="h-4 w-4" />
													{item.title}
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Pipeline</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{pipelineNav.map((item) => {
								const isActive = location.pathname.startsWith(item.url);

								return (
									<SidebarMenuItem key={item.title}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											className={item.badge ? "opacity-70" : ""}
										>
											<Link
												to={item.badge ? "#" : (item.url as any)}
												className={`flex items-center justify-between ${item.badge ? "pointer-events-none" : ""}`}
											>
												<div className="flex items-center gap-2">
													<item.icon className="h-4 w-4" />
													{item.title}
												</div>
												{item.badge && (
													<span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
														{item.badge}
													</span>
												)}
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
