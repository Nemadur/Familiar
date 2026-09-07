import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { DashboardSidebar } from "@/components/layout/dashboard/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { detectLocaleFromPathOrParams, setSSRLanguage } from "@/lib/i18n";
import { useAuth } from "@/providers/auth";
import { TRoles } from "@/types/user/roles";

export const Route = createFileRoute("/{-$locale}/dashboard")({
	beforeLoad: async ({ params, location }) => {
		const localeToSet = detectLocaleFromPathOrParams(params, location.pathname);
		await setSSRLanguage(localeToSet);
	},
	component: DashboardLayout,
});

function DashboardLayout() {
	const { user, isPending } = useAuth();
	const navigate = useNavigate();

	// TODO: move guard to middleware or 1 source of truth
	useEffect(() => {
		if (isPending) return;

		if (!user) {
			navigate({ to: "/{-$locale}/auth/login", replace: true });
			return;
		}

		if (!user.roles?.includes(TRoles.Artist)) {
			navigate({ to: "/{-$locale}/dashboard", replace: true });
		}
	}, [user, isPending, navigate]);

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
