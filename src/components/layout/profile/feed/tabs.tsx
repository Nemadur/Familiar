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
	return (
		<Tabs
			value={value}
			onValueChange={(value) => onValueChange?.(value as T)}
			className={cn("w-fit", className)}
		>
			<TabsList variant={"line"} className="p-0">
				{items.map((item) => {
					return (
						<TabsTrigger
							key={item.id}
							value={item.id}
							className={cn(
								"relative font-semibold data-[state=active]:text-primary!",
								"text-lg px-3",
								"hover:bg-transparent!",
								"after:left-0 after:right-0 group-data-horizontal/tabs:after:-bottom-px",
							)}
						>
							{/* {IconComponent && <IconComponent className={iconSize} />} */}
							{item.label}
						</TabsTrigger>
					);
				})}
			</TabsList>
		</Tabs>
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
