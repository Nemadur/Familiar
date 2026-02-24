import { Suspense } from "react";
import { useSuspenseUser } from "@/hooks/use-user";
import { useAuth } from "@/providers/auth";
import type { ProfileWrapperProps } from "@/types/user/wrapper";
import { EmptyPage } from "../empty-page";
import UserProfile from "./profile";

function UserProfileWrapper({
	username,
	folderId,
	initialTab,
	activeTab,
	onTabChange,
	children,
}: ProfileWrapperProps) {
	const { data } = useSuspenseUser(username);

	if (!data) {
		return <EmptyPage title={`User "${username}" not found`} />;
	}

	return (
		<UserProfile user={data} activeTab={activeTab} onTabChange={onTabChange}>
			{children}
		</UserProfile>
	);
}

export default UserProfileWrapper;
