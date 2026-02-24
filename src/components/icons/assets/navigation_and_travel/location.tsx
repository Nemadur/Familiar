import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineLocation: React.FC<IconProps> = ({
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
		<title>Location</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 4a7 7 0 0 0-7 7c0 2.206 1.336 4.268 3.205 5.888l3.441 2.982a.54.54 0 0 0 .708 0l3.441-2.982C17.664 15.268 19 13.206 19 11a7 7 0 0 0-7-7Zm-9 7a9 9 0 0 1 18 0c0 3.026-1.81 5.592-3.895 7.399l-3.441 2.983a2.54 2.54 0 0 1-3.328 0l-3.441-2.983C4.81 16.592 3 14.026 3 11Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidLocation: React.FC<IconProps> = ({
	className,
	size = 24,
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
		<title>Location</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3 11a9 9 0 0 1 18 0c0 3.026-1.81 5.592-3.895 7.399l-3.441 2.983a2.54 2.54 0 0 1-3.328 0l-3.441-2.983C4.81 16.592 3 14.026 3 11Zm9 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneLocation: React.FC<IconProps> = ({
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
		<title>Location</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M12 2a9 9 0 0 0-9 9c0 3.026 1.81 5.592 3.895 7.399l3.441 2.983a2.54 2.54 0 0 0 3.328 0l3.44-2.983C19.19 16.592 21 14.026 21 11a9 9 0 0 0-9-9Z"
			fill="currentColor"
		/>

		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M14 11a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
			fill="currentColor"
		/>
	</svg>
);
