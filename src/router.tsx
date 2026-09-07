import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { getQueryClient } from "@/providers/query-client";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const queryClient = getQueryClient();
	const router = routerWithQueryClient(
		createTanStackRouter({
			routeTree,
			context: {
				queryClient,
			},
			trailingSlash: "preserve",
			scrollRestoration: true,
			defaultPreload: "intent",
			defaultPreloadStaleTime: 0,
		}),
		queryClient,
	);

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
