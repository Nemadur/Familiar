import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "src/lib/utils";

interface ColumnSortIconProps {
	canSort: boolean;
	isSorted: false | "asc" | "desc";
}

export function getColumnHeaderLabelClassName(className?: string) {
	return cn(
		"text-secondary-foreground/80 inline-flex h-full items-center gap-1.5 font-normal [&_svg]:opacity-60 text-[0.8125rem] leading-[calc(1.125/0.8125)] [&_svg]:size-3.5",
		className,
	);
}

export function getColumnHeaderButtonClassName() {
	return cn(
		"text-secondary-foreground/80 hover:bg-secondary data-[state=open]:bg-secondary hover:text-foreground data-[state=open]:text-foreground -ms-2 px-2 font-normal h-6 rounded-lg",
	);
}

export function ColumnSortIcon({
	canSort,
	isSorted,
}: ColumnSortIconProps): ReactNode {
	if (!canSort) return null;

	if (isSorted === "desc") {
		return <ArrowDownIcon className="size-3.25" />;
	}

	if (isSorted === "asc") {
		return <ArrowUpIcon className="size-3.25" />;
	}

	return <ChevronsUpDownIcon className="mt-px size-3.25" />;
}
