import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Container } from "@/components/layout/container";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import i18n, { setSSRLanguage } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { AbilityProvider } from "@/providers/ability";
import { ThemeProvider } from "@/providers/theme";
import Header from "../components/layout/header";
import { AuthProvider } from "../providers/auth";
import appCss from "../styles.css?url";
// import "../bones/registry";

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
			...seo({
				title: i18n.t("seo.defaults.title"),
			}),
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
	// const context = Route.useRouteContext();

	return (
		<html lang={i18n.language || "en"} suppressHydrationWarning>
			<head>
				<HeadContent />
				<script
					crossOrigin="anonymous"
					src="//unpkg.com/react-scan/dist/auto.global.js"
				></script>
			</head>
			<body>
				<AuthProvider>
					<AbilityProvider>
						<ThemeProvider>
							<Toaster />
							<div className={"flex min-h-screen flex-col"}>
								<Container className="flex h-full flex-1 flex-col">
									<Header />
									<main
										className={
											"flex h-full min-h-[calc(100dvh-4rem)] flex-1 flex-col sm:pb-5 lg:px-5"
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
									TanStackQueryDevtools,
								]}
							/>
						</ThemeProvider>
					</AbilityProvider>
				</AuthProvider>
				<Scripts />
			</body>
		</html>
	);
}
