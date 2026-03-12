import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineFilter: React.FC<IconProps> = ({
	className,
	size = 24,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Filter</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M17.992 5H6.002a1 1 0 0 0-.763 1.646l3.813 4.502A4 4 0 0 1 10 13.733v4.265a1 1 0 0 0 1.418.908l2-.92a1 1 0 0 0 .582-.908v-3.345a4 4 0 0 1 .946-2.584l3.81-4.503A1 1 0 0 0 17.992 5ZM6.002 3h11.99c2.554 0 3.94 2.988 2.29 4.938l-3.809 4.503A2 2 0 0 0 16 13.732v3.346a3 3 0 0 1-1.746 2.725l-2 .92C10.266 21.638 8 20.186 8 17.998v-4.265a2 2 0 0 0-.474-1.293l-3.813-4.5C2.063 5.989 3.448 3 6.003 3Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidFilter: React.FC<IconProps> = ({
	className,
	size = 24,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Filter</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M17.992 5H6.002a1 1 0 0 0-.763 1.646l3.813 4.502A4 4 0 0 1 10 13.733v4.265a1 1 0 0 0 1.418.908l2-.92a1 1 0 0 0 .582-.908v-3.345a4 4 0 0 1 .946-2.584l3.81-4.503A1 1 0 0 0 17.992 5ZM6.002 3h11.99c2.554 0 3.94 2.988 2.29 4.938l-3.809 4.503A2 2 0 0 0 16 13.732v3.346a3 3 0 0 1-1.746 2.725l-2 .92C10.266 21.638 8 20.186 8 17.998v-4.265a2 2 0 0 0-.474-1.293l-3.813-4.5C2.063 5.989 3.448 3 6.003 3Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneFilter: React.FC<IconProps> = ({
	className,
	size = 24,
	style,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style={style}
		className={getIconClassName(className)}
	>
		<title>Filter</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M18.994 3H5.006c-1.69 0-2.618 1.966-1.544 3.27l5.31 6.453A1 1 0 0 1 9 13.36v5.634c0 1.538 1.664 2.5 2.997 1.734l2-1.15A2 2 0 0 0 15 17.843v-4.484a1 1 0 0 1 .228-.636l5.31-6.452C21.612 4.966 20.684 3 18.994 3Z"
			fill="currentColor"
		/>
	</svg>
);
