import { notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { userByUsernameQueryOptions } from "@/hooks/user/use-user";
import UserProfile, {
	UserProfileSkeleton,
} from "@/components/layout/profile/profile";
import { Skeleton } from "@/components/ui/skeleton";

// Common reserved routes that might incorrectly match /$username
const RESERVED_ROUTES = new Set([
	"dashboard",
	"settings",
	"auth",
	"login",
	"register",
	"api",
	"admin",
	"quests",
	"wallet",
	"users",
	"my-requests",
	"portfolio",
	"shop",
]);

function GenericPageSkeleton() {
	return (
		<div className="flex w-full flex-col gap-8 p-4 md:p-8">
			<div className="flex items-center gap-4">
				<Skeleton className="size-16 rounded-full" />
				<div className="space-y-2 flex-1">
					<Skeleton className="size-6 w-1/4" />
					<Skeleton className="size-4 w-1/3" />
				</div>
			</div>
			<Skeleton className="h-[400px] w-full rounded-xl" />
		</div>
	);
}

export default function UserProfileWrapper({
	username,
	children,
	activeTab,
	onTabChange,
}: {
	username: string;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const isReserved = RESERVED_ROUTES.has(username.toLowerCase());

	const {
		data: user,
		isPending,
		isError,
	} = useQuery({
		...userByUsernameQueryOptions(username),
		enabled: !isReserved, // don't fetch if it's a known reserved route
	});

	if (isReserved) {
		return <GenericPageSkeleton />;
	}

	if (isPending) {
		return <UserProfileSkeleton />;
	}

	if (isError || !user) {
		throw notFound();
	}

	return (
		<UserProfile user={user} activeTab={activeTab} onTabChange={onTabChange}>
			{children}
		</UserProfile>
	);
}
