import { domAnimation, LazyMotion, m } from "framer-motion";
import { type ElementType, useId } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
	id: T;
	label: string;
	description?: string;
	icon?: ElementType;
	activeIcon?: ElementType;
	disabled?: boolean;
}

interface TabSelectorProps<T extends string> {
	items: TabItem<T>[];
	value: T;
	onValueChange?: (value: T) => void;
	className?: string;
	size?: "default" | "sm" | "lg" | "xl";
}

export function TabSelector<T extends string>({
	items,
	value,
	onValueChange,
	className,
	size = "lg",
}: TabSelectorProps<T>) {
	const id = useId();

	// Map size to icon dimensions
	const iconSize = {
		default: "size-4",
		sm: "size-3.5",
		lg: "size-5",
		xl: "size-6",
	}[size];

	return (
		<LazyMotion features={domAnimation}>
			<Tabs
				value={value}
				onValueChange={(value) => onValueChange?.(value as T)}
				className={cn("w-fit", className)}
			>
				<TabsList className="h-auto gap-2 bg-transparent">
					{items.map((item) => {
						const isActive = value === item.id;
						const IconComponent =
							isActive && item.activeIcon ? item.activeIcon : item.icon;

						return (
							<TabsTrigger
								key={item.id}
								value={item.id}
								size={size}
								className={cn(
									"gap-2",
									item.disabled &&
										"pointer-events-none cursor-not-allowed opacity-50",
								)}
							>
								{IconComponent && <IconComponent className={iconSize} />}
								{item.label}
								{isActive && (
									<m.div
										layout
										layoutId={`${id}-active-tab-indicator-${item.id}`} // Unique ID per tab item to prevent cross-tab jumping on unrelated re-renders
										initial={false}
										className="absolute right-0 -bottom-1.5 left-0 mx-auto h-1 w-1/3 rounded-t-full bg-primary"
										transition={{
											type: "tween",
											ease: "easeInOut",
											duration: 0.25,
										}}
									/>
								)}
							</TabsTrigger>
						);
					})}
				</TabsList>
			</Tabs>
		</LazyMotion>
	);
}
