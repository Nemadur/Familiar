"use client";

import { Slot } from "@radix-ui/react-slot";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	type ReactNode,
} from "react";
import { surfaceClasses } from "@/lib/surface-classes";
import { SurfaceProvider, useSurface } from "@/lib/surface-context";
import { cn } from "@/lib/utils";

interface ElevatedProps extends ComponentPropsWithoutRef<"div"> {
	/**
	 * Steps above the current substrate.
	 *
	 * The component's own surface level becomes `min(substrate + offset, 8)`
	 * and is re-provided to descendants via SurfaceProvider, so further
	 * nesting walks up the ladder automatically.
	 *
	 * Conventional offsets:
	 *   2 — dropdown / popover / select menu
	 *   4 — dialog / modal
	 */
	offset?: number;
	/**
	 * Override for the shadow level. Defaults to the computed surface level.
	 *
	 * Pass a fixed value when the component should keep a constant shadow
	 * weight regardless of how deeply it's nested — e.g. a dropdown always
	 * reads `shadow-surface-3` whether it opens on the page or inside a
	 * dialog, even though its background tracks the substrate.
	 */
	shadowLevel?: number;
	asChild?: boolean;
	children?: ReactNode;
}

const Elevated = forwardRef<HTMLDivElement, ElevatedProps>(
	(
		{ offset = 1, shadowLevel, asChild, className, children, ...props },
		ref,
	) => {
		const substrate = useSurface();
		const level = Math.min(substrate + offset, 8);

		const Comp = asChild ? Slot : "div";

		return (
			<SurfaceProvider value={level}>
				<Comp
					ref={ref}
					className={cn(
						surfaceClasses(level, shadowLevel ?? level),
						"text-elevated-foreground",
						className,
					)}
					{...props}
				>
					{children}
				</Comp>
			</SurfaceProvider>
		);
	},
);
Elevated.displayName = "Elevated";

export { Elevated };
