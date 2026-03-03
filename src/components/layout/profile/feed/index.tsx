import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineFolderAddOuLc } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { useBento } from "@/hooks/use-bento";
import { bucketFromDimensions, type Tile, toPixels } from "@/lib/bento";
import { cn } from "@/lib/utils";
import type { PostWithAuthor } from "@/types/post";
import { FeedItem } from "../../feed/item";

interface ProfileFeedProps {
	posts: PostWithAuthor[];
	className?: string;
	onPostClick?: (post: PostWithAuthor) => void;
	variant?: "feed" | "portfolio";
}

export function ProfileFeed({
	posts,
	className,
	onPostClick,
	variant = "feed",
}: ProfileFeedProps) {
	const { t } = useTranslation();
	const containerRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [animateGate, setAnimateGate] = useState(false);

	// Convert posts to tiles
	const tiles = useMemo<Tile[]>(() => {
		return posts
			.filter((p) => p.images && p.images.length > 0)
			.map((post) => {
				const img = post.images[0];
				const bucket = bucketFromDimensions(img.width, img.height);
				return {
					id: post.id,
					widthUnit: bucket.widthUnit,
					heightUnit: bucket.heightUnit,
					cover: {
						path: img.path,
						width: img.width,
						height: img.height,
						alt: img.alt,
					},
				} satisfies Tile;
			});
	}, [posts]);

	const { cols, placed } = useBento(tiles);

	useEffect(() => {
		if (!containerRef.current) return;
		const observer = new ResizeObserver((entries) => {
			if (entries[0].contentRect.width > 0) {
				setWidth(entries[0].contentRect.width);
			}
		});
		observer.observe(containerRef.current);
		return () => observer.disconnect();
	}, [posts.length]);

	// Animation gate
	useEffect(() => {
		if (posts.length > 0) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => setAnimateGate(true));
			});
		}
	}, [posts.length]);

	const handlePostClick = (postId: string) => {
		const post = posts.find((p) => p.id === postId);
		if (post && onPostClick) {
			onPostClick(post);
		}
	};

	// Calculate cell size and gap
	const gap = 16;
	const cell = width ? (width - (cols - 1) * gap) / cols : 0;

	// Generate layout nodes
	const { nodes, containerHeight } = toPixels(placed as any, cell, gap);

	if (!posts.length) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center py-12">
				<EmptyPage
					icon={OutlineFolderAddOuLc}
					title={t("components.profile.portfolio.empty.title", "No posts yet.")}
					description={t(
						"components.profile.portfolio.empty.description",
						"This user hasn't posted anything to their portfolio yet.",
					)}
				/>
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={cn(
				"relative w-full transition-all duration-300 ease-in-out",
				// Hide until width is measured to prevent layout shift/small square
				width === 0 ? "opacity-0" : "opacity-100",
				className,
			)}
			style={{ height: containerHeight }}
		>
			{nodes.map((node) => {
				const post = posts.find((p) => p.id === node.tile.id);
				if (!post) return null;

				return (
					<FeedItem
						key={node.key}
						p={node.tile}
						post={post}
						animateGate={animateGate}
						handlePostClick={handlePostClick}
						style={node.style}
						variant={variant}
					/>
				);
			})}
		</div>
	);
}
