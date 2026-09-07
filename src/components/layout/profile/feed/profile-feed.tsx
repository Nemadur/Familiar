import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";

import type {
	PortfolioPostImageResponse,
	PortfolioPostResponse,
} from "@/api/portfolio/posts/post-types";
import { OutlineFolderAddOuLc } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { usePortfolioImageBuckets } from "@/hooks/portfolio/use-portfolio-image-buckets";
import { useBento } from "@/hooks/ui/use-bento";
import { useIsMobile, useIsTablet } from "@/hooks/ui/use-mobile";
import { packAppend, type Tile, toPixels } from "@/lib/bento";
import { cn } from "@/lib/utils";

import { PortfolioFeedItem } from "../../feed/item";

interface ProfileFeedProps {
	posts: PortfolioPostResponse[];
	className?: string;
	onPostClick?: (post: PortfolioPostResponse) => void;
	variant?: "feed" | "portfolio";
	isOwner?: boolean;
	onRemoveFromCatalog?: (postId: string) => void;
}

type PortfolioPostWithId = PortfolioPostResponse & {
	id: string;
};

const GAP = 1;
const MOBILE_COLUMN_COUNT = 2;
const TABLET_COLUMN_COUNT = 3;

function hasPostId(
	post: PortfolioPostResponse,
): post is PortfolioPostWithId {
	return typeof post.id === "string" && post.id.length > 0;
}

function getImagePath(
	image?: PortfolioPostImageResponse,
): string | undefined {
	return image?.fullSize?.path ?? image?.thumbnail?.path;
}

function getRenderableImages(post: PortfolioPostResponse) {
	return [...(post.images ?? [])]
		.sort(
			(a, b) =>
				(a.position ?? Number.MAX_SAFE_INTEGER) -
				(b.position ?? Number.MAX_SAFE_INTEGER),
		)
		.filter((image) => Boolean(getImagePath(image)));
}

function getFirstRenderableImage(
	post: PortfolioPostResponse,
): PortfolioPostImageResponse | undefined {
	return getRenderableImages(post)[0];
}

function createPostById(posts: PortfolioPostResponse[]) {
	const postById = new Map<string, PortfolioPostResponse>();

	for (const post of posts) {
		if (hasPostId(post)) {
			postById.set(post.id, post);
		}
	}

	return postById;
}

export function ProfileFeed({
	posts,
	className,
	onPostClick,
	variant = "feed",
	isOwner = false,
	onRemoveFromCatalog,
}: ProfileFeedProps) {
	const { t } = useTranslation();
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();
	const containerRef = useRef<HTMLDivElement>(null);
	const resizeFrameRef = useRef<number | null>(null);
	const [width, setWidth] = useState(0);
	const [animateGate, setAnimateGate] = useState(false);

	const postById = useMemo(() => createPostById(posts), [posts]);
	const { buckets, isMeasuring } = usePortfolioImageBuckets(posts);

	const tiles = useMemo<Tile[]>(() => {
		if (isMeasuring) {
			return [];
		}

		const nextTiles: Tile[] = [];

		for (const post of posts) {
			if (!hasPostId(post)) {
				continue;
			}

			const image = getFirstRenderableImage(post);
			const path = getImagePath(image);
			const bucket = buckets.get(post.id);

			if (!bucket) {
				continue;
			}

			nextTiles.push({
				id: post.id,
				createdAt: post.createdAt,
				widthUnit: bucket.widthUnit,
				heightUnit: bucket.heightUnit,
				cover: {
					path: path ?? "",
					width: bucket.imageWidth,
					height: bucket.imageHeight,
					alt: post.title ?? "",
				},
			});
		}

		return nextTiles;
	}, [posts, buckets, isMeasuring]);

	const mobileTiles = useMemo<Tile[]>(
		() =>
			tiles.map((tile) =>
				tile.heightUnit > tile.widthUnit
					? {
						...tile,
						widthUnit: 2,
						heightUnit: 3,
					}
					: tile,
			),
		[tiles],
	);

	const mobilePlaced = useMemo(
		() =>
			packAppend(
				[],
				mobileTiles,
				MOBILE_COLUMN_COUNT,
				"balanced",
			),
		[mobileTiles],
	);

	const tabletTiles = useMemo<Tile[]>(
		() =>
			tiles.map((tile) =>
				tile.heightUnit > tile.widthUnit
					? {
						...tile,
						widthUnit: 1,
						heightUnit: 2,
					}
					: tile,
			),
		[tiles],
	);

	const tabletPlaced = useMemo(
		() => packAppend([], tabletTiles, TABLET_COLUMN_COUNT, "fit"),
		[tabletTiles],
	);

	const useTabletCompactLayout = isTablet && !isMobile;
	const compactColumnCount = useTabletCompactLayout
		? TABLET_COLUMN_COUNT
		: MOBILE_COLUMN_COUNT;
	const compactPlaced = useTabletCompactLayout
		? tabletPlaced
		: mobilePlaced;

	const { cols, placed } = useBento(tiles, "balanced");

	useEffect(() => {
		const container = containerRef.current;

		if (!container) {
			return;
		}

		const commitWidth = (nextWidth: number) => {
			if (nextWidth <= 0) {
				return;
			}

			setWidth((currentWidth) =>
				currentWidth === nextWidth ? currentWidth : nextWidth,
			);
		};

		commitWidth(Math.round(container.getBoundingClientRect().width));

		const observer = new ResizeObserver(([entry]) => {
			const nextWidth = Math.round(entry?.contentRect.width ?? 0);

			if (nextWidth <= 0) {
				return;
			}

			if (resizeFrameRef.current !== null) {
				cancelAnimationFrame(resizeFrameRef.current);
			}

			resizeFrameRef.current = requestAnimationFrame(() => {
				commitWidth(nextWidth);
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
		if (variant === "portfolio" || tiles.length === 0) {
			return;
		}

		setAnimateGate(false);

		let secondFrame = 0;
		const firstFrame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(() => setAnimateGate(true));
		});

		return () => {
			cancelAnimationFrame(firstFrame);

			if (secondFrame) {
				cancelAnimationFrame(secondFrame);
			}
		};
	}, [tiles.length, variant]);

	const handlePostClick = useCallback(
		(postId: string) => {
			const post = postById.get(postId);

			if (post) {
				onPostClick?.(post);
			}
		},
		[onPostClick, postById],
	);

	const { nodes, containerHeight } = useMemo(() => {
		if (width <= 0 || cols <= 0) {
			return { nodes: [], containerHeight: 0 };
		}

		const cell = Math.max(0, (width - (cols - 1) * GAP) / cols);
		return toPixels(placed, cell, GAP);
	}, [cols, placed, width]);

	const { compactNodes, compactContainerHeight } = useMemo(() => {
		if (width <= 0) {
			return { compactNodes: [], compactContainerHeight: 0 };
		}

		const cell = Math.max(
			0,
			(width - (compactColumnCount - 1) * GAP) /
			compactColumnCount,
		);
		const layout = toPixels(compactPlaced, cell, GAP);

		return {
			compactNodes: layout.nodes,
			compactContainerHeight: layout.containerHeight,
		};
	}, [compactColumnCount, compactPlaced, width]);

	const { tabletNodes, tabletContainerHeight } = useMemo(() => {
		if (width <= 0) {
			return { tabletNodes: [], tabletContainerHeight: 0 };
		}

		const cell = Math.max(
			0,
			(width - (TABLET_COLUMN_COUNT - 1) * GAP) /
			TABLET_COLUMN_COUNT,
		);
		const layout = toPixels(tabletPlaced, cell, GAP);

		return {
			tabletNodes: layout.nodes,
			tabletContainerHeight: layout.containerHeight,
		};
	}, [tabletPlaced, width]);

	const emptyState = (
		<div className="flex h-full flex-1 flex-col items-center justify-center py-12">
			<EmptyPage
				icon={OutlineFolderAddOuLc}
				title={t(
					"components.profile.portfolio.empty.title",
					"No posts yet.",
				)}
				description={t(
					"components.profile.portfolio.empty.description",
					"This user hasn't posted anything to their portfolio yet.",
				)}
			/>
		</div>
	);

	if (postById.size === 0 && !isMeasuring) {
		return (
			<div className={cn("w-auto min-w-0 max-w-full", className)}>
				{emptyState}
			</div>
		);
	}

	return (
		<div
			ref={containerRef}
			className={cn("w-auto min-w-0 max-w-full", className)}
		>
			{variant === "portfolio" ? (
				<div className="lg:hidden">
					{isMeasuring ? (
						<div className="min-h-80 w-full animate-pulse bg-muted/20" />
					) : (
						<div
							className={cn(
								"relative w-full transition-opacity duration-150 ease-out motion-reduce:transition-none",
								width === 0 ? "opacity-0" : "opacity-100",
							)}
							style={{ height: compactContainerHeight }}
						>
							{compactNodes.map((node) => {
								const post = postById.get(node.tile.id);

								if (!post) {
									return null;
								}

								return (
									<PortfolioFeedItem
										key={node.tile.id}
										p={node.tile}
										post={post}
										handlePostClick={handlePostClick}
										style={node.style}
										isOwner={isOwner}
										onRemoveFromCatalog={onRemoveFromCatalog}
									/>
								);
							})}
						</div>
					)}
				</div>
			) : null}

			{variant === "portfolio" ? (
				<div className="hidden lg:block xl:hidden">
					{isMeasuring ? (
						<div className="min-h-80 w-full animate-pulse bg-muted/20" />
					) : (
						<div
							className={cn(
								"relative w-full transition-opacity duration-150 ease-out motion-reduce:transition-none",
								width === 0 ? "opacity-0" : "opacity-100",
							)}
							style={{ height: tabletContainerHeight }}
						>
							{tabletNodes.map((node) => {
								const post = postById.get(node.tile.id);

								if (!post) {
									return null;
								}

								return (
									<PortfolioFeedItem
										key={node.tile.id}
										p={node.tile}
										post={post}
										handlePostClick={handlePostClick}
										style={node.style}
										isOwner={isOwner}
										onRemoveFromCatalog={onRemoveFromCatalog}
									/>
								);
							})}
						</div>
					)}
				</div>
			) : null}

			<div className={cn(variant === "portfolio" && "hidden xl:block")}>
				{isMeasuring ? (
					<div className="min-h-80 w-full animate-pulse bg-muted/20" />
				) : tiles.length === 0 ? (
					emptyState
				) : (
					<div
						className={cn(
							"relative w-full transition-opacity duration-150 ease-out motion-reduce:transition-none",
							width === 0 ? "opacity-0" : "opacity-100",
						)}
						style={{ height: containerHeight }}
						data-animate-gate={animateGate}
					>
						{nodes.map((node) => {
							const post = postById.get(node.tile.id);

							if (!post) {
								return null;
							}

							return (
								<PortfolioFeedItem
									key={node.tile.id}
									p={node.tile}
									post={post}
									handlePostClick={handlePostClick}
									style={node.style}
									isOwner={isOwner}
									onRemoveFromCatalog={onRemoveFromCatalog}
								/>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}