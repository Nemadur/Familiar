import { createFileRoute } from "@tanstack/react-router";
import Users from "@/components/layout/users";
export const Route = createFileRoute("/_main/users")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Users />;
}
