import NumberFlow from "@number-flow/react";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
	OutlineBookmark,
	OutlineChat,
	OutlineEye,
	OutlineHeart,
	OutlineRepeat02,
	SolidBookmark,
	SolidChat,
	SolidHeart,
	SolidRepeat02,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Memoized ViewIndicator component
export const ViewIndicator = memo(function ViewIndicator({
	views,
	shouldAnimate = true,
}: {
	views: number;
	shouldAnimate?: boolean;
}) {
	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				className="cursor-default text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] hover:bg-transparent dark:text-white"
				style={{ transition: "none" }}
			>
				<OutlineEye />
			</Button>
			<div
				className={cn(
					"text-sm text-white transition-opacity dark:text-white",
					views === 0
						? "opacity-0"
						: shouldAnimate
							? "opacity-100"
							: "opacity-100", // Force visible if animation not required or static context
				)}
			>
				<NumberFlow value={views} />
			</div>
		</div>
	);
});

// Helper hook for optimistic updates
function useLocalAction({
	initialActive,
	initialCount,
	onSuccess,
}: {
	initialActive: boolean;
	initialCount: number;
	onSuccess?: () => void;
}) {
	const [active, setActive] = useState(initialActive);
	const [count, setCount] = useState(initialCount);

	useEffect(() => {
		setActive(initialActive);
		setCount(initialCount);
	}, [initialActive, initialCount]);

	const handleAction = useCallback(() => {
		const newActive = !active;
		setActive(newActive);
		setCount((prev) => (newActive ? prev + 1 : prev - 1));
		onSuccess?.();
	}, [active, onSuccess]);

	return { active, count, handleAction };
}

// Memoized LikeButton component
export const LikeButton = memo(function LikeButton({
	likes,
	isLiked,
	onLike,
	showLikesCount = true,
	shouldAnimate,
}: {
	postId: string;
	likes: number;
	isLiked: boolean;
	onLike: (e: MouseEvent) => void;
	showLikesCount?: boolean;
	shouldAnimate: boolean;
}) {
	const {
		active: liked,
		count: likesCount,
		handleAction,
	} = useLocalAction({
		initialActive: isLiked,
		initialCount: likes,
		onSuccess: () => {
			// We can pass a fake event if needed, but onLike in parent usually just logs or calls API
		},
	});

	const handleLikeClick = useCallback(
		(e: MouseEvent) => {
			e.stopPropagation();
			handleAction();
			onLike(e);
		},
		[handleAction, onLike],
	);

	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				className={cn(
					"hover:bg-white/12 hover:text-white dark:text-white",
					liked
						? "text-[#f4393e] drop-shadow-[0_1px_10px_#f4393e] hover:bg-[#f4393e]/12"
						: "text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]",
				)}
				onClick={handleLikeClick}
				style={{ transition: "none" }}
			>
				{liked ? <SolidHeart className="text-[#f4393e]" /> : <OutlineHeart />}
			</Button>
			{showLikesCount && (
				<div
					className={cn(
						"text-sm transition-opacity",
						liked
							? "text-[#f4393e] drop-shadow-[0_1px_1px_rgba(0,0,0,0.75)]"
							: "text-white",
						likesCount === 0
							? "opacity-0"
							: shouldAnimate
								? "opacity-100"
								: "opacity-0",
					)}
				>
					<NumberFlow value={likesCount} />
				</div>
			)}
		</div>
	);
});

// Memoized CommentButton component
export const CommentButton = memo(function CommentButton({
	comments,
	isCommented,
	onComment,
	showCommentsCount = true,
	shouldAnimate,
}: {
	comments: number;
	isCommented: boolean;
	onComment: (e: MouseEvent) => void;
	showCommentsCount?: boolean;
	shouldAnimate: boolean;
}) {
	// Comments usually don't toggle like likes, but we might want optimistic update if we added a comment immediately
	// For now, let's just assume it's a button that opens a modal or navigates

	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				className="text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] hover:bg-white/12 hover:text-white dark:text-white"
				onClick={(e) => {
					e.stopPropagation();
					onComment(e);
				}}
				style={{ transition: "none" }}
			>
				{isCommented ? <SolidChat /> : <OutlineChat />}
			</Button>
			{showCommentsCount && (
				<div
					className={cn(
						"text-sm text-white transition-opacity",
						comments === 0
							? "opacity-0"
							: shouldAnimate
								? "opacity-100"
								: "opacity-0",
					)}
				>
					<NumberFlow value={comments} />
				</div>
			)}
		</div>
	);
});

// Memoized RepostButton component
export const RepostButton = memo(function RepostButton({
	reposts,
	isReposted,
	onRepost,
	showRepostsCount = true,
	shouldAnimate,
}: {
	reposts: number;
	isReposted: boolean;
	onRepost: (e: MouseEvent) => void;
	showRepostsCount?: boolean;
	shouldAnimate: boolean;
}) {
	const {
		active: reposted,
		count: repostsCount,
		handleAction,
	} = useLocalAction({
		initialActive: isReposted,
		initialCount: reposts,
	});

	const handleRepostClick = useCallback(
		(e: MouseEvent) => {
			e.stopPropagation();
			handleAction();
			onRepost(e);
		},
		[handleAction, onRepost],
	);

	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				className={cn(
					"hover:bg-white/12 hover:text-white dark:text-white",
					reposted
						? "text-green-500 drop-shadow-[0_1px_10px_rgba(34,197,94,0.75)] hover:bg-green-500/12"
						: "text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]",
				)}
				onClick={handleRepostClick}
				style={{ transition: "none" }}
			>
				{reposted ? (
					<SolidRepeat02 className="text-green-500" />
				) : (
					<OutlineRepeat02 />
				)}
			</Button>
			{showRepostsCount && (
				<div
					className={cn(
						"text-sm transition-opacity",
						reposted
							? "text-green-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.75)]"
							: "text-white",
						repostsCount === 0
							? "opacity-0"
							: shouldAnimate
								? "opacity-100"
								: "opacity-0",
					)}
				>
					<NumberFlow value={repostsCount} />
				</div>
			)}
		</div>
	);
});

// Memoized BookmarkButton component
export const BookmarkButton = memo(function BookmarkButton({
	isBookmarked,
	onBookmark,
}: {
	isBookmarked: boolean;
	onBookmark: (e: MouseEvent) => void;
}) {
	const { active: bookmarked, handleAction } = useLocalAction({
		initialActive: isBookmarked,
		initialCount: 0,
	});

	const handleBookmarkClick = useCallback(
		(e: MouseEvent) => {
			e.stopPropagation();
			handleAction();
			onBookmark(e);
		},
		[handleAction, onBookmark],
	);

	return (
		<Button
			variant="ghost"
			size={"icon"}
			className={cn(
				"hover:bg-white/12 hover:text-white dark:text-white",
				bookmarked
					? "text-yellow-500 drop-shadow-[0_1px_10px_rgba(234,179,8,0.75)] hover:bg-yellow-500/12"
					: "text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]",
			)}
			onClick={handleBookmarkClick}
			style={{ transition: "none" }}
		>
			{bookmarked ? (
				<SolidBookmark className="text-yellow-500" />
			) : (
				<OutlineBookmark />
			)}
		</Button>
	);
});

interface CTAsProps {
	postId: string; // required so the component can call the API
	likes: number;
	isLiked: boolean;
	comments?: number;
	isCommented?: boolean;
	reposts?: number;
	isReposted: boolean;
	isBookmarked: boolean;
	onLike: (e: MouseEvent) => void;
	onComment: (e: MouseEvent) => void;
	onRepost: (e: MouseEvent) => void;
	onBookmark: (e: MouseEvent) => void;
	showLikesCount?: boolean;
	showCommentsCount?: boolean;
	showRepostsCount?: boolean;
	showBookmarksCount?: boolean;
	animateGate?: boolean; // bramka z Feed
}

export const CTAs = memo(function CTAs({
	postId,
	likes,
	isLiked,
	comments = 0,
	isCommented = false,
	reposts = 0,
	isReposted,
	isBookmarked,
	onLike,
	onComment,
	onRepost,
	onBookmark,
	showLikesCount = true,
	showCommentsCount = true,
	showRepostsCount = true,
	animateGate = false,
}: CTAsProps) {
	// Enable animations only when component is visible in viewport
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const hasAnimatedRef = useRef(false);

	useEffect(() => {
		if (!animateGate || hasAnimatedRef.current) return;
		const el = containerRef.current;
		if (!el) return;

		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					hasAnimatedRef.current = true;
					setShouldAnimate(true);
					obs.disconnect();
				}
			},
			{
				threshold: 0.6,
				rootMargin: "0px",
			},
		);
		obs.observe(el);
		return () => obs.disconnect();
	}, [animateGate]);

	return (
		<div
			ref={containerRef}
			className="relative z-20 flex w-full items-center justify-between px-2"
		>
			<div className="flex items-center gap-1 sm:gap-4">
				<LikeButton
					postId={postId}
					likes={likes}
					isLiked={isLiked}
					onLike={onLike}
					showLikesCount={showLikesCount}
					shouldAnimate={shouldAnimate}
				/>
				<CommentButton
					comments={comments}
					isCommented={isCommented}
					onComment={onComment}
					showCommentsCount={showCommentsCount}
					shouldAnimate={shouldAnimate}
				/>
				<RepostButton
					reposts={reposts}
					isReposted={isReposted}
					onRepost={onRepost}
					showRepostsCount={showRepostsCount}
					shouldAnimate={shouldAnimate}
				/>
			</div>
			<div>
				<BookmarkButton isBookmarked={isBookmarked} onBookmark={onBookmark} />
			</div>
		</div>
	);
});
