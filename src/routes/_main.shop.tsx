import { ScrollShadow, Typography } from "@heroui/react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
	BrushIcon,
	CodeIcon,
	CpuIcon,
	GamepadIcon,
	LayoutGridIcon,
	ListFilterIcon,
	MusicIcon,
	TypeIcon,
	VideoIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyPage } from "@/components/layout/empty-page";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { CategoryCard } from "@/components/layout/shop/category-card";
import { ShopItemCard } from "@/components/layout/shop/shop-item-card";
import { useShopItems } from "@/hooks/shop";
import { useCommissionCategories } from "@/hooks/use-commisions";
import { Elevated } from "@/lib/elevated";
import type { MockShopItem } from "@/types/shop";

export const Route = createFileRoute("/_main/shop")({
	component: ShopPage,
});

function ShopPage() {
	const { data: backendCategories } = useCommissionCategories();
	const { data: items, isLoading: isLoadingItems } = useShopItems();

	const categories = useMemo(() => {
		if (backendCategories && backendCategories.length > 0) {
			return backendCategories;
		}
		return [
			{ id: "c1", name: "Digital Art" },
			{ id: "c2", name: "Character Design" },
			{ id: "c3", name: "Concept Art" },
			{ id: "c4", name: "Illustration" },
			{ id: "c5", name: "Emote / Sticker" },
			{ id: "c6", name: "Traditional Art" },
			{ id: "c7", name: "Handcraft" },
			{ id: "c8", name: "Animation" },
			{ id: "c9", name: "Pixel Art" },
		] as any[];
	}, [backendCategories]);

	const categoryOptions = useMemo(() => {
		if (!categories) return [];
		const options: { id: string; label: string; parentId?: string }[] = [];
		for (const cat of categories) {
			options.push({ id: cat.id, label: cat.name });
			if (cat.subcategories) {
				for (const sub of cat.subcategories) {
					// ensure the child id is distinct to match filter selections accurately
					options.push({ id: sub.id, label: sub.name, parentId: cat.id });
				}
			}
		}
		return options;
	}, [categories]);

	const filterGroups: FilterGroup<MockShopItem>[] = useMemo(
		() => [
			{
				id: "categoryId",
				label: "Category",
				type: "select",
				icon: ListFilterIcon,
				getItemValue: (item) => item.categoryId,
				options: categoryOptions,
			},
		],
		[categoryOptions],
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<
		Record<string, FilterValue | ManagedFilterValue | undefined>
	>({});

	const filteredItems = useMemo(() => {
		if (!items) return [];
		let result = items;

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(item) =>
					item.title.toLowerCase().includes(query) ||
					item.author.username.toLowerCase().includes(query),
			);
		}

		const categoryFilter = filterValues.categoryId;
		if (categoryFilter) {
			const filterObj =
				typeof categoryFilter === "object" &&
				!Array.isArray(categoryFilter) &&
				"value" in categoryFilter
					? categoryFilter
					: { value: categoryFilter, operator: "is" };

			const operator = filterObj.operator || "is";
			const selectedCategories = Array.isArray(filterObj.value)
				? filterObj.value
				: [filterObj.value];

			if (selectedCategories.length > 0) {
				const selectedStrs = selectedCategories.map(String);

				if (operator === "is not" || operator === "is none of") {
					result = result.filter(
						(item) => !selectedStrs.includes(String(item.categoryId)),
					);
				} else {
					result = result.filter((item) =>
						selectedStrs.includes(String(item.categoryId)),
					);
				}
			}
		}

		return result;
	}, [items, searchQuery, filterValues]);

	const categoriesWithItems = useMemo(() => {
		if (!categories || !filteredItems.length) return [];

		return categories
			.map((cat) => {
				// Map a predefined icon based on category name (or fallback to a default)
				const iconMap: Record<string, React.ElementType> = {
					"Art & Design": BrushIcon,
					"Digital Art": BrushIcon,
					"Traditional Art": BrushIcon,
					Handcraft: BrushIcon,
					Animation: VideoIcon,
					"Pixel Art": LayoutGridIcon,
					Development: CodeIcon,
					"Audio & Music": MusicIcon,
					Gaming: GamepadIcon,
					Writing: TypeIcon,
					"Video & Animation": VideoIcon,
					Tech: CpuIcon,
				};
				const Icon = iconMap[cat.name] || LayoutGridIcon;

				// Include items belonging to the main category OR any of its subcategories
				const validIds = new Set<string>();
				validIds.add(String(cat.id));
				if (cat.subcategories) {
					for (const sub of cat.subcategories) {
						validIds.add(String(sub.id));
					}
				}

				return {
					category: cat,
					icon: <Icon className="size-6" />,
					items: filteredItems.filter((item) =>
						validIds.has(String(item.categoryId)),
					),
				};
			})
			.filter((group) => group.items.length > 0);
	}, [categories, filteredItems]);

	return (
		<div className="flex h-full flex-1 flex-col gap-6">
			<div className="flex items-center justify-between">
				<Typography.Heading level={2}>Shop</Typography.Heading>
			</div>

			{/* <Elevated offset={1} className="p-4 rounded-xl flex flex-col gap-2">
				<Typography className="text-sm font-medium">
					Elevated Surface (Level 2)
				</Typography>
				<Typography className="text-xs text-muted-foreground">
					This is an elevated test container.
				</Typography>
				<Elevated offset={-1} className="p-4 rounded-xl flex flex-col gap-2">
					<Typography className="text-sm font-medium">
						Nested Elevated Surface (Level 4)
					</Typography>
					<Typography className="text-xs text-muted-foreground">
						This nested container reads the substrate from its parent.
					</Typography>
				</Elevated>
			</Elevated> */}

			<FilterBar
				data={filteredItems}
				groups={filterGroups}
				values={filterValues}
				onFilterChange={(groupId, value, operator) => {
					setFilterValues((prev) => ({
						...prev,
						[groupId]: { value, operator },
					}));
				}}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onClearAll={() => setFilterValues({})}
				searchPlaceholder="Search by item name or creator..."
			/>

			{isLoadingItems ? (
				<div className="flex items-center justify-center p-12">
					<Typography className="text-muted-foreground">
						Loading shop items...
					</Typography>
				</div>
			) : (
				<div className="flex flex-col gap-10 h-full">
					{categoriesWithItems.map((group) => {
						return (
							<div
								key={group.category.id}
								className="flex gap-6 w-full overflow-hidden"
							>
								<CategoryCard
									title={group.category.name}
									icon={group.icon}
									onSeeAll={() => {
										setFilterValues({
											categoryId: { value: [group.category.id] },
										});
									}}
								/>
								<div className="flex-1 min-w-0">
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
										{group.items.slice(0, 3).map((item) => (
											<ShopItemCard key={item.id} item={item} />
										))}
									</div>
								</div>
							</div>
						);
					})}
					{categoriesWithItems.length === 0 && (
						<EmptyPage
							title="No items found"
							description="Try adjusting your filters or search query."
						/>
					)}
				</div>
			)}
			<Outlet />
		</div>
	);
}
