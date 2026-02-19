import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useLocation,
	useMatches,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/footer";
import { setSSRLanguage } from "@/lib/i18n";
import { QueryClientProvider } from "@/providers/query-client";
import { ThemeProvider } from "@/providers/theme";
import Header from "../components/layout/header";
import { AuthProvider } from "../providers/auth";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "TanStack Start Starter",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	beforeLoad: async () => {
		await setSSRLanguage();
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const context = Route.useRouteContext();
	const matches = useMatches();
	const location = useLocation();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<ThemeProvider>
						<QueryClientProvider client={context.queryClient}>
							<div className={"flex min-h-screen flex-col"}>
								<Container>
									<Header />
									<main
										className={
											"flex min-h-[calc(100dvh-4rem)] flex-1 flex-col sm:pb-5"
										}
									>
										{children}
									</main>
									<Footer />
								</Container>
							</div>
							<TanStackDevtools
								config={{
									position: "bottom-right",
								}}
								plugins={[
									{
										name: "Tanstack Router",
										render: <TanStackRouterDevtoolsPanel />,
									},
								]}
							/>
						</QueryClientProvider>
					</ThemeProvider>
				</AuthProvider>
				<Scripts />
			</body>
		</html>
	);
}
