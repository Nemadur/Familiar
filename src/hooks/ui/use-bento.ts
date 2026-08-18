import {
	useEffect,
	useMemo,
	useState,
} from "react";
import { bucketFromDimensions } from "@/lib/bento";
import type {
	PackStrategy,
	PlacedGeneric,
	PlacedTile,
	Tile,
	TileHeightUnit,
	TileWidthUnit,
} from "@/types/feed/bento";

export type {
	PackStrategy,
	PlacedGeneric,
	PlacedTile,
	Tile,
};

export { bucketFromDimensions };

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

interface PlacementCandidate
	extends IndexedTile,
	GridPosition {
	width: TileWidthUnit;
	height: TileHeightUnit;
}

type HorizontalPreference =
	| "left"
	| "right";

const MAX_COLUMN_COUNT = 4;

/**
 * Maximum number of nearby posts considered when balancing the grid.
 */
const BALANCED_LOOKAHEAD = 6;

/**
 * Only posts published within this period may switch places because of their
 * dimensions. Older posts cannot jump ahead solely to fill a hole.
 */
const BALANCED_DATE_WINDOW_MS =
	3 * 24 * 60 * 60 * 1000;

class OccupancyGrid {
	private readonly cells: boolean[][] =
		[];

	constructor(
		private readonly columnCount: number,
	) { }

	private ensureRow(
		rowIndex: number,
	): boolean[] {
		if (!this.cells[rowIndex]) {
			this.cells[rowIndex] =
				new Array<boolean>(
					this.columnCount,
				).fill(false);
		}

		return this.cells[rowIndex];
	}

	markOccupied(
		startColumn: number,
		startRow: number,
		width: number,
		height: number,
	): void {
		for (
			let y = 0;
			y < height;
			y += 1
		) {
			const row = this.ensureRow(
				startRow + y,
			);

			for (
				let x = 0;
				x < width;
				x += 1
			) {
				row[startColumn + x] =
					true;
			}
		}
	}

	isEmpty(): boolean {
		return !this.cells.some((row) =>
			row.some((occupied) => occupied),
		);
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
			startColumn + width >
			this.columnCount
		) {
			return false;
		}

		for (
			let y = 0;
			y < height;
			y += 1
		) {
			const row = this.ensureRow(
				startRow + y,
			);

			for (
				let x = 0;
				x < width;
				x += 1
			) {
				if (
					row[startColumn + x]
				) {
					return false;
				}
			}
		}

		return true;
	}

	findFirstAvailablePosition(
		width: number,
		height: number,
		horizontalPreference: HorizontalPreference = "left",
	): GridPosition {
		for (
			let row = 0;
			;
			row += 1
		) {
			const maximumColumn =
				this.columnCount - width;

			if (
				horizontalPreference ===
				"right"
			) {
				for (
					let column =
						maximumColumn;
					column >= 0;
					column -= 1
				) {
					if (
						this.isRegionFree(
							column,
							row,
							width,
							height,
						)
					) {
						return {
							column,
							row,
						};
					}
				}
			} else {
				for (
					let column = 0;
					column <=
					maximumColumn;
					column += 1
				) {
					if (
						this.isRegionFree(
							column,
							row,
							width,
							height,
						)
					) {
						return {
							column,
							row,
						};
					}
				}
			}
		}
	}
}

/**
 * Supports tile.createdAt and tile.post.createdAt.
 */
function getCreatedAt(
	tile: Tile,
): number {
	const datedTile = tile as Tile & {
		createdAt?: string | null;
		post?: {
			createdAt?: string | null;
		};
	};

	const value =
		datedTile.createdAt ??
		datedTile.post?.createdAt;

	const timestamp = value
		? Date.parse(value)
		: Number.NaN;

	return Number.isFinite(timestamp)
		? timestamp
		: Number.NEGATIVE_INFINITY;
}

function getEffectiveSize(
	tile: Tile,
	columnCount: number,
): EffectiveSize {
	if (columnCount === 1) {
		return {
			width: 1,
			height: 1,
		};
	}

	return {
		width: Math.min(
			tile.widthUnit,
			columnCount,
		) as TileWidthUnit,
		height: tile.heightUnit,
	};
}

function sortIndexedTilesNewestFirst(
	tiles: IndexedTile[],
): IndexedTile[] {
	return [...tiles].sort((a, b) => {
		if (
			a.createdAt !== b.createdAt
		) {
			return (
				b.createdAt -
				a.createdAt
			);
		}

		return (
			a.inputIndex -
			b.inputIndex
		);
	});
}

function getHorizontalPreference(
	strategy: PackStrategy,
	width: TileWidthUnit,
	height: TileHeightUnit,
	grid: OccupancyGrid,
): HorizontalPreference {
	/*
	 * A single tile, or the first tile, always starts on the left.
	 *
	 * Large portraits prefer the right only when earlier tiles already
	 * occupy part of the grid.
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

/**
 * Returns recent candidates that may switch positions with the newest
 * remaining post.
 */
function getBalancedCandidatePool(
	remainingTiles: IndexedTile[],
): IndexedTile[] {
	const candidates =
		remainingTiles.slice(
			0,
			BALANCED_LOOKAHEAD,
		);

	const newestTimestamp =
		remainingTiles[0]?.createdAt;

	if (
		newestTimestamp === undefined ||
		!Number.isFinite(
			newestTimestamp,
		)
	) {
		return candidates.slice(0, 1);
	}

	const nearbyCandidates =
		candidates.filter(
			(candidate, index) => {
				if (index === 0) {
					return true;
				}

				if (
					!Number.isFinite(
						candidate.createdAt,
					)
				) {
					return false;
				}

				return (
					newestTimestamp -
					candidate.createdAt <=
					BALANCED_DATE_WINDOW_MS
				);
			},
		);

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
	const { width, height } =
		getEffectiveSize(
			indexedTile.tile,
			columnCount,
		);

	const horizontalPreference =
	getHorizontalPreference(
		strategy,
		width,
		height,
		grid,
	);

	return {
		...indexedTile,
		...grid.findFirstAvailablePosition(
			width,
			height,
			horizontalPreference,
		),
		width,
		height,
	};
}

function isEarlierPosition(
	candidate: PlacementCandidate,
	best: PlacementCandidate,
): boolean {
	if (candidate.row !== best.row) {
		return (
			candidate.row < best.row
		);
	}

	if (
		candidate.column !==
		best.column
	) {
		return (
			candidate.column <
			best.column
		);
	}

	return false;
}

function isSamePosition(
	candidate: PlacementCandidate,
	best: PlacementCandidate,
): boolean {
	return (
		candidate.row === best.row &&
		candidate.column ===
		best.column
	);
}

function isTallCandidate(
	candidate: PlacementCandidate,
): boolean {
	return candidate.height > 1;
}

/**
 * Selects the preferred shape when two candidates can occupy the same
 * starting position.
 *
 * Priority:
 * 1. Short tiles before tall tiles.
 * 2. Wider short tiles before narrow short tiles.
 * 3. Smaller tall tiles before larger tall tiles.
 * 4. Newer publication date.
 * 5. Original input order.
 */
function isBetterBalancedShape(
	candidate: PlacementCandidate,
	best: PlacementCandidate,
): boolean {
	const candidateIsTall =
		isTallCandidate(candidate);

	const bestIsTall =
		isTallCandidate(best);

	/*
	 * Keep 1x2 and 2x3 cards behind short cards.
	 */
	if (
		candidateIsTall !== bestIsTall
	) {
		return !candidateIsTall;
	}

	/*
	 * Prefer a 2x1 over a 1x1. The wider tile completes a row segment and
	 * avoids leaving a single unusable cell.
	 */
	if (
		!candidateIsTall &&
		!bestIsTall &&
		candidate.width !== best.width
	) {
		return (
			candidate.width >
			best.width
		);
	}

	const candidateArea =
		candidate.width *
		candidate.height;

	const bestArea =
		best.width * best.height;

	/*
	 * When both cards are tall, prefer the smaller footprint.
	 */
	if (
		candidateIsTall &&
		bestIsTall &&
		candidateArea !== bestArea
	) {
		return (
			candidateArea < bestArea
		);
	}

	if (
		candidate.createdAt !==
		best.createdAt
	) {
		return (
			candidate.createdAt >
			best.createdAt
		);
	}

	return (
		candidate.inputIndex <
		best.inputIndex
	);
}

function chooseBalancedCandidate(
	candidates: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
): PlacementCandidate {
	let best:
		| PlacementCandidate
		| undefined;

	for (const indexedTile of candidates) {
		const candidate =
			createCandidate(
				indexedTile,
				columnCount,
				grid,
				"balanced",
			);

		if (!best) {
			best = candidate;
			continue;
		}

		if (
			isEarlierPosition(
				candidate,
				best,
			)
		) {
			best = candidate;
			continue;
		}

		if (
			isSamePosition(
				candidate,
				best,
			) &&
			isBetterBalancedShape(
				candidate,
				best,
			)
		) {
			best = candidate;
		}
	}

	if (!best) {
		throw new Error(
			"Cannot choose a tile from an empty collection",
		);
	}

	return best;
}

function chooseFitCandidate(
	remainingTiles: IndexedTile[],
	columnCount: number,
	grid: OccupancyGrid,
): PlacementCandidate {
	let best:
		| PlacementCandidate
		| undefined;

	for (const indexedTile of remainingTiles) {
		const candidate =
			createCandidate(
				indexedTile,
				columnCount,
				grid,
				"fit",
			);

		if (!best) {
			best = candidate;
			continue;
		}

		const candidateArea =
			candidate.width *
			candidate.height;

		const bestArea =
			best.width * best.height;

		const candidateIsBetter =
			isEarlierPosition(
				candidate,
				best,
			) ||
			(isSamePosition(
				candidate,
				best,
			) &&
				candidateArea >
				bestArea) ||
			(isSamePosition(
				candidate,
				best,
			) &&
				candidateArea ===
				bestArea &&
				candidate.createdAt >
				best.createdAt) ||
			(isSamePosition(
				candidate,
				best,
			) &&
				candidateArea ===
				bestArea &&
				candidate.createdAt ===
				best.createdAt &&
				candidate.inputIndex <
				best.inputIndex);

		if (candidateIsBetter) {
			best = candidate;
		}
	}

	if (!best) {
		throw new Error(
			"Cannot choose a tile from an empty collection",
		);
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
		throw new Error(
			"Cannot choose a tile from an empty collection",
		);
	}

	if (strategy === "recency") {
		return createCandidate(
			remainingTiles[0],
			columnCount,
			grid,
			"recency",
		);
	}

	if (strategy === "balanced") {
		const candidates =
			getBalancedCandidatePool(
				remainingTiles,
			);

		return chooseBalancedCandidate(
			candidates,
			columnCount,
			grid,
		);
	}

	return chooseFitCandidate(
		remainingTiles,
		columnCount,
		grid,
	);
}

/**
 * Packs incoming tiles around existing tiles.
 *
 * recency:
 * Uses exact publication order.
 *
 * balanced:
 * Allows nearby posts to switch position to improve the layout. Short 2x1
 * tiles fill row segments before 1x1 tiles, while large 2x3 posts move toward
 * the lower-right.
 *
 * fit:
 * Searches every remaining tile and maximizes density.
 */
export function packAppend(
	existingTiles: PlacedTile[],
	incomingTiles: Tile[],
	columnCount: number,
	strategy: PackStrategy = "balanced",
): PlacedTile[] {
	const safeColumnCount = Math.max(
		1,
		Math.min(
			columnCount,
			MAX_COLUMN_COUNT,
		),
	);

	const grid = new OccupancyGrid(
		safeColumnCount,
	);

	const outputTiles =
		existingTiles.map(
			(placedTile) => ({
				...placedTile,
				tile: {
					...placedTile.tile,
				},
			}),
		);

	for (const placedTile of outputTiles) {
		grid.markOccupied(
			placedTile.x,
			placedTile.y,
			placedTile.widthUnit,
			placedTile.heightUnit,
		);
	}

	const indexedIncomingTiles =
		incomingTiles.map(
			(tile, inputIndex) => ({
				tile,
				inputIndex,
				createdAt:
					getCreatedAt(tile),
			}),
		);

	const remainingTiles =
		sortIndexedTilesNewestFirst(
			indexedIncomingTiles,
		);

	while (
		remainingTiles.length > 0
	) {
		const next = chooseNextTile(
			remainingTiles,
			safeColumnCount,
			grid,
			strategy,
		);

		grid.markOccupied(
			next.column,
			next.row,
			next.width,
			next.height,
		);

		outputTiles.push({
			x: next.column,
			y: next.row,
			widthUnit: next.width,
			heightUnit: next.height,
			tile: {
				...next.tile,
			},
		});

		const selectedIndex =
			remainingTiles.findIndex(
				(item) =>
					item.inputIndex ===
					next.inputIndex,
			);

		if (selectedIndex >= 0) {
			remainingTiles.splice(
				selectedIndex,
				1,
			);
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
	const safeColumnCount = Math.max(
		1,
		Math.min(
			columnCount,
			MAX_COLUMN_COUNT,
		),
	);

	const grid = new OccupancyGrid(
		safeColumnCount,
	);

	const outputTiles = [
		...existingTiles,
	];

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
				: Math.min(
					tile.widthUnit,
					safeColumnCount,
				) as TileWidthUnit;

		const height =
			safeColumnCount === 1
				? 1
				: tile.heightUnit;

		const { column, row } =
			grid.findFirstAvailablePosition(
				width,
				height,
			);

		grid.markOccupied(
			column,
			row,
			width,
			height,
		);

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

export function useBento(
	tiles: Tile[],
	strategy: PackStrategy = "balanced",
): {
	cols: number;
	placed: PlacedTile[];
} {
	const [
		columnCount,
		setColumnCount,
	] = useState(4);

	useEffect(() => {
		const computeColumnCount = (
			windowWidth: number,
		): number => {
			if (windowWidth < 640) {
				return 1;
			}

			if (windowWidth < 900) {
				return 2;
			}

			if (windowWidth < 1_200) {
				return 3;
			}

			return 4;
		};

		let pendingAnimationFrame = 0;

		const handleResize = (): void => {
			cancelAnimationFrame(
				pendingAnimationFrame,
			);

			pendingAnimationFrame =
				requestAnimationFrame(
					() => {
						setColumnCount(
							computeColumnCount(
								window.innerWidth,
							),
						);
					},
				);
		};

		handleResize();

		window.addEventListener(
			"resize",
			handleResize,
			{ passive: true },
		);

		window.addEventListener(
			"orientationchange",
			handleResize,
			{ passive: true },
		);

		return () => {
			cancelAnimationFrame(
				pendingAnimationFrame,
			);

			window.removeEventListener(
				"resize",
				handleResize,
			);

			window.removeEventListener(
				"orientationchange",
				handleResize,
			);
		};
	}, []);

	const placedTiles = useMemo(
		() =>
			packAppend(
				[],
				tiles,
				columnCount,
				strategy,
			),
		[
			tiles,
			columnCount,
			strategy,
		],
	);

	return {
		cols: columnCount,
		placed: placedTiles,
	};
}