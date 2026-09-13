import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, waitFor, screen, act } from "@testing-library/react";
import {
	createRootRoute,
	createRoute,
	createRouter,
	createMemoryHistory,
	RouterProvider,
	Outlet,
} from "@tanstack/react-router";
vi.mock("@/components/icons/icons", () => ({ OutlineUser: () => null }));
vi.mock("@/components/layout/empty-page", () => ({ EmptyPage: () => null }));
vi.mock("@/components/layout/profile/facehash-favicon", () => ({
	FacehashFavicon: () => null,
}));
vi.mock("@/components/layout/profile/feed/commissions", () => ({
	ProfileCommissions: () => null,
}));
vi.mock("@/components/layout/profile/feed/portfolio", () => ({
	ProfilePortfolio: () => null,
}));
vi.mock("@/components/layout/profile/feed/portfolio-unavailable", () => ({
	hasArtistPortfolio: () => true,
	PortfolioUnavailable: () => null,
}));
vi.mock("@/components/layout/profile/profile", () => ({
	default: ({ children, activeTab }: any) => (
		<div data-testid="profile" data-tab={activeTab}>
			{children}
		</div>
	),
	TabContentSkeleton: () => null,
	UserProfileSkeleton: () => null,
}));
vi.mock("@/components/ui/button", () => ({ Button: () => null }));
vi.mock("@/hooks/commissions/use-commissions", () => ({
	useProfileCommissions: () => ({}),
}));
vi.mock("@/hooks/ui/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/hooks/user/use-profile-content", () => ({
	useProfileContent: () => ({}),
}));
vi.mock("@/hooks/user/use-user", () => ({
	userByUsernameQueryOptions: () => ({ queryKey: ["user"] }),
}));
vi.mock("@/lib/i18n", () => ({ default: { t: (key: string) => key } }));
vi.mock("@/lib/seo", () => ({ seo: () => [], getSeoLinks: () => [] }));
import { Route as ProfileRoute } from "@/routes/{-$locale}/_main/user.$username";
function makeRouter(path: string) {
	const root = createRootRoute({ component: Outlet });
	const main = createRoute({
		getParentRoute: () => root,
		id: "/{-$locale}/_main",
		component: Outlet,
	});
	const profile = ProfileRoute.update({
		id: "/user/$username",
		path: "/{-$locale}/user/$username",
		getParentRoute: () => main,
	} as any);
	const tab = createRoute({
		getParentRoute: () => profile,
		path: "$tab",
		component: () => (
			<>
				<div data-testid="tab">Tab</div>
				<Outlet />
			</>
		),
	});
	const post = createRoute({
		getParentRoute: () => tab,
		path: "$postId",
		component: () => <div data-testid="post">Post</div>,
	});
	const folder = createRoute({
		getParentRoute: () => tab,
		path: "folder/$folderSlug",
		component: () => <div data-testid="folder">Folder</div>,
	});
	return createRouter({
		routeTree: root.addChildren([
			main.addChildren([
				profile.addChildren([tab.addChildren([post, folder])]),
			]),
		]),
		history: createMemoryHistory({ initialEntries: [path] }),
		context: {
			queryClient: {
				ensureQueryData: async () => ({
					userId: "user-1",
					username: "hasiradoo",
					displayName: "Hasira",
					avatarPath: "/avatar.png",
					roles: ["ARTIST"],
				}),
			},
		},
		defaultPendingMinMs: 0,
	} as any);
}
afterEach(cleanup);
describe("profile navigation", () => {
	for (const path of [
		"/user/hasiradoo",
		"/user/hasiradoo/",
		"/pl/user/hasiradoo",
	]) {
		it(`redirects once from ${path} and renders the portfolio`, async () => {
			const router = makeRouter(path);
			let loads = 0;
			router.subscribe("onLoad", () => {
				loads++;
			});
			render(<RouterProvider router={router} />);
			await waitFor(() =>
				expect(screen.getByTestId("profile").getAttribute("data-tab")).toBe(
					"portfolio",
				),
			);
			expect(router.state.location.pathname).toBe(
				path.replace(/\/$/, "") + "/portfolio",
			);
			expect(loads).toBeLessThanOrEqual(2);
		});
	}
	for (const path of [
		"/user/hasiradoo/portfolio",
		"/pl/user/hasiradoo/liked",
	]) {
		it(`keeps an explicit tab at ${path}`, async () => {
			const router = makeRouter(path);
			render(<RouterProvider router={router} />);
			await waitFor(() =>
				expect(screen.getByTestId("profile").getAttribute("data-tab")).toBe(
					path.split("/").at(-1),
				),
			);
			expect(router.state.location.pathname).toBe(path);
		});
	}
	it("preserves a direct post route", async () => {
		const router = makeRouter("/user/hasiradoo/portfolio/post-1");
		render(<RouterProvider router={router} />);
		await screen.findByTestId("post");
		expect(screen.queryByTestId("profile")).toBeNull();
		expect(router.state.location.pathname).toBe(
			"/user/hasiradoo/portfolio/post-1",
		);
	});
	it("preserves a folder and browser back after switching tabs", async () => {
		const router = makeRouter("/user/hasiradoo/portfolio/folder/folder-1");
		render(<RouterProvider router={router} />);
		await screen.findByTestId("folder");
		await act(async () => {
			await router.navigate({
				to: "/{-$locale}/user/$username/$tab",
				params: { username: "hasiradoo", tab: "liked" },
			});
		});
		await waitFor(() =>
			expect(screen.getByTestId("profile").getAttribute("data-tab")).toBe(
				"liked",
			),
		);
		await act(async () => {
			router.history.back();
		});
		await screen.findByTestId("folder");
	});
});
