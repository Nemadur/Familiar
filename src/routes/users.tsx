import { createFileRoute } from "@tanstack/react-router";
import Users from "@/components/layout/users";
export const Route = createFileRoute("/users")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Users />;
}
