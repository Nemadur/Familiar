import { Typography } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { OutlineArrowRight } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { generateTailwindPalette, getTextColor } from "@/lib/colors";
import { Elevated } from "@/lib/elevated";
import { useTheme } from "@/providers/theme";

// Simple deterministic hash to get a consistent color for the same category name
function getHash(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return Math.abs(hash);
}

function stringToColor(str: string): string {
	const hash = getHash(str);
	const c = (hash & 0x00ffffff).toString(16).toUpperCase();
	return `#${"00000".substring(0, 6 - c.length)}${c}`;
}

const PATTERNS = [
	// Dots
	(color: string) =>
		`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='${encodeURIComponent(color)}' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
	// Zigzag
	(color: string) =>
		`url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6.172L6.172 0h5.656L0 11.828V6.172zm40 5.656L28.172 0h5.656L40 6.172v5.656zM6.172 12l12-12h5.656L11.828 12H6.172zm17.656 0L35.828 0h4.172L28.172 12h-4.344z' fill='${encodeURIComponent(color)}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
	// Diagonal lines
	(color: string) =>
		`url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 0h18v2H0V0h2zm-2 20h2v-2H0v2zm18 0h2v-2h-2v2zm-6-20h2v2h-2V0zm-6 0h2v2H6V0z' fill='${encodeURIComponent(color)}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
	// Waves
	(color: string) =>
		`url("data:image/svg+xml,%3Csvg width='20' height='12' viewBox='0 0 20 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6c2.759 0 5.203-1.09 7.071-2.859 1.868 1.77 4.312 2.859 7.071 2.859 2.759 0 5.203-1.09 7.071-2.859V0C18.665 1.77 16.221 2.859 13.462 2.859 10.703 2.859 8.259 1.77 6.391 0 4.523 1.77 2.079 2.859-.68 2.859v3.141z' fill='${encodeURIComponent(color)}' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
];

export function CategoryCard({
	title,
	icon,
	onSeeAll,
	count,
}: {
	title: string;
	icon?: React.ReactNode;
	onSeeAll?: () => void;
	count?: string;
}) {
	const { isDark } = useTheme();

	// Generate consistent deterministic colors based on category title
	const { surface, surfaceDeep, ring, ink, inkSoft, button, patternIndex } =
		useMemo(() => {
			const hash = getHash(title);
			const baseHex = stringToColor(title);
			const { palette } = generateTailwindPalette(baseHex);

			const pIndex = hash % PATTERNS.length;

			return {
				surface: isDark ? palette[900] || "#111827" : palette[100] || "#f3f4f6",
				surfaceDeep: isDark
					? palette[800] || "#1f2937"
					: palette[200] || "#e5e7eb",
				ring: isDark ? palette[700] || "#374151" : palette[300] || "#d1d5db",
				ink: isDark ? palette[300] || "#d1d5db" : getTextColor(palette, 100),
				inkSoft: isDark ? palette[400] || "#9ca3af" : palette[700] || "#374151",
				button: isDark ? palette[200] || "#e5e7eb" : palette[900] || "#111827",
				patternIndex: pIndex,
			};
		}, [title, isDark]);

	const buttonText = isDark
		? getTextColor({ 200: button }, 200)
		: getTextColor({ 900: button }, 900);

	return (
		<Elevated
			offset={1}
			shadowLevel={0}
			style={{ backgroundColor: surface }}
			className="group shadow-none! relative flex w-full lg:w-full lg:h-full shrink-0 flex-col justify-center lg:justify-end overflow-hidden rounded-[24px] p-5 lg:p-6"
		>
			{/* Foreground icon chip */}

			{/* SVG Pattern texture */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-40"
				style={{ backgroundImage: PATTERNS[patternIndex](surfaceDeep) }}
			/>

			{/* Concentric ring shapes, top-right */}
			<div
				aria-hidden
				className="pointer-events-none absolute right-3 top-1/2 xl:-right-16 xl:top-16 -translate-y-1/2 z-0"
			>
				<div
					className="flex size-44 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110"
					style={{ backgroundColor: surfaceDeep }}
				>
					<div
						className="flex size-32 items-center justify-center rounded-full"
						style={{ backgroundColor: ring }}
					>
						<div
							className="size-20 rounded-full"
							style={{ backgroundColor: surfaceDeep }}
						/>
					</div>
				</div>
			</div>

			{/* Huge watermark icon */}
			{icon && (
				<div
					aria-hidden
					className="pointer-events-none absolute top-1/2 -translate-y-1/2 xl:translate-y-0 xl:top-auto xl:-bottom-4 right-3 xl:-right-6 size-44 -rotate-12 transition-transform duration-75 group-hover:rotate-0 flex items-center justify-center z-10"
					style={{ color: ink, opacity: 0.5 }}
				>
					<div className="scale-[2] xl:scale-[4] origin-center opacity-80 [&>svg]:stroke-[1.5]">
						{icon}
					</div>
				</div>
			)}

			{/* Content */}
			<div className="relative lg:mt-auto flex flex-col gap-2 lg:gap-3 z-10 w-fit">
				<div className="flex flex-col lg:gap-1">
					<Typography.Heading
						level={5}
						className="text-pretty font-bold leading-tight lg:text-2xl"
						style={{ color: ink }}
					>
						{title}
					</Typography.Heading>
					{count && (
						<span
							className="text-xs lg:text-sm font-medium"
							style={{ color: inkSoft }}
						>
							{count}
						</span>
					)}
				</div>
				<Button
					onClick={onSeeAll}
					size={"lg"}
					className="w-fit"
					style={{ backgroundColor: button, color: buttonText }}
				>
					See all
					<OutlineArrowRight />
				</Button>
			</div>
		</Elevated>
	);
}
