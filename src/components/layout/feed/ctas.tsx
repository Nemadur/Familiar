import NumberFlow from "@number-flow/react";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
	OutlineBookmark,
	OutlineEye,
	OutlineHeart,
	SolidBookmark,
	SolidHeart,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Memoized ViewIndicator component
export const ViewIndicator = memo(function ViewIndicator({
	views,
	shouldAnimate = true,
	variant = "overlay",
}: {
	views: number;
	shouldAnimate?: boolean;
	variant?: "overlay" | "default";
}) {
	const isOverlay = variant === "overlay";
	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				disabled
				className={cn(
					"cursor-default drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] hover:bg-transparent disabled:opacity-50",
					isOverlay ? "text-white dark:text-white" : "text-primary",
				)}
				style={{ transition: "none" }}
			>
				<OutlineEye />
			</Button>
			<div
				className={cn(
					"text-sm transition-opacity",
					isOverlay ? "text-white dark:text-white" : "text-primary",
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
export function useLocalAction({
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
	const [prevInitialActive, setPrevInitialActive] = useState(initialActive);
	const [prevInitialCount, setPrevInitialCount] = useState(initialCount);

	if (
		initialActive !== prevInitialActive ||
		initialCount !== prevInitialCount
	) {
		setPrevInitialActive(initialActive);
		setPrevInitialCount(initialCount);
		setActive(initialActive);
		setCount(initialCount);
	}

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
	variant = "overlay",
}: {
	postId: string;
	likes: number;
	isLiked: boolean;
	onLike: (e: MouseEvent) => void;
	showLikesCount?: boolean;
	shouldAnimate: boolean;
	variant?: "overlay" | "default";
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

	const isOverlay = variant === "overlay";

	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				className={cn(
					liked
						? "text-danger drop-shadow-[0_1px_10px_danger] hover:bg-danger/12!"
						: isOverlay &&
								"text-white hover:bg-white/12 drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] supports-backdrop:backdrop-blur-md hover:text-primary",
				)}
				onClick={handleLikeClick}
				style={{ transition: "none" }}
			>
				{liked ? <SolidHeart className="text-danger" /> : <OutlineHeart />}
			</Button>
			{Boolean(showLikesCount) && (
				<div
					className={cn(
						"text-sm transition-opacity",
						liked
							? "text-danger drop-shadow-[0_1px_1px_rgba(0,0,0,0.75)]"
							: isOverlay
								? "text-white"
								: "text-muted-foreground",
						likesCount === 0 || !likesCount
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

// Memoized BookmarkButton component
export const BookmarkButton = memo(function BookmarkButton({
	isBookmarked,
	onBookmark,
	variant = "overlay",
}: {
	isBookmarked: boolean;
	onBookmark: (e: MouseEvent) => void;
	variant?: "overlay" | "default";
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

	const isOverlay = variant === "overlay";

	return (
		<Button
			variant="ghost"
			size="icon-xl"
			className={cn(
				isOverlay
					? "hover:bg-white/12 hover:text-white dark:text-white"
					: "hover:bg-primary/10 hover:text-primary",
				bookmarked
					? "text-white hover:bg-white/10"
					: isOverlay
						? "text-accent drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)]"
						: "text-muted-foreground",
			)}
			onClick={handleBookmarkClick}
			style={{ transition: "none" }}
		>
			{bookmarked ? <SolidBookmark /> : <OutlineBookmark />}
		</Button>
	);
});

interface CTAsProps {
	postId: string; // required so the component can call the API
	likes: number;
	isLiked: boolean;
	isBookmarked: boolean;
	onLike: (e: MouseEvent) => void;
	onBookmark: (e: MouseEvent) => void;
	showLikesCount?: boolean;
	showBookmarksCount?: boolean;
	views?: number;
	animateGate?: boolean;
	showBookmarkButton?: boolean;
	showLikeButton?: boolean;
	rightElement?: React.ReactNode;
	variant?: "overlay" | "default";
}

export const CTAs = memo(function CTAs({
	postId,
	likes,
	isLiked,
	isBookmarked,
	onLike,
	onBookmark,
	showLikesCount = true,
	views,
	animateGate = false,
	showBookmarkButton = true,
	showLikeButton = true,
	rightElement,
	variant = "overlay",
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
			className="relative z-20 flex w-full items-center justify-between"
		>
			<div className="flex items-center gap-1 sm:gap-4">
				{showLikeButton && (
					<LikeButton
						postId={postId}
						likes={likes}
						isLiked={isLiked}
						onLike={onLike}
						showLikesCount={showLikesCount}
						shouldAnimate={shouldAnimate}
						variant={variant}
					/>
				)}
				{views !== undefined && (
					<ViewIndicator
						views={views}
						shouldAnimate={shouldAnimate}
						variant={variant}
					/>
				)}
			</div>
			<div>
				{showBookmarkButton ? (
					<BookmarkButton
						isBookmarked={isBookmarked}
						onBookmark={onBookmark}
						variant={variant}
					/>
				) : (
					rightElement
				)}
			</div>
		</div>
	);
});
