import type { ElementType } from "react";

interface FeedTabItem<T extends string> {
	id: T;
	label: string;
	description?: string;
	icon?: ElementType;
	activeIcon?: ElementType;
}

interface FeedTabSelectorProps<T extends string> {
	items: FeedTabItem<T>[];
	value: T;
	onValueChange?: (value: T) => void;
	className?: string;
	size?: "default" | "sm" | "lg" | "xl";
}

export type { FeedTabItem, FeedTabSelectorProps };
