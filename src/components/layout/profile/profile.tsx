import { ScrollShadow } from "@heroui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	OutlineChat,
	OutlineChevronRight,
	OutlineListBoxes,
	OutlineMore,
	OutlineUser,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableFeeds } from "@/hooks/use-available-feeds";
import { useBento } from "@/hooks/use-bento";
import { type Tile, toPixels } from "@/lib/bento";
import { useAuth } from "@/providers/auth";
import type { TUserProfile } from "@/types/user";
import { TRoles } from "@/types/user/roles";
import UserAvatar from "./avatar";
import { ProfileBadge } from "./badge";
import { ProfileBio } from "./bio";
import { ProfileCover, ProfileCoverSkeleton } from "./cover";
import { ProfileFeedTabs, ProfileFeedTabsSkeleton } from "./feed/tabs";
import { ProfileDetailsContent } from "./profile-details";
import { createStaticList } from "@/lib/utils";

const CHARACTER_SKELETON_ITEMS = createStaticList("character-skeleton", 10);
const COMMISSION_SKELETON_ITEMS = createStaticList("commission-skeleton", 2);

// Temporary stubs for missing components
const FollowButton = ({
	isFollowing,
	loading,
	canFollow,
	onToggle,
	className,
}: any) => {
	const { t } = useTranslation();
	return (
		<Button
			className={className}
			disabled={!canFollow || loading}
			onClick={onToggle}
			size="xl"
		>
			{isFollowing
				? t("components.profile.actions.unfollow")
				: t("components.profile.actions.follow")}
		</Button>
	);
};

export function UserInfoSkeleton() {
	return (
		<aside className="-mt-12 h-fit space-y-3 md:sticky md:top-20 md:-mt-16 md:pb-10">
			<div className="relative z-10 flex">
				<Skeleton className="size-24 rounded-full ring-6 ring-background md:size-32" />
			</div>

			<div className="space-y-4">
				<div>
					<Skeleton className="mb-2 h-8 w-48" />
					<Skeleton className="h-5 w-32" />
				</div>

				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 flex-1 rounded-full" />
						<Skeleton className="size-9 rounded-full" />
						<Skeleton className="size-9 rounded-full" />
					</div>
					<Skeleton className="h-9 w-full rounded-full" />
				</div>

				<div className="flex flex-col gap-2 pt-1">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-4 w-32" />
				</div>

				<div className="space-y-2 pt-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-[90%]" />
					<Skeleton className="h-4 w-[80%]" />
				</div>
			</div>
		</aside>
	);
}

export function CommissionsContentSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-6 w-32 rounded-md" />
			<div className="grid gap-4">
				{COMMISSION_SKELETON_ITEMS.map((item) => (
					<div
						key={item.id}
						className="flex h-[320px] flex-col rounded-3xl border border-border/50 p-2 sm:h-[200px] sm:flex-row"
					>
						<Skeleton className="h-[180px] w-full rounded-2xl sm:h-full sm:w-2/5" />
						<div className="flex flex-1 flex-col justify-between gap-4 p-3 sm:pl-6">
							<div className="space-y-3">
								<div className="flex justify-between">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="size-9 rounded-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-1/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							</div>
							<div className="flex gap-2">
								<Skeleton className="h-9 flex-1 rounded-full" />
								<Skeleton className="size-9 rounded-full" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export function PortfolioContentSkeleton() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	const tiles = useMemo<Tile[]>(() => {
		return Array.from({ length: 5 }).map((_, i) => {
			let widthUnit: 1 | 2 = 1;
			let heightUnit: 1 | 2 = 1;

			if (i === 0) {
				widthUnit = 2;
				heightUnit = 2;
			} else if (i === 4) {
				widthUnit = 2;
			}

			return {
				id: `skeleton-${i}`,
				widthUnit,
				heightUnit,
				cover: {
					path: "",
					width: 100,
					height: 100,
					alt: "",
				},
			};
		});
	}, []);

	const { cols, placed } = useBento(tiles);

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			if (entries[0].contentRect.width > 0) {
				setWidth(entries[0].contentRect.width);
			}
		});

		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, []);

	const gap = 16;
	const cell = width ? (width - (cols - 1) * gap) / cols : 0;
	const { nodes, containerHeight } = toPixels(placed, cell, gap);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2 pb-3 md:flex-row md:items-center">
				<div className="flex gap-2 overflow-hidden">
					<Skeleton className="h-9 w-20 rounded-full" />
					<Skeleton className="h-9 w-24 rounded-full" />
					<Skeleton className="h-9 w-16 rounded-full" />
				</div>
				<div className="flex w-full items-center gap-2 md:ml-auto md:w-auto">
					<Skeleton className="h-9 w-40 rounded-full" />
					<Skeleton className="size-9 rounded-full" />
				</div>
			</div>

			<div
				ref={containerRef}
				className="relative w-full transition-all duration-300 ease-in-out"
				style={{ height: containerHeight, opacity: width === 0 ? 0 : 1 }}
			>
				{nodes.map((node) => (
					<Skeleton
						key={node.key}
						className="absolute rounded-3xl"
						data-boneyard-content="true"
						style={node.style}
					/>
				))}
			</div>
		</div>
	);
}

export function CharactersContentSkeleton() {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{Array.from({ length: 10 }).map((_, i) => (
				<div
					key={CHARACTER_SKELETON_ITEMS[i].id}
					className="flex flex-col gap-2"
				>
					<Skeleton className="aspect-3/4 w-full rounded-xl" />
					<Skeleton className="h-4 w-3/4" />
				</div>
			))}
		</div>
	);
}

export function TabContentSkeleton({ tab }: { tab?: string }) {
	if (tab === "portfolio") return <PortfolioContentSkeleton />;
	if (tab === "characters") return <CharactersContentSkeleton />;
	return <CommissionsContentSkeleton />;
}

export function UserFeedsSkeleton() {
	return (
		<div className="flex w-full flex-col">
			<div className="mb-6 flex gap-2 py-2">
				<ProfileFeedTabsSkeleton />
			</div>
			<CommissionsContentSkeleton />
		</div>
	);
}

export function UserProfileSkeleton() {
	return (
		<div className="flex h-full flex-1 flex-col">
			<ProfileCoverSkeleton />
			<div className="container mx-auto flex h-full flex-1 flex-col">
				<div className="relative grid h-full flex-1 grid-cols-1 gap-4 md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]">
					<UserInfoSkeleton />
					<div className="flex h-full min-w-0 flex-1 flex-col pt-0">
						<UserFeedsSkeleton />
					</div>
				</div>
			</div>
		</div>
	);
}

export default function UserProfile({
	user,
	children,
	activeTab,
	onTabChange,
}: {
	user: TUserProfile;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const { user: me, isPending } = useAuth();
	const isMe = me?.username === user.username;

	if (isPending) return <UserProfileSkeleton />;

	return (
		<div className="flex flex-1 flex-col">
			<ProfileCover user={user} />
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="flex flex-1 flex-col gap-4 sm:flex-row md:gap-8 max-lg:px-5">
					<div className="shrink-0 md:w-[240px] lg:w-[280px]">
						<UserProfileSidebar user={user} isMe={isMe} isSuspended={false} />
					</div>

					<div className="flex min-w-0 flex-1 flex-col">
						<UserProfileMainContent
							user={user}
							isSuspended={false}
							isMe={isMe}
							activeTab={activeTab}
							onTabChange={onTabChange}
						>
							{children}
						</UserProfileMainContent>
					</div>
				</div>
			</div>
		</div>
	);
}

export function UserProfileSidebar({
	user,
	isMe,
	isSuspended,
}: {
	user: TUserProfile;
	isMe: boolean;
	isSuspended: boolean;
}) {
	const onEditProfile = () => toast("open settings");
	const { t } = useTranslation();

	return (
		<aside className="-mt-12 h-fit space-y-3 md:sticky md:top-20 md:-mt-16 md:pb-10">
			<div className="relative z-10 flex flex-row items-start justify-between gap-4 lg:flex-col lg:justify-start">
				<UserAvatar user={user} isHuge hasOutline />
				<div className="flex w-fit max-w-full shrink-0 gap-2 self-end sm:hidden">
					{!isMe ? (
						<>
							<FollowButton
								isFollowing={false}
								loading={false}
								canFollow={true}
								onToggle={() => {}}
								showText={true}
							/>
							{user.roles.includes(TRoles.Artist) && user.isVerified && (
								<Button variant="secondary" size={"icon-xl"}>
									<OutlineListBoxes />
								</Button>
							)}
							<Button variant="secondary" disabled size="icon-xl">
								<OutlineChat />
							</Button>
							<Button variant="ghost" size="icon-xl">
								<OutlineMore />
							</Button>
						</>
					) : (
						<>
							<Button className="flex-1" size={"xl"} onClick={onEditProfile}>
								{t("components.profile.actions.edit_profile")}
							</Button>
							{user.roles.includes(TRoles.Artist) && user.isVerified && (
								<Button variant="secondary" size={"icon-xl"}>
									<OutlineListBoxes />
								</Button>
							)}
						</>
					)}
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="inline-flex w-full items-center gap-2 text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
					<span className="truncate">{user.displayName}</span>
					<ProfileBadge user={user} />
				</h3>
				<p className="text-neutral-600 dark:text-neutral-400">
					@{user.username}
				</p>

				<div className="hidden flex-col gap-2 sm:flex">
					{isMe ? (
						<div className="flex gap-2">
							<Button className="flex-1" size={"xl"} onClick={onEditProfile}>
								{t("components.profile.actions.edit_profile")}
							</Button>
							{user.roles.includes(TRoles.Artist) && user.isVerified && (
								<Button variant="secondary" size={"icon-xl"}>
									<OutlineListBoxes />
								</Button>
							)}
						</div>
					) : (
						<div className="flex gap-2">
							<div className="flex w-full gap-2">
								<FollowButton
									isFollowing={false}
									loading={false}
									canFollow={true}
									onToggle={() => {}}
									showText={true}
									className={"flex-1"}
								/>
								{user.roles.includes(TRoles.Artist) && user.isVerified && (
									<Button variant="secondary" size={"icon-xl"}>
										<OutlineListBoxes />
									</Button>
								)}
								<Button variant="secondary" disabled size="icon-xl">
									<OutlineChat />
								</Button>
								<Button variant="ghost" size="icon-xl">
									<OutlineMore />
								</Button>
							</div>
						</div>
					)}
				</div>

				<div className="flex gap-2 text-xs text-neutral-500">
					<div className="flex items-center gap-2">
						<span className="flex items-center gap-2">
							<span className="font-semibold text-primary">0</span>{" "}
							{t("components.profile.actions.followers", "followers")}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span className="flex items-center gap-2">
							<span className="font-semibold text-primary">0</span>{" "}
							{t("components.profile.actions.following", "following")}
						</span>
					</div>
				</div>

				{!isSuspended ? (
					<ProfileBio user={user} isShort />
				) : (
					!isMe && (
						<p className="text-sm text-muted-foreground">
							{t("components.profile.info.suspended")}
						</p>
					)
				)}

				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant={"link"}
							size={"sm"}
							className="link h-auto text-xs text-muted-foreground hover:text-foreground"
						>
							{t("components.profile.info.about_me")}
							<OutlineChevronRight />
						</Button>
					</DialogTrigger>
					<ProfileDetailsContent user={user} />
				</Dialog>
			</div>
		</aside>
	);
}

function UserFeeds({
	user,
	isMe,
	children,
	activeTab,
	onTabChange,
}: {
	user: TUserProfile;
	isMe: boolean;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const { t } = useTranslation();
	const availableFeeds = useAvailableFeeds(user, isMe);

	const defaultTab = useMemo(() => {
		return (
			availableFeeds.find((feed) => feed.id === "commissions")?.id ??
			availableFeeds[0]?.id ??
			""
		);
	}, [availableFeeds]);

	const [internalTab, setInternalTab] = useState(defaultTab);

	useEffect(() => {
		if (!activeTab && defaultTab && internalTab !== defaultTab) {
			setInternalTab(defaultTab);
		}
	}, [activeTab, defaultTab, internalTab]);

	const currentFeed = activeTab ?? internalTab ?? defaultTab;
	const handleTabChange = onTabChange ?? setInternalTab;

	if (availableFeeds.length === 0) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineUser}
					title={t("components.profile.feeds.empty.title")}
					description={t("components.profile.feeds.empty.description")}
				/>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-1 flex-col">
			<div className="mb-6 shrink-0 justify-start pb-0 pt-2 transition-all">
				<ScrollShadow
					orientation="horizontal"
					className="h-full w-full"
					hideScrollBar
				>
					<div className="w-full border-b">
						<ProfileFeedTabs
							items={availableFeeds}
							value={currentFeed}
							onValueChange={handleTabChange}
							size="lg"
						/>
					</div>
				</ScrollShadow>
			</div>

			<div className="mt-0 flex h-full min-h-0 flex-1 flex-col pb-24">
				{children}
			</div>
		</div>
	);
}

function UserProfileMainContent({
	user,
	isMe,
	isSuspended,
	children,
	activeTab,
	onTabChange,
}: {
	user: TUserProfile;
	isMe: boolean;
	isSuspended: boolean;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	return (
		<main className="flex h-full min-w-0 flex-1 flex-col pt-0">
			{!isSuspended && (
				<UserFeeds
					user={user}
					isMe={isMe}
					activeTab={activeTab}
					onTabChange={onTabChange}
				>
					{children}
				</UserFeeds>
			)}
		</main>
	);
}
