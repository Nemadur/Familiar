import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineFolderAddOuLc } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { useBento } from "@/hooks/use-bento";
import { useMediaQuery } from "@/hooks/use-media-query";
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

const GAP = 16;

function createTiles(posts: PostWithAuthor[]) {
	const tiles: Tile[] = [];

	for (const post of posts) {
		const img = post.images?.[0];

		if (!img) continue;

		const bucket = bucketFromDimensions(img.width, img.height);

		tiles.push({
			id: post.id,
			widthUnit: bucket.widthUnit,
			heightUnit: bucket.heightUnit,
			cover: {
				path: img.path,
				width: img.width,
				height: img.height,
				alt: img.alt || "",
			},
		});
	}

	return tiles;
}

function createPostById(posts: PostWithAuthor[]) {
	const postById = new Map<string, PostWithAuthor>();

	for (const post of posts) {
		postById.set(post.id, post);
	}

	return postById;
}

export function ProfileFeed({
	posts,
	className,
	onPostClick,
	variant = "feed",
}: ProfileFeedProps) {
	const { t } = useTranslation();
	const containerRef = useRef<HTMLDivElement>(null);
	const resizeFrameRef = useRef<number | null>(null);
	const [width, setWidth] = useState(0);
	const [animateGate, setAnimateGate] = useState(false);
	const isCompact = useMediaQuery("(max-width: 1279px)");

	const tiles = useMemo(() => createTiles(posts), [posts]);
	const postById = useMemo(() => createPostById(posts), [posts]);
	const { cols, placed } = useBento(tiles);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const observer = new ResizeObserver(([entry]) => {
			const nextWidth = Math.round(entry?.contentRect.width ?? 0);
			if (nextWidth <= 0) return;

			if (resizeFrameRef.current !== null) {
				cancelAnimationFrame(resizeFrameRef.current);
			}

			resizeFrameRef.current = requestAnimationFrame(() => {
				setWidth((currentWidth) =>
					currentWidth === nextWidth ? currentWidth : nextWidth,
				);
			});
		});

		observer.observe(container);

		return () => {
			observer.disconnect();
			if (resizeFrameRef.current !== null) {
				cancelAnimationFrame(resizeFrameRef.current);
			}
		};
	}, []);

	useEffect(() => {
		// Portfolio grids are frequently filtered and navigated. Keep them static.
		if (variant === "portfolio" || tiles.length === 0) return;

		setAnimateGate(false);
		let secondFrame = 0;

		const firstFrame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(() => setAnimateGate(true));
		});

		return () => {
			cancelAnimationFrame(firstFrame);
			if (secondFrame) cancelAnimationFrame(secondFrame);
		};
	}, [tiles.length, variant]);

	const handlePostClick = useCallback(
		(postId: string) => {
			const post = postById.get(postId);
			if (post) onPostClick?.(post);
		},
		[onPostClick, postById],
	);

	const { nodes, containerHeight } = useMemo(() => {
		if (width <= 0 || cols <= 0) {
			return { nodes: [], containerHeight: 0 };
		}

		const cell = Math.max(0, (width - (cols - 1) * GAP) / cols);
		return toPixels(placed as any, cell, GAP);
	}, [cols, placed, width]);

	if (tiles.length === 0) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center py-12">
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
				"relative w-full transition-opacity duration-150 ease-out motion-reduce:transition-none",
				width === 0 ? "opacity-0" : "opacity-100",
				className,
			)}
			style={{ height: containerHeight }}
		>
			{nodes.map((node) => {
				const post = postById.get(node.tile.id);
				if (!post) return null;

				return (
					<FeedItem
						key={node.tile.id}
						p={node.tile}
						post={post}
						animateGate={variant === "portfolio" ? false : animateGate}
						handlePostClick={handlePostClick}
						style={node.style}
						variant={variant}
						isCompact={isCompact}
					/>
				);
			})}
		</div>
	);
}
