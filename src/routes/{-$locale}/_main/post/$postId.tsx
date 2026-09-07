import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PortfolioPostPage } from "@/components/layout/modal/portfolio-post";

type PostSearch = {
	username?: string;
};

export const Route = createFileRoute("/{-$locale}/_main/post/$postId")({
	validateSearch: (search: Record<string, unknown>): PostSearch => ({
		username: typeof search.username === "string" ? search.username : undefined,
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { locale, postId } = Route.useParams();

	const { username } = Route.useSearch();
	const navigate = useNavigate();

	const handleBack = () => {
		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		if (username) {
			navigate({
				to: "/{-$locale}/user/$username/$tab",
				params: {
					locale,
					username,
					tab: "portfolio",
				},
				replace: true,
			});
		} else {
			navigate({
				to: "/{-$locale}",
				params: {
					locale,
				},
				replace: true,
			});
		}
	};

	return (
		<PortfolioPostPage
			postId={postId}
			username={username}
			onBack={handleBack}
			onDeleted={() => {
				if (username) {
					navigate({
						to: "/{-$locale}/user/$username/$tab",
						params: {
							locale,
							username,
							tab: "portfolio",
						},
						replace: true,
					});
				} else {
					navigate({
						to: "/{-$locale}",
						params: {
							locale,
						},
						replace: true,
					});
				}
			}}
		/>
	);
}
