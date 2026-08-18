import type {
	PackStrategy,
	PixelLayout,
	PixelNode,
	PlacedGeneric,
	PlacedTile,
	Tile,
	TileHeightUnit,
	TileWidthUnit,
} from "@/types/feed/bento";

export type {
	PackStrategy,
	PixelLayout,
	PixelNode,
	PlacedGeneric,
	PlacedTile,
	Tile,
	TileHeightUnit,
	TileWidthUnit,
};

export interface TileBucket {
	widthUnit: TileWidthUnit;
	heightUnit: TileHeightUnit;
}

interface IndexedTile<TileData> {
	tile: TileData;
	originalIndex: number;
	timestamp: number | null;
}

interface BalancedTile<TileData>
	extends IndexedTile<TileData> {
	priorityScore: number;
}

type HorizontalPreference =
	| "left"
	| "right";

const DAY_IN_MS =
	24 * 60 * 60 * 1000;

/**
 * Determines the grid shape from the original image ratio.
 *
 * - extremely narrow portrait: 1x2
 * - ordinary portrait: 2x3
 * - landscape: 2x1
 * - square or near-square: 1x1
 */
export function bucketFromDimensions(
	imageWidth: number,
	imageHeight: number,
): TileBucket {
	if (
		!Number.isFinite(imageWidth) ||
		!Number.isFinite(imageHeight) ||
		imageWidth <= 0 ||
		imageHeight <= 0
	) {
		return {
			widthUnit: 1,
			heightUnit: 1,
		};
	}

	const aspectRatio =
		imageWidth / imageHeight;

	if (aspectRatio <= 0.58) {
		return {
			widthUnit: 1,
			heightUnit: 2,
		};
	}

	if (aspectRatio < 0.9) {
		return {
			widthUnit: 2,
			heightUnit: 3,
		};
	}

	if (aspectRatio >= 1.35) {
		return {
			widthUnit: 2,
			heightUnit: 1,
		};
	}

	return {
		widthUnit: 1,
		heightUnit: 1,
	};
}

function parseTimestamp(
	createdAt: string | undefined,
): number | null {
	if (!createdAt) {
		return null;
	}

	const timestamp =
		Date.parse(createdAt);

	return Number.isFinite(timestamp)
		? timestamp
		: null;
}

/**
 * Strict chronological ordering.
 */
export function sortNewestFirst<
	TileData extends {
		createdAt?: string;
	},
>(
	tiles: readonly TileData[],
): TileData[] {
	return tiles
		.map<IndexedTile<TileData>>(
			(tile, originalIndex) => ({
				tile,
				originalIndex,
				timestamp: parseTimestamp(
					tile.createdAt,
				),
			}),
		)
		.sort((a, b) => {
			if (
				a.timestamp !== null &&
				b.timestamp !== null
			) {
				const difference =
					b.timestamp -
					a.timestamp;

				if (difference !== 0) {
					return difference;
				}
			}

			if (
				a.timestamp !== null &&
				b.timestamp === null
			) {
				return -1;
			}

			if (
				a.timestamp === null &&
				b.timestamp !== null
			) {
				return 1;
			}

			return (
				a.originalIndex -
				b.originalIndex
			);
		})
		.map(({ tile }) => tile);
}

/**
 * Larger tiles receive a penalty so they can be passed by smaller posts
 * published around the same time.
 */
function getTileSizePenalty(tile: {
	widthUnit: TileWidthUnit;
	heightUnit: TileHeightUnit;
}): number {
	if (
		tile.widthUnit === 2 &&
		tile.heightUnit === 3
	) {
		return 5;
	}

	if (
		tile.widthUnit === 1 &&
		tile.heightUnit === 2
	) {
		return 2.5;
	}

	if (
		tile.widthUnit === 2 &&
		tile.heightUnit === 1
	) {
		return 1.5;
	}

	return 0;
}

/**
 * Hybrid ordering based on both publication date and size.
 *
 * Three priority points are added for every day of age:
 *
 * - a new 2x3 post has a score of 5;
 * - a one-day-old 1x1 post has a score of 3;
 * - a two-day-old 1x1 post has a score of 6.
 *
 * Consequently, a large post may be passed by small posts from roughly the
 * same publishing period, but substantially older posts remain below it.
 */
export function sortBalanced<
	TileData extends {
		widthUnit: TileWidthUnit;
		heightUnit: TileHeightUnit;
		createdAt?: string;
	},
>(
	tiles: readonly TileData[],
): TileData[] {
	const indexedTiles = tiles.map<
		IndexedTile<TileData>
	>((tile, originalIndex) => ({
		tile,
		originalIndex,
		timestamp: parseTimestamp(
			tile.createdAt,
		),
	}));

	const validTimestamps =
		indexedTiles
			.map(({ timestamp }) => timestamp)
			.filter(
				(
					timestamp,
				): timestamp is number =>
					timestamp !== null,
			);

	const newestTimestamp =
		validTimestamps.length > 0
			? Math.max(...validTimestamps)
			: null;

	return indexedTiles
		.map<BalancedTile<TileData>>(
			(entry) => {
				const ageInDays =
					newestTimestamp !== null &&
					entry.timestamp !== null
						? Math.max(
								0,
								(newestTimestamp -
									entry.timestamp) /
									DAY_IN_MS,
							)
						: 30;

				return {
					...entry,
					priorityScore:
						ageInDays * 3 +
						getTileSizePenalty(
							entry.tile,
						),
				};
			},
		)
		.sort((a, b) => {
			const priorityDifference =
				a.priorityScore -
				b.priorityScore;

			if (
				Math.abs(
					priorityDifference,
				) > 0.001
			) {
				return priorityDifference;
			}

			if (
				a.timestamp !== null &&
				b.timestamp !== null &&
				a.timestamp !== b.timestamp
			) {
				return (
					b.timestamp -
					a.timestamp
				);
			}

			return (
				a.originalIndex -
				b.originalIndex
			);
		})
		.map(({ tile }) => tile);
}

function createEmptyRow(
	columnCount: number,
): boolean[] {
	return Array.from(
		{ length: columnCount },
		() => false,
	);
}

function ensureRows(
	occupied: boolean[][],
	requiredRows: number,
	columnCount: number,
): void {
	while (
		occupied.length < requiredRows
	) {
		occupied.push(
			createEmptyRow(columnCount),
		);
	}
}

function canPlace(
	occupied: boolean[][],
	x: number,
	y: number,
	width: number,
	height: number,
	columnCount: number,
): boolean {
	if (
		x < 0 ||
		y < 0 ||
		x + width > columnCount
	) {
		return false;
	}

	for (
		let row = y;
		row < y + height;
		row += 1
	) {
		for (
			let column = x;
			column < x + width;
			column += 1
		) {
			if (
				occupied[row]?.[column]
			) {
				return false;
			}
		}
	}

	return true;
}

function markOccupied(
	occupied: boolean[][],
	x: number,
	y: number,
	width: number,
	height: number,
	columnCount: number,
): void {
	ensureRows(
		occupied,
		y + height,
		columnCount,
	);

	for (
		let row = y;
		row < y + height;
		row += 1
	) {
		for (
			let column = x;
			column < x + width;
			column += 1
		) {
			occupied[row][column] = true;
		}
	}
}

function getColumnOrder(
	width: number,
	columnCount: number,
	preference: HorizontalPreference,
): number[] {
	const maximumColumn =
		columnCount - width;

	const columns = Array.from(
		{ length: maximumColumn + 1 },
		(_, index) => index,
	);

	if (preference === "right") {
		columns.reverse();
	}

	return columns;
}

function findPosition(
	occupied: boolean[][],
	width: number,
	height: number,
	columnCount: number,
	minimumRow: number,
	horizontalPreference: HorizontalPreference,
): { x: number; y: number } {
	let row = Math.max(
		0,
		minimumRow,
	);

	const columnOrder =
		getColumnOrder(
			width,
			columnCount,
			horizontalPreference,
		);

	while (true) {
		for (const column of columnOrder) {
			if (
				canPlace(
					occupied,
					column,
					row,
					width,
					height,
					columnCount,
				)
			) {
				return {
					x: column,
					y: row,
				};
			}
		}

		row += 1;
	}
}

function normalizeWidth(
	width: TileWidthUnit,
	columnCount: number,
): TileWidthUnit {
	if (columnCount <= 1) {
		return 1;
	}

	return width;
}

function getHorizontalPreference(
	strategy: PackStrategy,
	width: TileWidthUnit,
	height: TileHeightUnit,
): HorizontalPreference {
	/*
	 * Only large 2x3 tiles prefer the right edge.
	 *
	 * Smaller tiles still fill from left to right. If small recent posts
	 * already occupy the upper rows, the portrait tile naturally moves
	 * toward the lower-right.
	 */
	if (
		strategy === "balanced" &&
		width === 2 &&
		height === 3
	) {
		return "right";
	}

	return "left";
}

/**
 * Generic bento-grid packing.
 *
 * recency:
 * Strict chronological progression. An older post cannot move to a row above
 * the previously placed post.
 *
 * balanced:
 * Date-weighted size ordering. Large portrait tiles prefer the right side,
 * while smaller items can fill holes from the top-left.
 *
 * fit:
 * Uses the supplied order and always searches from the first row.
 */
export function packGeneric<
	TileData extends {
		widthUnit: TileWidthUnit;
		heightUnit: TileHeightUnit;
		createdAt?: string;
	},
>(
	inputTiles: readonly TileData[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedGeneric<TileData>[] {
	if (
		inputTiles.length === 0 ||
		columnCount <= 0
	) {
		return [];
	}

	const tiles =
		strategy === "recency"
			? sortNewestFirst(inputTiles)
			: strategy === "balanced"
				? sortBalanced(inputTiles)
				: [...inputTiles];

	const occupied: boolean[][] = [];

	const placed: PlacedGeneric<TileData>[] =
		[];

	let chronologicalRow = 0;

	for (const tile of tiles) {
		const width = normalizeWidth(
			tile.widthUnit,
			columnCount,
		);

		const height =
			tile.heightUnit;

		const minimumRow =
			strategy === "recency"
				? chronologicalRow
				: 0;

		const horizontalPreference =
			getHorizontalPreference(
				strategy,
				width,
				height,
			);

		const position = findPosition(
			occupied,
			width,
			height,
			columnCount,
			minimumRow,
			horizontalPreference,
		);

		markOccupied(
			occupied,
			position.x,
			position.y,
			width,
			height,
			columnCount,
		);

		placed.push({
			x: position.x,
			y: position.y,
			width,
			height,
			tile,
		});

		if (strategy === "recency") {
			chronologicalRow =
				position.y;
		}
	}

	return placed;
}

/**
 * Compatibility export for existing code.
 */
export function packAppendGeneric<
	TileData extends {
		widthUnit: TileWidthUnit;
		heightUnit: TileHeightUnit;
		createdAt?: string;
	},
>(
	inputTiles: readonly TileData[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedGeneric<TileData>[] {
	return packGeneric(
		inputTiles,
		columnCount,
		strategy,
	);
}

export function packTiles(
	inputTiles: readonly Tile[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedTile[] {
	return packGeneric(
		inputTiles,
		columnCount,
		strategy,
	).map((placed) => ({
		x: placed.x,
		y: placed.y,
		widthUnit: placed.width,
		heightUnit: placed.height,
		tile: placed.tile,
	}));
}

/**
 * Compatibility export for existing code.
 */
export function packAppend(
	inputTiles: readonly Tile[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedTile[] {
	return packTiles(
		inputTiles,
		columnCount,
		strategy,
	);
}

export function toPixels(
	placedTiles: readonly PlacedTile[],
	cellSize: number,
	gapSize: number,
): PixelLayout {
	const safeCellSize = Math.max(
		0,
		cellSize,
	);

	const safeGapSize = Math.max(
		0,
		gapSize,
	);

	const toOffsetPx = (
		gridIndex: number,
	): number =>
		gridIndex *
		(safeCellSize + safeGapSize);

	const toSpanPx = (
		gridSpan: number,
	): number =>
		gridSpan * safeCellSize +
		(gridSpan - 1) * safeGapSize;

	const nodes: PixelNode[] =
		placedTiles.map((placedTile) => ({
			key: placedTile.tile.id,
			tile: placedTile.tile,
			style: {
				position: "absolute",
				left: toOffsetPx(
					placedTile.x,
				),
				top: toOffsetPx(
					placedTile.y,
				),
				width: toSpanPx(
					placedTile.widthUnit,
				),
				height: toSpanPx(
					placedTile.heightUnit,
				),
			},
		}));

	const totalRows =
		placedTiles.length > 0
			? Math.max(
					...placedTiles.map(
						(placedTile) =>
							placedTile.y +
							placedTile.heightUnit,
					),
				)
			: 0;

	return {
		nodes,
		containerHeight:
			totalRows > 0
				? toSpanPx(totalRows)
				: 0,
	};
}