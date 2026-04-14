import {
	QueryClient,
	QueryClientProvider as TanStackQueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient();
	}
	// Browser: make a new query client if we don't already have one
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

export function QueryClientProvider({
	children,
	client,
}: {
	children: ReactNode;
	client?: QueryClient;
}) {
	const queryClient = client ?? getQueryClient();
	return (
		<TanStackQueryClientProvider client={queryClient}>
			{children}
		</TanStackQueryClientProvider>
	);
}
