import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineClock03: React.FC<IconProps> = ({
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
		<title>Clock</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 6a1 1 0 0 1 1 1v4.586l1.707 1.707a1 1 0 0 1-1.414 1.414l-2-2A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidClock03: React.FC<IconProps> = ({
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
		<title>Clock</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm1-15a1 1 0 1 0-2 0v5a1 1 0 0 0 .293.707l2 2a1 1 0 0 0 1.414-1.414L13 11.586V7Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneClock03: React.FC<IconProps> = ({
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
		<title>Clock</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 6a1 1 0 0 1 1 1v4.586l1.707 1.707a1 1 0 0 1-1.414 1.414l-2-2A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1Z"
			fill="currentColor"
		/>
	</svg>
);
