import { EyeOff } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useMediaQuery } from "@/hooks/use-media-query";
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
	animateGate: _animateGate,
	handlePostClick,
	style: nodeStyle,
	variant = "feed",
}: FeedItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const articleRef = useRef<HTMLElement>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const isLgOrLower = useMediaQuery("(max-width: 1279px)");
	const { t } = useTranslation();
	const [isContentRevealed, setIsContentRevealed] = useState(false);

	const hasContentWarnings =
		post.contentWarnings && post.contentWarnings.length > 0;
	const shouldBlur = hasContentWarnings && !isContentRevealed;
	const blurredImageSrc = useBlurredImage(
		post.images?.[0]?.path,
		shouldBlur,
		post.images?.[0]?.assetId,
	);

	const medias = post?.images || [];
	const hasMultipleImages = medias.length > 1;
	const isPlaying = isLgOrLower || (isHovered && hasMultipleImages);

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

	const reelItems: ReelItem[] = useMemo(
		() =>
			medias.map((img, index) => ({
				id: `${post.id}-${index}`,
				type: "image",
				src: img.path,
				duration: 1,
				alt: img.alt || `Post by ${post.author.display_name}`,
			})),
		[medias, post.id, post.author.display_name],
	);

	// Hover handlers
	const handleMouseEnter = useCallback(() => {
		if (isLgOrLower) return;
		setIsHovered(true);
	}, [isLgOrLower]);

	const handleMouseLeave = useCallback(() => {
		if (isLgOrLower) return;
		setIsHovered(false);
		setCurrentImageIndex(0);
	}, [isLgOrLower]);

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

	// Memoized motion configs to prevent re-renders (unused for now)
	// const motionConfig = useMemo(() => ({
	//   initial: "rest" as const,
	//   whileHover: "hover" as const,
	//   transition: { duration: 0.3, ease: "easeOut" as const },
	//   layout: false,
	//   layoutId: undefined,
	// }), []);

	// Motion configs removed - using CSS hover instead

	// Memoized article style to prevent re-renders
	const articleStyle = useMemo(
		() => ({
			...nodeStyle,
			minWidth: 160,
			minHeight: 160,
			willChange: "transform, opacity",
			transform: "translateZ(0)", // Force hardware acceleration
			backfaceVisibility: "hidden" as const, // Prevent flickering
			opacity: _animateGate ? 1 : 0.5,
		}),
		[nodeStyle, _animateGate],
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
			animateGate: _animateGate,
		}),
		[
			p.id,
			post.likeCount,
			post.isLiked,
			handleLike,
			handleComment,
			handleRepost,
			handleBookmark,
			_animateGate,
			shouldBlur,
		],
	);

	// Use style props passed from parent Feed component via toPixels

	return (
		<article
			ref={articleRef}
			key={p.id}
			className={cn(
				"group absolute overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-ring/30 transition-opacity duration-300 ease-out dark:bg-neutral-900",
				!shouldBlur && "cursor-pointer",
			)}
			onClick={() => {
				if (!shouldBlur) {
					handlePostClick(p.id);
				}
			}}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (!shouldBlur) {
						handlePostClick(p.id);
					}
				}
			}}
			aria-label={`View post by ${post.author.display_name}`}
			style={articleStyle}
		>
			{/* Header with User, Date and Views */}
			{variant !== "portfolio" && (
				<Header
					user={userData}
					dateLabel={dateLabel}
					fullDateString={fullDateString}
					animateGate={_animateGate}
				/>
			)}

			{/* Media content */}
			<div className="absolute inset-0">
				{shouldBlur ? (
					<div className="relative h-full w-full">
						{/* Blurred Background Image */}
						<div
							className="h-full w-full bg-cover bg-center opacity-50 blur-3xl filter transition-all duration-500 hover:scale-110 hover:opacity-70"
							style={{
								backgroundImage: `url(${blurredImageSrc || post.images?.[0]?.path})`,
							}}
						/>

						{/* Sensitive Content Overlay */}
						<div className="absolute inset-0 z-10 flex flex-col justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
							<EyeOff className="text-white mb-4 mx-auto" size={32} />
							<h4 className="mb-1 font-bold text-white text-xl">
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
				) : (
					<Reel
						className="h-full w-full relative"
						data={reelItems}
						index={currentImageIndex}
						onIndexChange={setCurrentImageIndex}
						playing={isPlaying}
						autoPlay={false}
						muted={true}
						resetOnPause={true}
					>
						{hasMultipleImages && (
							<ReelProgress className="top-auto right-auto bottom-1 left-1/2 z-20 w-1/2 -translate-x-1/2 px-1" />
						)}

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

						{/* Top gradient */}
						<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-black/60 via-black/30 to-transparent" />

						{/* Bottom gradient */}
						{/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-black/60 via-black/30 to-transparent" /> */}

						{/* Smooth Blur */}
						<div
							className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none z-10 backdrop-blur-md"
							style={{
								maskImage:
									"linear-gradient(to top, black 0%, black 45%, transparent 100%)",
								WebkitMaskImage:
									"linear-gradient(to top, black 0%, black 45%, transparent 100%)",
							}}
						/>

						{/* Hide Content Button (when revealed) */}
						{hasContentWarnings && isContentRevealed && (
							<TooltipProvider delayDuration={0}>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant={"ghost"}
											size={"icon"}
											className="absolute right-2 top-2 z-20 backdrop-blur-md"
											onClick={(e) => {
												e.stopPropagation();
												setIsContentRevealed(false);
											}}
										>
											<OutlineEyeOff />
										</Button>
									</TooltipTrigger>
									<TooltipContent side={"left"}>
										{t("components.profile.commissions.card.hide_content")}
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						)}
					</Reel>
				)}
			</div>

			{/* Actions row */}
			<div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-2 sm:p-3">
				{/* Post preview: bottom-anchored, max 3 lines */}
				{post?.title && !shouldBlur && (
					<div
						className="w-full transform-gpu transition-all duration-300 ease-out will-change-[opacity,transform,filter]"
						style={{
							opacity: isHovered || isLgOrLower ? 1 : 0,
							transform:
								isHovered || isLgOrLower ? "translateY(0)" : "translateY(8px)",
						}}
					>
						{/* 3 lines */}
						<div className="flex min-h-15 flex-col justify-end">
							<div
								className="transition-all duration-300 ease-out will-change-[filter]"
								style={{
									filter: isHovered || isLgOrLower ? "blur(0px)" : "blur(8px)",
								}}
							>
								<p className="line-clamp-3 text-left text-white text-xs leading-5 [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box] font-semibold drop-shadow-md">
									{post.title}
								</p>
							</div>
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
