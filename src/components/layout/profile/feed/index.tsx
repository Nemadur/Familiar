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

function createTiles(posts: PostWithAuthor[]) {
	const tiles: Tile[] = [];

	for (const post of posts) {
		const img = post.images?.[0];

		if (!img) {
			continue;
		}

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
	const [width, setWidth] = useState(0);
	const [animateGate, setAnimateGate] = useState(false);

	const tiles = useMemo(() => createTiles(posts), [posts]);
	const postById = useMemo(() => createPostById(posts), [posts]);

	const { cols, placed } = useBento(tiles);

	useEffect(() => {
		if (!containerRef.current) return;

		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];

			if (entry?.contentRect.width && entry.contentRect.width > 0) {
				setWidth(entry.contentRect.width);
			}
		});

		observer.observe(containerRef.current);

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (posts.length === 0) {
			setAnimateGate(false);
			return;
		}

		const firstFrame = requestAnimationFrame(() => {
			requestAnimationFrame(() => setAnimateGate(true));
		});

		return () => cancelAnimationFrame(firstFrame);
	}, [posts.length]);

	const handlePostClick = (postId: string) => {
		const post = postById.get(postId);

		if (post) {
			onPostClick?.(post);
		}
	};

	const gap = 16;
	const cell = width ? (width - (cols - 1) * gap) / cols : 0;

	const { nodes, containerHeight } = toPixels(placed as any, cell, gap);

	if (!posts.length) {
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
				"relative w-full transition-all duration-300 ease-in-out",
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
