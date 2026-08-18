import { Typography } from "@heroui/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Empty({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty"
			className={cn(
				"flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed shadow-none! p-6 text-center text-balance",
				className,
			)}
			{...props}
		/>
	);
}

function EmptyHeader({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-header"
			className={cn(
				"flex max-w-md flex-col items-center gap-2 text-center",
				className,
			)}
			{...props}
		/>
	);
}

const emptyMediaVariants = cva(
	"mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				icon: "flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/6 text-foreground [&_svg:not([class*='size-'])]:size-6",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function EmptyMedia({
	className,
	variant = "default",
	...props
}: ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
	return (
		<div
			data-slot="empty-media"
			data-variant={variant}
			className={cn(emptyMediaVariants({ variant, className }))}
			{...props}
		/>
	);
}

type EmptyTitleProps = Omit<
	ComponentProps<typeof Typography.Heading>,
	"level"
> & {
	level?: ComponentProps<typeof Typography.Heading>["level"];
};

function EmptyTitle({ className, level = 5, ...props }: EmptyTitleProps) {
	return (
		<Typography.Heading
			data-slot="empty-title"
			level={level}
			className={cn("text-foreground", className)}
			{...props}
		/>
	);
}

function EmptyDescription({
	className,
	size = "sm",
	...props
}: ComponentProps<typeof Typography.Paragraph>) {
	return (
		<Typography.Paragraph
			data-slot="empty-description"
			size={size}
			className={cn(
				"text-muted-foreground text-center! text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
				className,
			)}
			{...props}
		/>
	);
}

function EmptyContent({ className, ...props }: ComponentProps<"div">) {
	return (
		<div
			data-slot="empty-content"
			className={cn(
				"flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
};
