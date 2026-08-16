import type React from "react";

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

/**
 * A single bento grid tile backed by an image asset.
 * The `widthUnit` and `heightUnit` fields describe how many grid cells the tile
 * spans horizontally and vertically respectively — either a single cell (1) or
 * a double-wide/tall cell (2).
 */
export interface Tile {
	id: string;
	widthUnit: 1 | 2;
	heightUnit: 1 | 2;
	createdAt?: string;
	cover: {
		path: string;
		width: number;
		height: number;
		alt: string;
	};
}

/**
 * A {@link Tile} that has been assigned a concrete position inside the bento
 * grid.  Coordinates are in grid-unit space (not pixels); use {@link toPixels}
 * to convert them for rendering.
 */
export interface PlacedTile {
	/** Zero-based column index of the tile's left edge. */
	x: number;
	/** Zero-based row index of the tile's top edge. */
	y: number;
	/** Resolved column span (may differ from `tile.widthUnit` after size degradation). */
	widthUnit: 1 | 2;
	/** Resolved row span (may differ from `tile.heightUnit` after size degradation). */
	heightUnit: 1 | 2;
	/** The original tile data. */
	tile: Tile;
}

/**
 * A generic placed tile that wraps any tile-like object with its resolved
 * position and span inside the bento grid.  Used by {@link packAppendGeneric}
 * for non-image tiles such as loading skeletons or placeholder cards.
 */
export interface PlacedGeneric<
	TileData extends { widthUnit: 1 | 2; heightUnit: 1 | 2 },
> {
	/** Zero-based column index of the tile's left edge. */
	x: number;
	/** Zero-based row index of the tile's top edge. */
	y: number;
	/** Number of columns this tile occupies. */
	width: number;
	/** Number of rows this tile occupies. */
	height: number;
	/** The original tile data. */
	tile: TileData;
}

// ---------------------------------------------------------------------------
// Pixel-rendering types
// ---------------------------------------------------------------------------

/**
 * A tile enriched with absolute pixel-position styles, ready to be rendered
 * inside an `position: relative` container.
 */
export interface PixelNode {
	/** Stable key forwarded from {@link Tile.id}. */
	key: string;
	/** The original tile data. */
	tile: Tile;
	/**
	 * Inline styles that position and size the tile absolutely within its
	 * container.  All numeric values are in pixels.
	 */
	style: React.CSSProperties;
}

/**
 * The return value of {@link toPixels}: a list of render-ready nodes and the
 * total pixel height needed by the grid container.
 */
export interface PixelLayout {
	/** Render-ready nodes with absolute positioning styles. */
	nodes: PixelNode[];
	/**
	 * Total pixel height of the grid container, derived from the lowest-placed
	 * tile.  Set `height: containerHeight` on the wrapping element.
	 */
	containerHeight: number;
}

// ---------------------------------------------------------------------------
// Packing types
// ---------------------------------------------------------------------------

/**
 * Strategy hint for callers that support multiple packing modes.
 *
 * - `"recency"` — prioritise showing the newest tiles at the top, even if
 *   that leaves gaps.
 * - `"fit"` — prioritise a compact layout, allowing older tiles to float
 *   upward to fill holes left by large items.
 */
export type PackStrategy = "recency" | "fit";
