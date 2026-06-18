import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import type * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "src/components/ui/dialog";
import { cn } from "src/lib/utils";
import { surfaceClasses } from "@/lib/surface-classes";
import { SurfaceProvider, useSurface } from "@/lib/surface-context";

function Command({
	className,
	style,
	...props
}: React.ComponentProps<typeof CommandPrimitive>) {
	const substrate = useSurface();
	const level = Math.min(substrate + 2, 0);

	return (
		<CommandPrimitive
			data-slot="command"
			className={cn(
				"text-elevated-foreground flex h-full w-full flex-col overflow-hidden rounded-(--command-content-radius) group/command",
				className,
				surfaceClasses(level, 0),
			)}
			style={
				{
					"--command-content-radius": "1.25rem",
					"--command-content-padding": "0.25rem",
					...style,
				} as React.CSSProperties
			}
			{...props}
		/>
	);
}

function CommandDialog({
	title = "Command Palette",
	description = "Search for a command to run...",
	children,
	className,
	showCloseButton = true,
	...props
}: React.ComponentProps<typeof Dialog> & {
	title?: string;
	description?: string;
	className?: string;
	showCloseButton?: boolean;
}) {
	return (
		<Dialog {...props}>
			<DialogHeader className="sr-only">
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			<DialogContent
				className={cn("overflow-hidden p-0", className)}
				showCloseButton={showCloseButton}
			>
				<Command className="**:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-2 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[cmdk-list]_[cmdk-item]:first-child]:rounded-t-sm">
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	);
}

function CommandInput({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div
			data-slot="command-input-wrapper"
			className="flex h-9 items-center gap-2 border-b px-3 peer"
		>
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<CommandPrimitive.Input
				data-slot="command-input"
				className={cn(
					"placeholder:text-muted-foreground flex h-10 w-full rounded-lg bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function CommandList({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot="command-list"
			className={cn(
				"max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto p-(--command-content-padding) group/list",

				// First item styling
				"[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-[calc(var(--command-content-radius)-var(--command-content-padding))]!",
				"[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-[calc(var(--command-content-radius)-var(--command-content-padding))]!",

				// Reset First item to Small Rounding if Command has Input
				"peer-data-[slot=command-input-wrapper]:[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-lg!",
				"peer-data-[slot=command-input-wrapper]:[&_[cmdk-list-sizer]>:nth-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-child(1_of_:not([hidden],.hidden))]:rounded-t-lg!",

				// Last item styling
				"[&_[cmdk-list-sizer]>:nth-last-child(1_of_:not([hidden],.hidden))]:rounded-b-[calc(var(--command-content-radius)-var(--command-content-padding))]!",
				"[&_[cmdk-list-sizer]>:nth-last-child(1_of_:not([hidden],.hidden))_[cmdk-group-items]>:nth-last-child(1_of_:not([hidden],.hidden))]:rounded-b-[calc(var(--command-content-radius)-var(--command-content-padding))]!",

				className,
			)}
			{...props}
		/>
	);
}

function CommandEmpty({
	...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
	return (
		<CommandPrimitive.Empty
			data-slot="command-empty"
			className="py-6 text-center text-sm"
			{...props}
		/>
	);
}

function CommandGroup({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot="command-group"
			className={cn(
				"text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium group/group",
				className,
			)}
			{...props}
		/>
	);
}

function CommandSeparator({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot="command-separator"
			className={cn("bg-border -mx-1 h-px", className)}
			{...props}
		/>
	);
}

function CommandItem({
	className,
	...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot="command-item"
			className={cn(
				"data-[selected=true]:bg-black/6 dark:data-[selected=true]:bg-white/6",
				"data-[selected=true]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				"data-[selected=true]:shadow-none",
				className,
			)}
			{...props}
		/>
	);
}

function CommandShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="command-shortcut"
			className={cn(
				"text-muted-foreground ml-auto text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
};
