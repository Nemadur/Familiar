import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineLink: React.FC<IconProps> = ({
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
		<title>Link</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12.066 4.527a5.24 5.24 0 0 1 7.403 7.418l-1.762 1.762a1 1 0 0 1-1.414-1.414l1.762-1.762a3.24 3.24 0 0 0-4.578-4.587L11.706 7.71a1 1 0 1 1-1.412-1.418l1.772-1.764Zm-4.36 5.764a1 1 0 0 1 .003 1.415l-1.765 1.771a3.24 3.24 0 0 0 4.587 4.578l1.762-1.762a1 1 0 0 1 1.414 1.414l-1.762 1.762a5.24 5.24 0 0 1-7.418-7.403l1.764-1.772a1 1 0 0 1 1.415-.003Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidLink: React.FC<IconProps> = ({
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
		<title>Link</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10ZM10.066 6.522a5.242 5.242 0 0 1 7.402 7.425l-.26.26a1 1 0 0 1-1.415-1.414l.26-.26a3.242 3.242 0 0 0-4.578-4.592l-.27.268a1 1 0 1 1-1.41-1.418l.27-.269ZM8.204 9.791a1 1 0 0 1 .004 1.414l-.269.27a3.242 3.242 0 0 0 4.593 4.578l.26-.26a1 1 0 0 1 1.414 1.414l-.26.26a5.242 5.242 0 0 1-7.425-7.401l.269-.27a1 1 0 0 1 1.414-.005Zm5.502 1.916a1 1 0 0 0-1.414-1.414l-2 2a1 1 0 1 0 1.414 1.414l2-2Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneLink: React.FC<IconProps> = ({
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
		<title>Link</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M12.066 4.527a5.24 5.24 0 0 1 7.403 7.418l-1.762 1.762a1 1 0 0 1-1.414-1.414l1.762-1.762a3.24 3.24 0 0 0-4.578-4.587L11.706 7.71a1 1 0 1 1-1.412-1.418l1.772-1.764Zm-4.36 5.764a1 1 0 0 1 .003 1.415l-1.765 1.771a3.24 3.24 0 0 0 4.587 4.578l1.762-1.762a1 1 0 0 1 1.414 1.414l-1.762 1.762a5.24 5.24 0 0 1-7.418-7.403l1.764-1.772a1 1 0 0 1 1.415-.003Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414-1.414l4-4a1 1 0 0 1 1.414 0Z"
			fill="currentColor"
		/>
	</svg>
);
