import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
	Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import i18n, { setSSRLanguage } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { AbilityProvider } from "@/providers/ability";
import { ThemeProvider } from "@/providers/theme";
import { CurrencyProvider } from "@/providers/currency";
import { AuthProvider } from "@/providers/auth";
import appCss from "../styles.css?url";
import "@/bones/registry";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	beforeLoad: async () => {
		await setSSRLanguage();
	},
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
				name: "robots",
				content: "noindex, nofollow",
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
	component: RootDocument,
});

function RootDocument() {
	return (
		<html lang={i18n.language || "en"} suppressHydrationWarning>
			<head>
				<HeadContent />
				{/* <script
					crossOrigin="anonymous"
					src="//unpkg.com/react-scan/dist/auto.global.js"
				></script> */}
			</head>
			<body>
				<AuthProvider>
					<AbilityProvider>
						<ThemeProvider>
							<CurrencyProvider>
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
							</CurrencyProvider>
						</ThemeProvider>
					</AbilityProvider>
				</AuthProvider>
				<Analytics />
				<Scripts />
			</body>
		</html>
	);
}
