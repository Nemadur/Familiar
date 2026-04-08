import { useUserByUsername } from "@/hooks/use-user";
import type { ProfileWrapperProps } from "@/types/user/wrapper";
import { EmptyPage } from "../empty-page";
import UserProfile, { UserProfileSkeleton } from "./profile";

function UserProfileWrapper({
	username,
	activeTab,
	onTabChange,
	children,
}: ProfileWrapperProps) {
	const { user, error, isPending } = useUserByUsername(username);

	// FIXME: profile skeleton showing for every page (first we should check if ${username} exists in db than return skeletion based on this info)
	if (isPending && !user) {
		return <UserProfileSkeleton />;
	}

	if (error) {
		return <EmptyPage title={`Error loading user "${username}"`} />;
	}

	if (!user) {
		return <EmptyPage title={`User "${username}" not found`} />;
	}

	return (
		<UserProfile user={user} activeTab={activeTab} onTabChange={onTabChange}>
			{children}
		</UserProfile>
	);
}

export default UserProfileWrapper;
