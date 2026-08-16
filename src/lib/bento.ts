import type {
	PixelLayout,
	PixelNode,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

export type { PackStrategy, PlacedGeneric } from "@/types/feed/bento";
export type { PixelLayout, PixelNode, PlacedTile, Tile };

/**
 * Assigns a shape using aspect ratio only:
 * - landscape images become 2x1;
 * - portrait images become 1x2;
 * - square/near-square images stay 1x1.
 *
 * Pixel resolution deliberately does not promote square images to 2x2.
 */
export function bucketFromDimensions(
	imageWidth: number,
	imageHeight: number,
): { widthUnit: 1 | 2; heightUnit: 1 | 2 } {
	if (imageWidth <= 0 || imageHeight <= 0) {
		return { widthUnit: 1, heightUnit: 1 };
	}

	const aspectRatio = imageWidth / imageHeight;

	if (aspectRatio >= 1.3) {
		return { widthUnit: 2, heightUnit: 1 };
	}

	if (aspectRatio <= 1 / 1.3) {
		return { widthUnit: 1, heightUnit: 2 };
	}

	return { widthUnit: 1, heightUnit: 1 };
}

export function toPixels(
	placedTiles: PlacedTile[],
	cellSize: number,
	gapSize: number,
): PixelLayout {
	const toOffsetPx = (gridIndex: number): number =>
		gridIndex * (cellSize + gapSize);
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

	const totalRows =
		placedTiles.length > 0
			? Math.max(
				...placedTiles.map(
					(placedTile) => placedTile.y + placedTile.heightUnit,
				),
			)
			: 0;
	const containerHeight = totalRows > 0 ? toSpanPx(totalRows) : 0;

	return { nodes, containerHeight };
}