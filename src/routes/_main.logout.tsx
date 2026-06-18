import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_main/logout")({
	component: LogoutPage,
});

function LogoutPage() {
	const navigate = useNavigate();

	useEffect(() => {
		const performLogout = async () => {
			try {
				await supabase.auth.signOut();
			} catch (error) {
				console.error("Logout failed:", error);
			} finally {
				// Navigate to home page after logout attempt
				navigate({ to: "/", replace: true });
			}
		};

		performLogout();
	}, [navigate]);

	return (
		<div className="flex items-center justify-center min-h-screen">
			<p>Logging out&hellip;</p>
		</div>
	);
}
