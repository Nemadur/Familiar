import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { OutlineStar, SolidStar } from "@/components/icons/icons";
import { LikeButton } from "@/components/layout/feed/ctas";
import { ProfileBadge } from "@/components/layout/profile/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllOrders } from "@/data/orders";
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

	const order = orders?.find((o) => o.postId === post.id);
	const isCommissioned = !!order;
	const review = order?.review;
	const rating = review?.rating || 0;
	const comment = review?.comment;

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title="Post Details"
			showBookmark={false}
			mediaContent={
				<div className="flex flex-col min-h-full items-center justify-center">
					{post.images && post.images.length > 0 ? (
						post.images.map((img, index) => (
							<div key={img.path} className="w-full">
								<img
									src={img.path}
									alt={img.alt || `${post.title} - ${index + 1}`}
									className="block h-auto w-full object-contain"
								/>
							</div>
						))
					) : (
						<div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
							No media available
						</div>
					)}
				</div>
			}
			detailsContent={
				<div className="flex flex-col min-h-full">
					<div className="flex-1 space-y-4 p-4">
						{/* Artist Info */}
						<div className="flex items-center gap-3">
							<Avatar className="h-10 w-10 border">
								<AvatarImage src={post.author.media.avatar || undefined} />
								<AvatarFallback>{post.author.display_name}</AvatarFallback>
							</Avatar>
							<div className="flex flex-col">
								<div className="flex items-center gap-1">
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

						{/* Title */}
						<div className="space-y-4">
							<h1 className="font-bold text-2xl leading-tight">{post.title}</h1>

							{/* Commissioned Badge / Review */}
							{isCommissioned && review && (
								<div className="flex flex-col gap-2 rounded-lg border bg-secondary/20 p-3">
									<div className="flex items-center gap-1 text-xs">
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
										<span className="ml-1 font-medium text-muted-foreground">
											{rating}.0
										</span>
									</div>
									{comment && (
										<p className="text-foreground/90 text-sm leading-snug">
											{comment}
										</p>
									)}
									<div className="flex flex-wrap gap-2">
										{[
											"On time delivery",
											"Professional",
											"Amazing skills",
											"Great value",
										].map((tag) => (
											<Badge key={tag} variant={"secondary"}>
												{tag}
											</Badge>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Like Button & Stats */}
						<div className="flex items-center gap-2">
							<LikeButton
								postId={post.id}
								likes={post.likeCount}
								isLiked={post.isLiked}
								onLike={() => {}} // TODO: Implement like logic
								showLikesCount={true}
								shouldAnimate={true}
							/>

							{/* TODO: add views to posts */}
							{/* <ViewIndicator
								views={post.viewCount || 0}
								shouldAnimate={false}
							/> */}
						</div>

						{/* Description / Bio Content */}
						{post.description && (
							<div className="text-muted-foreground leading-relaxed">
								<p>{post.description}</p>
							</div>
						)}

						{/* Content Warnings */}
						{post.contentWarnings && post.contentWarnings.length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{post.contentWarnings.map((cw) => (
									<Badge key={cw} variant="destructive" className="text-xs">
										CW: {cw}
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Footer CTA */}
					<div className="border-t bg-background p-4">
						<div className="flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<span className="font-medium text-primary text-sm">
									Commission me for something similar
								</span>
								<ArrowRight className="h-4 w-4 text-primary" />
							</div>

							<div className="flex flex-wrap gap-2">
								{/* Tags/Categories */}
								{post.tags && post.tags.length > 0
									? post.tags.map((tag) => (
											<Badge key={tag} variant={"outline"}>
												{tag}
											</Badge>
										))
									: // Fallback tags if none
										["illustration", "art"].map((tag) => (
											<Badge key={tag} variant={"outline"}>
												{tag}
											</Badge>
										))}
							</div>
						</div>
					</div>
				</div>
			}
		/>
	);
}
