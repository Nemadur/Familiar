import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineChevronUp: React.FC<IconProps> = ({
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
		<title>Chevron up</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M5.293 15.707a1 1 0 0 0 1.414 0L12 10.414l5.293 5.293a1 1 0 0 0 1.414-1.414l-6-6a1 1 0 0 0-1.414 0l-6 6a1 1 0 0 0 0 1.414Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidChevronUp: React.FC<IconProps> = ({
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
		<title>Chevron up</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M18.414 15.414a2 2 0 0 1-2.828 0L12 11.828l-3.586 3.586a2 2 0 1 1-2.828-2.828l5-5a2 2 0 0 1 2.828 0l5 5a2 2 0 0 1 0 2.828Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneChevronUp: React.FC<IconProps> = ({
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
		<title>Chevron up</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M18.707 15.707a1 1 0 0 1-1.414 0L12 10.414l-5.293 5.293a1 1 0 0 1-1.414-1.414l6-6a1 1 0 0 1 1.414 0l6 6a1 1 0 0 1 0 1.414Z"
			fill="currentColor"
		/>
	</svg>
);
