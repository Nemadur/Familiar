import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineFilterClear: React.FC<IconProps> = ({
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
		<title>Filter Clear</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M13.343 3A5.988 5.988 0 0 0 13 5H6.003c-.851 0-1.314.997-.764 1.646l3.814 4.502c.612.722.947 1.639.947 2.585v4.265a1 1 0 0 0 1.418.908l2-.92a1 1 0 0 0 .582-.908v-3.346a4 4 0 0 1 .947-2.583l.888-1.051a5.962 5.962 0 0 0 1.96.78l-1.322 1.562A2 2 0 0 0 16 13.732v3.346a3 3 0 0 1-1.746 2.726l-2 .92C10.267 21.638 8 20.186 8 17.998v-4.265a2 2 0 0 0-.473-1.293L3.713 7.938C2.063 5.99 3.45 3 6.003 3h7.34Zm4.364-.707a1 1 0 1 0-1.414 1.414L17.586 5l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 6.414l1.293 1.293a1 1 0 1 0 1.414-1.414L20.414 5l1.293-1.293a1 1 0 0 0-1.414-1.414L19 3.586l-1.293-1.293Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidFilterClear: React.FC<IconProps> = ({
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
		<title>Filter Clear</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M13.343 3a6.002 6.002 0 0 0 3.6 7.638l-1.715 2.085a1.001 1.001 0 0 0-.228.635v4.485a2 2 0 0 1-1.003 1.734l-2 1.15C10.664 21.493 9 20.53 9 18.993v-5.635a1 1 0 0 0-.228-.635L3.462 6.27C2.388 4.966 3.317 3 5.007 3h8.336Zm4.364-.707a1 1 0 1 0-1.414 1.414L17.586 5l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 6.414l1.293 1.293a1 1 0 1 0 1.414-1.414L20.414 5l1.293-1.293a1 1 0 0 0-1.414-1.414L19 3.586l-1.293-1.293Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneFilterClear: React.FC<IconProps> = ({
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
		<title>Filter Clear</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M18.994 3H5.006c-1.69 0-2.618 1.966-1.544 3.27l5.31 6.453A1 1 0 0 1 9 13.36v5.634c0 1.538 1.664 2.5 2.997 1.734l2-1.15A2 2 0 0 0 15 17.843v-4.484a1 1 0 0 1 .228-.636l5.31-6.452C21.612 4.966 20.684 3 18.994 3Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M17.707 2.293a1 1 0 1 0-1.414 1.414L17.586 5l-1.293 1.293a1 1 0 0 0 1.414 1.414L19 6.414l1.293 1.293a1 1 0 1 0 1.414-1.414L20.414 5l1.293-1.293a1 1 0 0 0-1.414-1.414L19 3.586l-1.293-1.293Z"
			fill="currentColor"
		/>
	</svg>
);
