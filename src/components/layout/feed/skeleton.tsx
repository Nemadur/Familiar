import { useMemo } from "react";
import { useBento } from "@/hooks/use-bento";
import type { Tile } from "@/types/post";

type SkelTile = { id: string; w: 1 | 2; h: 1 | 2; x: number; y: number };

// Generate 3-row grid patterns based on column count
function generateSkeletonPresets(cols: number): SkelTile[][] {
	const _maxWidth = Math.min(cols, 2); // Max width for tiles

	return [
		// Pattern 1: Balanced layout
		[
			{ id: "a", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 0 },
			...(cols > 2 ? [{ id: "b", w: 1, h: 1, x: 2, y: 0 }] : []),
			...(cols > 3 ? [{ id: "c", w: 1, h: 1, x: 3, y: 0 }] : []),
			{ id: "d", w: 1, h: 2, x: 0, y: 1 },
			...(cols > 1 ? [{ id: "e", w: 1, h: 1, x: 1, y: 1 }] : []),
			...(cols > 2
				? [{ id: "f", w: Math.min(2, cols - 2) as 1 | 2, h: 1, x: 2, y: 1 }]
				: []),
			{ id: "g", w: 1, h: 1, x: 0, y: 2 },
			...(cols > 1 ? [{ id: "h", w: 1, h: 1, x: 1, y: 2 }] : []),
			...(cols > 2 ? [{ id: "i", w: 1, h: 1, x: 2, y: 2 }] : []),
			...(cols > 3 ? [{ id: "j", w: 1, h: 1, x: 3, y: 2 }] : []),
		].filter(Boolean) as SkelTile[],

		// Pattern 2: Large featured items
		[
			{ id: "a", w: Math.min(2, cols) as 1 | 2, h: 2, x: 0, y: 0 },
			...(cols > 2 ? [{ id: "b", w: 1, h: 1, x: 2, y: 0 }] : []),
			...(cols > 3 ? [{ id: "c", w: 1, h: 1, x: 3, y: 0 }] : []),
			...(cols > 2 ? [{ id: "d", w: 1, h: 1, x: 2, y: 1 }] : []),
			...(cols > 3 ? [{ id: "e", w: 1, h: 1, x: 3, y: 1 }] : []),
			{ id: "f", w: 1, h: 1, x: 0, y: 2 },
			...(cols > 1 ? [{ id: "g", w: 1, h: 1, x: 1, y: 2 }] : []),
			...(cols > 2 ? [{ id: "h", w: 1, h: 1, x: 2, y: 2 }] : []),
			...(cols > 3 ? [{ id: "i", w: 1, h: 1, x: 3, y: 2 }] : []),
		].filter(Boolean) as SkelTile[],

		// Pattern 3: Grid-like layout
		[
			{ id: "a", w: 1, h: 1, x: 0, y: 0 },
			...(cols > 1 ? [{ id: "b", w: 1, h: 1, x: 1, y: 0 }] : []),
			...(cols > 2 ? [{ id: "c", w: 1, h: 1, x: 2, y: 0 }] : []),
			...(cols > 3 ? [{ id: "d", w: 1, h: 1, x: 3, y: 0 }] : []),
			{ id: "e", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 1 },
			...(cols > 2 ? [{ id: "f", w: 1, h: 1, x: 2, y: 1 }] : []),
			...(cols > 3 ? [{ id: "g", w: 1, h: 1, x: 3, y: 1 }] : []),
			{ id: "h", w: 1, h: 1, x: 0, y: 2 },
			...(cols > 1 ? [{ id: "i", w: 1, h: 1, x: 1, y: 2 }] : []),
			...(cols > 2 ? [{ id: "j", w: 1, h: 1, x: 2, y: 2 }] : []),
			...(cols > 3 ? [{ id: "k", w: 1, h: 1, x: 3, y: 2 }] : []),
		].filter(Boolean) as SkelTile[],

		// Pattern 4: Mixed sizes
		[
			{ id: "a", w: 1, h: 2, x: 0, y: 0 },
			...(cols > 1 ? [{ id: "b", w: 1, h: 1, x: 1, y: 0 }] : []),
			...(cols > 2 ? [{ id: "c", w: 1, h: 1, x: 2, y: 0 }] : []),
			...(cols > 3 ? [{ id: "d", w: 1, h: 1, x: 3, y: 0 }] : []),
			...(cols > 1 ? [{ id: "e", w: 1, h: 1, x: 1, y: 1 }] : []),
			...(cols > 2 ? [{ id: "f", w: 1, h: 1, x: 2, y: 1 }] : []),
			...(cols > 3 ? [{ id: "g", w: 1, h: 1, x: 3, y: 1 }] : []),
			{ id: "h", w: Math.min(2, cols) as 1 | 2, h: 1, x: 0, y: 2 },
			...(cols > 2 ? [{ id: "i", w: 1, h: 1, x: 2, y: 2 }] : []),
			...(cols > 3 ? [{ id: "j", w: 1, h: 1, x: 3, y: 2 }] : []),
		].filter(Boolean) as SkelTile[],

		// Pattern 5: Vertical emphasis
		[
			{ id: "a", w: 1, h: 1, x: 0, y: 0 },
			...(cols > 1 ? [{ id: "b", w: 1, h: 2, x: 1, y: 0 }] : []),
			...(cols > 2 ? [{ id: "c", w: 1, h: 1, x: 2, y: 0 }] : []),
			...(cols > 3 ? [{ id: "d", w: 1, h: 1, x: 3, y: 0 }] : []),
			{ id: "e", w: 1, h: 1, x: 0, y: 1 },
			...(cols > 2 ? [{ id: "f", w: 1, h: 1, x: 2, y: 1 }] : []),
			...(cols > 3 ? [{ id: "g", w: 1, h: 1, x: 3, y: 1 }] : []),
			{ id: "h", w: 1, h: 1, x: 0, y: 2 },
			...(cols > 1 ? [{ id: "i", w: 1, h: 1, x: 1, y: 2 }] : []),
			...(cols > 2 ? [{ id: "j", w: 1, h: 1, x: 2, y: 2 }] : []),
			...(cols > 3 ? [{ id: "k", w: 1, h: 1, x: 3, y: 2 }] : []),
		].filter(Boolean) as SkelTile[],
	];
}

export function BentoSkeleton({
	cols = 3,
	containerWidth = 896,
	gap = 12,
	count = 6,
}: {
	cols?: number;
	containerWidth?: number;
	gap?: number;
	count?: number;
}) {
	// Generate skeleton tiles (deterministic for SSR)
	const skeletonTiles = useMemo<Tile[]>(() => {
		const presets = generateSkeletonPresets(cols);
		// Use cols as seed for deterministic selection instead of Math.random()
		const selectedPreset = presets[cols % presets.length];

		return selectedPreset.slice(0, count).map((tile) => ({
			id: tile.id,
			w: tile.w,
			h: tile.h,
			cover: {
				path: "",
				width: 400,
				height: 400,
				alt: "",
			},
		}));
	}, [cols, count]);

	// Use bento layout for skeleton
	const { placed } = useBento(skeletonTiles);

	const cell =
		cols > 0 ? Math.floor((containerWidth - (cols - 1) * gap) / cols) : 0;
	const rows = placed.length ? Math.max(...placed.map((p) => p.y + p.h)) : 0;
	const containerHeight =
		rows > 0 ? rows * cell + (rows - 1) * gap : Math.max(cell, 240);

	return (
		<div className="w-full max-w-[56rem] mx-auto mt-6">
			<div
				className="relative"
				style={{ height: containerHeight, minHeight: Math.max(240, cell) }}
			>
				{placed.map((p) => {
					const top = p.y * (cell + gap);
					const left = p.x * (cell + gap);
					const width = Math.max(1, p.w * cell + (p.w - 1) * gap);
					const height = Math.max(1, p.h * cell + (p.h - 1) * gap);

					return (
						<div
							key={p.tile.id}
							className="absolute bg-muted rounded-xl animate-pulse"
							style={{
								top: `${top}px`,
								left: `${left}px`,
								width: `${width}px`,
								height: `${height}px`,
								minWidth: "160px",
								minHeight: "160px",
							}}
						/>
					);
				})}
			</div>
		</div>
	);
}

export function Loading({ containerWidth = 896 }: { containerWidth?: number }) {
	return <BentoSkeleton containerWidth={containerWidth} />;
}
