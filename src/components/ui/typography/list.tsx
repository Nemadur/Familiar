import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function TypographyList({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return <ul className={cn("ml-6 list-disc", className)}>{children}</ul>;
}
