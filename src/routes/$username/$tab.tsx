import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { UserFeedContent } from "@/components/layout/profile/feed-content";
import { useSuspenseUser } from "@/hooks/use-user";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/$username/$tab")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const { data: user } = useSuspenseUser(username);
	const { user: me } = useAuth();
	const isMe = me?.username === user?.username;
	const location = useLocation();

	// Check if we are in a sub-route that should replace the feed content
	// We want to keep the feed visible for:
	// 1. The root tab route (/$username/$tab)
	// 2. The commission modal route (/$username/$tab/$commissionId)
	// We want to hide it for:
	// 1. The folder route (/$username/$tab/folder/...)
	// 2. The post detail route (/$username/$tab/p/...) - if it exists and is not a modal
	//    Wait, looking at file structure, there is `p/$postId.tsx`.
	//    If `p/$postId` is a full page, we should hide feed.
	//    If it's a modal, we should show feed.
	//    Usually `p` (post) is a modal too?
	//    Let's assume `folder` is the main one to hide for now.
	//    Actually, let's check `p/$postId.tsx` content if possible.

	// For now, based on the user request, we specifically want to fix commission modal.
	// Commission modal path is /$username/$tab/$commissionId
	// Folder path is /$username/$tab/folder/$slug

	// Simple heuristic: If the path contains "/folder/", hide the feed.
	// Also check for "/p/" if that's a full page.
	// But let's look at the file list again.
	// $tab/$commisionId/index.tsx
	// $tab/folder/...
	// $tab/p/$postId.tsx (Wait, ls output showed p/ inside folder? No.)
	// Wait, ls output showed:
	/*
	          - folder/
	            - $folderSlug/
	              - $subfolderSlug/
	                - index.tsx
	              - p/
	                - $postId.tsx
	              - index.tsx
	*/
	// So `p` is inside `folder/$folderSlug`?
	// Ah, the ls output indentation is tricky.
	// Let's re-read LS output carefully.

	/*
	        - $tab/
	          - $commisionId/
	            - index.tsx
	          - folder/
	            - $folderSlug/
	              - $subfolderSlug/
	                - index.tsx
	              - p/
	                - $postId.tsx
	              - index.tsx
	          - index.tsx
	*/

	// It seems `p` is inside `folder/$folderSlug`.
	// So checking for `/folder/` in path should cover it.

	const isFolderRoute = location.pathname.includes("/folder/");

	return (
		<>
			{!isFolderRoute && <UserFeedContent user={user!} tab={tab} isMe={isMe} />}
			<Outlet />
		</>
	);
}
