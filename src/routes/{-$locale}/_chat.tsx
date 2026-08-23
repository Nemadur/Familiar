import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Container } from "@/components/layout/container";
import FloatingToolbar from "@/components/layout/floating-toolbar";
import Header from "@/components/layout/header";
import { detectLocaleFromPathOrParams, setSSRLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/{-$locale}/_chat")({
	beforeLoad: async ({ params, location }) => {
		const localeToSet = detectLocaleFromPathOrParams(params, location.pathname);
		await setSSRLanguage(localeToSet);
	},
	component: ChatLayout,
});

function ChatLayout() {
	return (
		<div className="flex h-dvh flex-col">
			<Container className="flex h-full flex-1 flex-col">
				<Header />
				<main className="flex min-h-0 flex-1 flex-col pt-5 pb-10 px-4">
					<Outlet />
				</main>
				<FloatingToolbar />
			</Container>
		</div>
	);
}
