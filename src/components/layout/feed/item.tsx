import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Reel,
	ReelContent,
	ReelImage,
	type ReelItem,
	ReelProgress,
} from "@/components/kibo-ui/reel";
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
}

export const FeedItem = memo(function FeedItem({
	p,
	post,
	animateGate: _animateGate,
	handlePostClick,
	style: nodeStyle,
}: FeedItemProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const articleRef = useRef<HTMLElement>(null);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

	const medias = post?.images || [];
	const hasMultipleImages = medias.length > 1;

	const reelItems: ReelItem[] = useMemo(
		() =>
			medias.map((img, index) => ({
				id: `${post.id}-${index}`,
				type: "image",
				src: img.path,
				duration: 1,
				alt: img.alt || `Post by ${post.author.displayName}`,
			})),
		[medias, post.id, post.author.displayName],
	);

	// Hover handlers
	const handleMouseEnter = useCallback(() => {
		setIsHovered(true);
		if (hasMultipleImages) setIsPlaying(true);
	}, [hasMultipleImages]);

	const handleMouseLeave = useCallback(() => {
		setIsHovered(false);
		setIsPlaying(false);
		setCurrentImageIndex(0);
	}, []);

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
			isBookmarked: post.isBookmarked || false,
			showBookmarksCount: false,
			onLike: handleLike,
			onComment: handleComment,
			onRepost: handleRepost,
			onBookmark: handleBookmark,
			animateGate: _animateGate,
		}),
		[
			p.id,
			post,
			handleLike,
			handleComment,
			handleRepost,
			handleBookmark,
			_animateGate,
		],
	);

	// Use style props passed from parent Feed component via toPixels

	return (
		<article
			ref={articleRef}
			key={p.id}
			className="group absolute cursor-pointer overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-ring/30 transition-opacity duration-300 ease-out dark:bg-neutral-900"
			onClick={() => handlePostClick(p.id)}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handlePostClick(p.id);
				}
			}}
			aria-label={`View post by ${post.author.displayName}`}
			style={articleStyle}
		>
			{/* Header with User, Date and Views */}
			<Header
				user={userData}
				dateLabel={dateLabel}
				fullDateString={fullDateString}
				animateGate={_animateGate}
			/>

			{/* Media content */}
			<div className="absolute inset-0">
				<Reel
					className="h-full w-full"
					data={reelItems}
					index={currentImageIndex}
					onIndexChange={setCurrentImageIndex}
					playing={isPlaying}
					onPlayingChange={setIsPlaying}
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
					<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
				</Reel>
			</div>

			{/* Actions row */}
			<div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-2 sm:p-3">
				{/* Post preview: bottom-anchored, max 3 lines */}
				{post?.text && (
					<div
						className="w-full transform-gpu transition-all duration-300 ease-out will-change-[opacity,transform,filter]"
						style={{
							opacity: isHovered ? 1 : 0,
							transform: isHovered ? "translateY(0)" : "translateY(8px)",
						}}
					>
						{/* 3 lines */}
						<div className="flex min-h-15 flex-col justify-end">
							<div
								className="transition-all duration-300 ease-out will-change-[filter]"
								style={{
									filter: isHovered ? "blur(0px)" : "blur(8px)",
								}}
							>
								<p className="line-clamp-3 text-left text-white text-xs leading-5 [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]">
									{post.text}
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
