import { useMemo, useState } from "react";
import { FolderCard } from "@/components/layout/profile/feed/folder-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	generateTailwindPalette,
	getTextColor,
	isHexColor,
	normalizeHex,
} from "@/lib/colors";

const SHADES = [
	"50",
	"100",
	"200",
	"300",
	"400",
	"500",
	"600",
	"700",
	"800",
	"900",
	"950",
] as const;

type ShadeOption = "auto" | (typeof SHADES)[number];

export function ColorPaletteDebugger() {
	const [baseColor, setBaseColor] = useState("#8b5cf6");
	const [baseShade, setBaseShade] = useState<ShadeOption>("auto");

	const isValid = isHexColor(baseColor);

	const { palette, inputShade } = useMemo(() => {
		if (!isValid) {
			return { palette: {} as Record<number, string>, inputShade: 500 };
		}

		return generateTailwindPalette(normalizeHex(baseColor), {
			baseShade: baseShade === "auto" ? undefined : Number(baseShade),
			preserveInputShadeExact: true,
		});
	}, [baseColor, baseShade, isValid]);

	return (
		<div className="w-full max-w-6xl space-y-8 p-6">
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="base-color">Base Color (Hex)</Label>
					<div className="flex gap-4">
						<Input
							id="base-color"
							value={baseColor}
							onChange={(e) => setBaseColor(e.target.value)}
							className="w-48 font-mono"
							placeholder="#000000"
						/>
						<div
							className="h-10 w-10 rounded border shadow-sm"
							style={{
								backgroundColor: isValid
									? normalizeHex(baseColor)
									: "transparent",
							}}
						/>
					</div>
					{!isValid && (
						<p className="text-destructive text-sm">Invalid hex color</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="base-shade">Base shade</Label>
					<select
						id="base-shade"
						value={baseShade}
						onChange={(e) => setBaseShade(e.target.value as ShadeOption)}
						className="border-input bg-background ring-offset-background focus-visible:ring-ring h-10 w-48 rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
					>
						<option value="auto">Auto detect</option>
						{SHADES.map((shade) => (
							<option key={shade} value={shade}>
								{shade}
							</option>
						))}
					</select>

					{isValid && (
						<p className="text-muted-foreground text-sm">
							Using base shade:{" "}
							<span className="font-semibold">
								{baseShade === "auto" ? inputShade : baseShade}
							</span>
						</p>
					)}
				</div>
			</div>

			{isValid && (
				<div className="space-y-8">
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11">
						{SHADES.map((shade) => {
							const numericShade = Number(shade);
							const hex = palette[numericShade];
							const textColor = getTextColor(palette, numericShade);

							console.log(`${numericShade}: ${hex}`);

							return (
								<div
									key={shade}
									className="flex aspect-square flex-col justify-between rounded-lg p-3 text-xs shadow-sm transition-transform hover:scale-[1.02]"
									style={{ backgroundColor: hex, color: textColor }}
								>
									<div className="space-y-1">
										<div className="font-semibold">{shade}</div>
										<div className="text-[10px] opacity-80">
											{textColor.toUpperCase()}
										</div>
									</div>

									<div className="font-mono opacity-90">
										{hex?.toUpperCase()}
									</div>
								</div>
							);
						})}
					</div>

					<div className="space-y-4">
						<Label>Folder Card Preview</Label>
						<div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
							<FolderCard
								folder={{
									id: "debug-folder",
									parentId: null,
									slug: "debug",
									name: "Debug Folder",
									count: 42,
									images: [],
									color: normalizeHex(baseColor),
									hasSubfolders: true,
								}}
							/>
							<FolderCard
								folder={{
									id: "debug-folder-images",
									parentId: null,
									slug: "debug-images",
									name: "With Images",
									count: 12,
									images: [
										"https://picsum.photos/200/300",
										"https://picsum.photos/200/301",
									],
									color: normalizeHex(baseColor),
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
