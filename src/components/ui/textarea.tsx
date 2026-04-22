import type * as React from "react";
import { cn } from "src/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="input-group-control"
			className={cn(
				"border border-input bg-transparent outline-none transition-[color] selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-transparent text-primary",
				"flex field-sizing-content min-h-16 w-full rounded-xl px-3 py-2 text-base disabled:cursor-not-allowed md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
