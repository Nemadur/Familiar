import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	useLocation,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
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
	notFoundComponent: () => {
		return (
			<div className="flex flex-1 flex-col items-center justify-center p-8 text-center min-h-screen">
				<h2 className="text-2xl font-bold mb-2">Page not found</h2>
				<p className="text-muted-foreground">
					The page you are looking for does not exist.
				</p>
			</div>
		)
	},
	component: RootDocument,
});

function RootDocument() {
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
							<Outlet />
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
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}
