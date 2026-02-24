import type {
	PixelLayout,
	PixelNode,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

export type { Tile, PlacedTile, PixelNode, PixelLayout };
export type { PackStrategy, PlacedGeneric } from "@/types/feed/bento";

// ---------------------------------------------------------------------------
// Tile-size bucketing
// ---------------------------------------------------------------------------

/**
 * Determines the optimal tile size (1×1, 2×2, 2×1, or 1×2) based on the
 * intrinsic pixel dimensions of an image.
 *
 * Decision rules (evaluated top-to-bottom, first match wins):
 * 1. **2×2** — image is at least 1200 × 1200 px *and* nearly square
 *    (aspect ratio within ±15 % of 1.0).
 * 2. **2×1** — landscape image (aspect ratio ≥ 1.3, i.e. 30 % wider than tall).
 * 3. **1×2** — portrait image (aspect ratio ≤ 1/1.3 ≈ 0.77, i.e. 30 % taller
 *    than wide).
 * 4. **1×1** — everything else (roughly square images below the 1200 px threshold).
 *
 * @param imageWidth  - Intrinsic pixel width of the image.
 * @param imageHeight - Intrinsic pixel height of the image.
 * @returns The suggested `widthUnit` and `heightUnit` for the tile.
 */
export function bucketFromDimensions(
	imageWidth: number,
	imageHeight: number,
): { widthUnit: 1 | 2; heightUnit: 1 | 2 } {
	const aspectRatio = imageWidth / imageHeight;

	if (
		imageWidth >= 1_200 &&
		imageHeight >= 1_200 &&
		Math.abs(aspectRatio - 1) < 0.15
	) {
		return { widthUnit: 2, heightUnit: 2 };
	}

	if (aspectRatio >= 1.3) {
		return { widthUnit: 2, heightUnit: 1 };
	}

	if (aspectRatio <= 1 / 1.3) {
		return { widthUnit: 1, heightUnit: 2 };
	}

	return { widthUnit: 1, heightUnit: 1 };
}

// ---------------------------------------------------------------------------
// Pixel-position conversion
// ---------------------------------------------------------------------------

/**
 * Converts abstract grid-unit coordinates into absolute pixel positions
 * suitable for rendering tiles inside a `position: relative` container.
 *
 * Each grid cell is `cellSize` pixels wide and tall, with `gapSize` pixels of
 * space between adjacent cells.  A tile that spans two units therefore has a
 * pixel width of `2 × cellSize + 1 × gapSize` (it consumes two cells *and*
 * the gap between them).
 *
 * @param placedTiles - Tiles that have been assigned grid-unit positions.
 * @param cellSize    - Pixel size of a single 1×1 grid cell.
 * @param gapSize     - Pixel gap between adjacent cells (both axes).
 * @returns A {@link PixelLayout} containing render-ready nodes and the total
 *          container height required to display all tiles without clipping.
 */
export function toPixels(
	placedTiles: PlacedTile[],
	cellSize: number,
	gapSize: number,
): PixelLayout {
	/**
	 * Converts a grid-unit coordinate to a pixel offset from the container edge.
	 * Formula: `unitIndex × (cellSize + gapSize)` — each unit contributes one
	 * cell plus one gap, and the leading gap is absent (index 0 → 0 px).
	 */
	const toOffsetPx = (gridIndex: number): number =>
		gridIndex * (cellSize + gapSize);

	/**
	 * Converts a grid-unit span to a pixel dimension.
	 * A span of `n` units covers `n` cells and `n − 1` gaps between them.
	 */
	const toSpanPx = (gridSpan: number): number =>
		gridSpan * cellSize + (gridSpan - 1) * gapSize;

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

	// Find the maximum row index reached by any tile (bottom edge in grid units).
	const totalRows =
		placedTiles.length > 0
			? Math.max(
					...placedTiles.map(
						(placedTile) => placedTile.y + placedTile.heightUnit,
					),
				)
			: 0;

	// Convert total rows to pixels using the same span formula.
	const containerHeight = totalRows > 0 ? toSpanPx(totalRows) : 0;

	return { nodes, containerHeight };
}
