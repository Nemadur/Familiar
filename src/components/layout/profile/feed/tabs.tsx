import { motion } from "framer-motion";
import { useId } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { FeedTabSelectorProps } from "@/types/feed/tabs";

function ProfileFeedTabs<T extends string>({
	items,
	value,
	onValueChange,
	className,
	size = "lg",
}: FeedTabSelectorProps<T>) {
	const id = useId();

	// Map size to icon dimensions
	const iconSize = {
		default: "size-4",
		sm: "size-3.5",
		lg: "size-5",
		xl: "size-6",
	}[size];

	return (
		<Tabs
			value={value}
			onValueChange={(value) => onValueChange?.(value as T)}
			className={cn("w-fit", className)}
		>
			<TabsList className="h-auto gap-2 bg-transparent p-1">
				{items.map((item) => {
					const isActive = value === item.id;
					const IconComponent =
						isActive && item.activeIcon ? item.activeIcon : item.icon;

					return (
						<TabsTrigger
							key={item.id}
							value={item.id}
							size={size}
							className="gap-2"
						>
							{IconComponent && <IconComponent className={iconSize} />}
							{item.label}
							{isActive && (
								<motion.div
									layout
									layoutId={`${id}-active-tab-indicator-${item.id}`} // Unique ID per tab item to prevent cross-tab jumping on unrelated re-renders
									initial={false}
									className="absolute right-0 -bottom-3.5 left-0 mx-auto h-1 w-1/3 rounded-t-full bg-primary"
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
	);
}

function ProfileFeedTabsSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex w-fit gap-2 p-1", className)}>
			{[1, 2, 3, 4].map((i) => (
				<div
					key={i}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md py-1.5 text-sm font-medium gap-2"
				>
					<Skeleton className="size-10 rounded-full" />
					<Skeleton className="h-10 w-32 rounded-full" />
				</div>
			))}
		</div>
	);
}

export { ProfileFeedTabs, ProfileFeedTabsSkeleton };
