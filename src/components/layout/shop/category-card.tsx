import { Typography } from "@heroui/react";
import { useMemo } from "react";
import { OutlineArrowRight } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { generateTailwindPalette, getTextColor } from "@/lib/colors";
import { Elevated } from "@/lib/elevated";

// Simple deterministic hash to get a consistent color for the same category name
function stringToColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const c = (hash & 0x00ffffff).toString(16).toUpperCase();
	return `#${"00000".substring(0, 6 - c.length)}${c}`;
}

export function CategoryCard({
	title,
	icon,
	onSeeAll,
}: {
	title: string;
	icon?: React.ReactNode;
	onSeeAll?: () => void;
}) {
	// Generate consistent deterministic colors based on category title
	const { bgStyle, iconBgStyle, textStyle, buttonStyle } = useMemo(() => {
		const baseHex = stringToColor(title);
		const { palette } = generateTailwindPalette(baseHex);

		const bgHex = palette[100] || "#f3f4f6";
		const iconBgHex = palette[200] || "#e5e7eb";
		const fgColor = getTextColor(palette, 100);

		return {
			bgStyle: { backgroundColor: bgHex },
			iconBgStyle: { backgroundColor: iconBgHex },
			textStyle: { color: fgColor },
			buttonStyle: {
				backgroundColor: palette[900] || "#111827",
				color: getTextColor(palette, 900),
			},
		};
	}, [title]);

	return (
		<Elevated
			offset={1}
			shadowLevel={0}
			style={bgStyle}
			className="relative flex self-stretch shadow-none w-[220px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl p-5"
		>
			<div
				style={iconBgStyle}
				className="absolute -top-2 -right-2 -rotate-15 rounded-full p-6 transition-transform"
			>
				{icon && (
					<span style={textStyle} className="size-6 opacity-75">
						{icon}
					</span>
				)}
			</div>

			<div className="mt-auto flex flex-col gap-4">
				<Typography.Heading level={4} style={textStyle}>
					{title}
				</Typography.Heading>

				<Button
					size={"lg"}
					className="w-fit border-none hover:opacity-90 transition-opacity"
					style={buttonStyle}
					onClick={onSeeAll}
				>
					See all <OutlineArrowRight />
				</Button>
			</div>
		</Elevated>
	);
}
