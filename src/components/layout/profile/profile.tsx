import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	OutlineChat,
	OutlineChevronRight,
	OutlineCrown,
	OutlineDiscord,
	OutlineDribbble,
	OutlineGlobe,
	OutlineInstagram,
	OutlineLink,
	OutlineLocation,
	OutlineMore,
	OutlineTwitter,
	OutlineUser,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { languages } from "@/lib/i18n";
import { userLocalTime } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth";
import type { User } from "@/types/user";
import UserAvatar from "./avatar";
import { ProfileBadge } from "./badge";
import { ProfileBio } from "./bio";
import { ProfileCover, ProfileCoverSkeleton } from "./cover";
import { ProfileFeedTabs, ProfileFeedTabsSkeleton } from "./feed/tabs";
import { ProfileDetailsContent } from "./profile-details";
import { SpokenLanguageBadge } from "./spoken-language-badge";

// Temporary stubs for missing components
const FollowButton = ({
	isFollowing,
	loading,
	canFollow,
	onToggle,
	showText,
	className,
}: any) => {
	return (
		<Button className={className} disabled={!canFollow} onClick={onToggle}>
			{isFollowing ? "Unfollow" : "Follow"}
		</Button>
	);
};

const ProfileCommissions = ({ categories }: any) => (
	<div>Commissions: {categories.length}</div>
);
const ProfilePortfolio = ({ posts }: any) => (
	<div>Portfolio: {posts.length}</div>
);
const ProfileCharacters = ({ characters }: any) => (
	<div>Characters: {characters.length}</div>
);

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

export function UserFeedsSkeleton() {
	return (
		<div className="flex flex-col gap-8 w-full">
			{/* Filter Bar Skeleton */}
			<div className="mb-6 flex gap-2">
				<ProfileFeedTabsSkeleton />
			</div>

			{/* Content Skeletons */}
			<div className="space-y-4">
				<Skeleton className="h-6 w-32 rounded-md" />
				<div className="grid gap-4">
					{[1, 2].map((i) => (
						<div
							key={i}
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
		</div>
	);
}

export function UserProfileSkeleton() {
	return (
		<>
			<ProfileCoverSkeleton />
			<div className={"container mx-auto flex flex-col flex-1 px-4"}>
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
		</>
	);
}

function UserProfile({ user }: { user: User }) {
	const { user: me, pending } = useAuth();
	const isMe = me?.username === user.username;
	const isSuspended = user.banned_until !== null;

	if (pending) return <UserProfileSkeleton />;

	return (
		<>
			<ProfileCover user={user} />
			<div className={"container mx-auto flex flex-col flex-1 px-4"}>
				<div
					className={
						"relative flex-1 h-full grid grid-cols-1 gap-4 md:grid-cols-[240px_1fr] md:gap-8 lg:grid-cols-[280px_1fr]"
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
					/>
				</div>
			</div>
		</>
	);
}

function UserProfileSidebar({
	user,
	isMe,
	isSuspended,
}: {
	user: User;
	isMe: boolean;
	isSuspended: boolean;
}) {
	const onEditProfile = () => toast("open settings");

	return (
		<aside className="-mt-12 h-fit space-y-3 md:sticky md:top-20 md:-mt-16 md:pb-10">
			{/* Avatar */}
			<div className="relative z-10 flex">
				<UserAvatar user={user} isHuge hasOutline />
			</div>

			{/* Profile Info */}
			<div className="space-y-4">
				<div>
					<h3 className="inline-flex items-center gap-2 font-bold text-2xl text-neutral-950 dark:text-neutral-50">
						<span>{user.display_name}</span>
						<ProfileBadge user={user} />
					</h3>
					<p className="text-neutral-600 dark:text-neutral-400">
						@{user.username}
					</p>
				</div>

				{/* Actions */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						{isMe ? (
							<Button className="flex-1" onClick={onEditProfile}>
								Edit Profile
							</Button>
						) : (
							<FollowButton
								isFollowing={false} // TODO: Implement follow status
								loading={false}
								canFollow={true}
								onToggle={() => {}}
								showText={true}
								className="flex-1"
							/>
						)}
						{/* disabled for now */}
						<Button variant="secondary" disabled size="icon">
							<OutlineChat />
						</Button>
						<Button variant="ghost" size="icon">
							<OutlineMore />
						</Button>
					</div>

					{/* Work Queue Status */}
					<Button variant="secondary">
						<OutlineCrown className="fill-current" />
						Work Queue
					</Button>
				</div>

				{/* Time/Lang */}
				<div className="flex flex-col gap-1 text-neutral-500 text-xs">
					{user.timezone && (
						<div className="flex items-center gap-2">
							<OutlineLocation size={16} />
							<span>
								Local time {userLocalTime({ timeZone: user.timezone })}
							</span>
						</div>
					)}
					{user.spoken_languages && user.spoken_languages.length > 0 && (
						<div className="flex items-center gap-2">
							<OutlineGlobe size={16} />
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
							This account is suspended.
						</p>
					)
				)}

				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant={"link"}
							className="h-auto p-0 text-muted-foreground hover:text-foreground text-xs"
						>
							About me
							<OutlineChevronRight />
						</Button>
					</DialogTrigger>
					<ProfileDetailsContent user={user} />
				</Dialog>

				{/* Social Links (Horizontal on mobile, Vertical on desktop) */}
				{!isSuspended && user.social_links && user.social_links.length > 0 && (
					<div className="w-full overflow-x-auto pb-1 md:pb-0 whitespace-nowrap md:whitespace-normal">
						<div className="flex w-max flex-row items-center gap-5 pt-2 md:w-full md:flex-col md:items-start md:gap-2">
							{user.social_links.map((link) => {
								let Icon = OutlineLink;
								const lowerUrl = link.url.toLowerCase();

								if (
									lowerUrl.includes("twitter.com") ||
									lowerUrl.includes("x.com")
								) {
									Icon = OutlineTwitter;
								} else if (lowerUrl.includes("instagram.com")) {
									Icon = OutlineInstagram;
								} else if (
									lowerUrl.includes("discord.gg") ||
									lowerUrl.includes("discord.com")
								) {
									Icon = OutlineDiscord;
								} else if (lowerUrl.includes("dribbble.com")) {
									Icon = OutlineDribbble;
								}

								return (
									<a
										key={link.url}
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
									>
										<Icon size={16} />
										<span>{link.label}</span>
									</a>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}

function UserFeeds({ user, isMe }: { user: User; isMe: boolean }) {
	const { commissions, posts, characters, folders } = useSuspenseProfileContent(
		user.uuid,
	);

	const availableFeeds = useMemo(() => {
		const feeds = [];
		if (isMe || commissions.length > 0)
			feeds.push({
				id: "commissions",
				label: "Commissions",
				icon: OutlineCrown,
			});
		if (isMe || posts.length > 0)
			feeds.push({
				id: "portfolio",
				label: "Portfolio",
				icon: OutlineDribbble,
			});
		if (isMe || characters.length > 0)
			feeds.push({ id: "characters", label: "Characters", icon: OutlineUser });
		if (isMe) feeds.push({ id: "saved", label: "Saved", icon: OutlineCrown });
		return feeds;
	}, [commissions, posts, characters, isMe]);

	const [currentFeed, setCurrentFeed] = useState(
		availableFeeds.length > 0 ? availableFeeds[0].id : "",
	);

	if (
		availableFeeds.length > 0 &&
		!availableFeeds.find((f) => f.id === currentFeed)
	) {
		setCurrentFeed(availableFeeds[0].id);
	}

	if (availableFeeds.length === 0) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineUser}
					title="No content yet"
					description="This user hasn't posted anything yet."
				/>
			</div>
		);
	}

	return (
		<>
			<div className="mb-6 flex justify-start border-border border-b py-2 transition-all">
				<div className="w-fit rounded-full p-1">
					<ProfileFeedTabs
						items={availableFeeds}
						value={currentFeed}
						onValueChange={setCurrentFeed}
						size="lg"
					/>
				</div>
			</div>

			<div className="mt-0 flex-1 flex flex-col">
				{currentFeed === "commissions" && (
					<ProfileCommissions categories={commissions} artist={user} />
				)}
				{currentFeed === "portfolio" && (
					<ProfilePortfolio
						posts={posts}
						folderId={null}
						username={user.username}
						folders={folders}
					/>
				)}
				{currentFeed === "characters" && (
					<ProfileCharacters characters={characters} />
				)}
				{currentFeed === "saved" && <div>Saved</div>}
			</div>
		</>
	);
}

function UserProfileMainContent({
	user,
	isMe,
	isSuspended,
}: {
	user: User;
	isMe: boolean;
	isSuspended: boolean;
}) {
	return (
		<main className={"min-w-0 pt-0 flex flex-col flex-1 h-full"}>
			{!isSuspended && <UserFeeds user={user} isMe={isMe} />}
		</main>
	);
}

export default UserProfile;
