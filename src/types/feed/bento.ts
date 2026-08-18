import type React from "react";

export type TileWidthUnit = 1 | 2;
export type TileHeightUnit = 1 | 2 | 3;

export interface Tile {
	id: string;
	widthUnit: TileWidthUnit;
	heightUnit: TileHeightUnit;
	createdAt?: string;
	cover: {
		path: string;
		width: number;
		height: number;
		alt: string;
	};
}

export interface PlacedTile {
	x: number;
	y: number;
	widthUnit: TileWidthUnit;
	heightUnit: TileHeightUnit;
	tile: Tile;
}

export interface PlacedGeneric<
	TileData extends {
		widthUnit: TileWidthUnit;
		heightUnit: TileHeightUnit;
	},
> {
	x: number;
	y: number;
	width: TileWidthUnit;
	height: TileHeightUnit;
	tile: TileData;
}

export interface PixelNode {
	key: string;
	tile: Tile;
	style: React.CSSProperties;
}

export interface PixelLayout {
	nodes: PixelNode[];
	containerHeight: number;
}

export type PackStrategy =
	| "recency"
	| "balanced"
	| "fit";