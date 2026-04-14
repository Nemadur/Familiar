import { useEffect, useMemo, useState } from "react";
import { bucketFromDimensions } from "@/lib/bento";
import type {
	PackStrategy,
	PlacedGeneric,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

// Re-export everything consumers are likely to need so they have a single
// import path for both types and the hook.
export type { Tile, PlacedTile, PlacedGeneric, PackStrategy };
export { bucketFromDimensions };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * A lightweight, lazily-initialised 2-D occupancy grid.
 * Each cell holds either `0` (empty) or `1` (occupied).
 * Rows are allocated on demand to avoid pre-allocating unbounded memory.
 */
class OccupancyGrid {
	private readonly cells: number[][] = [];
	private readonly columnCount: number;

	constructor(columnCount: number) {
		this.columnCount = columnCount;
	}

	/**
	 * Returns the row at `rowIndex`, creating it as an all-zero array if it
	 * does not yet exist.
	 */
	private ensureRow(rowIndex: number): number[] {
		if (!this.cells[rowIndex]) {
			this.cells[rowIndex] = new Array<number>(this.columnCount).fill(0);
		}
		return this.cells[rowIndex];
	}

	/**
	 * Marks a rectangular region of cells as occupied (1).
	 *
	 * @param startColumn - Left edge of the region (inclusive, zero-based).
	 * @param startRow    - Top edge of the region (inclusive, zero-based).
	 * @param width       - Number of columns to mark.
	 * @param height      - Number of rows to mark.
	 */
	markOccupied(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): void {
		for (let rowOffset = 0; rowOffset < height; rowOffset++) {
			const row = this.ensureRow(startRow + rowOffset);
			for (let columnOffset = 0; columnOffset < width; columnOffset++) {
				row[startColumn + columnOffset] = 1;
			}
		}
	}

	/**
	 * Marks a rectangular region of cells as free (0).
	 * Used during the compaction pass to temporarily "lift" a tile before
	 * testing whether it can move left.
	 *
	 * @param startColumn - Left edge of the region (inclusive, zero-based).
	 * @param startRow    - Top edge of the region (inclusive, zero-based).
	 * @param width       - Number of columns to clear.
	 * @param height      - Number of rows to clear.
	 */
	markFree(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): void {
		for (let rowOffset = 0; rowOffset < height; rowOffset++) {
			const row = this.ensureRow(startRow + rowOffset);
			for (let columnOffset = 0; columnOffset < width; columnOffset++) {
				row[startColumn + columnOffset] = 0;
			}
		}
	}

	/**
	 * Returns `true` if every cell in the specified rectangular region is free.
	 *
	 * @param startColumn - Left edge of the region (inclusive, zero-based).
	 * @param startRow    - Top edge of the region (inclusive, zero-based).
	 * @param width       - Number of columns to test.
	 * @param height      - Number of rows to test.
	 */
	isRegionFree(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): boolean {
		for (let rowOffset = 0; rowOffset < height; rowOffset++) {
			const row = this.ensureRow(startRow + rowOffset);
			for (let columnOffset = 0; columnOffset < width; columnOffset++) {
				if (row[startColumn + columnOffset] !== 0) return false;
			}
		}
		return true;
	}

	/**
	 * Scans the grid row-by-row, then left-to-right within each row, to find
	 * the first position where a tile of the given dimensions fits entirely
	 * within the column bounds.
	 *
	 * @param width  - Required column span.
	 * @param height - Required row span.
	 * @returns The `{ column, row }` of the top-left corner of the free region.
	 */
	findFirstAvailablePosition(
		width: number,
		height: number,
	): { column: number; row: number } {
		const clampedWidth = Math.max(1, Math.min(width, this.columnCount));
		const MAX_SEARCH_ROWS = 2_000;

		for (let currentRow = 0; currentRow < MAX_SEARCH_ROWS; currentRow++) {
			for (
				let currentColumn = 0;
				currentColumn <= this.columnCount - clampedWidth;
				currentColumn++
			) {
				if (
					this.isRegionFree(currentColumn, currentRow, clampedWidth, height)
				) {
					return { column: currentColumn, row: currentRow };
				}
			}
		}

		// Fallback — append a fresh row at the bottom of the grid.
		return { column: 0, row: this.cells.length };
	}
}

// ---------------------------------------------------------------------------
// Size-variant resolution
// ---------------------------------------------------------------------------

/** A candidate width/height combination for a tile. */
type SizeVariant = { width: number; height: number };

/**
 * Returns an ordered list of acceptable size variants for a tile, from most
 * preferred (original requested size) to smallest fallback.
 *
 * Degradation rules:
 * - **2×2** → try 2×1, then 1×2, then 1×1
 * - **2×1** → try 1×1
 * - **1×2** → try 1×1
 * - **1×1** → no further fallback
 *
 * @param originalWidth  - Desired column span (1 or 2).
 * @param originalHeight - Desired row span (1 or 2).
 */
function getSizeVariants(
	originalWidth: number,
	originalHeight: number,
): SizeVariant[] {
	const variants: SizeVariant[] = [
		{ width: originalWidth, height: originalHeight },
	];

	if (originalWidth === 2 && originalHeight === 2) {
		variants.push(
			{ width: 2, height: 1 },
			{ width: 1, height: 2 },
			{ width: 1, height: 1 },
		);
	} else if (originalWidth === 2 && originalHeight === 1) {
		variants.push({ width: 1, height: 1 });
	} else if (originalWidth === 1 && originalHeight === 2) {
		variants.push({ width: 1, height: 1 });
	}

	return variants;
}

// ---------------------------------------------------------------------------
// Best-fit position finder
// ---------------------------------------------------------------------------

/** The resolved placement of a tile after evaluating all size variants. */
type BestFitResult = {
	column: number;
	row: number;
	width: number;
	height: number;
};

/**
 * Evaluates every allowed size variant for a tile and returns the position
 * that minimises the placement score, defined as:
 *
 * ```
 * score = row × 1000 + column + tileIndex × 0.001
 * ```
 *
 * - `row × 1000` — strong bias to fill the topmost rows first.
 * - `+ column`   — secondary left-to-right bias within a row.
 * - `+ tileIndex × 0.001` — tiny tiebreaker that preserves chronological order
 *   among tiles placed on the same cell.
 *
 * @param tile        - The tile to place.
 * @param tileIndex   - The tile's index in the incoming batch (for tiebreaking).
 * @param columnCount - Total number of grid columns.
 * @param grid        - The current occupancy grid.
 * @returns The best-fit result, or `null` if no position could be found (should
 *          not happen in practice given the grid's unbounded row expansion).
 */
function findBestFitPosition(
	tile: Tile,
	tileIndex: number,
	columnCount: number,
	grid: OccupancyGrid,
): BestFitResult | null {
	const variants = getSizeVariants(tile.widthUnit, tile.heightUnit);

	let bestFit: BestFitResult | null = null;
	let bestScore = Number.POSITIVE_INFINITY;

	for (const variant of variants) {
		const effectiveWidth = Math.max(1, Math.min(variant.width, columnCount));
		// In a single-column layout tiles cannot be taller than one row.
		const effectiveHeight = columnCount === 1 ? 1 : variant.height;

		const { column, row } = grid.findFirstAvailablePosition(
			effectiveWidth,
			effectiveHeight,
		);
		const score = row * 1_000 + column + tileIndex * 0.001;

		if (score < bestScore) {
			bestScore = score;
			bestFit = { column, row, width: effectiveWidth, height: effectiveHeight };
		}
	}

	return bestFit;
}

// ---------------------------------------------------------------------------
// Compaction pass
// ---------------------------------------------------------------------------

/**
 * Shifts newly placed tiles as far left as possible within their existing rows
 * to reduce horizontal fragmentation.
 *
 * Only tiles added during the current `packAppend` call (i.e. those after
 * index `existingTileCount`) are eligible for movement; previously committed
 * tiles remain fixed.
 *
 * The pass processes tiles in top-to-bottom, left-to-right order so that
 * earlier tiles do not block the movement of later ones.
 *
 * @param outputTiles       - Full array of placed tiles (mutated in place).
 * @param existingTileCount - Number of tiles present before this packing call.
 * @param grid              - The occupancy grid (mutated to reflect any moves).
 */
function compactNewTilesLeft(
	outputTiles: PlacedTile[],
	existingTileCount: number,
	grid: OccupancyGrid,
): void {
	const movableTiles = outputTiles
		.slice(existingTileCount)
		.sort((tileA, tileB) => tileA.y - tileB.y || tileA.x - tileB.x);

	for (const placedTile of movableTiles) {
		// Temporarily free the tile's current position so the check below does
		// not treat it as a blocking neighbour of itself.
		grid.markFree(
			placedTile.x,
			placedTile.y,
			placedTile.widthUnit,
			placedTile.heightUnit,
		);

		// Walk leftward one column at a time until an obstacle or the grid edge
		// is reached.
		let targetColumn = placedTile.x;
		while (
			targetColumn > 0 &&
			grid.isRegionFree(
				targetColumn - 1,
				placedTile.y,
				placedTile.widthUnit,
				placedTile.heightUnit,
			)
		) {
			targetColumn--;
		}

		// Re-occupy the (possibly shifted) position and update the tile's x.
		grid.markOccupied(
			targetColumn,
			placedTile.y,
			placedTile.widthUnit,
			placedTile.heightUnit,
		);
		placedTile.x = targetColumn;
	}
}

// ---------------------------------------------------------------------------
// Public API — packAppend
// ---------------------------------------------------------------------------

/**
 * Places `incomingTiles` into the bento grid using a best-fit strategy that
 * respects chronological order as closely as possible.
 *
 * **Algorithm overview:**
 * 1. Re-build the occupancy grid from `existingTiles` (their positions are frozen).
 * 2. For each incoming tile, evaluate all allowed size variants and select the
 *    position with the lowest score (top-left bias + chronological tiebreaker).
 * 3. Run a left-compaction pass on the newly placed tiles to minimise gaps.
 *
 * @param existingTiles - Tiles already committed to the grid; their positions
 *                        will not be changed.
 * @param incomingTiles - New tiles to place; order is preserved as closely as
 *                        the layout constraints allow.
 * @param columnCount   - Number of columns in the grid (typically 1, 2, or 3).
 * @returns A new array containing `existingTiles` followed by the newly placed
 *          tiles.
 */
export function packAppend(
	existingTiles: PlacedTile[],
	incomingTiles: Tile[],
	columnCount: number,
): PlacedTile[] {
	const grid = new OccupancyGrid(columnCount);
	const outputTiles: PlacedTile[] = [...existingTiles];

	// Seed the grid with the frozen positions of already-placed tiles.
	for (const existingTile of existingTiles) {
		grid.markOccupied(
			existingTile.x,
			existingTile.y,
			existingTile.widthUnit,
			existingTile.heightUnit,
		);
	}

	for (let tileIndex = 0; tileIndex < incomingTiles.length; tileIndex++) {
		const tile = incomingTiles[tileIndex];
		const bestFit = findBestFitPosition(tile, tileIndex, columnCount, grid);

		if (bestFit !== null) {
			grid.markOccupied(
				bestFit.column,
				bestFit.row,
				bestFit.width,
				bestFit.height,
			);
			outputTiles.push({
				x: bestFit.column,
				y: bestFit.row,
				widthUnit: bestFit.width as 1 | 2,
				heightUnit: bestFit.height as 1 | 2,
				tile: {
					...tile,
					widthUnit: bestFit.width as 1 | 2,
					heightUnit: bestFit.height as 1 | 2,
				},
			});
		} else {
			// Fallback — should rarely be reached; places the tile as small as
			// necessary to guarantee it always lands somewhere in the grid.
			const fallbackWidth = Math.max(1, Math.min(tile.widthUnit, columnCount));
			const fallbackHeight = columnCount === 1 ? 1 : tile.heightUnit;
			const { column, row } = grid.findFirstAvailablePosition(
				fallbackWidth,
				fallbackHeight,
			);

			grid.markOccupied(column, row, fallbackWidth, fallbackHeight);
			outputTiles.push({
				x: column,
				y: row,
				widthUnit: fallbackWidth as 1 | 2,
				heightUnit: fallbackHeight as 1 | 2,
				tile,
			});
		}
	}

	compactNewTilesLeft(outputTiles, existingTiles.length, grid);

	return outputTiles;
}

// ---------------------------------------------------------------------------
// Public API — packAppendGeneric
// ---------------------------------------------------------------------------

/**
 * A generic variant of {@link packAppend} for non-image tile types such as
 * loading skeletons or placeholder cards.
 *
 * Unlike `packAppend`, this function:
 * - Does **not** apply size-variant degradation — tiles always use their
 *   declared dimensions.
 * - Does **not** run a compaction pass — positions are therefore stable and
 *   predictable, which matters for skeleton screens.
 *
 * @param existingTiles - Previously placed generic tiles (positions are frozen).
 * @param incomingTiles - New generic tiles to place.
 * @param columnCount   - Number of columns in the grid.
 * @returns A new array containing all existing and newly placed generic tiles.
 */
export function packAppendGeneric<
	TileData extends { widthUnit: 1 | 2; heightUnit: 1 | 2 },
>(
	existingTiles: PlacedGeneric<TileData>[],
	incomingTiles: TileData[],
	columnCount: number,
): PlacedGeneric<TileData>[] {
	const grid = new OccupancyGrid(columnCount);
	const outputTiles: PlacedGeneric<TileData>[] = [...existingTiles];

	for (const existingTile of existingTiles) {
		grid.markOccupied(
			existingTile.x,
			existingTile.y,
			existingTile.width,
			existingTile.height,
		);
	}

	for (const incomingTile of incomingTiles) {
		const effectiveWidth = Math.max(
			1,
			Math.min(incomingTile.widthUnit, columnCount),
		);
		const effectiveHeight = columnCount === 1 ? 1 : incomingTile.heightUnit;
		const { column, row } = grid.findFirstAvailablePosition(
			effectiveWidth,
			effectiveHeight,
		);

		grid.markOccupied(column, row, effectiveWidth, effectiveHeight);
		outputTiles.push({
			x: column,
			y: row,
			width: effectiveWidth,
			height: effectiveHeight,
			tile: incomingTile,
		});
	}

	return outputTiles;
}

// ---------------------------------------------------------------------------
// React hook — useBento
// ---------------------------------------------------------------------------

/**
 * Responsive bento-grid hook that tracks the current column count and runs
 * the packing algorithm whenever the tile list or column count changes.
 *
 * **Column breakpoints:**
 * | Window width    | Columns |
 * |-----------------|---------|
 * | < 640 px        | 1       |
 * | 640 – 1 199 px  | 2       |
 * | ≥ 1 200 px      | 3       |
 *
 * Resize events are debounced with `requestAnimationFrame` to prevent layout
 * thrashing during continuous window resizing.
 *
 * @param tiles - The full, ordered list of tiles to display.
 * @returns `{ cols, placed }` where `cols` is the current column count and
 *          `placed` is the packed tile array ready for pixel conversion.
 */
export function useBento(tiles: Tile[]): {
	cols: number;
	placed: PlacedTile[];
} {
	const [columnCount, setColumnCount] = useState<number>(3);

	useEffect(() => {
		/**
		 * Pure function — maps a pixel width to the desired column count.
		 * Extracted so it can be unit-tested independently of the DOM.
		 */
		const computeColumnCount = (windowWidth: number): number => {
			if (windowWidth < 640) return 1;
			if (windowWidth < 1_200) return 2;
			return 3;
		};

		let pendingAnimationFrame = 0;

		const handleResize = (): void => {
			if (pendingAnimationFrame) cancelAnimationFrame(pendingAnimationFrame);
			pendingAnimationFrame = requestAnimationFrame(() => {
				const nextColumnCount = computeColumnCount(window.innerWidth);
				// Functional updater avoids a stale closure on `columnCount`.
				setColumnCount((previousColumnCount) =>
					previousColumnCount === nextColumnCount
						? previousColumnCount
						: nextColumnCount,
				);
			});
		};

		// Set the initial value synchronously on mount.
		handleResize();

		window.addEventListener("resize", handleResize, { passive: true });
		window.addEventListener("orientationchange", handleResize, {
			passive: true,
		});

		return () => {
			cancelAnimationFrame(pendingAnimationFrame);
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleResize);
		};
	}, []); // Empty dependency array — listeners are registered only once.

	/**
	 * Re-pack only when `tiles` or `columnCount` changes.
	 * Passing `[]` as `existingTiles` causes a full re-pack from scratch, which
	 * is correct because a column-count change invalidates all prior positions.
	 */
	const placedTiles = useMemo<PlacedTile[]>(
		() => packAppend([], tiles, columnCount),
		[tiles, columnCount],
	);

	return { cols: columnCount, placed: placedTiles };
}
