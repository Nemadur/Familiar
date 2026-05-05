import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center rounded-full border border-transparent font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground [a&]:hover:bg-primary/90 selection:bg-primary-foreground/12",
				secondary: "bg-muted text-muted-foreground [a&]:hover:bg-secondary/90",
				destructive:
					"bg-destructive/20 text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/30",
				outline:
					"border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
				link: "text-primary underline-offset-4 [a&]:hover:underline",
				success: "bg-success text-success-foreground [a&]:hover:bg-success/90",
				warning: "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
				info: "bg-info text-info-foreground [a&]:hover:bg-info/90",
				success_ghost:
					"bg-success/20 text-success-foreground [a&]:hover:bg-success/90",
				danger_ghost:
					"bg-destructive/20 text-destructive-foreground [a&]:hover:bg-destructive/90",
				info_ghost: "bg-info/20 text-info-foreground [a&]:hover:bg-info/90",
				warning_ghost:
					"bg-warning/20 text-warning-foreground [a&]:hover:bg-warning/90",
			},
			size: {
				sm: "text-xs px-1.5 py-0.25",
				default: "text-sm px-2 py-0.5",
				lg: "text-base px-2.5 py-0.75",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Badge({
	className,
	size,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> &
	VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "span";

	return (
		<Comp
			data-slot="badge"
			data-size={size}
			data-variant={variant}
			className={cn(badgeVariants({ size, variant }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
