import { EyeOff } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineEyeOff } from "@/components/icons/icons";
import {
	Reel,
	ReelContent,
	ReelImage,
	type ReelItem,
	ReelProgress,
} from "@/components/kibo-ui/reel";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlurredImage } from "@/hooks/use-blurred-image";
import { cn } from "@/lib/utils";
import type { PostWithAuthor, Tile } from "@/types/post";
import { CTAs } from "./ctas";
import { Header } from "./header";

// Motion variants removed - using CSS hover instead

interface FeedItemProps {
	p: Tile;
	post: PostWithAuthor;
	animateGate: boolean;
	handlePostClick: (postId: string) => void;
	style: React.CSSProperties;
	variant?: "feed" | "portfolio";
}

export const FeedItem = memo(function FeedItem({
	p,
	post,
	animateGate,
	handlePostClick,
	style: nodeStyle,
	variant = "feed",
}: FeedItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const { t } = useTranslation();
	const [isContentRevealed, setIsContentRevealed] = useState(false);

	const hasContentWarnings =
		post.contentWarnings && post.contentWarnings.length > 0;
	const shouldBlur = hasContentWarnings && !isContentRevealed;
	const blurredImageSrc = useBlurredImage(post.images?.[0]?.path, shouldBlur);

	const medias = post.images ?? [];
	const firstMedia = medias[0];
	const hasMultipleImages = medias.length > 1;
	const isPortfolio = variant === "portfolio";

	// Portfolio tiles stay static. In the regular feed, a reel runs only while
	// a multi-image tile is hovered, so dozens of timers never run at once.
	const shouldRenderReel = !isPortfolio && hasMultipleImages;
	const isPlaying = shouldRenderReel && isHovered;

	// Memoized date values to prevent re-renders
	const dateLabel = useMemo(
		() =>
			post?.createdAt
				? new Date(post.createdAt).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})
				: "",
		[post?.createdAt],
	);

	const fullDateString = useMemo(
		() => (post?.createdAt ? new Date(post.createdAt).toLocaleString() : ""),
		[post?.createdAt],
	);

	const reelItems: ReelItem[] = useMemo(() => {
		if (!shouldRenderReel) return [];

		return medias.map((img, index) => ({
			id: `${post.id}-${index}`,
			type: "image",
			src: img.path,
			duration: 1,
			alt: img.alt || `Post by ${post.author.display_name}`,
		}));
	}, [medias, post.id, post.author.display_name, shouldRenderReel]);

	const handleMouseEnter = useCallback(() => {
		if (shouldRenderReel) {
			setIsHovered(true);
		}
	}, [shouldRenderReel]);

	const handleMouseLeave = useCallback(() => {
		if (!shouldRenderReel) return;

		setIsHovered(false);
		setCurrentImageIndex(0);
	}, [shouldRenderReel]);

	// Memoized callbacks to prevent unnecessary re-renders
	const handleLike = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		// Handle like
	}, []);

	const handleComment = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		// Handle comment
	}, []);

	const handleRepost = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		// Handle repost
	}, []);

	const handleBookmark = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
		// Handle bookmark
	}, []);

	const articleStyle = useMemo(
		() => ({
			...nodeStyle,
			minWidth: 160,
			minHeight: 160,
			// Portfolio items are intentionally static and must never inherit the
			// feed entrance gate's dimmed state.
			opacity: isPortfolio || animateGate ? 1 : 0,
		}),
		[nodeStyle, isPortfolio, animateGate],
	);

	// Memoized user data to prevent UserChipHoverCard re-renders
	const userData = useMemo(
		() => ({
			user_id: post.author.uuid,
			username: post.author.username,
			displayName: post.author.display_name,
			avatarUrl: post.author.media?.avatar,
			accentColor: post.author.accent_color,
			isPremium: post.author.is_premium || false,
		}),
		[post.author],
	);

	// Memoized CTAs props to prevent re-renders
	// TODO: use post types
	const ctaProps = useMemo(
		() => ({
			postId: p.id,
			likes: post.likeCount,
			comments: post.commentCount,
			reposts: post.repostCount,
			bookmarks: post.bookmarkCount,
			isLiked: post.isLiked || false,
			isCommented: post.isCommented || false,
			isReposted: post.isReposted || false,
			isBookmarked: false,
			showBookmarksCount: false,
			showLikeButton: !shouldBlur,
			showBookmarkButton: false,
			onLike: handleLike,
			onComment: handleComment,
			onRepost: handleRepost,
			onBookmark: handleBookmark,
			animateGate: isPortfolio ? false : animateGate,
		}),
		[
			p.id,
			post.likeCount,
			post.isLiked,
			handleLike,
			handleComment,
			handleRepost,
			handleBookmark,
			animateGate,
			isPortfolio,
			shouldBlur,
			post.bookmarkCount,
			post.commentCount,
			post.isCommented,
			post.isReposted,
			post.repostCount,
		],
	);

	// Use style props passed from parent Feed component via toPixels

	return (
		<article
			className={cn(
				"group absolute overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-ring/30 shadow-[0_1px_2px_rgba(0,0,0,0.05),_0_2px_4px_rgba(0,0,0,0.05)] transition-opacity duration-200 ease-out motion-reduce:transition-none dark:bg-neutral-900",
				"after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:border after:border-black/10 dark:after:border-white/10",
				!shouldBlur && "cursor-pointer",
			)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			style={articleStyle}
		>
			{/* Header with User, Date and Views */}
			{variant !== "portfolio" && (
				<Header
					user={userData}
					dateLabel={dateLabel}
					fullDateString={fullDateString}
					animateGate={animateGate}
				/>
			)}

			{/* Media content */}
			<div className="absolute inset-0">
				{shouldBlur ? (
					<div className="relative h-full w-full">
						{/* Blurred Background Image */}
						<div
							className="h-full w-full bg-cover bg-center opacity-50 blur-3xl transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:hover:scale-105 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-70"
							style={{
								backgroundImage: `url(${blurredImageSrc || post.images?.[0]?.path})`,
							}}
						/>

						{/* Sensitive Content Overlay */}
						<div className="absolute inset-0 z-10 flex flex-col justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
							<EyeOff className="text-white mb-4 mx-auto" size={32} />
							<h4 className="mb-1 font-semibold text-white text-xl">
								{t("components.profile.commissions.card.sensitive_content")}
							</h4>
							<p className="mb-4 text-sm text-white/70">
								{post.contentWarnings && post.contentWarnings.length > 0
									? t("components.profile.commissions.card.contains_tags", {
											tags: post.contentWarnings
												.map((w) => w.replace(/_/g, " ").toLowerCase())
												.join(", "),
										})
									: t("components.profile.commissions.card.content_warning")}
							</p>

							<Button
								size={"sm"}
								className="border-none w-fit mx-auto bg-white hover:bg-white/90 text-black"
								onClick={(e) => {
									e.stopPropagation();
									setIsContentRevealed(true);
								}}
							>
								{t("components.profile.commissions.card.show_content")}
							</Button>
						</div>
					</div>
				) : shouldRenderReel ? (
					<Reel
						className="relative h-full w-full"
						data={reelItems}
						index={currentImageIndex}
						onIndexChange={setCurrentImageIndex}
						playing={isPlaying}
						autoPlay={false}
						muted
						resetOnPause
					>
						<ReelProgress className="top-auto right-auto bottom-1 left-1/2 z-20 w-1/2 -translate-x-1/2 px-1" />

						<ReelContent>
							{(reelItem) => (
								<ReelImage
									alt={reelItem.alt || ""}
									duration={reelItem.duration}
									src={reelItem.src}
									className="h-full w-full object-cover"
								/>
							)}
						</ReelContent>

						<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/60 via-black/20 to-transparent" />
						<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

						{hasContentWarnings && isContentRevealed && (
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-2 top-2 z-20 bg-black/40 hover:bg-black/55"
											aria-label={t(
												"components.profile.commissions.card.hide_content",
											)}
											onClick={(e) => {
												e.stopPropagation();
												setIsContentRevealed(false);
											}}
										>
											<OutlineEyeOff aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="left">
										{t("components.profile.commissions.card.hide_content")}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</Reel>
				) : firstMedia ? (
					<>
						<img
							src={firstMedia.path}
							alt={firstMedia.alt || `Post by ${post.author.display_name}`}
							className="h-full w-full object-cover"
							loading="lazy"
							decoding="async"
							draggable={false}
						/>
						{!isPortfolio && (
							<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/60 via-black/20 to-transparent" />
						)}
						<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

						{hasContentWarnings && isContentRevealed && (
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="absolute right-2 top-2 z-20 bg-black/40 hover:bg-black/55"
											aria-label={t(
												"components.profile.commissions.card.hide_content",
											)}
											onClick={(e) => {
												e.stopPropagation();
												setIsContentRevealed(false);
											}}
										>
											<OutlineEyeOff aria-hidden="true" />
										</Button>
									</TooltipTrigger>
									<TooltipContent side="left">
										{t("components.profile.commissions.card.hide_content")}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</>
				) : null}
			</div>

			{!shouldBlur && (
				<button
					type="button"
					className="absolute inset-0 z-10 cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
					aria-label={`View post by ${post.author.display_name}`}
					onClick={() => handlePostClick(p.id)}
				/>
			)}

			{/* Actions row */}
			<div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-2 sm:p-3">
				{/* Post preview: bottom-anchored, max 3 lines */}
				{post.title && !shouldBlur && (
					<div className="w-full translate-y-0 opacity-100 transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none xl:translate-y-2 xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100 xl:group-focus-within:translate-y-0 xl:group-focus-within:opacity-100">
						<div className="flex min-h-15 flex-col justify-end">
							<p className="line-clamp-3 text-left text-xs font-semibold leading-5 text-white drop-shadow-md">
								{post.title}
							</p>
						</div>
					</div>
				)}

				{/* CTAs */}
				<div className="pointer-events-auto">
					<CTAs {...ctaProps} />
				</div>
			</div>
		</article>
	);
});

FeedItem.displayName = "FeedItem";
