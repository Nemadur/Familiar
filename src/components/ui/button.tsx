import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "src/lib/utils";

const buttonVariants = cva(
	"group/button inline-flex cursor-pointer shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				outline:
					"border-border bg-transparent hover:bg-primary/12 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
				secondary: "bg-primary/10 text-primary hover:bg-primary/20", //TODO: make better style for aria-expanded:bg-primary
				ghost:
					"hover:bg-muted hover:text-muted-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
				destructive:
					"bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
				link: "text-accent underline-offset-4 hover:underline mx-0! px-0!",
				link_ghost: "bg-accent/10 hover:text-foreground",
			},
			size: {
				default:
					"h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-full has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				lg: "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
				xl: "h-10 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
				icon: "size-8",
				"icon-xs":
					"size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-full [&_svg:not([class*='size-'])]:size-3",
				"icon-sm":
					"size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-full",
				"icon-lg": "size-9",
				"icon-xl": "size-10 [&_svg:not([class*='size-'])]:size-5",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

// TODO: add hold to confirm for destructive buttons with callback
function Button({
	className,
	variant = "default",
	size = "default",
	asChild = false,
	onHold,
	holdDuration = 3000,
	onHoldCompleted,
	onClick,
	onPointerDown,
	onPointerUp,
	onPointerLeave,
	children,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
		onHold?: () => void;
		holdDuration?: number;
		onHoldCompleted?: (completed: boolean) => void;
	}) {
	const Comp = asChild ? Slot.Root : "button";

	const [isHolding, setIsHolding] = React.useState(false);
	const [holdCompleted, setHoldCompleted] = React.useState(false);
	const holdTimer = React.useRef<NodeJS.Timeout | null>(null);
	const visualTimer = React.useRef<NodeJS.Timeout | null>(null);
	const pointerDownTime = React.useRef<number>(0);
	const isTap = React.useRef<boolean>(true);

	// Sync holdCompleted state with external callback if provided
	React.useEffect(() => {
		if (onHoldCompleted) {
			onHoldCompleted(holdCompleted);
		}
	}, [holdCompleted, onHoldCompleted]);

	const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
		if (props.disabled || !onHold) {
			onPointerDown?.(e);
			return;
		}
		if (e.button !== 0) {
			onPointerDown?.(e);
			return;
		}

		isTap.current = true;
		setHoldCompleted(false);
		pointerDownTime.current = Date.now();

		if (visualTimer.current) clearTimeout(visualTimer.current);
		visualTimer.current = setTimeout(() => {
			setIsHolding(true);
		}, 150);

		if (holdTimer.current) clearTimeout(holdTimer.current);
		holdTimer.current = setTimeout(() => {
			setIsHolding(false);
			setHoldCompleted(true);
			onHold();
		}, holdDuration);

		onPointerDown?.(e);
	};

	const cancelHold = () => {
		if (visualTimer.current) clearTimeout(visualTimer.current);
		if (holdTimer.current) clearTimeout(holdTimer.current);
		setIsHolding(false);
	};

	const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
		if (!onHold) {
			onPointerUp?.(e);
			return;
		}
		cancelHold();
		const duration = Date.now() - pointerDownTime.current;
		isTap.current = duration <= 200;
		onPointerUp?.(e);
	};

	const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
		if (!onHold) {
			onPointerLeave?.(e);
			return;
		}
		cancelHold();
		isTap.current = false;
		onPointerLeave?.(e);
	};

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (onHold) {
			if (!isTap.current || holdCompleted) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
		}
		onClick?.(e);
	};

	const getFillStyles = (v: string) => {
		switch (v) {
			case "destructive":
				return "bg-destructive !text-white [&_svg]:!text-white";
			case "secondary":
			case "outline":
			case "ghost":
				return "bg-foreground !text-background [&_svg]:!text-background";
			case "link":
			case "link_ghost":
				return "bg-accent !text-accent-foreground [&_svg]:!text-accent-foreground";
			default:
				return "bg-primary !text-primary-foreground [&_svg]:!text-primary-foreground";
		}
	};

	if (asChild) {
		return (
			<Comp
				data-slot="button"
				data-variant={variant}
				data-size={size}
				className={cn(buttonVariants({ variant, size, className }))}
				onClick={onClick}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerLeave={onPointerLeave}
				{...props}
			>
				{children}
			</Comp>
		);
	}

	return (
		<Comp
			data-slot="button"
			data-variant={variant}
			data-size={size}
			className={cn(
				buttonVariants({ variant, size, className }),
				onHold && "relative overflow-hidden",
			)}
			onPointerDown={onHold ? handlePointerDown : onPointerDown}
			onPointerUp={onHold ? handlePointerUp : onPointerUp}
			onPointerLeave={onHold ? handlePointerLeave : onPointerLeave}
			onClick={onHold ? handleClick : onClick}
			{...props}
		>
			{onHold && (
				<span
					className={cn(
						// Don't spread full buttonVariants here — it pulls in the base text color
						"absolute inset-0 z-10 pointer-events-none border-transparent transition-all ease-linear",
						"inline-flex items-center justify-center gap-1.5 text-sm font-medium whitespace-nowrap rounded-full",
						"flex items-center justify-center",
						getFillStyles(variant as string),
					)}
					style={{
						clipPath: isHolding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
						transitionDuration: isHolding ? `${holdDuration - 150}ms` : "0ms",
						transitionProperty: "clip-path",
						transitionTimingFunction: "linear",
					}}
				>
					{typeof children === "function"
						? (children as any)(holdCompleted)
						: children}
				</span>
			)}
			{typeof children === "function"
				? (children as any)(holdCompleted)
				: children}
		</Comp>
	);
}

export { Button, buttonVariants };
