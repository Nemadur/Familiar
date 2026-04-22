import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardIndexRedirect,
});

function DashboardIndexRedirect() {
	const navigate = useNavigate();

	useEffect(() => {
		navigate({ to: "/dashboard/commissions_requests", replace: true });
	}, [navigate]);

	return null;
}
