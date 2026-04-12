import {
	createFileRoute,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/layout/dashboard/sidebar";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const { user, isPending } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!user) {
			navigate({ to: "/auth/login", replace: true });
			return;
		}

		if (!user.roles?.includes(TRoles.Artist)) {
			navigate({ to: "/", replace: true });
		}
	}, [user, navigate]);

	if (isPending || !user || !user.roles?.includes(TRoles.Artist)) {
		return null; // Or a loading spinner
	}

	return (
		<SidebarProvider>
			<DashboardSidebar />
			<SidebarInset className="bg-muted/40">
				<Outlet />
			</SidebarInset>
		</SidebarProvider>
	);
}
