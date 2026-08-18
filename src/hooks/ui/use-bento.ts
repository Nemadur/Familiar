import {
	useEffect,
	useMemo,
	useState,
} from "react";
import { packAppend } from "@/lib/bento";
import type {
	PackStrategy,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

export type {
	PackStrategy,
	PlacedGeneric,
	PlacedTile,
	Tile,
} from "@/types/feed/bento";

function computeColumnCount(
	windowWidth: number,
): number {
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
}

export function useBento(
	tiles: Tile[],
	strategy: PackStrategy = "balanced",
): {
	cols: number;
	placed: PlacedTile[];
} {
	/*
	 * Start with four columns for SSR and hydration consistency.
	 * The effect corrects it immediately on smaller screens.
	 */
	const [columnCount, setColumnCount] =
		useState(4);

	useEffect(() => {
		let animationFrame = 0;

		const handleResize = (): void => {
			cancelAnimationFrame(
				animationFrame,
			);

			animationFrame =
				requestAnimationFrame(() => {
					setColumnCount(
						computeColumnCount(
							window.innerWidth,
						),
					);
				});
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
				animationFrame,
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

	const placed = useMemo(
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
		placed,
	};
}