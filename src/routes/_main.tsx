import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Container } from "@/components/layout/container";
import FloatingToolbar from "@/components/layout/floating-toolbar";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";

export const Route = createFileRoute("/_main")({
	component: MainLayout,
});

function MainLayout() {
	return (
		<div className={"flex min-h-screen flex-col"}>
			<Container className="flex h-full flex-1 flex-col">
				<Header />
				<main
					className={
						"flex h-full min-h-[calc(100dvh-4rem)] flex-1 flex-col sm:pb-4 sm:pt-2 lg:px-4"
					}
				>
					<Outlet />
				</main>
				<FloatingToolbar />
				<Footer />
			</Container>
		</div>
	);
}
