import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function TypographyH2({
	children,
	underline = false,
}: {
	children: ReactNode;
	underline?: boolean;
}) {
	return (
		<h2
			className={cn(
				"scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
				underline && "border-b",
			)}
		>
			{children}
		</h2>
	);
}
