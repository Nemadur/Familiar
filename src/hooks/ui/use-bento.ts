import { useEffect, useMemo, useState } from "react";
import { bucketFromDimensions } from "@/lib/bento";
import type {
	PackStrategy,
	PlacedGeneric,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

export type { PackStrategy, PlacedGeneric, PlacedTile, Tile };
export { bucketFromDimensions };

type GridPosition = { column: number; row: number };

class OccupancyGrid {
	private readonly cells: boolean[][] = [];

	constructor(private readonly columnCount: number) { }

	private ensureRow(rowIndex: number): boolean[] {
		if (!this.cells[rowIndex]) {
			this.cells[rowIndex] = new Array<boolean>(this.columnCount).fill(false);
		}
		return this.cells[rowIndex];
	}

	markOccupied(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): void {
		for (let y = 0; y < height; y++) {
			const row = this.ensureRow(startRow + y);
			for (let x = 0; x < width; x++) row[startColumn + x] = true;
		}
	}

	isRegionFree(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): boolean {
		for (let y = 0; y < height; y++) {
			const row = this.ensureRow(startRow + y);
			for (let x = 0; x < width; x++) {
				if (row[startColumn + x]) return false;
			}
		}
		return true;
	}

	findFirstAvailablePosition(width: number, height: number): GridPosition {
		for (let row = 0; ; row++) {
			for (let column = 0; column <= this.columnCount - width; column++) {
				if (this.isRegionFree(column, row, width, height)) {
					return { column, row };
				}
			}
		}
	}
}

type IndexedTile = {
	tile: Tile;
	inputIndex: number;
	createdAt: number;
};

type PlacementCandidate = IndexedTile &
	GridPosition & {
		width: 1 | 2;
		height: 1 | 2;
	};

/** Supports either tile.createdAt or tile.post.createdAt. */
function getCreatedAt(tile: Tile): number {
	const datedTile = tile as Tile & {
		createdAt?: string | null;
		post?: { createdAt?: string | null };
	};
	const value = datedTile.createdAt ?? datedTile.post?.createdAt;
	const timestamp = value ? Date.parse(value) : Number.NaN;
	return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function getEffectiveSize(
	tile: Tile,
	columnCount: number,
): { width: 1 | 2; height: 1 | 2 } {
	return {
		width: Math.min(tile.widthUnit, columnCount) as 1 | 2,
		height: columnCount === 1 ? 1 : tile.heightUnit,
	};
}

/**
 * Chooses the tile that fits the earliest free position. A small tile can move
 * ahead of a wide/tall tile to close an internal gap. At an equal position,
 * larger tiles win; createdAt (newest first) is the stable tie-breaker.
 */
function chooseNextTile(
	remainingTiles: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
): PlacementCandidate {
	let best: PlacementCandidate | undefined;

	for (const indexedTile of remainingTiles) {
		const { width, height } = getEffectiveSize(indexedTile.tile, columnCount);
		const candidate: PlacementCandidate = {
			...indexedTile,
			...grid.findFirstAvailablePosition(width, height),
			width,
			height,
		};

		if (!best) {
			best = candidate;
			continue;
		}

		const candidateArea = candidate.width * candidate.height;
		const bestArea = best.width * best.height;
		const isBetter =
			candidate.row < best.row ||
			(candidate.row === best.row && candidate.column < best.column) ||
			(candidate.row === best.row &&
				candidate.column === best.column &&
				candidateArea > bestArea) ||
			(candidate.row === best.row &&
				candidate.column === best.column &&
				candidateArea === bestArea &&
				candidate.createdAt > best.createdAt) ||
			(candidate.row === best.row &&
				candidate.column === best.column &&
				candidateArea === bestArea &&
				candidate.createdAt === best.createdAt &&
				candidate.inputIndex < best.inputIndex);

		if (isBetter) best = candidate;
	}

	if (!best) throw new Error("Cannot choose a tile from an empty collection");
	return best;
}

/**
 * Dense packing that preserves every image's bucketed dimensions. It never
 * degrades a 2x1/1x2 tile to 1x1 and never expands a tile into a leftover gap.
 */
export function packAppend(
	existingTiles: PlacedTile[],
	incomingTiles: Tile[],
	columnCount: number,
): PlacedTile[] {
	const safeColumnCount = Math.max(1, Math.min(columnCount, 4));
	const grid = new OccupancyGrid(safeColumnCount);
	const outputTiles = existingTiles.map((placedTile) => ({
		...placedTile,
		tile: { ...placedTile.tile },
	}));

	for (const placedTile of outputTiles) {
		grid.markOccupied(
			placedTile.x,
			placedTile.y,
			placedTile.widthUnit,
			placedTile.heightUnit,
		);
	}

	const remainingTiles: IndexedTile[] = incomingTiles.map((tile, inputIndex) => ({
		tile,
		inputIndex,
		createdAt: getCreatedAt(tile),
	}));

	while (remainingTiles.length > 0) {
		const next = chooseNextTile(remainingTiles, safeColumnCount, grid);
		grid.markOccupied(next.column, next.row, next.width, next.height);
		outputTiles.push({
			x: next.column,
			y: next.row,
			widthUnit: next.width,
			heightUnit: next.height,
			tile: { ...next.tile },
		});

		const selectedIndex = remainingTiles.findIndex(
			(item) => item.inputIndex === next.inputIndex,
		);
		remainingTiles.splice(selectedIndex, 1);
	}

	return outputTiles;
}

export function packAppendGeneric<
	TileData extends { widthUnit: 1 | 2; heightUnit: 1 | 2 },
>(
	existingTiles: PlacedGeneric<TileData>[],
	incomingTiles: TileData[],
	columnCount: number,
): PlacedGeneric<TileData>[] {
	const safeColumnCount = Math.max(1, Math.min(columnCount, 4));
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
		const width = Math.min(tile.widthUnit, safeColumnCount) as 1 | 2;
		const height = safeColumnCount === 1 ? 1 : tile.heightUnit;
		const { column, row } = grid.findFirstAvailablePosition(width, height);
		grid.markOccupied(column, row, width, height);
		outputTiles.push({ x: column, y: row, width, height, tile });
	}

	return outputTiles;
}

export function useBento(tiles: Tile[]): {
	cols: number;
	placed: PlacedTile[];
} {
	const [columnCount, setColumnCount] = useState(4);

	useEffect(() => {
		const computeColumnCount = (windowWidth: number): number => {
			if (windowWidth < 640) return 1;
			if (windowWidth < 900) return 2;
			if (windowWidth < 1_200) return 3;
			return 4;
		};
		let pendingAnimationFrame = 0;

		const handleResize = (): void => {
			cancelAnimationFrame(pendingAnimationFrame);
			pendingAnimationFrame = requestAnimationFrame(() => {
				setColumnCount(computeColumnCount(window.innerWidth));
			});
		};

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
	}, []);

	const placedTiles = useMemo(
		() => packAppend([], tiles, columnCount),
		[tiles, columnCount],
	);

	return { cols: columnCount, placed: placedTiles };
}