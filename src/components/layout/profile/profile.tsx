import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	OutlineChat,
	OutlineChevronRight,
	OutlineClock03,
	OutlineCrown,
	OutlineGlobe,
	OutlineLink,
	OutlineMore,
	OutlineUser,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useBento } from "@/hooks/use-bento";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { type Tile, toPixels } from "@/lib/bento";
import { userLocalTime } from "@/lib/profile";
import { useAuth } from "@/providers/auth";
import type { User } from "@/types/user";
import UserAvatar from "./avatar";
import { ProfileBadge } from "./badge";
import { ProfileBio } from "./bio";
import { ProfileCover, ProfileCoverSkeleton } from "./cover";
import { ProfileCharacters } from "./feed/characters";
import { ProfilePortfolio } from "./feed/portfolio";
import { ProfileFeedTabs, ProfileFeedTabsSkeleton } from "./feed/tabs";
import { UserFeedContent } from "./feed-content";
import { ProfileDetailsContent } from "./profile-details";
import { ProfileSocials } from "./socials";
import { SpokenLanguageBadge } from "./spoken-languages";
import { mapFolderToFolderType, mapPostToPostWithAuthor } from "./utils";

// Temporary stubs for missing components
const FollowButton = ({
	isFollowing,
	loading,
	canFollow,
	onToggle,
	showText,
	className,
}: any) => {
	const { t } = useTranslation();
	return (
		<Button className={className} disabled={!canFollow} onClick={onToggle}>
			{isFollowing
				? t("components.profile.actions.unfollow")
				: t("components.profile.actions.follow")}
		</Button>
	);
};

export function UserInfoSkeleton() {
	return (
		<aside className="-mt-12 h-fit space-y-3 md:sticky md:top-20 md:-mt-16 md:pb-10">
			{/* Avatar */}
			<div className="relative z-10 flex">
				<Skeleton className="size-24 rounded-full ring-6 ring-background md:size-32" />
			</div>

			{/* Profile Info */}
			<div className="space-y-4">
				{/* Name & Username */}
				<div>
					<Skeleton className="mb-2 h-8 w-48" />
					<Skeleton className="h-5 w-32" />
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 flex-1 rounded-full" />
						<Skeleton className="size-9 rounded-full" />
						<Skeleton className="size-9 rounded-full" />
					</div>
					<Skeleton className="h-9 w-full rounded-full" />
				</div>

				{/* Location & Lang */}
				<div className="flex flex-col gap-2 pt-1">
					<Skeleton className="h-4 w-40" />
					<Skeleton className="h-4 w-32" />
				</div>

				{/* Bio */}
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
				{[1, 2].map((i) => (
					<div
						key={`skeleton-feed-${i}`}
						className="flex flex-col rounded-3xl border border-border/50 p-2 sm:flex-row h-[320px] sm:h-[200px]"
					>
						<Skeleton className="h-[180px] sm:h-full w-full sm:w-2/5 rounded-2xl" />
						<div className="flex-1 p-3 sm:pl-6 flex flex-col justify-between gap-4">
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

	// Generate deterministic mock tiles for skeleton
	const tiles = useMemo<Tile[]>(() => {
		return Array.from({ length: 5 }).map((_, i) => {
			// Pattern: 2x2, 1x1, 1x1, 1x2, 2x1, ...
			// 0: 2x2 (Big feature)
			// 1,2: 1x1
			// 3: 1x2 (Tall)
			// 4: 2x1 (Wide)
			// 5-11: Mix
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
			<div className="flex flex-col gap-2 md:flex-row md:items-center pb-3">
				<div className="flex gap-2 overflow-hidden">
					<Skeleton className="h-9 w-20 rounded-full" />
					<Skeleton className="h-9 w-24 rounded-full" />
					<Skeleton className="h-9 w-16 rounded-full" />
				</div>
				<div className="flex w-full items-center gap-2 md:w-auto md:ml-auto">
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
				<div key={i} className="flex flex-col gap-2">
					<Skeleton className="aspect-[3/4] w-full rounded-xl" />
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
		<div className="flex flex-col w-full">
			{/* Filter Bar Skeleton */}
			<div className="mb-6 flex gap-2 py-2">
				<ProfileFeedTabsSkeleton />
			</div>

			{/* Content Skeletons */}
			<CommissionsContentSkeleton />
		</div>
	);
}

export function UserProfileSkeleton() {
	return (
		<div className={"md:px-6"}>
			<ProfileCoverSkeleton />
			<div className={"container mx-auto flex flex-col flex-1 md:px-4"}>
				<div
					className={
						"relative flex-1 h-full grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]"
					}
				>
					<UserInfoSkeleton />
					<div className="min-w-0 pt-0 flex flex-col flex-1 h-full">
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
	user: User;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const { user: me, pending } = useAuth();
	const isMe = me?.username === user.username;
	const isSuspended = user.banned_until !== null;

	if (pending) return <UserProfileSkeleton />;

	return (
		<div className={"md:px-6 h-full flex-1"}>
			<ProfileCover user={user} />
			<div className={"flex-1 min-h-0 md:px-4"}>
				<div className={"flex-1 h-full"}>
					<div
						className={
							"max-lg:px-5 grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]"
						}
					>
						{/* Sidebar */}
						<UserProfileSidebar
							user={user}
							isMe={isMe}
							isSuspended={isSuspended}
						/>

						{/* Main Content */}
						<UserProfileMainContent
							user={user}
							isSuspended={isSuspended}
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
	user: User;
	isMe: boolean;
	isSuspended: boolean;
}) {
	const onEditProfile = () => toast("open settings");
	const { t } = useTranslation();

	return (
		<aside className="-mt-12 h-fit space-y-3 md:sticky md:top-20 md:-mt-16 md:pb-10">
			{/* Avatar */}
			<div className="relative z-10 flex">
				<UserAvatar user={user} isHuge hasOutline />
			</div>

			{/* Profile Info */}
			<div className="space-y-4">
				<div>
					<h3 className="inline-flex w-full items-center gap-2 font-bold text-2xl text-neutral-950 dark:text-neutral-50">
						{/* TODO: make auto slide text if too more than 12 characters */}
						<span className="truncate">{user.display_name}</span>
						<ProfileBadge user={user} />
					</h3>
					<p className="text-neutral-600 dark:text-neutral-400">
						@{user.username}
					</p>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					{isMe ? (
						<>
							<Button
								variant="secondary"
								className="w-full"
								onClick={onEditProfile}
							>
								{t("components.profile.actions.edit_profile")}
							</Button>
							<div className="flex gap-2">
								<Button variant="secondary" className="flex-1">
									{t("components.profile.actions.followers")}
								</Button>
								<Button variant="secondary" className="flex-1">
									{t("components.profile.actions.following")}
								</Button>
							</div>
						</>
					) : (
						<div className="flex items-center gap-2">
							<FollowButton
								isFollowing={false} // TODO: Implement follow status
								loading={false}
								canFollow={true}
								onToggle={() => {}}
								showText={true}
								className="flex-1"
							/>
							{/* disabled for now */}
							<Button variant="secondary" disabled size="icon">
								<OutlineChat />
							</Button>
							<Button variant="ghost" size="icon">
								<OutlineMore />
							</Button>
						</div>
					)}

					{/* Work Queue Status */}
					{/* TODO: check if user is artist and has premium */}
					{user.roles.includes("artist") && (
						<Button variant="secondary">
							<OutlineCrown className="fill-current" />
							{t("components.profile.actions.work_queue")}
						</Button>
					)}
				</div>

				{/* Time/Lang/Pronounce */}
				<div className="flex flex-col gap-1 text-neutral-500 text-xs">
					{user.timezone && (
						<div className="flex items-center gap-2">
							<OutlineClock03 size={14} />
							<span>
								{t("components.profile.info.local_time")}{" "}
								{userLocalTime({ timeZone: user.timezone })}
							</span>
						</div>
					)}
					{user.pronouns && (
						<div className="flex items-center gap-2">
							<OutlineUser size={14} />
							<span>{user.pronouns}</span>
						</div>
					)}
					{user.spoken_languages && user.spoken_languages.length > 0 && (
						<div className="flex items-center gap-2">
							<OutlineGlobe size={14} />
							<TooltipProvider delayDuration={100}>
								<div className="flex items-center gap-1.5 flex-wrap">
									{user.spoken_languages.map((lang, index, array) => (
										<SpokenLanguageBadge
											key={lang.locale}
											language={lang}
											showSeparator={index < array.length - 1}
										/>
									))}
								</div>
							</TooltipProvider>
						</div>
					)}
				</div>

				{!isSuspended ? (
					<ProfileBio user={user} isShort />
				) : (
					!isMe && (
						<p className="text-muted-foreground text-sm">
							{t("components.profile.info.suspended")}
						</p>
					)
				)}

				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant={"link"}
							size={"sm"}
							className="h-auto link text-muted-foreground hover:text-foreground text-xs"
						>
							{t("components.profile.info.about_me")}
							<OutlineChevronRight />
						</Button>
					</DialogTrigger>
					<ProfileDetailsContent user={user} />
				</Dialog>

				{/* Social Links (Horizontal on mobile, Vertical on desktop) */}
				{!isSuspended && user.social_links && user.social_links.length > 0 && (
					<ProfileSocials links={user.social_links} />
				)}
			</div>
		</aside>
	);
}

import { ScrollShadow } from "@heroui/react";
import { useAvailableFeeds } from "@/hooks/use-available-feeds";
import { ProfileCommissions } from "./feed/commissions";

function UserFeeds({
	user,
	isMe,
	children,
	activeTab,
	onTabChange,
}: {
	user: User;
	isMe: boolean;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	const { t } = useTranslation();
	const availableFeeds = useAvailableFeeds(user, isMe);

	const [internalTab, setInternalTab] = useState(
		availableFeeds.length > 0 ? availableFeeds[0].id : "",
	);

	const currentFeed = activeTab ?? internalTab;
	const handleTabChange = onTabChange ?? setInternalTab;

	if (
		availableFeeds.length > 0 &&
		!availableFeeds.find((f) => f.id === currentFeed) &&
		!activeTab
	) {
		setInternalTab(availableFeeds[0].id);
	}

	if (availableFeeds.length === 0) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineUser}
					title={t("components.profile.feeds.empty.title")}
					description={t("components.profile.feeds.empty.description")}
				/>
			</div>
		);
	}

	return (
		<>
			<div className="mb-6 flex justify-start border-border border-b transition-all pt-2 pb-0">
				<ScrollShadow
					orientation="horizontal"
					className="w-full h-full"
					hideScrollBar
				>
					<div className="w-fit rounded-full pb-2">
						<ProfileFeedTabs
							items={availableFeeds}
							value={currentFeed}
							onValueChange={handleTabChange}
							size="lg"
						/>
					</div>
				</ScrollShadow>
			</div>

			<div className="mt-0 flex-1 flex flex-col pb-24">{children}</div>
		</>
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
	user: User;
	isMe: boolean;
	isSuspended: boolean;
	children?: React.ReactNode;
	activeTab?: string;
	onTabChange?: (tab: string) => void;
}) {
	return (
		<main className={"min-w-0 pt-0 flex flex-col flex-1 h-full"}>
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
