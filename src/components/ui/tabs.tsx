"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "src/lib/utils";

function Tabs({
	className,
	orientation = "horizontal",
	style,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			data-orientation={orientation}
			style={
				{
					"--tabs-radius": "var(--radius)",
					"--tabs-padding": "0.25rem",
					...style,
				} as React.CSSProperties
			}
			className={cn(
				"gap-2 group/tabs flex data-[orientation=horizontal]:flex-col data-[orientation=vertical]:flex-row",
				className,
			)}
			{...props}
		/>
	);
}

const tabsListVariants = cva(
	"rounded-[var(--tabs-radius)] p-[var(--tabs-padding)] data-[variant=line]:rounded-none group/tabs-list inline-flex w-full items-center justify-center text-muted-foreground group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
	{
		variants: {
			variant: {
				default: "bg-muted group-data-[orientation=horizontal]/tabs:h-10",
				line: "gap-1 bg-transparent p-0 w-fit h-auto",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function TabsList({
	className,
	variant = "default",
	...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
	VariantProps<typeof tabsListVariants>) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	);
}

const tabsTriggerVariants = cva(
	"relative inline-flex items-center justify-center whitespace-nowrap rounded-[calc(var(--tabs-radius)-var(--tabs-padding))] font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer flex-1 h-[calc(100%-1px)]",
	{
		variants: {
			size: {
				default: "px-1.5 py-0.5 text-sm",
				sm: "px-1 py-0.5 text-xs",
				lg: "px-4 py-3 text-lg",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

function TabsTrigger({
	className,
	size,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
	VariantProps<typeof tabsTriggerVariants>) {
	return (
		<TabsPrimitive.Trigger
			data-slot="tabs-trigger"
			className={cn(
				tabsTriggerVariants({ size }),
				// Default (Pill) variant styles
				"group-data-[variant=default]/tabs-list:data-[state=active]:bg-background group-data-[variant=default]/tabs-list:data-[state=active]:text-foreground",
				"group-data-[variant=default]/tabs-list:text-muted-foreground group-data-[variant=default]/tabs-list:hover:text-foreground",

				// Line (Profile) variant styles
				"group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:rounded-none",
				"group-data-[variant=line]/tabs-list:text-muted-foreground group-data-[variant=line]/tabs-list:hover:text-foreground",
				"group-data-[variant=line]/tabs-list:data-[state=active]:text-foreground",

				className,
			)}
			{...props}
		/>
	);
}

function TabsContent({
	className,
	...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot="tabs-content"
			className={cn("text-sm flex-1 outline-none", className)}
			{...props}
		/>
	);
}

export {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	tabsListVariants,
	tabsTriggerVariants,
};
