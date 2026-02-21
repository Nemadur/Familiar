import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";
import { UserProfileSkeleton } from "@/components/layout/profile/profile";
import UserProfileWrapper from "@/components/layout/profile/wrapper";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/$username/")({
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
	const { tab } = Route.useSearch();
	const navigate = useNavigate();

	return (
		<Suspense fallback={<UserProfileSkeleton />}>
			<UserProfileWrapper username={username} />
		</Suspense>
	);
}
