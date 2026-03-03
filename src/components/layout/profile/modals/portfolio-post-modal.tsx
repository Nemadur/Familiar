import { ScrollShadow } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowUpRight,
	Check,
	ChevronDown,
	ChevronUp,
	ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineArrowRight,
	OutlineCheckmarkSeal,
	OutlineChevronDown,
	OutlineChevronUp,
	OutlineStar,
	SolidStar,
} from "@/components/icons/icons";
import { CTAs } from "@/components/layout/feed/ctas";
import { ProfileBadge } from "@/components/layout/profile/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getAllOrders } from "@/data/orders";
import { getPostDetails } from "@/data/posts";
import type { PostWithAuthor } from "@/types/post";
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
		"On time delivery",
		"Very responsive",
		"Proactive updates",
	];

	const linkedCharacters =
		postDetails?.linkedCharacters || post.linkedCharacters || [];

	const [isReviewOpen, setIsReviewOpen] = useState(true);

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title="Post Details"
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
								No media available
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
								No media available
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
							<Avatar className="h-10 w-10 border">
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

						{/* Content Warnings */}
						{post.contentWarnings && post.contentWarnings.length > 0 && (
							<div className="rounded-2xl border border-yellow-900/20 bg-yellow-950/10 p-4">
								<div className="flex items-center gap-2 mb-2">
									<ShieldAlert className="size-5 text-yellow-500" />
									<span className="text-sm text-yellow-500">
										Content Warning
									</span>
								</div>
								<div className="flex flex-wrap gap-2 mb-2">
									{post.contentWarnings.map((cw) => (
										<Badge
											key={cw}
											className=" bg-yellow-900/20 text-yellow-500"
										>
											{cw}
										</Badge>
									))}
								</div>
								<p className="text-xs text-yellow-400/50">
									This artwork contains content that some viewers may find
									sensitive
								</p>
							</div>
						)}

						{/* Commissioned Badge / Review */}
						{isCommissioned && (
							<div className="rounded-2xl bg-border/30 p-4 space-y-4">
								<div className="flex items-center gap-2 text-emerald-500">
									<OutlineCheckmarkSeal size={20} />
									<span className="text-sm">Commissioned by client</span>
								</div>

								{review && (
									<Collapsible
										open={isReviewOpen}
										onOpenChange={setIsReviewOpen}
									>
										<div className="flex items-center justify-between">
											<div className="space-y-1">
												<div className="flex items-center gap-3">
													<div className="flex gap-0.5">
														{[1, 2, 3, 4, 5].map((i) =>
															i <= rating ? (
																<SolidStar
																	key={i}
																	size={16}
																	className="text-amber-500"
																/>
															) : (
																<OutlineStar
																	key={i}
																	size={16}
																	className="text-muted-foreground/40"
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
												{/* TODO: add title */}
												{comment && (
													<p className="text-sm text-foreground/90 leading-relaxed">
														{comment}
													</p>
												)}
											</div>
											{highlights && highlights.length > 0 && (
												<CollapsibleTrigger asChild>
													<Button variant="ghost" size="icon">
														{isReviewOpen ? (
															<OutlineChevronUp className="text-muted-foreground" />
														) : (
															<OutlineChevronDown className="text-muted-foreground" />
														)}
													</Button>
												</CollapsibleTrigger>
											)}
										</div>
										{highlights && highlights.length > 0 && (
											<CollapsibleContent>
												<div className="space-y-4 pt-1">
													<div className="space-y-2">
														<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
															Highlights
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
												</div>
											</CollapsibleContent>
										)}
									</Collapsible>
								)}
							</div>
						)}

						{/* Featured Character */}
						{linkedCharacters && linkedCharacters.length > 0 && (
							<div className="space-y-3">
								<h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
									Featured
								</h4>
								<div className="flex items-center justify-between rounded-xl border bg-card/50 p-3 pr-4 hover:bg-accent/50 transition-colors cursor-pointer group">
									<div className="flex items-center gap-3">
										<Avatar className="h-10 w-10 border bg-background">
											<AvatarImage
												src={linkedCharacters[0].avatarUrl}
												className="object-cover"
											/>
											<AvatarFallback>
												{linkedCharacters[0].name[0]}
											</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="font-bold text-sm group-hover:text-primary transition-colors">
												{linkedCharacters[0].name}
											</span>
											<span className="text-xs text-muted-foreground">
												Character
											</span>
										</div>
									</div>
									<Button
										variant="secondary"
										size="sm"
										className="gap-1.5 text-xs font-medium h-8 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50 rounded-full px-4"
									>
										View in gallery
										<ArrowUpRight className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						)}

						{/* Commission CTA */}
						<Button
							size={"xl"}
							className="w-full justify-between bg-blue-500/12 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400 group"
						>
							Commission me for something similar
							<OutlineArrowRight className="transition-transform group-hover:translate-x-1" />
						</Button>

						{/* Description / Bio Content */}
						{post.description && (
							<div className="text-muted-foreground leading-relaxed text-sm">
								<MarkdownDisplay content={post.description} />
							</div>
						)}

						{/* Tags */}
						<div className="flex flex-wrap gap-2 pt-2">
							{post.tags && post.tags.length > 0 ? (
								post.tags.map((tag) => (
									<Badge
										key={tag}
										variant="secondary"
										className="rounded-full px-3 py-1.5 text-xs font-medium bg-secondary/50 hover:bg-secondary/70 text-secondary-foreground"
									>
										{tag}
									</Badge>
								))
							) : (
								<p>No tags</p>
							)}
						</div>
					</div>
				</div>
			}
		/>
	);
}
