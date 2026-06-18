import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="min-h-[calc(100vh-6rem)]">
			<div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-6xl lg:grid-cols-2 lg:gap-10">
				<section
					aria-labelledby="auth-page-title"
					className="flex min-h-full flex-col"
				>
					<div className="flex flex-1 flex-col lg:items-center lg:justify-center">
						<div className="w-full flex flex-col h-full lg:max-w-md">
							<Outlet />
						</div>
					</div>
				</section>

				<aside
					aria-hidden="true"
					className="relative hidden overflow-hidden rounded-4xl bg-muted lg:block"
				>
					<img
						src="https://images.pexels.com/photos/1570264/pexels-photo-1570264.jpeg"
						alt=""
						className="absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</aside>
			</div>
		</main>
	);
}
