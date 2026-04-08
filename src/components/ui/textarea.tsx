import type * as React from "react";
import { cn } from "src/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="input-group-control"
			className={cn(
				"placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full rounded-xl px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
