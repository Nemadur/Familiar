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

interface GridPosition {
	column: number;
	row: number;
}

interface EffectiveSize {
	width: TileWidthUnit;
	height: TileHeightUnit;
}

interface IndexedTile {
	tile: Tile;
	inputIndex: number;
	createdAt: number;
}

interface PlacementCandidate extends IndexedTile, GridPosition {
	width: TileWidthUnit;
	height: TileHeightUnit;
}

type HorizontalPreference = "left" | "right";

const MAX_COLUMN_COUNT = 4;
const BALANCED_LOOKAHEAD = 6;

const BALANCED_DATE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Converts the original image ratio into a grid span.
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

	const aspectRatio = imageWidth / imageHeight;

	// Extremely narrow portrait.
	if (aspectRatio <= 0.58) {
		return {
			widthUnit: 1,
			heightUnit: 2,
		};
	}

	// Ordinary portrait, including 2:3, 3:4 and 4:5.
	if (aspectRatio < 0.9) {
		return {
			widthUnit: 2,
			heightUnit: 3,
		};
	}

	// Landscape.
	if (aspectRatio >= 1.35) {
		return {
			widthUnit: 2,
			heightUnit: 1,
		};
	}

	// Square or near-square.
	return {
		widthUnit: 1,
		heightUnit: 1,
	};
}

class OccupancyGrid {
	private readonly cells: boolean[][] = [];

	constructor(private readonly columnCount: number) {}

	private ensureRow(rowIndex: number): boolean[] {
		if (!this.cells[rowIndex]) {
			this.cells[rowIndex] = new Array<boolean>(this.columnCount).fill(false);
		}

		return this.cells[rowIndex];
	}

	isEmpty(): boolean {
		return !this.cells.some((row) => row.some(Boolean));
	}

	markOccupied(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): void {
		for (let y = 0; y < height; y += 1) {
			const row = this.ensureRow(startRow + y);

			for (let x = 0; x < width; x += 1) {
				row[startColumn + x] = true;
			}
		}
	}

	isRegionFree(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): boolean {
		if (
			startColumn < 0 ||
			startRow < 0 ||
			startColumn + width > this.columnCount
		) {
			return false;
		}

		for (let y = 0; y < height; y += 1) {
			const row = this.ensureRow(startRow + y);

			for (let x = 0; x < width; x += 1) {
				if (row[startColumn + x]) {
					return false;
				}
			}
		}

		return true;
	}

	findFirstAvailablePosition(
		width: number,
		height: number,
		preference: HorizontalPreference = "left",
	): GridPosition {
		for (let row = 0; ; row += 1) {
			const maximumColumn = this.columnCount - width;

			if (preference === "right") {
				for (let column = maximumColumn; column >= 0; column -= 1) {
					if (this.isRegionFree(column, row, width, height)) {
						return {
							column,
							row,
						};
					}
				}

				continue;
			}

			for (let column = 0; column <= maximumColumn; column += 1) {
				if (this.isRegionFree(column, row, width, height)) {
					return {
						column,
						row,
					};
				}
			}
		}
	}
}

function getCreatedAt(tile: Tile): number {
	const datedTile = tile as Tile & {
		createdAt?: string | null;
		post?: {
			createdAt?: string | null;
		};
	};

	const value = datedTile.createdAt ?? datedTile.post?.createdAt;

	if (!value) {
		return Number.NEGATIVE_INFINITY;
	}

	const timestamp = Date.parse(value);

	return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function getEffectiveSize(tile: Tile, columnCount: number): EffectiveSize {
	if (columnCount === 1) {
		return {
			width: 1,
			height: 1,
		};
	}

	return {
		width: Math.min(tile.widthUnit, columnCount) as TileWidthUnit,
		height: tile.heightUnit,
	};
}

function sortNewestFirst(tiles: IndexedTile[]): IndexedTile[] {
	return [...tiles].sort((a, b) => {
		if (a.createdAt !== b.createdAt) {
			return b.createdAt - a.createdAt;
		}

		return a.inputIndex - b.inputIndex;
	});
}

function getHorizontalPreference(
	strategy: PackStrategy,
	width: TileWidthUnit,
	height: TileHeightUnit,
	grid: OccupancyGrid,
): HorizontalPreference {
	/*
	 * The first or only portrait starts on the left.
	 * A later 2x3 portrait prefers the right side.
	 */
	if (
		strategy === "balanced" &&
		width === 2 &&
		height === 3 &&
		!grid.isEmpty()
	) {
		return "right";
	}

	return "left";
}

function getBalancedCandidatePool(
	remainingTiles: IndexedTile[],
): IndexedTile[] {
	const candidates = remainingTiles.slice(0, BALANCED_LOOKAHEAD);

	const newestTimestamp = remainingTiles[0]?.createdAt;

	if (newestTimestamp === undefined || !Number.isFinite(newestTimestamp)) {
		return candidates.slice(0, 1);
	}

	const nearbyCandidates = candidates.filter((candidate, index) => {
		if (index === 0) {
			return true;
		}

		if (!Number.isFinite(candidate.createdAt)) {
			return false;
		}

		return newestTimestamp - candidate.createdAt <= BALANCED_DATE_WINDOW_MS;
	});

	return nearbyCandidates.length > 0
		? nearbyCandidates
		: candidates.slice(0, 1);
}

function createCandidate(
	indexedTile: IndexedTile,
	columnCount: number,
	grid: OccupancyGrid,
	strategy: PackStrategy,
): PlacementCandidate {
	const { width, height } = getEffectiveSize(indexedTile.tile, columnCount);

	const preference = getHorizontalPreference(strategy, width, height, grid);

	return {
		...indexedTile,
		...grid.findFirstAvailablePosition(width, height, preference),
		width,
		height,
	};
}

function isEarlierPosition(
	candidate: PlacementCandidate,
	current: PlacementCandidate,
): boolean {
	if (candidate.row !== current.row) {
		return candidate.row < current.row;
	}

	return candidate.column < current.column;
}

function isSamePosition(
	candidate: PlacementCandidate,
	current: PlacementCandidate,
): boolean {
	return candidate.row === current.row && candidate.column === current.column;
}

function isTallCandidate(candidate: PlacementCandidate): boolean {
	return candidate.height > 1;
}

/**
 * Chooses between two shapes that start at the same position.
 *
 * Wider short tiles are chosen before 1x1 tiles. This avoids placing a 1x1
 * where a 2x1 could complete a row and prevents isolated one-cell holes.
 */
function isBetterBalancedShape(
	candidate: PlacementCandidate,
	current: PlacementCandidate,
): boolean {
	const candidateIsTall = isTallCandidate(candidate);

	const currentIsTall = isTallCandidate(current);

	// Short items go before tall items.
	if (candidateIsTall !== currentIsTall) {
		return !candidateIsTall;
	}

	// Prefer 2x1 over 1x1.
	if (!candidateIsTall && !currentIsTall && candidate.width !== current.width) {
		return candidate.width > current.width;
	}

	const candidateArea = candidate.width * candidate.height;

	const currentArea = current.width * current.height;

	// For two tall items, prefer the smaller footprint.
	if (candidateIsTall && currentIsTall && candidateArea !== currentArea) {
		return candidateArea < currentArea;
	}

	if (candidate.createdAt !== current.createdAt) {
		return candidate.createdAt > current.createdAt;
	}

	return candidate.inputIndex < current.inputIndex;
}

function chooseBalancedCandidate(
	candidates: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
): PlacementCandidate {
	let best: PlacementCandidate | undefined;

	for (const indexedTile of candidates) {
		const candidate = createCandidate(
			indexedTile,
			columnCount,
			grid,
			"balanced",
		);

		if (!best) {
			best = candidate;
			continue;
		}

		if (isEarlierPosition(candidate, best)) {
			best = candidate;
			continue;
		}

		if (
			isSamePosition(candidate, best) &&
			isBetterBalancedShape(candidate, best)
		) {
			best = candidate;
		}
	}

	if (!best) {
		throw new Error("Cannot select a tile from an empty collection.");
	}

	return best;
}

function chooseFitCandidate(
	remainingTiles: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
): PlacementCandidate {
	let best: PlacementCandidate | undefined;

	for (const indexedTile of remainingTiles) {
		const candidate = createCandidate(indexedTile, columnCount, grid, "fit");

		if (!best) {
			best = candidate;
			continue;
		}

		const candidateArea = candidate.width * candidate.height;

		const bestArea = best.width * best.height;

		if (
			isEarlierPosition(candidate, best) ||
			(isSamePosition(candidate, best) && candidateArea > bestArea) ||
			(isSamePosition(candidate, best) &&
				candidateArea === bestArea &&
				candidate.createdAt > best.createdAt)
		) {
			best = candidate;
		}
	}

	if (!best) {
		throw new Error("Cannot select a tile from an empty collection.");
	}

	return best;
}

function chooseNextTile(
	remainingTiles: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
	strategy: PackStrategy,
): PlacementCandidate {
	if (remainingTiles.length === 0) {
		throw new Error("Cannot select a tile from an empty collection.");
	}

	if (strategy === "recency") {
		return createCandidate(remainingTiles[0], columnCount, grid, "recency");
	}

	if (strategy === "balanced") {
		return chooseBalancedCandidate(
			getBalancedCandidatePool(remainingTiles),
			columnCount,
			grid,
		);
	}

	return chooseFitCandidate(remainingTiles, columnCount, grid);
}

export function packAppend(
	existingTiles: PlacedTile[],
	incomingTiles: Tile[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedTile[] {
	const safeColumnCount = Math.max(1, Math.min(columnCount, MAX_COLUMN_COUNT));

	const grid = new OccupancyGrid(safeColumnCount);

	const outputTiles = existingTiles.map((placedTile) => ({
		...placedTile,
		tile: {
			...placedTile.tile,
		},
	}));

	for (const placedTile of outputTiles) {
		grid.markOccupied(
			placedTile.x,
			placedTile.y,
			placedTile.widthUnit,
			placedTile.heightUnit,
		);
	}

	const remainingTiles = sortNewestFirst(
		incomingTiles.map((tile, inputIndex) => ({
			tile,
			inputIndex,
			createdAt: getCreatedAt(tile),
		})),
	);

	while (remainingTiles.length > 0) {
		const next = chooseNextTile(
			remainingTiles,
			safeColumnCount,
			grid,
			strategy,
		);

		grid.markOccupied(next.column, next.row, next.width, next.height);

		outputTiles.push({
			x: next.column,
			y: next.row,
			widthUnit: next.width,
			heightUnit: next.height,
			tile: {
				...next.tile,
			},
		});

		const selectedIndex = remainingTiles.findIndex(
			(item) => item.inputIndex === next.inputIndex,
		);

		if (selectedIndex >= 0) {
			remainingTiles.splice(selectedIndex, 1);
		}
	}

	return outputTiles;
}

export function packAppendGeneric<
	TileData extends {
		widthUnit: TileWidthUnit;
		heightUnit: TileHeightUnit;
	},
>(
	existingTiles: PlacedGeneric<TileData>[],
	incomingTiles: TileData[],
	columnCount: number,
): PlacedGeneric<TileData>[] {
	const safeColumnCount = Math.max(1, Math.min(columnCount, MAX_COLUMN_COUNT));

	const grid = new OccupancyGrid(safeColumnCount);

	const outputTiles = [...existingTiles];

	for (const placedTile of existingTiles) {
		grid.markOccupied(
			placedTile.x,
			placedTile.y,
			placedTile.width,
			placedTile.height,
		);
	}

	for (const tile of incomingTiles) {
		const width =
			safeColumnCount === 1
				? 1
				: (Math.min(tile.widthUnit, safeColumnCount) as TileWidthUnit);

		const height = safeColumnCount === 1 ? 1 : tile.heightUnit;

		const { column, row } = grid.findFirstAvailablePosition(width, height);

		grid.markOccupied(column, row, width, height);

		outputTiles.push({
			x: column,
			y: row,
			width,
			height,
			tile,
		});
	}

	return outputTiles;
}

export function toPixels(
	placedTiles: readonly PlacedTile[],
	cellSize: number,
	gapSize: number,
): PixelLayout {
	const safeCellSize = Math.max(0, cellSize);

	const safeGapSize = Math.max(0, gapSize);

	const toOffsetPx = (index: number): number =>
		index * (safeCellSize + safeGapSize);

	const toSpanPx = (span: number): number =>
		span * safeCellSize + (span - 1) * safeGapSize;

	const nodes: PixelNode[] = placedTiles.map((placedTile) => ({
		key: placedTile.tile.id,
		tile: placedTile.tile,
		style: {
			position: "absolute",
			left: toOffsetPx(placedTile.x),
			top: toOffsetPx(placedTile.y),
			width: toSpanPx(placedTile.widthUnit),
			height: toSpanPx(placedTile.heightUnit),
		},
	}));

	const totalRows =
		placedTiles.length > 0
			? Math.max(...placedTiles.map((tile) => tile.y + tile.heightUnit))
			: 0;

	return {
		nodes,
		containerHeight: totalRows > 0 ? toSpanPx(totalRows) : 0,
	};
}
