import type React from "react";

import { cn } from "@/lib/utils";

function Skeleton({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				"animate-none! rounded-md bg-input shadow-none! transition-none! bg-none! before:hidden after:hidden",
				className,
			)}
			{...props}
		/>
	);
}

export { Skeleton };
