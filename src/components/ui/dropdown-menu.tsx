import {
	CheckIcon,
	ChevronRightIcon,
	CircleIcon,
	SearchIcon,
} from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "src/lib/utils";

function DropdownMenu({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
	return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
	return (
		<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
	);
}

function DropdownMenuTrigger({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
	return (
		<DropdownMenuPrimitive.Trigger
			data-slot="dropdown-menu-trigger"
			{...props}
		/>
	);
}

function DropdownMenuContent({
	className,
	sideOffset = 4,
	style,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				data-slot="dropdown-menu-content"
				sideOffset={sideOffset}
				style={
					{
						"--dropdown-menu-radius": "1.25rem",
						"--dropdown-menu-padding": "0.25rem",
						...style,
					} as React.CSSProperties
				}
				className={cn(
					"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-(--dropdown-menu-radius) border p-(--dropdown-menu-padding) shadow-md",
					// Direct children: big outer top/bottom radius
					"[&>[data-slot=dropdown-menu-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-checkbox-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-radio-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-sub-trigger]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-checkbox-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-radio-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>[data-slot=dropdown-menu-sub-trigger]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					// Group-aware: only the first item in the first group and last item in the last group get big outer radius
					"[&>.dropdown-menu-group:first-child>[data-slot=dropdown-menu-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:first-child>[data-slot=dropdown-menu-checkbox-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:first-child>[data-slot=dropdown-menu-radio-item]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:first-child>[data-slot=dropdown-menu-sub-trigger]:first-child]:rounded-t-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:last-child>[data-slot=dropdown-menu-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:last-child>[data-slot=dropdown-menu-checkbox-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:last-child>[data-slot=dropdown-menu-radio-item]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					"[&>.dropdown-menu-group:last-child>[data-slot=dropdown-menu-sub-trigger]:last-child]:rounded-b-[calc(var(--dropdown-menu-radius)-var(--dropdown-menu-padding))]!",
					// If the group is not first/last, keep inner radius only
					"[&>.dropdown-menu-group:not(:first-child)>[data-slot=dropdown-menu-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-group:not(:first-child)>[data-slot=dropdown-menu-checkbox-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-group:not(:first-child)>[data-slot=dropdown-menu-radio-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-group:not(:first-child)>[data-slot=dropdown-menu-sub-trigger]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-group:not(:last-child)>[data-slot=dropdown-menu-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:not(:last-child)>[data-slot=dropdown-menu-checkbox-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:not(:last-child)>[data-slot=dropdown-menu-radio-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:not(:last-child)>[data-slot=dropdown-menu-sub-trigger]:last-child]:rounded-b-lg!",
					// Input wrapper above first visible option: always only lg top radius + spacing
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-item]]:mt-1",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-checkbox-item]]:mt-1",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-radio-item]]:mt-1",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-sub-trigger]]:mt-1",
					"[&>.dropdown-menu-input-wrapper+.dropdown-menu-group]:mt-1",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-item]]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-checkbox-item]]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-radio-item]]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+[data-slot=dropdown-menu-sub-trigger]]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+.dropdown-menu-group>[data-slot=dropdown-menu-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+.dropdown-menu-group>[data-slot=dropdown-menu-checkbox-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+.dropdown-menu-group>[data-slot=dropdown-menu-radio-item]:first-child]:rounded-t-lg!",
					"[&>.dropdown-menu-input-wrapper+.dropdown-menu-group>[data-slot=dropdown-menu-sub-trigger]:first-child]:rounded-t-lg!",
					// Separator behavior around direct children
					"[&>[data-slot=dropdown-menu-item]:has(+[data-slot=dropdown-menu-separator])]:rounded-b-lg!",
					"[&>[data-slot=dropdown-menu-checkbox-item]:has(+[data-slot=dropdown-menu-separator])]:rounded-b-lg!",
					"[&>[data-slot=dropdown-menu-radio-item]:has(+[data-slot=dropdown-menu-separator])]:rounded-b-lg!",
					"[&>[data-slot=dropdown-menu-sub-trigger]:has(+[data-slot=dropdown-menu-separator])]:rounded-b-lg!",
					"[&>[data-slot=dropdown-menu-separator]+[data-slot=dropdown-menu-item]]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+[data-slot=dropdown-menu-checkbox-item]]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+[data-slot=dropdown-menu-radio-item]]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+[data-slot=dropdown-menu-sub-trigger]]:rounded-t-lg!",
					// Separator behavior around grouped items
					"[&>.dropdown-menu-group:has(+[data-slot=dropdown-menu-separator])>[data-slot=dropdown-menu-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:has(+[data-slot=dropdown-menu-separator])>[data-slot=dropdown-menu-checkbox-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:has(+[data-slot=dropdown-menu-separator])>[data-slot=dropdown-menu-radio-item]:last-child]:rounded-b-lg!",
					"[&>.dropdown-menu-group:has(+[data-slot=dropdown-menu-separator])>[data-slot=dropdown-menu-sub-trigger]:last-child]:rounded-b-lg!",
					"[&>[data-slot=dropdown-menu-separator]+.dropdown-menu-group>[data-slot=dropdown-menu-item]:first-child]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+.dropdown-menu-group>[data-slot=dropdown-menu-checkbox-item]:first-child]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+.dropdown-menu-group>[data-slot=dropdown-menu-radio-item]:first-child]:rounded-t-lg!",
					"[&>[data-slot=dropdown-menu-separator]+.dropdown-menu-group>[data-slot=dropdown-menu-sub-trigger]:first-child]:rounded-t-lg!",
					className,
				)}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuInputWrapper({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dropdown-menu-input-wrapper"
			className={cn(
				"dropdown-menu-input-wrapper flex h-9 items-center gap-2 border-b px-3",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuInput({
	className,
	...props
}: React.ComponentProps<"input">) {
	return (
		<DropdownMenuInputWrapper>
			<SearchIcon className="size-4 shrink-0 opacity-50" />
			<input
				data-slot="dropdown-menu-input"
				className={cn(
					"placeholder:text-muted-foreground flex h-9 w-full rounded-lg bg-transparent text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				{...props}
			/>
		</DropdownMenuInputWrapper>
	);
}

function DropdownMenuGroup({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
	return (
		<DropdownMenuPrimitive.Group
			data-slot="dropdown-menu-group"
			className={cn("dropdown-menu-group", className)}
			{...props}
		/>
	);
}

function DropdownMenuItem({
	className,
	inset,
	variant = "default",
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
	inset?: boolean;
	variant?: "default" | "destructive";
}) {
	return (
		<DropdownMenuPrimitive.Item
			data-slot="dropdown-menu-item"
			data-inset={inset}
			data-variant={variant}
			className={cn(
				"focus:bg-primary/6 focus:text-primary data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive! [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuCheckboxItem({
	className,
	children,
	checked,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
	return (
		<DropdownMenuPrimitive.CheckboxItem
			data-slot="dropdown-menu-checkbox-item"
			className={cn(
				"focus:bg-primary/6 focus:text-primary relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			checked={checked}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CheckIcon className="size-4" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.CheckboxItem>
	);
}

function DropdownMenuRadioGroup({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
	return (
		<DropdownMenuPrimitive.RadioGroup
			data-slot="dropdown-menu-radio-group"
			{...props}
		/>
	);
}

function DropdownMenuRadioItem({
	className,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
	return (
		<DropdownMenuPrimitive.RadioItem
			data-slot="dropdown-menu-radio-item"
			className={cn(
				"focus:bg-primary/6 focus:text-primary relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
				<DropdownMenuPrimitive.ItemIndicator>
					<CircleIcon className="size-2 fill-current" />
				</DropdownMenuPrimitive.ItemIndicator>
			</span>
			{children}
		</DropdownMenuPrimitive.RadioItem>
	);
}

function DropdownMenuLabel({
	className,
	inset,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.Label
			data-slot="dropdown-menu-label"
			data-inset={inset}
			className={cn(
				"px-2 py-1.5 text-sm font-medium data-inset:pl-8",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	return (
		<DropdownMenuPrimitive.Separator
			data-slot="dropdown-menu-separator"
			className={cn("bg-border -mx-1 my-1 h-px", className)}
			{...props}
		/>
	);
}

function DropdownMenuShortcut({
	className,
	...props
}: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="dropdown-menu-shortcut"
			className={cn(
				"text-muted-foreground ml-auto text-xs tracking-widest",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSub({
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
	return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
	className,
	inset,
	children,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
	inset?: boolean;
}) {
	return (
		<DropdownMenuPrimitive.SubTrigger
			data-slot="dropdown-menu-sub-trigger"
			data-inset={inset}
			className={cn(
				"focus:bg-primary/6 focus:text-primary data-[state=open]:bg-primary/6 data-[state=open]:text-primary [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden select-none data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			{children}
			<ChevronRightIcon className="ml-auto size-4" />
		</DropdownMenuPrimitive.SubTrigger>
	);
}

function DropdownMenuSubContent({
	className,
	style,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
	return (
		<DropdownMenuPrimitive.SubContent
			data-slot="dropdown-menu-sub-content"
			style={
				{
					"--dropdown-menu-radius": "0.75rem",
					"--dropdown-menu-padding": "0.25rem",
					...style,
				} as React.CSSProperties
			}
			className={cn(
				"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-(--dropdown-menu-radius) border p-(--dropdown-menu-padding) shadow-lg",
				className,
			)}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuPortal,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuInputWrapper,
	DropdownMenuInput,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
};
