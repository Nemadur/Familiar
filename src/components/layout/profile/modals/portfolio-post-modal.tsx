import { ScrollShadow, Surface } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineArrowRight,
	OutlineCheckmarkSeal,
	OutlineChevronDown,
	OutlineStar,
	SolidStar,
} from "@/components/icons/icons";
import { CTAs } from "@/components/layout/feed/ctas";
import UserAvatar from "@/components/layout/profile/avatar";
import { ProfileBadge } from "@/components/layout/profile/badge";
import { AnimateChangeInHeight } from "@/components/ui/animate-change-in-height";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getAllOrders } from "@/data/orders";
import { getPostDetails } from "@/data/posts";
import { cn } from "@/lib/utils";
import type { PostWithAuthor } from "@/types/post";
import type { User } from "@/types/user";
import { EmptyPage } from "../../empty-page";
import { UniversalModalLayout } from "./universal-modal-layout";

interface PortfolioPostModalProps {
	post: PostWithAuthor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PortfolioPostModal({
	post,
	open,
	onOpenChange,
}: PortfolioPostModalProps) {
	const { t } = useTranslation();
	const { data: orders } = useQuery({
		queryKey: ["orders"],
		queryFn: () => getAllOrders(),
	});

	const { data: postDetails } = useQuery({
		queryKey: ["post-details", post.id],
		queryFn: () => getPostDetails({ data: { postId: post.id } }),
		enabled: open,
	});

	const order = orders?.find((o) => o.postId === post.id);
	const review =
		postDetails?.featuredReview || post.featuredReview || order?.review;
	const isCommissioned = !!order || !!review;
	const rating = review?.rating || 0;
	const comment = review?.comment;
	const highlights = review?.highlights || [
		t("components.profile.commissions.post_modal.default_highlights.delivery"),
		t(
			"components.profile.commissions.post_modal.default_highlights.responsive",
		),
		t("components.profile.commissions.post_modal.default_highlights.updates"),
	];

	const linkedCharacters =
		postDetails?.linkedCharacters || post.linkedCharacters || [];

	const [isReviewOpen, setIsReviewOpen] = useState(true);
	const [isWarningOpen, setIsWarningOpen] = useState(true);

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title={t("components.profile.commissions.post_modal.title")}
			showBookmark={true}
			isBookmarked={post.isBookmarked || false}
			onBookmark={(e) => {
				e.stopPropagation();
			}}
			mediaContent={
				<>
					{/* Mobile & Tablet View (< lg) */}
					<ScrollShadow
						orientation="horizontal"
						className="flex w-full gap-4 p-4 lg:hidden"
						hideScrollBar
					>
						{post.images && post.images.length > 0 ? (
							post.images.map((img, index) => (
								<div
									key={img.path}
									className="relative flex h-[250px] w-3/4 shrink-0 items-center justify-center rounded-lg"
								>
									<img
										src={img.path}
										alt={img.alt || `${post.title} - ${index + 1}`}
										className="h-full w-full rounded-lg object-cover shadow-sm"
									/>
								</div>
							))
						) : (
							<div className="flex h-[250px] w-full items-center justify-center p-8 text-muted-foreground">
								<EmptyPage title="no media" />
							</div>
						)}
					</ScrollShadow>

					{/* Desktop View (>= lg) */}
					<div className="hidden flex-col gap-4 p-4 lg:flex">
						{post.images && post.images.length > 0 ? (
							post.images.map((img, index) => (
								<div
									key={img.path}
									className="relative flex min-h-[40vh] w-full items-center justify-center rounded-lg"
								>
									<img
										src={img.path}
										alt={img.alt || `${post.title} - ${index + 1}`}
										className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
									/>
								</div>
							))
						) : (
							<div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
								{t("components.profile.commissions.post_modal.no_media")}
							</div>
						)}
					</div>
				</>
			}
			detailsContent={
				<div className="flex flex-col min-h-full">
					<div className="flex-1 space-y-6 p-6">
						{/* Author Info */}
						<div className="flex items-center gap-3">
							<Avatar>
								<AvatarImage src={post.author.media.avatar || undefined} />
								<AvatarFallback>{post.author.display_name}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<div className="flex items-center gap-1.5">
									<span className="font-semibold text-sm">
										{post.author.display_name}
									</span>
									<ProfileBadge user={post.author} />
								</div>
								<span className="text-muted-foreground text-xs">
									{`@${post.author.username}`}
								</span>
							</div>
						</div>

						{/* Title & Stats */}
						<div className="space-y-3">
							<h1 className="font-bold text-2xl leading-tight">{post.title}</h1>

							<div className="flex flex-col gap-2">
								{/* Description */}
								{post.description && (
									<div className="text-muted-foreground leading-relaxed text-sm">
										<MarkdownDisplay content={post.description} />
									</div>
								)}
							</div>
						</div>

						{/* Content Warnings */}
						{/* {post.contentWarnings && post.contentWarnings.length > 0 && (
							<div className="rounded-2xl text-yellow-950 dark:text-yellow-500 border border-yellow-600/40 bg-yellow-50/12 dark:bg-yellow-950/12 p-2">
								<button
									type="button"
									className="flex w-full items-center justify-between cursor-pointer select-none"
									onClick={() => setIsWarningOpen(!isWarningOpen)}
								>
									<div className="flex items-center gap-2">
										<ShieldAlert className="size-5" />
										<span className="text-sm">
											{t(
												"components.profile.commissions.post_modal.content_warning",
											)}
										</span>
									</div>
									<div
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon-sm" }),
											"text-yellow-950 dark:text-yellow-500 hover:bg-yellow-200/50 dark:hover:bg-yellow-900/50 pointer-events-none rounded-lg",
										)}
									>
										<OutlineChevronDown
											className={cn(
												"transition-transform duration-200",
												isWarningOpen && "rotate-180",
											)}
										/>
									</div>
								</button>
								<AnimateChangeInHeight>
									{isWarningOpen && (
										<div className="pt-4 space-y-2">
											<div className="flex flex-wrap gap-2">
												{post.contentWarnings.map((cw) => (
													<Badge
														key={cw}
														className="bg-yellow-200 text-yellow-800 dark:bg-yellow-500/12 dark:text-yellow-500"
													>
														{cw}
													</Badge>
												))}
											</div>
											<p className="text-xs text-yellow-800/50 dark:text-yellow-400/50">
												{t(
													"components.profile.commissions.post_modal.sensitive_content_desc",
												)}
											</p>
										</div>
									)}
								</AnimateChangeInHeight>
							</div>
						)} */}

						{/* Commissioned Badge / Review */}
						{isCommissioned && (
							<Surface
								variant={"default"}
								className="rounded-2xl border border-border p-2"
							>
								{review ? (
									<button
										type="button"
										className="flex w-full items-center justify-between cursor-pointer select-none"
										onClick={() => setIsReviewOpen(!isReviewOpen)}
									>
										<div className="flex items-center gap-2">
											<OutlineCheckmarkSeal size={20} />
											<span className="text-sm">
												{t(
													"components.profile.commissions.post_modal.commissioned_by",
												)}
											</span>
										</div>
										<div
											className={cn(
												buttonVariants({ variant: "ghost", size: "icon-sm" }),
												"pointer-events-none rounded-lg",
											)}
										>
											<OutlineChevronDown
												className={cn(
													"transition-transform duration-200",
													isReviewOpen && "rotate-180",
												)}
											/>
										</div>
									</button>
								) : (
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<OutlineCheckmarkSeal size={20} />
											<span className="text-sm">
												{t(
													"components.profile.commissions.post_modal.commissioned_by",
												)}
											</span>
										</div>
									</div>
								)}

								{review && (
									<AnimateChangeInHeight>
										{isReviewOpen && (
											<div className="pt-1">
												<div className="flex items-center gap-3 mb-1">
													<div className="flex gap-0.5">
														{[1, 2, 3, 4, 5].map((i) =>
															i <= rating ? (
																<SolidStar
																	// eslint-disable-next-line react-doctor/no-array-index-as-key
																	key={i}
																	size={16}
																	className="text-amber-600 dark:text-amber-200"
																/>
															) : (
																<OutlineStar
																	// eslint-disable-next-line react-doctor/no-array-index-as-key
																	key={i}
																	size={16}
																	className="text-muted-foreground/30"
																/>
															),
														)}
													</div>
													<span className="text-xs text-muted-foreground">
														{new Date(review.createdAt).toLocaleDateString(
															undefined,
															{
																month: "short",
																year: "numeric",
															},
														)}
													</span>
												</div>

												{comment && (
													<p className="text-sm text-emerald-950 dark:text-emerald-50 leading-relaxed">
														{comment}
													</p>
												)}

												{highlights && highlights.length > 0 && (
													<div className="space-y-2">
														<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
															{t(
																"components.profile.commissions.post_modal.highlights",
															)}
														</span>
														<div className="flex flex-wrap gap-2">
															{highlights.map((tag) => (
																<Badge
																	key={tag}
																	variant="secondary"
																	className="bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground font-normal rounded-lg px-3 py-1.5"
																>
																	{tag}
																</Badge>
															))}
														</div>
													</div>
												)}
											</div>
										)}
									</AnimateChangeInHeight>
								)}
							</Surface>
						)}

						{/* Featured Character */}
						{linkedCharacters && linkedCharacters.length > 0 && (
							<div className="space-y-3">
								<h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
									{t("components.profile.commissions.post_modal.featured")}
								</h4>
								<div className="grid gap-2">
									{linkedCharacters.map((character) => (
										<Surface
											variant={"default"}
											key={character.id}
											className="flex items-center justify-between rounded-full border p-1 cursor-pointer group"
										>
											<div className="flex items-center gap-3">
												<UserAvatar
													user={
														{
															display_name: character.name,
															media: { avatar: character.avatarUrl },
															accent_color: character.accent_color,
														} as User
													}
												/>
												<div className="flex flex-col">
													<span className="font-bold text-sm group-hover:text-primary transition-colors">
														{character.name}
													</span>
													<span className="text-xs text-muted-foreground">
														{t(
															"components.profile.commissions.post_modal.character",
														)}
													</span>
												</div>
											</div>
											<Button variant="secondary">
												{t(
													"components.profile.commissions.post_modal.view_in_gallery",
												)}
											</Button>
										</Surface>
									))}
								</div>
							</div>
						)}

						{/* Commission CTA */}
						<Button
							size={"xl"}
							className="w-full border border-accent/30 justify-between bg-accent/12 dark:bg-accent/12 text-accent hover:bg-accent-soft-hover hover:text-accent-soft-foreground group"
						>
							{t(
								"components.profile.commissions.post_modal.commission_similar",
							)}
							<OutlineArrowRight className="transition-transform group-hover:translate-x-1" />
						</Button>

						{/* Tags */}
						<div className="flex flex-col gap-2 pt-2">
							<div className="space-y-1">
								<p className="uppercase text-xs text-muted-foreground">
									{t("components.profile.commissions.post_modal.tags_label")}
								</p>
								<div className="flex flex-wrap gap-2">
									{post.tags && post.tags.length > 0 ? (
										post.tags.map((tag) => (
											<Badge
												key={tag}
												variant="secondary"
												className="px-3 py-1.5"
											>
												{tag}
											</Badge>
										))
									) : (
										<p>
											{t("components.profile.commissions.post_modal.no_tags")}
										</p>
									)}
								</div>
							</div>
							{/* CW tags */}
							<div className="space-y-1">
								<p className="uppercase text-xs text-muted-foreground">
									{t(
										"components.profile.commissions.post_modal.content_warnings_label",
									)}
								</p>
								<div className="flex flex-wrap gap-2">
									{post.contentWarnings && post.contentWarnings.length > 0 ? (
										post.contentWarnings.map((tag) => (
											<Badge
												key={tag}
												variant="destructive"
												className="px-3 py-1.5"
											>
												{tag}
											</Badge>
										))
									) : (
										<p>
											{t(
												"components.profile.commissions.post_modal.no_cw_tags",
											)}
										</p>
									)}
								</div>
							</div>
						</div>
					</div>

					<div className="sticky bottom-0 z-20 bg-background border-t p-4">
						<CTAs
							postId={post.id}
							likes={post.likeCount || 0}
							isLiked={post.isLiked || false}
							isBookmarked={post.isBookmarked || false}
							onLike={(e) => {
								e.stopPropagation();
							}}
							onBookmark={(e) => {
								e.stopPropagation();
							}}
							views={post.viewCount || 0}
							showBookmarksCount={false}
							animateGate
							showBookmarkButton={false}
							variant="default"
							rightElement={
								<span className="text-xs text-muted-foreground">
									{new Date(post.createdAt).toLocaleDateString(undefined, {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</span>
							}
						/>
					</div>
				</div>
			}
		/>
	);
}
