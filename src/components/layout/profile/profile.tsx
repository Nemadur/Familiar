import { ScrollShadow, Typography } from "@heroui/react";
import {
	useNavigate,
	useParams,
	useRouter,
	useSearch,
} from "@tanstack/react-router";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostConversationDirect } from "@/hooks/chat/use-chat";
import { useAvailableFeeds } from "@/hooks/feed/use-available-feeds";
import { useBento } from "@/hooks/ui/use-bento";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { type Tile, toPixels } from "@/lib/bento";
import { cn, createStaticList } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import type { TUserProfile } from "@/types/user";
import { TRoles } from "@/types/user/roles";
import { UserSettingsModal } from "../modal/profile/settings/settings-modal";
import UserAvatar from "./avatar";
import { ProfileBadge } from "./badge";
import { ProfileBio } from "./bio";
import { ProfileCover, ProfileCoverSkeleton } from "./cover";
import { ProfileFeedTabs, ProfileFeedTabsSkeleton } from "./feed/tabs";
import { ProfileDetailsContent } from "./profile-details";

const CHARACTER_SKELETON_ITEMS = createStaticList("character-skeleton", 10);
const COMMISSION_SKELETON_ITEMS = createStaticList("commission-skeleton", 2);

// Temporary stubs for missing components
const FollowButton = ({
	isFollowing,
	loading,
	canFollow,
	onToggle,
	className,
	size = "xl",
}: any) => {
	const { t } = useTranslation();
	return (
		<Button
			className={className}
			disabled={!canFollow || loading}
			onClick={onToggle}
			size={size}
		>
			{isFollowing
				? t("components.profile.actions.unfollow")
				: t("components.profile.actions.follow")}
		</Button>
	);
};

export function UserInfoSkeleton() {
	return (
		<aside className="-mt-12 h-fit space-y-3 lg:sticky lg:top-20 lg:-mt-16 lg:pb-10">
			<div className="relative z-10 flex">
				<Skeleton className="size-24 rounded-full ring-6 ring-background lg:size-32" />
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

	const { cols, placed } = useBento(tiles, "balanced");

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
				<div className="relative grid h-full flex-1 grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-8">
					<UserInfoSkeleton />
					<div className="flex h-full min-w-0 flex-1 flex-col pt-0">
						<UserFeedsSkeleton />
					</div>
				</div>
			</div>
		</div>
	);
}

function UserProfileMoreMenu({ user }: { user: TUserProfile }) {
	const { t } = useTranslation();

	const handleReportUser = () => {
		// TODO: open the report flow when the reporting API is available
		toast.info(`Report user: @${user.username}`);
	};

	const handleBlockUser = () => {
		// TODO: block the user when the blocking API is available
		toast.info(`Block user: @${user.username}`);
	};

	const handleShareProfile = () => {
		// TODO: share the profile when the sharing API is available
		//copy to clipboard
		navigator.clipboard.writeText(`https://familiar.com/user/${user.username}`);
		toast.success(`Successfully copied profile link`);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="absolute top-2 right-2">
				<Button
					type="button"
					variant="secondary"
					size="icon-xl"
					className="bg-background/80 backdrop-blur-sm hover:bg-background"
					aria-label={t(
						"components.profile.actions.more",
						"More actions",
					)}
				>
					<OutlineMore />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuItem onClick={handleReportUser} variant="destructive">
					{t(
						"components.profile.actions.report_user",
						"Report",
					)}
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onClick={handleBlockUser}
				>
					{t(
						"components.profile.actions.block_user",
						"Block user",
					)}
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={handleShareProfile}
				>
					{t(
						"components.profile.actions.share_profile",
						"Share Profile",
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
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
			<div className="relative">
				<ProfileCover user={user} />
				{!isMe && (
					<UserProfileMoreMenu user={user} />
				)}
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="flex flex-1 flex-col gap-4 lg:flex-row lg:gap-8">
					<div className="shrink-0 lg:w-72">
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
	const { t } = useTranslation();
	const navigate = useNavigate();
	const router = useRouter();
	const { user: currentUser } = useAuth();
	const isTablet = useIsTablet();
	const createDirectConversation = usePostConversationDirect();
	const actionButtonSize = isTablet ? "2xl" : "xl";

	const { locale } = useParams({ strict: false }) as { locale?: string };

	const search = useSearch({ strict: false }) as { settings?: "profile" };

	const settingsOpen = search.settings === "profile";

	const handleOpenSettings = () => {
		void navigate({
			to: ".",
			search: (previous) => ({
				...previous,
				settings: "profile",
			}),

			// Show the standalone settings URL in the adress bar.
			mask: {
				to: "/{-$locale}/settings/profile",
			},
		});
	};

	const handleCloseSettings = () => {
		router.history.back();
	};

	const handleSettingsOpenChange = (open: boolean) => {
		if (!open) {
			handleCloseSettings();
		}
	};

	const handleSaveSettings = () => {
		// TODO: save using the settings API
		toast.info("Settings saved successfully");
		handleCloseSettings();
	};

	const requireAuthentication = (action: "follow" | "message") => {
		if (currentUser) return true;

		toast.info(
			action === "follow"
				? t(
					"components.profile.actions.sign_in_to_follow",
					"Please sign in to follow this user.",
				)
				: t(
					"components.profile.actions.sign_in_to_message",
					"Please sign in to message this user.",
				),
		);

		return false;
	};

	const handleFollow = () => {
		if (!requireAuthentication("follow")) return;

		// TODO: replace this toast with the follow-user mutation
		toast.info(`Follow user: @${user.username}`);
	};

	const handleMessage = () => {
		if (!requireAuthentication("message")) return;

		createDirectConversation.mutate(user.userId, {
			onSuccess: (conversation) => {
				if (!conversation.id) {
					toast.error(
						t(
							"components.profile.actions.message_failed",
							"Could not start the conversation. Please try again.",
						),
					);
					return;
				}

				void navigate({
					to: "/{-$locale}/chat/conversation/$conversationId",
					params: {
						locale,
						conversationId: conversation.id,
					},
				});
			},
			onError: () => {
				toast.error(
					t(
						"components.profile.actions.message_failed",
						"Could not start the conversation. Please try again.",
					),
				);
			},
		});
	};

	return (
		<>
			<aside className="-mt-12 h-fit space-y-3 max-lg:px-4 lg:sticky lg:top-20 lg:-mt-16 lg:pb-10 lg:pl-4">
				<div className="relative z-10 flex flex-row items-start justify-between gap-4 lg:flex-col lg:justify-start">
					<UserAvatar user={user} isHuge hasOutline />

					{/* Mobile actions */}
					{/* <div className="flex w-fit max-w-full shrink-0 gap-2 self-end sm:hidden">
						{!isMe ? (
							<>
								<FollowButton
									isFollowing={false}
									loading={false}
									canFollow
									onToggle={() => { }}
									showText
								/>

								{user.roles.includes(
									TRoles.Artist,
								) &&
									user.isVerified && (
										<Button
											type="button"
											variant="secondary"
											size="icon-xl"
										>
											<OutlineListBoxes />
										</Button>
									)}

								<Button
									type="button"
									variant="secondary"
									disabled
									size="icon-xl"
								>
									<OutlineChat />
								</Button>

								<Button
									type="button"
									variant="ghost"
									size="icon-xl"
								>
									<OutlineMore />
								</Button>
							</>
						) : (
							<>
								<Button
									type="button"
									className="flex-1"
									size={actionButtonSize}
									variant="secondary"
									onClick={
										handleOpenSettings
									}
								>
									{t(
										"components.profile.actions.edit_profile",
										"Edit profile",
									)}
								</Button>

								{user.roles.includes(
									TRoles.Artist,
								) &&
									user.isVerified && (
										<Button
											type="button"
											variant="secondary"
											size="icon-2xl"
										>
											<OutlineListBoxes />
										</Button>
									)}
							</>
						)}
					</div> */}
				</div>

				<div className="space-y-4">
					{/* User identity */}
					<div>
						<Typography.Heading level={3} className="inline-flex w-full items-center gap-2 font-semibold">
							<span className="truncate">{user.displayName}</span>

							<ProfileBadge user={user} />
						</Typography.Heading>

						<Typography.Paragraph size={"base"} className="text-muted-foreground!">
							@{user.username}
						</Typography.Paragraph>
					</div>

					{/* Desktop actions */}
					<div className="flex-col gap-2">
						{isMe ? (
							<div className="flex gap-2">
								<Button
									type="button"
									className="flex-1"
									variant={"outline"}
									size={actionButtonSize}
									onClick={handleOpenSettings}
								>
									{t("components.profile.actions.edit_profile", "Edit profile")}
								</Button>

								{user.roles.includes(TRoles.Artist) && user.isVerified && (
									<Button type="button" variant="secondary" size={actionButtonSize} className="flex-1">
										{t("components.profile.actions.queue", "Queue")}
										{/* <OutlineListBoxes /> */}
									</Button>
								)}
							</div>
						) : (
							<div className="flex flex-col gap-2">
								<div className="flex w-full gap-2">
									<FollowButton
										isFollowing={false}
										loading={false}
										canFollow
										onToggle={handleFollow}
										showText
										size={actionButtonSize}
										className="flex-1"
									/>

									<Button
										type="button"
										variant="secondary"
										className="flex-1"
										disabled={createDirectConversation.isPending}
										size={actionButtonSize}
										onClick={handleMessage}
									>
										{t("components.profile.actions.message", "Message")}
										{/* <OutlineChat /> */}
									</Button>
								</div>

								{user.roles.includes(TRoles.Artist) && user.isVerified && (
									<Button
										type="button"
										variant="secondary"
										size={actionButtonSize}
										className="w-full"
									>
										{t("components.profile.actions.queue", "Queue")}
										{/* <OutlineListBoxes /> */}
									</Button>
								)}
							</div>
						)}
					</div>

					{/* Follow statistics */}
					<div className="flex gap-2 text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							<span className="flex items-center gap-2">
								<Typography.Root type={"body-xs"} className="font-semibold">
									0
								</Typography.Root>

								{t("components.profile.actions.following", "following")}
							</span>
						</div>

						<div className="flex items-center gap-2">
							<span className="flex items-center gap-2">
								<Typography.Root type={"body-xs"} className="font-semibold">
									0
								</Typography.Root>

								{t("components.profile.actions.followers", "followers")}
							</span>
						</div>
					</div>

					{/* Biography */}
					{!isSuspended ? (
						<ProfileBio user={user} isShort />
					) : (
						!isMe && (
							<p className="text-sm text-muted-foreground">
								{t(
									"components.profile.info.suspended",
									"This account is suspended.",
								)}
							</p>
						)
					)}

					{/* About dialog */}
					<Dialog>
						<DialogTrigger asChild>
							<Button
								type="button"
								variant="link"
								size="sm"
								className="link h-auto text-xs text-muted-foreground hover:text-foreground"
							>
								{t("components.profile.info.about_me", "About me")}

								<OutlineChevronRight />
							</Button>
						</DialogTrigger>

						<ProfileDetailsContent user={user} />
					</Dialog>
				</div>
			</aside>

			{/* User settings modal */}
			{isMe && (
				<UserSettingsModal
					open={settingsOpen}
					onOpenChange={handleSettingsOpenChange}
					onSave={handleSaveSettings}
				/>
			)}
		</>
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
			{/* TODO: TABS DISABLED TILL WE WILL NOT TAKE CARE OF COMMMISSIONS AND OTHER STUFF */}
			{/* <div className="mb-6 shrink-0 justify-start pb-0 pt-2 transition-all">
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
			</div> */}

			<div className="mt-6 flex h-full min-h-0 flex-1 flex-col pb-24">
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