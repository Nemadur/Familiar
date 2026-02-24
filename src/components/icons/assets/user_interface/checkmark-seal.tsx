import type React from "react";
import type { IconProps } from "../../icons-props";
import { getIconClassName } from "../../icons-props";

export const OutlineCheckmarkSeal: React.FC<IconProps> = ({
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
		<title>Checkmark seal</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="m13.571 5.419-.78-1.028a1 1 0 0 0-1.593 0l-.779 1.028a2.1 2.1 0 0 1-1.96.811l-1.277-.175a1 1 0 0 0-1.127 1.127l.176 1.277a2.1 2.1 0 0 1-.812 1.96l-1.028.779a1 1 0 0 0 0 1.594l1.028.779a2.1 2.1 0 0 1 .812 1.96l-.176 1.277a1 1 0 0 0 1.127 1.127l1.278-.176a2.1 2.1 0 0 1 1.959.812l.78 1.028a1 1 0 0 0 1.593 0l.78-1.028a2.1 2.1 0 0 1 1.959-.812l1.277.176a1 1 0 0 0 1.127-1.127l-.175-1.278a2.1 2.1 0 0 1 .811-1.959l1.028-.78a1 1 0 0 0 0-1.593l-1.028-.78a2.1 2.1 0 0 1-.811-1.959l.175-1.277a1 1 0 0 0-1.127-1.127l-1.277.175a2.1 2.1 0 0 1-1.96-.811Zm.815-2.236a3 3 0 0 0-4.781 0l-.78 1.027a.1.1 0 0 1-.093.039l-1.278-.176a3 3 0 0 0-3.38 3.38l.175 1.279a.1.1 0 0 1-.038.093l-1.028.78a3 3 0 0 0 0 4.78l1.028.78a.1.1 0 0 1 .038.093l-.175 1.278a3 3 0 0 0 3.38 3.38l1.278-.175a.1.1 0 0 1 .093.038l.78 1.028a3 3 0 0 0 4.78 0l.78-1.028a.1.1 0 0 1 .093-.038l1.278.175a3 3 0 0 0 3.38-3.38l-.175-1.278a.1.1 0 0 1 .039-.093l1.027-.78a3 3 0 0 0 0-4.78l-1.027-.78a.1.1 0 0 1-.039-.093l.176-1.278a3 3 0 0 0-3.38-3.38l-1.279.175a.1.1 0 0 1-.093-.039l-.78-1.027Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 12.586l3.293-3.293a1 1 0 0 1 1.414 0Z"
			fill="currentColor"
		/>
	</svg>
);

export const SolidCheckmarkSeal: React.FC<IconProps> = ({
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
		<title>Checkmark seal</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M13.22 2.608a1.53 1.53 0 0 0-2.439 0L9.407 4.42a1 1 0 0 1-.933.386l-2.253-.31A1.53 1.53 0 0 0 4.497 6.22l.31 2.253a1 1 0 0 1-.387.933L2.608 10.78a1.53 1.53 0 0 0 0 2.439l1.812 1.374a1 1 0 0 1 .387.933l-.31 2.253a1.53 1.53 0 0 0 1.724 1.724l2.253-.31a1 1 0 0 1 .933.387l1.374 1.812a1.53 1.53 0 0 0 2.438 0l1.374-1.812a1 1 0 0 1 .933-.387l2.253.31a1.53 1.53 0 0 0 1.724-1.724l-.31-2.253a1 1 0 0 1 .387-.933l1.812-1.374a1.53 1.53 0 0 0 0-2.438L19.58 9.405a1 1 0 0 1-.386-.933l.31-2.253a1.53 1.53 0 0 0-1.725-1.724l-2.253.31a1 1 0 0 1-.933-.386L13.22 2.608Zm2.487 8.1a1 1 0 1 0-1.414-1.415L11 12.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
			fill="currentColor"
		/>
	</svg>
);

export const DuotoneCheckmarkSeal: React.FC<IconProps> = ({
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
		<title>Checkmark seal</title>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10 20h4a2 2 0 1 1-4 0Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			opacity={0.5}
			d="M10.78 2.608a1.53 1.53 0 0 1 2.44 0l1.373 1.812a1 1 0 0 0 .933.387l2.253-.31a1.53 1.53 0 0 1 1.724 1.724l-.31 2.253a1 1 0 0 0 .387.933l1.812 1.374a1.53 1.53 0 0 1 0 2.438l-1.812 1.374a1 1 0 0 0-.386.933l.31 2.253a1.53 1.53 0 0 1-1.725 1.724l-2.253-.31a1 1 0 0 0-.933.387l-1.374 1.812a1.53 1.53 0 0 1-2.438 0L9.407 19.58a1 1 0 0 0-.933-.386l-2.253.31a1.53 1.53 0 0 1-1.724-1.725l.31-2.253a1 1 0 0 0-.387-.933L2.608 13.22a1.53 1.53 0 0 1 0-2.438L4.42 9.407a1 1 0 0 0 .386-.933l-.31-2.253a1.53 1.53 0 0 1 1.725-1.724l2.253.31a1 1 0 0 0 .933-.387l1.374-1.812Z"
			fill="currentColor"
		/>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.707 9.293a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 1 1 1.414-1.414L11 12.586l3.293-3.293a1 1 0 0 1 1.414 0Z"
			fill="currentColor"
		/>
	</svg>
);
