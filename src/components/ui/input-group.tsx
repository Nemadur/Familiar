import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { cn } from "src/lib/utils";

function InputGroup({ className, ...props }: React.ComponentProps<"fieldset">) {
	return (
		<fieldset
			data-slot="input-group"
			className={cn(
				"group/input-group relative flex w-full items-center rounded-full border border-input bg-muted/30 outline-none transition-[color,box-shadow]",
				"h-10 min-w-0 has-[>textarea]:h-auto",

				// Variants based on alignment.
				"has-[>[data-align=inline-start]]:[&>input]:pl-2",
				"has-[>[data-align=inline-end]]:[&>input]:pr-2",
				"has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
				"has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",

				// Focus state.
				"has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",

				// Error state.
				"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

				className,
			)}
			{...props}
		/>
	);
}

const inputGroupAddonVariants = cva(
	"text-muted-foreground flex h-auto [&>svg]:mt-0.5 cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
	{
		variants: {
			align: {
				"inline-start":
					"order-first pl-3 has-[>button]:ml-[-0.5rem] has-[>kbd]:ml-[-0.35rem]",
				"inline-end":
					"order-last pr-3 has-[>button]:mr-[-0.5rem] has-[>kbd]:mr-[-0.35rem]",
				"block-start":
					"order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
				"block-end":
					"order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	},
);

function InputGroupAddon({
	className,
	align = "inline-start",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const handleMouseDown = (e: MouseEvent) => {
			if ((e.target as HTMLElement).closest("button")) {
				return;
			}
			const input = element.parentElement?.querySelector(
				"input,textarea",
			) as HTMLElement;
			// Prevent the div from stealing focus
			e.preventDefault();
			input?.focus();
		};

		element.addEventListener("mousedown", handleMouseDown);
		return () => {
			element.removeEventListener("mousedown", handleMouseDown);
		};
	}, []);

	return (
		<div
			ref={ref}
			data-slot="input-group-addon"
			data-align={align}
			className={cn(inputGroupAddonVariants({ align }), className)}
			{...props}
		/>
	);
}

const inputGroupButtonVariants = cva(
	"text-sm shadow-none flex gap-2 items-center rounded-full",
	{
		variants: {
			size: {
				xs: "h-7 gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
				sm: "h-8 px-2.5 gap-1.5 has-[>svg]:px-2.5",
				"icon-xs": "size-8 p-0 has-[>svg:first-child]:p-0",
				"icon-sm": "size-9 p-0 has-[>svg:first-child]:p-0",
			},
		},
		defaultVariants: {
			size: "xs",
		},
	},
);

function InputGroupButton({
	className,
	type = "button",
	variant = "ghost",
	size = "xs",
	...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
	VariantProps<typeof inputGroupButtonVariants>) {
	return (
		<Button
			type={type}
			data-size={size}
			variant={variant}
			className={cn(inputGroupButtonVariants({ size }), className)}
			{...props}
		/>
	);
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="input-group-text"
			className={cn(
				"text-muted-foreground pointer-events-none select-none text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function InputGroupInput({
	className,
	...props
}: React.ComponentProps<"input">) {
	return (
		<Input
			data-slot="input-group-control"
			className={cn(
				"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
				className,
			)}
			{...props}
		/>
	);
}

export {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupButton,
	InputGroupText,
};
