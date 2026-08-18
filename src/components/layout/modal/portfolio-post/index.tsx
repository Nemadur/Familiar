import { Typography } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	Bookmark,
	ChevronLeft,
	ChevronRight,
	Edit2,
	Flag,
	Heart,
	MessageCircle,
	Send,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { OutlineBookmark, OutlineChat, OutlineChevronLeft, OutlineChevronRight, OutlineHeart, OutlineSend } from "@/components/icons/icons";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
	useArtistPortfolioPost,
	useDeletePortfolioPost,
} from "@/hooks/portfolio/use-portfolio";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { ContentWarningOverlay } from "../../content-warning-overlay";
import UserAvatar from "../../profile/avatar";
import User from "../../profile/user";

interface PortfolioPostModalProps {
	postId: string;
	username: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PortfolioPostModal({
	postId,
	username,
	open,
	onOpenChange,
}: PortfolioPostModalProps) {
	const { t, i18n } = useTranslation();
	const { user: currentUser } = useAuth();
	const queryClient = useQueryClient();

	const { data: post, isPending, isError } =
		useArtistPortfolioPost(username, postId);

	const deletePostMutation = useDeletePortfolioPost();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [activeMediaIndex, setActiveMediaIndex] = useState(0);
	const [liked, setLiked] = useState(false);
	const [bookmarked, setBookmarked] = useState(false);

	useEffect(() => {
		setActiveMediaIndex(0);
	}, []);

	useEffect(() => {
		setLiked(Boolean(post?.likedByCurrentUser));
		setBookmarked(Boolean(post?.bookmarkedByCurrentUser));
	}, [
		post?.likedByCurrentUser,
		post?.bookmarkedByCurrentUser
	]);

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
			onOpenChange(false);

			queryClient.invalidateQueries({
				queryKey: ["portfolio"],
			});

			queryClient.invalidateQueries({
				queryKey: ["profile-content"],
			});
		} catch {
			toast.error(
				t(
					"components.portfolio.post.delete.error",
					"Failed to delete post",
				),
			);
		}
	};

	if (!open) {
		return null;
	}

	if (isPending) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={t(
					"components.portfolio.post.loading",
					"Loading post...",
				)}
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

	const displayTitle =
		post.title ||
		t("components.portfolio.post.untitled", "Untitled");

	const images = [...(post.images ?? [])]
		.filter(
			(image) =>
				Boolean(image.fullSize?.path) ||
				Boolean(image.thumbnail?.path),
		)
		.sort(
			(a, b) =>
				(a.position ?? 0) - (b.position ?? 0),
		);

	const currentMedia =
		images[activeMediaIndex] ?? images[0];

	const currentMediaPath =
		currentMedia?.fullSize?.path ||
		currentMedia?.thumbnail?.path;

	const originallyLiked = Boolean(post.likedByCurrentUser);

	const displayedLikeCount = Math.max(
		0,
		(post.likeCount ?? 0) +
		(liked === originallyLiked ? 0 : liked ? 1 : -1),
	);

	const createdAt =
		post.createdAt &&
			!Number.isNaN(Date.parse(post.createdAt))
			? new Intl.DateTimeFormat(i18n.language, {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(new Date(post.createdAt))
			: null;

	const goToPreviousMedia = () => {
		setActiveMediaIndex((currentIndex) =>
			currentIndex === 0
				? images.length - 1
				: currentIndex - 1,
		);
	};

	const goToNextMedia = () => {
		setActiveMediaIndex((currentIndex) =>
			currentIndex === images.length - 1
				? 0
				: currentIndex + 1,
		);
	};

	return (
		<>
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={displayTitle}
				mediaClassName="bg-black"
				detailsHeaderContent={
					<div className="flex min-w-0 items-center gap-3">
						<UserAvatar size={"default"} user={currentUser} />

						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">
								{currentUser?.username || ""}
							</p>

							<p className="truncate text-xs text-muted-foreground">
								{t(
									"components.portfolio.post.portfolio",
									"Portfolio post",
								)}
							</p>
						</div>
					</div>
				}
				moreMenuContent={currentUser ? (
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

							{t(
								"components.portfolio.post.manage.edit",
								"Edit post",
							)}
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						<DropdownMenuItem
							variant="destructive"
							onSelect={() => {
								setDeleteDialogOpen(true);
							}}
						>
							<Trash2 className="size-4" />

							{t(
								"components.portfolio.post.manage.delete",
								"Delete post",
							)}
						</DropdownMenuItem>
					</>
				) : (
					<DropdownMenuItem
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

						{t(
							"components.portfolio.post.manage.report",
							"Report post",
						)}
					</DropdownMenuItem>
				)}
				mediaContent={
					<ContentWarningOverlay
						key={postId}
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
									<div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
										<Button
											type="button"
											variant="secondary"
											size="icon-xl"
											aria-label={t(
												"components.portfolio.post.previous_media",
												"Previous image",
											)}
											className={cn(
												"transform-none! transition-colors",
												"active:transform-none!",
												"[&>svg]:transform-none!",
												"active:[&>svg]:transform-none!",
											)}
											onClick={(event) => {
												event.stopPropagation();
												goToPreviousMedia();
											}}
										>
											<OutlineChevronLeft className="size-5" />
										</Button>
									</div>

									<div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
										<Button
											type="button"
											variant="secondary"
											size="icon-xl"
											aria-label={t(
												"components.portfolio.post.next_media",
												"Next image",
											)}
											className={cn(
												"transform-none! transition-colors",
												"active:transform-none!",
												"[&>svg]:transform-none!",
												"active:[&>svg]:transform-none!",
											)}
											onClick={(event) => {
												event.stopPropagation();
												goToNextMedia();
											}}
										>
											<OutlineChevronRight className="size-5" />
										</Button>
									</div>

									<div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-2 backdrop-blur-sm">
										{images.map((image, index) => (
											<button
												key={image.id || index}
												type="button"
												aria-label={`Show image ${index + 1}`}
												className={cn(
													"size-1.5 rounded-full bg-white/50 transition-[width,background-color]",
													index === activeMediaIndex &&
													"w-4 bg-white",
												)}
												onClick={(event) => {
													event.stopPropagation();
													setActiveMediaIndex(index);
												}}
											/>
										))}
									</div>
								</>
							)}
						</div>
					</ContentWarningOverlay>
				}
				detailsContent={
					<article className="p-4">
						<div className="flex items-start flex-col gap-3">
							<User
								size={"sm"}
								user={currentUser}
							/>

							<div className="min-w-0 ml-11.5 flex-1 text-sm leading-relaxed">
								<Typography.Paragraph size={"sm"} className="wrap-break-word">
									{displayTitle}
								</Typography.Paragraph>

								{post.description && (
									<Typography.Paragraph size={"sm"} className="mt-2 whitespace-pre-wrap wrap-break-word text-foreground">
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
									<p className="mt-3 text-xs text-muted-foreground">
										{createdAt}
									</p>
								)}
							</div>
						</div>

						{/* {post.contentWarnings &&
							post.contentWarnings.length > 0 && (
								<div className="mt-6 border-t pt-4">
									<p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										{t(
											"components.portfolio.post.warnings",
											"Content warnings",
										)}
									</p>

									<div className="flex flex-wrap gap-2">
										{post.contentWarnings.map(
											(warning) => (
												<Badge
													key={warning}
													variant="destructive"
													className="border-transparent bg-destructive/10 font-normal text-destructive hover:bg-destructive/15"
												>
													{warning}
												</Badge>
											),
										)}
									</div>
								</div>
							)} */}
					</article>
				}
				detailsFooterContent={
					<div className="bg-background">
						<div className="flex items-center px-2 pt-2">
							<div className="flex items-center">
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={
										liked
											? t(
												"components.portfolio.post.unlike",
												"Unlike",
											)
											: t(
												"components.portfolio.post.like",
												"Like",
											)
									}
									className={cn(
										"rounded-full",
										liked &&
										"text-red-500 hover:text-red-500",
									)}
									onClick={() =>
										setLiked((current) => !current)
									}
								>
									<OutlineHeart
										className={cn(
											"size-6",
											liked && "fill-current",
										)}
									/>
								</Button>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={t(
										"components.portfolio.post.comment",
										"Comment",
									)}
									className="rounded-full"
								>
									<OutlineChat className="size-6" />
								</Button>

								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label={t(
										"components.portfolio.post.share",
										"Share",
									)}
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
										: t(
											"components.portfolio.post.bookmark",
											"Bookmark",
										)
								}
								className="ml-auto rounded-full"
								onClick={() =>
									setBookmarked((current) => !current)
								}
							>
								<OutlineBookmark
									className={cn(
										"size-6",
										bookmarked && "fill-current",
									)}
								/>
							</Button>
						</div>

						<div className="px-4 pb-3">
							<Typography.Paragraph size={"base"}>
								{displayedLikeCount.toLocaleString(
									i18n.language,
								)}{" "}
								{displayedLikeCount === 1
									? t(
										"components.portfolio.post.like_count_single",
										"like",
									)
									: t(
										"components.portfolio.post.like_count_plural",
										"likes",
									)}
							</Typography.Paragraph>

							{createdAt && (
								<Typography.Paragraph size={"xs"} className="mt-1 uppercase text-muted-foreground">
									{createdAt}
								</Typography.Paragraph>
							)}
						</div>
					</div>
				}
			/>

			<AlertDialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t(
								"components.portfolio.post.delete.title",
								"Delete post?",
							)}
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
							{t(
								"components.portfolio.post.delete.cancel",
								"Cancel",
							)}
						</AlertDialogCancel>

						<AlertDialogAction
							disabled={deletePostMutation.isPending}
							onClick={(event) => {
								event.preventDefault();
								handleDelete();
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deletePostMutation.isPending
								? t(
									"components.portfolio.post.delete.deleting",
									"Deleting...",
								)
								: t(
									"components.portfolio.post.delete.confirm",
									"Delete",
								)}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}