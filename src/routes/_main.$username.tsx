import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useParams,
	notFound,
} from "@tanstack/react-router";
import { ProfileCommissions } from "@/components/layout/profile/feed/commissions";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import UserProfileWrapper from "@/components/layout/profile/wrapper";
import { useProfileCommissions } from "@/hooks/use-commisions";
import { userByUsernameQueryOptions } from "@/hooks/use-user";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_main/$username")({
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
	notFoundComponent: () => <UserNotFoundComponent />,
	component: RouteComponent,
});

function UserNotFoundComponent() {
	const { username } = Route.useLoaderData();

	return (
		<div className="flex min-h-screen flex-1 flex-col items-center justify-center p-8 text-center">
			<h2 className="mb-2 text-2xl font-semibold">
				User "{username}" not found
			</h2>
			<p className="text-muted-foreground">
				The user "{username}" does not exist.
			</p>
		</div>
	);
}

export function DefaultProfileTabContent({ username }: { username: string }) {
	const {
		data: artist,
		isPending: isArtistPending,
		isError: isArtistError,
		error: artistError,
	} = useQuery(userByUsernameQueryOptions(username));

	const artistId = artist?.userId ?? "";

	const {
		commissions,
		isPending: isCommissionsPending,
		isError: isCommissionsError,
		error: commissionsError,
	} = useProfileCommissions(artistId, 0, 24);

	if (isArtistPending || (artistId && isCommissionsPending)) {
		return <TabContentSkeleton tab="commissions" />;
	}

	if (isArtistError || isCommissionsError || !artist) {
		throw notFound();
	}

	return <ProfileCommissions artist={artist} commissions={commissions} />;
}

function RouteComponent() {
	const { username } = Route.useLoaderData();
	const navigate = useNavigate();
	const params = useParams({ strict: false }) as {
		tab?: string;
		// TODO: we should standardize on "commissionId" vs "commisionId" across the codebase and remove this hack
		commissionId?: string;
		commisionId?: string;
	};

	const routeTab = typeof params.tab === "string" ? params.tab : undefined;
	const activeTab = routeTab ?? "commissions";

	const isModalOpen = Boolean(params.commissionId || params.commisionId);

	return (
		<UserProfileWrapper
			username={username}
			activeTab={activeTab}
			onTabChange={(tab) => {
				if (tab === activeTab) return;

				navigate({
					to: `/${username}/${tab}`,
					replace: isModalOpen,
				});
			}}
		>
			{routeTab ? <Outlet /> : <DefaultProfileTabContent username={username} />}
		</UserProfileWrapper>
	);
}
