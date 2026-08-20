import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	Navigate,
	notFound,
	Outlet,
	redirect,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import { t } from "i18next";
import { OutlineUser } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { ProfileCommissions } from "@/components/layout/profile/feed/commissions";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import UserProfileWrapper from "@/components/layout/profile/wrapper";
import { Button } from "@/components/ui/button";
import { useProfileCommissions } from "@/hooks/commissions/use-commissions";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { userByUsernameQueryOptions } from "@/hooks/user/use-user";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/user/$username")({
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
	head: ({ loaderData, params }) => {
		return {
			meta: seo({
				title: loaderData?.seo?.title ?? "",
				description: loaderData?.seo?.description ?? "",
				pathname: `/${params.username}`,
				locale: params.locale,
			}),
			links: getSeoLinks(`/${params.username}`, params.locale),
		};
	},
	notFoundComponent: () => <UserNotFoundComponent />,
	component: RouteComponent,
});

function UserNotFoundComponent() {
	const { username } = Route.useLoaderData();

	// TODO Empty Page component
	return (
		<div className="flex min-h-screen flex-1 flex-col items-center justify-center p-8 text-center">
			<EmptyPage
				icon={OutlineUser}
				title={t("states.empty.user_not_found", `User "${username}" do not found`)}
				description={t("states.empty.user_not_found_description")}

			>
				<Button asChild size={"2xl"}>
					<Link to="/{-$locale}">
						{t("states.empty.back_to_home")}
					</Link>
				</Button>
			</EmptyPage>
		</div >
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

	if (isArtistError || !artist) {
		throw notFound();
	}

	return <ProfileCommissions artist={artist} commissions={commissions} />;
}

export function DefaultPortfolioTabContent({ username }: { username: string }) {
	const {
		data: artist,
		isPending: isArtistPending,
		isError: isArtistError,
	} = useQuery(userByUsernameQueryOptions(username));

	const artistId = artist?.userId ?? "";

	const { data: content, isPending: isContentPending } = useProfileContent(
		username,
		artistId,
		"portfolio",
	);

	if (isArtistPending || (artistId && isContentPending)) {
		return <TabContentSkeleton tab="portfolio" />;
	}

	if (isArtistError || !artist) {
		throw notFound();
	}

	return (
		<ProfilePortfolio
			posts={content?.posts || []}
			folders={content?.folders || []}
			username={username}
		/>
	);
}

// TODO: middleware redirect user to portfolio tab if no tab is provided
// FIXME: when user is not logged in and open portfolio detailed page, there's no creator info

function RouteComponent() {
	const { username } = Route.useLoaderData();
	const navigate = useNavigate();
	const params = useParams({ strict: false }) as {
		locale?: string;
		tab?: string;
		// TODO: we should standardize on "commissionId" vs "commisionId" across the codebase and remove this hack
		commissionId?: string;
		commisionId?: string;
	};

	const routeTab = typeof params.tab === "string" ? params.tab : undefined;
	const activeTab = routeTab ?? "portfolio";

	const isModalOpen = Boolean(params.commissionId || params.commisionId);

	return (
		<UserProfileWrapper
			username={username}
			activeTab={activeTab}
			onTabChange={(tab) => {
				if (tab === activeTab) return;

				navigate({
					to: "/{-$locale}/user/$username/$tab",
					params: {
						locale: params.locale,
						username,
						tab,
					},
					replace: isModalOpen,
				});
			}}
		>
			{routeTab ? <Outlet /> : <DefaultPortfolioTabContent username={username} />}
		</UserProfileWrapper>
	);
}
