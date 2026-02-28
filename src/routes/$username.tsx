import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { UserProfileSkeleton } from "@/components/layout/profile/profile";
import UserProfileWrapper from "@/components/layout/profile/wrapper";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/$username")({
	loader: async ({ params }) => {
		return {
			username: params.username,
			seo: {
				title: i18n.t("seo.profile.title", { username: params.username }),
				description: i18n.t("seo.profile.description", {
					username: params.username,
				}),
			},
		};
	},
	head: ({ loaderData }) => ({
		meta: seo({
			title: loaderData?.seo?.title ?? "",
			description: loaderData?.seo?.description ?? "",
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { username } = Route.useLoaderData();
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	// Use the tab param if available, otherwise undefined
	const activeTab = (params as any).tab;
	const isModalOpen = !!(params as any).commisionId;

	return (
		<Suspense fallback={<UserProfileSkeleton />}>
			<UserProfileWrapper
				username={username}
				activeTab={activeTab}
				onTabChange={(tab) => {
					navigate({
						to: `/${username}/${tab}`,
						replace: isModalOpen,
					});
				}}
			>
				<Outlet />
			</UserProfileWrapper>
		</Suspense>
	);
}
