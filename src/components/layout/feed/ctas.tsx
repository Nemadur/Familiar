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
}: {
	views: number;
	shouldAnimate?: boolean;
}) {
	return (
		<div className="flex items-center">
			<Button
				variant="ghost"
				size={"icon"}
				disabled
				className="cursor-default text-white drop-shadow-[0_1px_10px_rgba(0,0,0,0.75)] hover:bg-transparent disabled:opacity-50 dark:text-white"
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
	isBookmarked: boolean;
	onLike: (e: MouseEvent) => void;
	onBookmark: (e: MouseEvent) => void;
	showLikesCount?: boolean;
	showBookmarksCount?: boolean;
	views?: number;
	animateGate?: boolean;
	showBookmarkButton?: boolean;
	rightElement?: React.ReactNode;
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
	rightElement,
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
				<LikeButton
					postId={postId}
					likes={likes}
					isLiked={isLiked}
					onLike={onLike}
					showLikesCount={showLikesCount}
					shouldAnimate={shouldAnimate}
				/>
				{views !== undefined && (
					<ViewIndicator views={views} shouldAnimate={shouldAnimate} />
				)}
			</div>
			<div>
				{showBookmarkButton ? (
					<BookmarkButton isBookmarked={isBookmarked} onBookmark={onBookmark} />
				) : (
					rightElement
				)}
			</div>
		</div>
	);
});
