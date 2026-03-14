import type React from "react";

export type ShadeKey =
	| "50"
	| "100"
	| "200"
	| "300"
	| "400"
	| "500"
	| "600"
	| "700"
	| "800"
	| "900"
	| "950";

export interface PaletteOptions {
	baseShade?: number;
	preserveInputShadeExact?: boolean;
}

interface AnchorCurve {
	H: number;
	name: string;
	L500: number;
	L: Record<number, number>;
	C: Record<number, number>;
	HD: Record<number, number>;
}

interface Rgb {
	r: number;
	g: number;
	b: number;
}

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const ANCHORS: AnchorCurve[] = [
	{
		H: 16.4,
		name: "rose",
		L500: 64.5,
		L: {
			50: 1.5033,
			100: 1.4607,
			200: 1.3844,
			300: 1.2569,
			400: 1.1165,
			500: 1,
			600: 0.906,
			700: 0.794,
			800: 0.7004,
			900: 0.6307,
			950: 0.417,
		},
		C: {
			50: 0.0711,
			100: 0.1406,
			200: 0.2611,
			300: 0.495,
			400: 0.786,
			500: 1,
			600: 1.0317,
			700: 0.9197,
			800: 0.7945,
			900: 0.6933,
			950: 0.4668,
		},
		HD: {
			50: -8.96,
			100: -11.41,
			200: -9.16,
			300: -7.72,
			400: -4.85,
			500: 0,
			600: 3.88,
			700: 4.98,
			800: 3.88,
			900: 2.6,
			950: 2.73,
		},
	},
	{
		H: 149.2,
		name: "green",
		L500: 70.2,
		L: {
			50: 1.3961,
			100: 1.3678,
			200: 1.3099,
			300: 1.2262,
			400: 1.1285,
			500: 1,
			600: 0.8661,
			700: 0.731,
			800: 0.6219,
			900: 0.547,
			950: 0.3705,
		},
		C: {
			50: 0.0854,
			100: 0.2287,
			200: 0.4072,
			300: 0.6981,
			400: 0.9105,
			500: 1,
			600: 0.8873,
			700: 0.7208,
			800: 0.563,
			900: 0.463,
			950: 0.3254,
		},
		HD: {
			50: 5.23,
			100: 5.76,
			200: 5.53,
			300: 4.21,
			400: 2.2,
			500: 0,
			600: -0.41,
			700: 0.13,
			800: 1.37,
			900: 2.9,
			950: 2.9,
		},
	},
	{
		H: 162.5,
		name: "emerald",
		L500: 69.6,
		L: {
			50: 1.4073,
			100: 1.3658,
			200: 1.3004,
			300: 1.2146,
			400: 1.1108,
			500: 1,
			600: 0.8564,
			700: 0.7302,
			800: 0.6205,
			900: 0.5433,
			950: 0.3766,
		},
		C: {
			50: 0.1387,
			100: 0.3404,
			200: 0.6003,
			300: 0.8717,
			400: 1.0296,
			500: 1,
			600: 0.8547,
			700: 0.7039,
			800: 0.5801,
			900: 0.4899,
			950: 0.327,
		},
		HD: {
			50: 3.63,
			100: 0.57,
			200: 1.67,
			300: 2.5,
			400: 0.74,
			500: 0,
			600: 0.75,
			700: 3.13,
			800: 4.43,
			900: 6.46,
			950: 10.07,
		},
	},
	{
		H: 259.8,
		name: "blue",
		L500: 62.3,
		L: {
			50: 1.5575,
			100: 1.4957,
			200: 1.4161,
			300: 1.2985,
			400: 1.1455,
			500: 1,
			600: 0.8765,
			700: 0.7835,
			800: 0.6812,
			900: 0.6084,
			950: 0.453,
		},
		C: {
			50: 0.0754,
			100: 0.168,
			200: 0.3035,
			300: 0.5085,
			400: 0.7626,
			500: 1,
			600: 1.1446,
			700: 1.155,
			800: 0.962,
			900: 0.7327,
			950: 0.4651,
		},
		HD: {
			50: -5.21,
			100: -4.23,
			200: -5.69,
			300: -8,
			400: -5.19,
			500: 0,
			600: 3.07,
			700: 4.56,
			800: 5.82,
			900: 5.71,
			950: 8.12,
		},
	},
	{
		H: 292.7,
		name: "violet",
		L500: 60.6,
		L: {
			50: 1.6028,
			100: 1.5602,
			200: 1.4831,
			300: 1.3489,
			400: 1.1793,
			500: 1,
			600: 0.8759,
			700: 0.7853,
			800: 0.691,
			900: 0.6089,
			950: 0.4592,
		},
		C: {
			50: 0.075,
			100: 0.1313,
			200: 0.254,
			300: 0.4666,
			400: 0.7294,
			500: 1,
			600: 1.1264,
			700: 1.1035,
			800: 0.9632,
			900: 0.8145,
			950: 0.6178,
		},
		HD: {
			50: 8.5,
			100: 6.17,
			200: 6.27,
			300: 5.42,
			400: 3.53,
			500: 0,
			600: -3.64,
			700: -5.9,
			800: -5.85,
			900: -4.45,
			950: -4.73,
		},
	},
];

const SNAP_DEG = 5;

function clamp(n: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, n));
}

function angularDist(a: number, b: number): number {
	const d = (((b - a) % 360) + 360) % 360;
	return d > 180 ? d - 360 : d;
}

function findNearestAnchors(H: number) {
	let b1: AnchorCurve | null = null;
	let b2: AnchorCurve | null = null;
	let d1 = Number.POSITIVE_INFINITY;
	let d2 = Number.POSITIVE_INFINITY;

	for (const a of ANCHORS) {
		const d = Math.abs(angularDist(H, a.H));
		if (d < d1) {
			d2 = d1;
			b2 = b1;
			d1 = d;
			b1 = a;
		} else if (d < d2) {
			d2 = d;
			b2 = a;
		}
	}

	return { b1: b1!, b2, d1, d2 };
}

function interpCurve(H: number, shade: number, key: "L" | "C" | "HD"): number {
	const { b1, b2, d1, d2 } = findNearestAnchors(H);

	if (d1 < SNAP_DEG || !b2 || d1 + d2 === 0) {
		return b1[key][shade];
	}

	const t = d1 / (d1 + d2);
	return b1[key][shade] * (1 - t) + b2[key][shade] * t;
}

function interpL500(H: number): number {
	const { b1, b2, d1, d2 } = findNearestAnchors(H);

	if (d1 < SNAP_DEG || !b2 || d1 + d2 === 0) {
		return b1.L500;
	}

	const t = d1 / (d1 + d2);
	return b1.L500 * (1 - t) + b2.L500 * t;
}

export function normalizeHex(value: string | null | undefined): string {
	if (!value) return "#6b7280";
	const hex = value.trim().replace(/^#/, "");

	if (/^[0-9a-fA-F]{3}$/.test(hex)) {
		return `#${hex
			.split("")
			.map((c) => c + c)
			.join("")
			.toLowerCase()}`;
	}

	if (/^[0-9a-fA-F]{6}$/.test(hex)) {
		return `#${hex.toLowerCase()}`;
	}

	return value.trim();
}

export function isHexColor(value: string | null | undefined): boolean {
	if (!value) return false;
	return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function hexToRgb(hex: string): Rgb | null {
	const normalized = normalizeHex(hex);
	const value = normalized.replace("#", "");

	if (!/^[0-9a-f]{6}$/i.test(value)) return null;

	const n = Number.parseInt(value, 16);
	if (Number.isNaN(n)) return null;

	return {
		r: (n >> 16) & 255,
		g: (n >> 8) & 255,
		b: n & 255,
	};
}

function rgbToHex({ r, g, b }: Rgb): string {
	return `#${[r, g, b]
		.map((v) =>
			Math.round(clamp(v, 0, 255))
				.toString(16)
				.padStart(2, "0"),
		)
		.join("")}`;
}

function linearize(channel: number): number {
	const v = channel / 255;
	return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function delinearize(v: number): number {
	return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
}

function rgbToOklch(r: number, g: number, b: number) {
	const rl = linearize(r);
	const gl = linearize(g);
	const bl = linearize(b);

	let l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
	let m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
	let s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;

	l = Math.cbrt(l);
	m = Math.cbrt(m);
	s = Math.cbrt(s);

	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const b2 = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	const C = Math.sqrt(a * a + b2 * b2);

	let H = (Math.atan2(b2, a) * 180) / Math.PI;
	if (H < 0) H += 360;

	return { L: L * 100, C, H };
}

function oklchToRgbGamut(L: number, C: number, H: number): Rgb {
	const raw = (c: number) => {
		const Ln = L / 100;
		const h = (H * Math.PI) / 180;

		const a = c * Math.cos(h);
		const b2 = c * Math.sin(h);

		let l = Ln + 0.3963377774 * a + 0.2158037573 * b2;
		let m = Ln - 0.1055613458 * a - 0.0638541728 * b2;
		let s = Ln - 0.0894841775 * a - 1.291485548 * b2;

		l = l ** 3;
		m = m ** 3;
		s = s ** 3;

		return {
			r:
				delinearize(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s) *
				255,
			g:
				delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s) *
				255,
			b:
				delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s) *
				255,
		};
	};

	const inGamut = (c: number) => {
		const t = raw(c);
		return (
			t.r >= -0.5 &&
			t.r <= 255.5 &&
			t.g >= -0.5 &&
			t.g <= 255.5 &&
			t.b >= -0.5 &&
			t.b <= 255.5
		);
	};

	let lo = 0;
	let hi = C;
	let best = inGamut(C) ? C : 0;

	if (!inGamut(C)) {
		for (let i = 0; i < 18; i++) {
			const mid = (lo + hi) / 2;
			if (inGamut(mid)) {
				best = mid;
				lo = mid;
			} else {
				hi = mid;
			}
		}
	}

	const res = raw(best);

	return {
		r: Math.round(clamp(res.r, 0, 255)),
		g: Math.round(clamp(res.g, 0, 255)),
		b: Math.round(clamp(res.b, 0, 255)),
	};
}

function relativeLuminanceFromHex(hex: string): number {
	const rgb = hexToRgb(hex);
	if (!rgb) return 0;

	const rs = linearize(rgb.r);
	const gs = linearize(rgb.g);
	const bs = linearize(rgb.b);

	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hexA: string, hexB: string): number {
	const l1 = relativeLuminanceFromHex(hexA);
	const l2 = relativeLuminanceFromHex(hexB);
	const lighter = Math.max(l1, l2);
	const darker = Math.min(l1, l2);
	return (lighter + 0.05) / (darker + 0.05);
}

export function getReadableTextColor(backgroundHex: string): string {
	const black = "#000000";
	const white = "#ffffff";
	return contrastRatio(backgroundHex, white) >=
		contrastRatio(backgroundHex, black)
		? white
		: black;
}

export function getTextColorShade(shade: number): number {
	if (shade === 50) return 800;
	if (shade <= 300) return 900;
	return 100;
}

export function getTextColor(
	palette: Record<number, string>,
	shade: number,
): string {
	return (
		palette[getTextColorShade(shade)] ??
		getReadableTextColor(palette[shade] ?? "#ffffff")
	);
}

function detectInputShade(inputL: number, inputH: number): number {
	const expectedL500 = interpL500(inputH);
	const ratio = inputL / expectedL500;

	let bestShade = 500;
	let bestDiff = Number.POSITIVE_INFINITY;

	for (const s of SHADES) {
		const diff = Math.abs(ratio - interpCurve(inputH, s, "L"));
		if (diff < bestDiff) {
			bestDiff = diff;
			bestShade = s;
		}
	}

	return bestShade;
}

function reconstructTrue500(
	inputOk: { L: number; C: number; H: number },
	inputShade: number,
) {
	const lR = interpCurve(inputOk.H, inputShade, "L");
	const cR = interpCurve(inputOk.H, inputShade, "C");
	const hD = interpCurve(inputOk.H, inputShade, "HD");

	return {
		L: inputOk.L / lR,
		C: inputOk.C / cR,
		H: (inputOk.H - hD + 360) % 360,
	};
}

function generateFromOklch500(ok500: {
	L: number;
	C: number;
	H: number;
}): Record<number, string> {
	const palette: Record<number, string> = {};

	for (const s of SHADES) {
		const tL = clamp(ok500.L * interpCurve(ok500.H, s, "L"), 1, 99);
		const tC = Math.max(0, ok500.C * interpCurve(ok500.H, s, "C"));
		const tH = (ok500.H + interpCurve(ok500.H, s, "HD") + 360) % 360;

		palette[s] = rgbToHex(oklchToRgbGamut(tL, tC, tH));
	}

	return palette;
}

export function generateTailwindPalette(
	baseHex: string,
	options: PaletteOptions = {},
): {
	palette: Record<number, string>;
	inputShade: number;
} {
	const normalized = normalizeHex(baseHex);
	const rgb = hexToRgb(normalized);

	if (!rgb) {
		return { palette: {}, inputShade: 500 };
	}

	const inputOk = rgbToOklch(rgb.r, rgb.g, rgb.b);
	const inputShade =
		options.baseShade ?? detectInputShade(inputOk.L, inputOk.H);
	const ok500 = reconstructTrue500(inputOk, inputShade);
	const palette = generateFromOklch500(ok500);

	if (options.preserveInputShadeExact ?? true) {
		palette[inputShade] = normalized;
	}

	return { palette, inputShade };
}

export function getPaletteShadeFromBaseHex(
	baseHex: string,
	targetShade: number,
	options: PaletteOptions = {},
): string | null {
	if (!isHexColor(baseHex)) return null;
	const { palette } = generateTailwindPalette(baseHex, options);
	return palette[targetShade] ?? null;
}

export function deriveShadeFromHex(
	baseHex: string,
	target: ShadeKey,
	options: PaletteOptions = {},
): string {
	const shade = Number.parseInt(target, 10);
	return getPaletteShadeFromBaseHex(baseHex, shade, options) ?? "#6b7280";
}

export function getStyleFromHexShade(
	baseHex: string,
	target: ShadeKey,
	property: "backgroundColor" | "color" | "borderColor" = "backgroundColor",
	options: PaletteOptions = {},
): React.CSSProperties {
	return {
		[property]: deriveShadeFromHex(baseHex, target, options),
	} as React.CSSProperties;
}

export function getSwatchStyles(
	baseHex: string,
	shade: number,
	options: PaletteOptions = {},
): React.CSSProperties {
	const { palette } = generateTailwindPalette(baseHex, options);

	return {
		backgroundColor: palette[shade],
		color: getTextColor(palette, shade),
	};
}

export const getUserAccentStylesFromHex = (
	hex: string,
	options: PaletteOptions = {},
) =>
	({
		coverBgStyle: getStyleFromHexShade(hex, "100", "backgroundColor", options),
		avatarBgStyle: getStyleFromHexShade(hex, "200", "backgroundColor", options),
		avatarForegroundStyle: getStyleFromHexShade(hex, "950", "color", options),
	}) as const;

// compatibility exports
export function getStyleFromHex(
	hex: string,
	property: "backgroundColor" | "color" | "borderColor" = "backgroundColor",
): React.CSSProperties {
	return { [property]: normalizeHex(hex) } as React.CSSProperties;
}

export function findAccentBy500Hex(_hex: string) {
	return null;
}

export function getAccentColorStyle(hex: string): React.CSSProperties {
	return getStyleFromHex(hex, "backgroundColor");
}

export function getAccentColorValue(hex: string): string {
	return normalizeHex(hex);
}

export function getAccentColorClass(_hex: string): string {
	return "";
}

export function getUserAccentStyles(hex: string) {
	return getUserAccentStylesFromHex(hex);
}

export const COLOR_PALETTES: Record<string, Record<number, string>> = {};
export const ACCENT_COLORS: Array<{ name: string; hex: string }> = [];
