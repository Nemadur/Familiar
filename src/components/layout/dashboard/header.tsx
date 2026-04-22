import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth";
import User from "@/components/layout/profile/user";
import ThemeToggle from "@/components/layout/select/theme-toggle";
import LanguageSelect from "@/components/layout/select/language";

interface DashboardHeaderProps {
	title: string;
	actions?: React.ReactNode;
}

export function DashboardHeader({ title, actions }: DashboardHeaderProps) {
	const { user, isPending } = useAuth();

	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 justify-between bg-background">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-2" />
				<h1 className="text-xl font-bold">{title}</h1>
			</div>

			<div className="flex items-center gap-4">
				{actions}
				<div className="h-6 w-px bg-border hidden sm:block" />
				<div className="flex items-center gap-2">
					{/* <ThemeToggle /> */}
					<LanguageSelect />
					{!isPending && user && (
						<User user={user} showInfo={false} isDropdown />
					)}
				</div>
			</div>
		</header>
	);
}
