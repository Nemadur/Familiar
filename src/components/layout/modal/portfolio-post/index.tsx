import { Typography } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Edit2, Flag, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
	OutlineBookmark,
	OutlineChat,
	OutlineChevronLeft,
	OutlineChevronRight,
	OutlineHeart,
	OutlineSend,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { UniversalModalLayout } from "@/components/layout/modal/universal-modal-layout";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
	useDeletePortfolioPost,
	useArtistPortfolioPost,
} from "@/hooks/portfolio/use-portfolio";
import { useUserByUsername } from "@/hooks/user/use-user";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { ContentWarningOverlay } from "../../content-warning-overlay";
import UserAvatar from "../../profile/avatar";
import User from "../../profile/user";

interface PortfolioPostModalProps {
	postId: string;
	username?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

interface PortfolioPostPageProps {
	postId: string;
	username?: string;
	onBack?: () => void;
	onDeleted?: () => void;
}

function usePortfolioPostController({
	postId,
	username,
	onDeleted,
}: {
	postId: string;
	username?: string;
	onDeleted?: () => void;
}) {
	const { t, i18n } = useTranslation();
	const { user: currentUser } = useAuth();
	const { user: profileUser, isPending: isUserPending } = useUserByUsername(
		username ?? "",
	);
	const queryClient = useQueryClient();

	const {
		data: post,
		isPending: isPostPending,
		isError,
	} = useArtistPortfolioPost(username ?? "", postId);

	const isPending = isPostPending || isUserPending;

	const deletePostMutation = useDeletePortfolioPost();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [liked, setLiked] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);

	useEffect(() => {
		setActiveMediaIndex(0);
	}, [postId]);

	useEffect(() => {
		setLiked(Boolean(post?.likedByCurrentUser));
		setBookmarked(Boolean(post?.bookmarkedByCurrentUser));
	}, [post?.likedByCurrentUser, post?.bookmarkedByCurrentUser]);

	const images = useMemo(
		() =>
			[...(post?.images ?? [])]
				.filter(
					(image) =>
						Boolean(image.fullSize?.path) || Boolean(image.thumbnail?.path),
				)
				.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
		[post?.images],
	);

	useEffect(() => {
		if (images.length > 0 && activeMediaIndex >= images.length) {
			setActiveMediaIndex(0);
		}
	}, [activeMediaIndex, images.length]);

	const currentMedia = images[activeMediaIndex] ?? images[0];

	const currentMediaPath =
		currentMedia?.fullSize?.path || currentMedia?.thumbnail?.path;

	const displayTitle =
		post?.title || t("components.portfolio.post.untitled", "Untitled");

	const originallyLiked = Boolean(post?.likedByCurrentUser);

	const displayedLikeCount = Math.max(
		0,
		(post?.likeCount ?? 0) + (liked === originallyLiked ? 0 : liked ? 1 : -1),
	);

	const createdAt =
		post?.createdAt && !Number.isNaN(Date.parse(post.createdAt))
			? new Intl.DateTimeFormat(i18n.language, {
					day: "numeric",
					month: "long",
					year: "numeric",
				}).format(new Date(post.createdAt))
			: null;

	const canManagePost = Boolean(
		currentUser?.userId &&
			profileUser?.userId &&
			currentUser.userId === profileUser.userId,
	);

	const goToPreviousMedia = () => {
		if (images.length <= 1) return;

		setActiveMediaIndex((currentIndex) =>
			currentIndex === 0 ? images.length - 1 : currentIndex - 1,
		);
	};

	const goToNextMedia = () => {
		if (images.length <= 1) return;

		setActiveMediaIndex((currentIndex) =>
			currentIndex === images.length - 1 ? 0 : currentIndex + 1,
		);
	};

	const handleDelete = async () => {
		try {
			await deletePostMutation.mutateAsync(postId);

			toast.success(
				t(
					"components.portfolio.post.delete.success",
					"Post deleted successfully",
				),
			);

			setDeleteDialogOpen(false);

			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: ["portfolio"],
				}),
				queryClient.invalidateQueries({
					queryKey: ["profile-content"],
				}),
			]);

			onDeleted?.();
		} catch {
			toast.error(
				t("components.portfolio.post.delete.error", "Failed to delete post"),
			);
		}
	};

	return {
		t,
		i18n,
		post,
		isPending,
		isError,
		profileUser,
		deletePostMutation,
		deleteDialogOpen,
		setDeleteDialogOpen,
		activeMediaIndex,
		setActiveMediaIndex,
		liked,
		setLiked,
		bookmarked,
		setBookmarked,
		images,
		currentMedia,
		currentMediaPath,
		displayTitle,
		displayedLikeCount,
		createdAt,
		canManagePost,
		goToPreviousMedia,
		goToNextMedia,
		handleDelete,
	};
}

type Controller = ReturnType<typeof usePortfolioPostController>;

function PostHeader({ controller }: { controller: Controller }) {
	const { t, profileUser } = controller;

	return (
		<div className="flex min-w-0 items-center gap-3">
			<User avatarSize="default" user={profileUser} showUsername={false} />
		</div>
	);
}

function PostMoreMenuItems({ controller }: { controller: Controller }) {
	const { t, canManagePost, setDeleteDialogOpen, post, profileUser } = controller;

	if (canManagePost) {
		return (
			<>
				<DropdownMenuItem
					onSelect={() => {
						toast.info(
							t(
								"components.portfolio.post.edit_coming_soon",
								"Edit feature coming soon!",
							),
						);
					}}
				>
					<Edit2 className="size-4" />
					{t("components.portfolio.post.manage.edit", "Edit post")}
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					variant="destructive"
					onSelect={() => {
						setDeleteDialogOpen(true);
					}}
				>
					<Trash2 className="size-4" />
					{t("components.portfolio.post.manage.delete", "Delete post")}
				</DropdownMenuItem>
			</>
		);
	}

	return (
		<>
		<DropdownMenuItem
			onSelect={() => {
				navigator.clipboard.writeText(
					`${window.location.origin}/${profileUser?.username}/portfolio/${post?.id}`,
				);
				toast.success(
					t(
						"components.portfolio.post.manage.copy_link_success",
						"Link copied to clipboard",
					),
				);
				// 		"Report feature coming soon!",
				// 	),
				// );
			}}
		>
			<Copy className="size-4" />
			{t("components.portfolio.post.manage.copy_link", "Copy link")}
		</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem
			variant={"destructive"}
			onSelect={() => {
				toast.info(
					t(
						"components.portfolio.post.report_coming_soon",
						"Report feature coming soon!",
					),
				);
			}}
		>
			<Flag className="size-4" />
			{t("components.portfolio.post.manage.report", "Report post")}
		</DropdownMenuItem>
		</>
	);
}

function PostMedia({ controller }: { controller: Controller }) {
	const {
		t,
		post,
		images,
		currentMedia,
		currentMediaPath,
		displayTitle,
		activeMediaIndex,
		setActiveMediaIndex,
		goToPreviousMedia,
		goToNextMedia,
	} = controller;

	if (!post) return null;

	return (
		<ContentWarningOverlay
			key={post.id}
			warnings={post.contentWarnings}
			className="size-full"
		>
			<div className="relative flex size-full min-h-0 items-center justify-center overflow-hidden bg-black">
				{currentMedia && currentMediaPath ? (
					currentMedia.mediaType === "VIDEO" ? (
						<video
							key={currentMedia.id}
							src={currentMediaPath}
							controls
							playsInline
							className="size-full object-contain"
						/>
					) : (
						<img
							key={currentMedia.id}
							src={currentMediaPath}
							alt={`${displayTitle} — ${activeMediaIndex + 1}`}
							className="size-full object-contain"
						/>
					)
				) : (
					<div className="flex size-full min-h-75 items-center justify-center px-6 text-center text-white/70">
						<EmptyPage
							title={t(
								"components.portfolio.post.no_media",
								"No media available",
							)}
						/>
					</div>
				)}

				{images.length > 1 && (
					<>
						<Button
							type="button"
							variant="secondary"
							size="icon-xl"
							aria-label={t(
								"components.portfolio.post.previous_media",
								"Previous image",
							)}
							className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
							onClick={goToPreviousMedia}
						>
							<OutlineChevronLeft className="size-5" />
						</Button>

						<Button
							type="button"
							variant="secondary"
							size="icon-xl"
							aria-label={t(
								"components.portfolio.post.next_media",
								"Next image",
							)}
							className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
							onClick={goToNextMedia}
						>
							<OutlineChevronRight className="size-5" />
						</Button>

						<div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-sm">
							{images.map((image, index) => (
								<button
									key={image.id || index}
									type="button"
									aria-label={`Show image ${index + 1}`}
									className={cn(
										"size-1.5 rounded-full bg-white/50 transition-all",
										index === activeMediaIndex && "w-4 bg-white",
									)}
									onClick={() => setActiveMediaIndex(index)}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</ContentWarningOverlay>
	);
}

function PostDetails({ controller }: { controller: Controller }) {
	const { post, profileUser, displayTitle, createdAt } = controller;

	if (!post) return null;

	return (
		<article className="p-4">
			<div className="flex flex-col items-start gap-3">
				<User avatarSize="sm" user={profileUser} />

				<div className="ml-11.5 min-w-0 flex-1 text-sm leading-relaxed">
					<Typography.Paragraph size="sm" className="wrap-break-word">
						{displayTitle}
					</Typography.Paragraph>

					{post.description && (
						<Typography.Paragraph
							size="sm"
							className="mt-2 whitespace-pre-wrap wrap-break-word text-foreground"
						>
							{post.description}
						</Typography.Paragraph>
					)}

					{post.tags && post.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-x-1.5 gap-y-1">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="cursor-pointer text-primary hover:underline"
								>
									#{tag.replace(/^#/, "")}
								</span>
							))}
						</div>
					)}

					{createdAt && (
						<p className="mt-3 text-xs text-muted-foreground">{createdAt}</p>
					)}
				</div>
			</div>
		</article>
	);
}

function PostActions({ controller }: { controller: Controller }) {
	const {
		t,
		i18n,
		liked,
		setLiked,
		bookmarked,
		setBookmarked,
		displayedLikeCount,
		createdAt,
	} = controller;

	return (
		<div className="bg-background">
			<div className="flex items-center px-2 pt-2">
				<div className="flex items-center">
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={
							liked
								? t("components.portfolio.post.unlike", "Unlike")
								: t("components.portfolio.post.like", "Like")
						}
						className={cn(
							"rounded-full",
							liked && "text-red-500 hover:text-red-500",
						)}
						onClick={() => setLiked((current) => !current)}
					>
						<OutlineHeart className={cn("size-6", liked && "fill-current")} />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={t("components.portfolio.post.comment", "Comment")}
						className="rounded-full"
					>
						<OutlineChat className="size-6" />
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label={t("components.portfolio.post.share", "Share")}
						className="rounded-full"
					>
						<OutlineSend className="size-6" />
					</Button>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={
						bookmarked
							? t(
									"components.portfolio.post.remove_bookmark",
									"Remove bookmark",
								)
							: t("components.portfolio.post.bookmark", "Bookmark")
					}
					className="ml-auto rounded-full"
					onClick={() => setBookmarked((current) => !current)}
				>
					<OutlineBookmark
						className={cn("size-6", bookmarked && "fill-current")}
					/>
				</Button>
			</div>

			<div className="px-4 pb-3">
				<Typography.Paragraph size="base">
					{displayedLikeCount.toLocaleString(i18n.language)}{" "}
					{displayedLikeCount === 1
						? t("components.portfolio.post.like_count_single", "like")
						: t("components.portfolio.post.like_count_plural", "likes")}
				</Typography.Paragraph>

				{createdAt && (
					<Typography.Paragraph
						size="xs"
						className="mt-1 uppercase text-muted-foreground"
					>
						{createdAt}
					</Typography.Paragraph>
				)}
			</div>
		</div>
	);
}

function DeletePostDialog({ controller }: { controller: Controller }) {
	const {
		t,
		deleteDialogOpen,
		setDeleteDialogOpen,
		deletePostMutation,
		handleDelete,
	} = controller;

	return (
		<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{t("components.portfolio.post.delete.title", "Delete post?")}
					</AlertDialogTitle>

					<AlertDialogDescription>
						{t(
							"components.portfolio.post.delete.description",
							"Are you sure you want to delete this post? This action cannot be undone.",
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>
						{t("components.portfolio.post.delete.cancel", "Cancel")}
					</AlertDialogCancel>

					<AlertDialogAction
						disabled={deletePostMutation.isPending}
						onClick={(event) => {
							event.preventDefault();
							void handleDelete();
						}}
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
					>
						{deletePostMutation.isPending
							? t("components.portfolio.post.delete.deleting", "Deleting...")
							: t("components.portfolio.post.delete.confirm", "Delete")}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function PortfolioPostModal({
	postId,
	username,
	open,
	onOpenChange,
}: PortfolioPostModalProps) {
	const controller = usePortfolioPostController({
		postId,
		username,
		onDeleted: () => onOpenChange(false),
	});

	const { t, isPending, isError, post, displayTitle } = controller;

	if (!open) return null;

	if (isPending) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={t("components.portfolio.post.loading", "Loading post...")}
				mediaClassName="bg-black"
				mediaContent={
					<div className="flex size-full min-h-75 items-center justify-center text-white">
						<Spinner />
					</div>
				}
				detailsHeaderContent={
					<div className="flex items-center gap-3">
						<div className="size-10 animate-pulse rounded-full bg-muted" />
						<div className="space-y-2">
							<div className="h-3 w-28 animate-pulse rounded bg-muted" />
							<div className="h-2.5 w-20 animate-pulse rounded bg-muted" />
						</div>
					</div>
				}
				detailsContent={
					<div className="flex h-full min-h-75 items-center justify-center">
						<Spinner />
					</div>
				}
			/>
		);
	}

	if (isError || !post) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={t("components.portfolio.post.error", "Error")}
				mediaClassName="bg-black"
				mediaContent={
					<div className="flex size-full min-h-75 items-center justify-center px-6 text-center text-sm text-white/70">
						{t(
							"components.portfolio.post.not_found",
							"Post not found or could not be loaded.",
						)}
					</div>
				}
				detailsContent={<div />}
			/>
		);
	}

	return (
		<>
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={displayTitle}
				mediaClassName="bg-black"
				detailsHeaderContent={<PostHeader controller={controller} />}
				moreMenuContent={<PostMoreMenuItems controller={controller} />}
				mediaContent={<PostMedia controller={controller} />}
				detailsContent={<PostDetails controller={controller} />}
				detailsFooterContent={<PostActions controller={controller} />}
			/>

			<DeletePostDialog controller={controller} />
		</>
	);
}

export function PortfolioPostPage({
	postId,
	username,
	onBack,
	onDeleted,
}: PortfolioPostPageProps) {
	const controller = usePortfolioPostController({
		postId,
		username,
		onDeleted,
	});

	const { t, isPending, isError, post, displayTitle } = controller;

	if (isPending) {
		return (
			<div className="flex min-h-[60dvh] w-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className="flex min-h-[60dvh] w-full items-center justify-center p-6">
				<EmptyPage
					title={t(
						"components.portfolio.post.not_found",
						"Post not found or could not be loaded.",
					)}
				/>
			</div>
		);
	}

	return (
		<>
			<main className="mx-auto w-full max-w-[1440px] md:px-4 lg:px-6">
				<div className="grid min-h-[calc(100dvh-5rem)] w-full overflow-hidden bg-background md:my-4 md:rounded-2xl md:border lg:grid-cols-[minmax(0,1fr)_420px]">
					<section className="relative min-h-[55dvh] bg-black lg:min-h-[calc(100dvh-7rem)]">
						{onBack && (
							<Button
								type="button"
								variant="secondary"
								size="icon-xl"
								aria-label="Back"
								className="absolute left-4 top-4 z-30"
								onClick={onBack}
							>
								<ArrowLeft className="size-5" />
							</Button>
						)}

						<PostMedia controller={controller} />
					</section>

					<aside className="flex min-h-0 flex-col border-t bg-background lg:max-h-[calc(100dvh-7rem)] lg:border-l lg:border-t-0">
						<header className="flex items-center gap-3 border-b p-4">
							<PostHeader controller={controller} />

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="ml-auto rounded-full"
										aria-label="More"
									>
										<MoreHorizontal className="size-5" />
									</Button>
								</DropdownMenuTrigger>

								<DropdownMenuContent align="end">
									<PostMoreMenuItems controller={controller} />
								</DropdownMenuContent>
							</DropdownMenu>
						</header>

						<div className="min-h-0 flex-1 overflow-y-auto">
							<PostDetails controller={controller} />
						</div>

						<div className="border-t">
							<PostActions controller={controller} />
						</div>
					</aside>
				</div>

				<h1 className="sr-only">{displayTitle}</h1>
			</main>

			<DeletePostDialog controller={controller} />
		</>
	);
}
