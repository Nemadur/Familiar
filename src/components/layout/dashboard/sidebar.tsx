import { Link } from "@tanstack/react-router";
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
	User,
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

const topNav = [
	{
		title: "Portfolio",
		url: "/dashboard/portfolio",
		icon: Briefcase,
	},
	{
		title: "Wallet",
		url: "/dashboard/wallet",
		icon: Wallet,
	},
	{
		title: "Quests",
		url: "/dashboard/quests",
		icon: Target,
	},
];

const commissionsNav = [
	{
		title: "Commissions",
		url: "/dashboard/commissions",
		icon: Sparkles,
		isActive: true,
	},
	{
		title: "Services",
		url: "/dashboard/services",
		icon: Settings,
	},
	{
		title: "Forms",
		url: "/dashboard/forms",
		icon: FileText,
	},
	{
		title: "Policies",
		url: "/dashboard/policies",
		icon: ShieldCheck,
	},
];

const pipelineNav = [
	{
		title: "Queue",
		url: "/dashboard/queue",
		icon: Clock,
		badge: "Coming soon",
	},
	{
		title: "Shop",
		url: "/dashboard/shop",
		icon: ShoppingBag,
		badge: "Coming soon",
	},
];

export function DashboardSidebar() {
	return (
		<Sidebar variant="inset" className="border-r bg-background">
			<SidebarHeader className="p-4">
				<div className="flex items-center gap-2 font-bold text-xl text-primary">
					Dashboard
				</div>
			</SidebarHeader>

			<SidebarContent>
				<div className="px-4 py-2">
					<Button size={"xl"} className="w-full">
						Go to my profile
					</Button>
				</div>

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{topNav.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild>
										<Link to={item.url} className="flex items-center gap-2">
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Commissions</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{commissionsNav.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={item.isActive}>
										<Link to={item.url} className="relative">
											<item.icon />
											{item.title}
											{/* TODO: new commissions */}
											{/* {item.isActive && (
												<div className="absolute top-1/2 -translate-y-1/2 right-4 size-2 rounded-full bg-red-500" />
											)} */}
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupLabel>Pipeline</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{pipelineNav.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild className="opacity-70">
										<Link to={item.url} className="flex items-center justify-between pointer-events-none">
											<div className="flex items-center gap-2">
												<item.icon />
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
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			{/* <SidebarFooter className="p-4 border-t mt-auto">
				<div className="rounded-xl bg-muted/50 p-4">
					<div className="text-xs font-medium text-muted-foreground mb-1">Next up</div>
					<div className="font-semibold text-sm flex justify-between">
						Discovery awaits
						<span>›</span>
					</div>
					<div className="mt-3 h-1.5 w-full bg-muted rounded-full overflow-hidden">
						<div className="h-full bg-primary w-1/5 rounded-full" />
					</div>
					<div className="text-right text-[10px] text-muted-foreground mt-1">20%</div>
				</div>
			</SidebarFooter> */}
		</Sidebar>
	);
}
