import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	AuthArtworkImage,
	AuthArtworkProvider,
	useAuthArtwork,
} from "@/components/layout/auth/artwork";

export const Route = createFileRoute("/{-$locale}/_main/auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<AuthArtworkProvider>
			<AuthPageLayout />
		</AuthArtworkProvider>
	);
}

function AuthPageLayout() {
	const { artwork } = useAuthArtwork();

	return (
		<div className="min-h-[calc(100vh-6rem)] min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-0">
			<div className="mx-auto grid min-h-[calc(100dvh-6rem)] min-w-0 w-full max-w-6xl lg:grid-cols-2 lg:gap-10">
				<section
					aria-labelledby="auth-page-title"
					className="flex min-h-full min-w-0 flex-col"
				>
					<div className="flex flex-1 flex-col lg:items-center lg:justify-center">
						<div className="flex h-full min-w-0 w-full flex-col lg:max-w-md">
							<Outlet />
						</div>
					</div>
				</section>

				<aside
					aria-hidden="true"
					className="relative hidden overflow-hidden rounded-4xl bg-muted lg:block"
				>
					<AuthArtworkImage
						artwork={artwork}
						className="absolute inset-0 size-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</aside>
			</div>
		</div>
	);
}
