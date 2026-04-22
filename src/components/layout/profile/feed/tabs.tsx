import { domAnimation, LazyMotion, m, useReducedMotion } from "framer-motion";
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
	const prefersReducedMotion = useReducedMotion();

	return (
		<LazyMotion features={domAnimation}>
			<Tabs
				value={value}
				onValueChange={(value) => onValueChange?.(value as T)}
				className={cn("w-fit", className)}
			>
				<TabsList variant={"line"}>
					{items.map((item) => {
						const isActive = value === item.id;

						return (
							<TabsTrigger
								key={item.id}
								value={item.id}
								size={size as any}
								className={cn(
									"relative h-auto font-semibold data-[state=active]:text-primary!",
								)}
							>
								{/* {IconComponent && <IconComponent className={iconSize} />} */}
								{item.label}
								{isActive && (
									<m.div
										layout
										layoutId={`${id}-active-tab-indicator-${item.id}`} // Unique ID per tab item to prevent cross-tab jumping on unrelated re-renders
										initial={false}
										className="absolute w-2/3 right-0 bottom-0 left-1/2 -translate-x-1/2 h-1 rounded-t-full bg-primary"
										transition={{
											type: "tween",
											ease: "easeInOut",
											duration: prefersReducedMotion ? 0 : 0.25,
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

function ProfileFeedTabsSkeleton({ className }: { className?: string }) {
	return (
		<div className={cn("flex w-fit gap-2", className)}>
			{[1, 2, 3].map((i) => (
				<div
					// eslint-disable-next-line react-doctor/no-array-index-as-key
					key={`skeleton-tab-${i}`}
					className="inline-flex items-center justify-center whitespace-nowrap rounded-md py-4 text-sm font-medium gap-2"
				>
					<Skeleton className="size-10 rounded-full" />
					<Skeleton className="h-10 w-32 rounded-full" />
				</div>
			))}
		</div>
	);
}

export { ProfileFeedTabs, ProfileFeedTabsSkeleton };
