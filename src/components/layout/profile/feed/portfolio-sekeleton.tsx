import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBento } from "@/hooks/ui/use-bento";
import { useIsMobile, useIsTablet } from "@/hooks/ui/use-mobile";
import { packAppend, type Tile } from "@/lib/bento";
import { cn, createStaticList } from "@/lib/utils";

const PORTFOLIO_FOLDER_SKELETON_ITEMS = createStaticList(
	"portfolio-folder-skeleton",
	5,
);

function createBentoSkeletonTile(
	id: string,
	widthUnit: 1 | 2,
	heightUnit: 1 | 2,
): Tile {
	return {
		id,
		widthUnit,
		heightUnit,
		cover: {
			path: "",
			width: widthUnit * 100,
			height: heightUnit * 100,
			alt: "",
		},
	};
}

const PORTFOLIO_BENTO_SKELETON_TILES: Tile[] = [
	createBentoSkeletonTile("portfolio-grid-skeleton-square-1", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-2", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-3", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-4", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-5", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-6", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-large-1", 2, 2),
	createBentoSkeletonTile("portfolio-grid-skeleton-wide-1", 2, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-wide-2", 2, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-tall-1", 1, 2),
	createBentoSkeletonTile("portfolio-grid-skeleton-tall-2", 1, 2),
	createBentoSkeletonTile("portfolio-grid-skeleton-square-7", 1, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-wide-3", 2, 1),
	createBentoSkeletonTile("portfolio-grid-skeleton-large-2", 2, 2),
];

const GAP = 1;
const MOBILE_COLUMN_COUNT = 2;
const TABLET_COLUMN_COUNT = 3;

type SkeletonPlacement = {
	tile: Tile;
	x: number;
	y: number;
	width?: number;
	height?: number;
	widthUnit?: number;
	heightUnit?: number;
};

function PortfolioFolderCardSkeleton() {
	return (
		<article className="flex w-40 shrink-0 flex-col gap-2">
			<div className="relative aspect-4/3 w-full">
				{/* Folder back and tab */}
				<Skeleton className="absolute inset-x-0 bottom-0 h-[92%] rounded-2xl rounded-tl-md bg-input/60" />
				<Skeleton className="absolute left-0 top-0 h-5 w-[40%] rounded-t-xl bg-input/60" />

				{/* Folder preview */}
				<Skeleton className="absolute inset-x-0 bottom-0 h-[86%] rounded-2xl" />
			</div>

			<div className="space-y-1.5 px-0.5">
				<Skeleton className="h-4 w-24 rounded-md" />
				<Skeleton className="h-3.5 w-16 rounded-md" />
			</div>
		</article>
	);
}

function BentoSkeletonGrid({
	className,
	cols,
	placed,
	width,
}: {
	className?: string;
	cols: number;
	placed: SkeletonPlacement[];
	width: number;
}) {
	const cell =
		width > 0 && cols > 0
			? Math.max(0, (width - (cols - 1) * GAP) / cols)
			: 0;
	const normalizedPlaced = useMemo(
		() =>
			placed.map((item) => ({
				...item,
				columnSpan:
					item.widthUnit ?? item.width ?? item.tile.widthUnit,
				rowSpan:
					item.heightUnit ?? item.height ?? item.tile.heightUnit,
			})),
		[placed],
	);
	const fillerCells = useMemo(() => {
		const occupied = new Set<string>();
		let rowCount = 0;

		for (const item of normalizedPlaced) {
			rowCount = Math.max(rowCount, item.y + item.rowSpan);

			for (let row = item.y; row < item.y + item.rowSpan; row += 1) {
				for (
					let column = item.x;
					column < item.x + item.columnSpan;
					column += 1
				) {
					occupied.add(`${column}:${row}`);
				}
			}
		}

		const fillers: Array<{ column: number; row: number }> = [];

		for (let row = 0; row < rowCount; row += 1) {
			for (let column = 0; column < cols; column += 1) {
				if (!occupied.has(`${column}:${row}`)) {
					fillers.push({ column, row });
				}
			}
		}

		return fillers;
	}, [cols, normalizedPlaced]);

	return (
		<div
			className={cn("w-full gap-px overflow-hidden", className)}
			style={{
				gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				gridAutoRows: cell > 0 ? `${cell}px` : undefined,
				opacity: cell > 0 ? 1 : 0,
			}}
		>
			{cell > 0
				? normalizedPlaced.map((item) => (
					<Skeleton
						key={item.tile.id}
						className="min-w-0 rounded-none bg-input shadow-none! bg-none! before:hidden after:hidden"
						style={{
							gridColumn: `${item.x + 1} / span ${item.columnSpan}`,
							gridRow: `${item.y + 1} / span ${item.rowSpan}`,
						}}
					/>
				))
				: null}

			{cell > 0
				? fillerCells.map(({ column, row }) => (
					<Skeleton
						key={`portfolio-grid-skeleton-filler-${column}-${row}`}
						className="min-w-0 rounded-none bg-input shadow-none! bg-none! before:hidden after:hidden"
						style={{
							gridColumn: column + 1,
							gridRow: row + 1,
						}}
					/>
				))
				: null}
		</div>
	);
}

export function PortfolioContentSkeleton() {
	const gridRef = useRef<HTMLDivElement>(null);
	const resizeFrameRef = useRef<number | null>(null);
	const [gridWidth, setGridWidth] = useState(0);
	const isMobile = useIsMobile();
	const isTablet = useIsTablet();

	const mobileTiles = useMemo<Tile[]>(
		() =>
			PORTFOLIO_BENTO_SKELETON_TILES.map((tile) =>
				tile.heightUnit > tile.widthUnit
					? {
						...tile,
						widthUnit: 2,
						heightUnit: 3,
					}
					: tile,
			),
		[],
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
			PORTFOLIO_BENTO_SKELETON_TILES.map((tile) =>
				tile.heightUnit > tile.widthUnit
					? {
						...tile,
						widthUnit: 1,
						heightUnit: 2,
					}
					: tile,
			),
		[],
	);
	const tabletPlaced = useMemo(
		() =>
			packAppend(
				[],
				tabletTiles,
				TABLET_COLUMN_COUNT,
				"fit",
			),
		[tabletTiles],
	);

	const useTabletCompactLayout = isTablet && !isMobile;
	const compactColumnCount = useTabletCompactLayout
		? TABLET_COLUMN_COUNT
		: MOBILE_COLUMN_COUNT;
	const compactPlaced = useTabletCompactLayout
		? tabletPlaced
		: mobilePlaced;
	const { cols, placed } = useBento(
		PORTFOLIO_BENTO_SKELETON_TILES,
		"balanced",
	);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		const commitWidth = (nextWidth: number) => {
			if (nextWidth <= 0) return;

			setGridWidth((currentWidth) =>
				currentWidth === nextWidth ? currentWidth : nextWidth,
			);
		};

		commitWidth(Math.round(grid.getBoundingClientRect().width));

		const observer = new ResizeObserver(([entry]) => {
			const nextWidth = Math.round(entry?.contentRect.width ?? 0);
			if (nextWidth <= 0) return;

			if (resizeFrameRef.current !== null) {
				cancelAnimationFrame(resizeFrameRef.current);
			}

			resizeFrameRef.current = requestAnimationFrame(() => {
				commitWidth(nextWidth);
			});
		});

		observer.observe(grid);

		return () => {
			observer.disconnect();

			if (resizeFrameRef.current !== null) {
				cancelAnimationFrame(resizeFrameRef.current);
			}
		};
	}, []);

	return (
		<div
			aria-hidden="true"
			className="flex h-full w-full flex-col gap-6"
		>
			{/* Search and filter */}
			<div className="flex items-center gap-3 px-4 pb-4 lg:px-0 xl:px-4">
				<Skeleton className="h-10 min-w-0 flex-1 rounded-full" />
				<Skeleton className="h-10 w-21.5 shrink-0 rounded-full" />
			</div>

			{/* Folder cards */}
			<section className="min-w-0 lg:px-0 xl:px-4">
				<div className="flex w-full min-w-0 gap-4 overflow-hidden px-3 pb-4 lg:px-0 xl:px-3">
					{PORTFOLIO_FOLDER_SKELETON_ITEMS.map((item) => (
						<PortfolioFolderCardSkeleton key={item.id} />
					))}
				</div>
			</section>

			{/*
				The same three packing modes as ProfileFeed. CSS Grid keeps the
				skeleton tiles in normal flow so they cannot escape their container.
			*/}
			<div
				ref={gridRef}
				className="w-full overflow-hidden lg:mx-0 xl:mx-4 xl:w-auto"
			>
				<BentoSkeletonGrid
					className="grid lg:hidden"
					cols={compactColumnCount}
					placed={compactPlaced}
					width={gridWidth}
				/>

				<BentoSkeletonGrid
					className="hidden lg:grid xl:hidden"
					cols={TABLET_COLUMN_COUNT}
					placed={tabletPlaced}
					width={gridWidth}
				/>

				<BentoSkeletonGrid
					className="hidden xl:grid"
					cols={cols}
					placed={placed}
					width={gridWidth}
				/>
			</div>
		</div>
	);
}
