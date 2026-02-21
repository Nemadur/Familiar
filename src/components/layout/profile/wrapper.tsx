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
	onTabChange,
}: ProfileWrapperProps) {
	const { data } = useSuspenseUser(username);

	if (!data) {
		return <EmptyPage title={`User "${username}" not found`} />;
	}

	return <UserProfile user={data} />;
}

export default UserProfileWrapper;
