import { Typography } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ListFilterIcon } from "lucide-react";
import { MOCK_CATEGORIES } from "mock/shop";
import { useMemo, useState } from "react";
import { OutlineArrowLeft } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { ShopItemCard } from "@/components/layout/shop/shop-item-card";
import { Button } from "@/components/ui/button";
import { useShopItems } from "@/hooks/shop";
import { useCommissionCategories } from "@/hooks/use-commisions";
import type { MockShopItem } from "@/types/shop";

export const Route = createFileRoute("/{-$locale}/_main/shop/category/$slug")({
	component: CategoryPage,
});

function CategoryPage() {
	const { slug, locale } = Route.useParams();
	const navigate = useNavigate();

	const { data: backendCategories } = useCommissionCategories();
	const { data: items, isLoading } = useShopItems();

	const [searchQuery, setSearchQuery] = useState("");
	const [filterValues, setFilterValues] = useState<
		Record<string, FilterValue | ManagedFilterValue | undefined>
	>({});

	const categories = useMemo(() => {
		if (backendCategories && backendCategories.length > 0) {
			return backendCategories;
		}
		return MOCK_CATEGORIES as any[];
	}, [backendCategories]);

	const currentCategory = useMemo(() => {
		return categories.find(
			(cat) =>
				cat.name
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "") === slug,
		);
	}, [categories, slug]);

	const categoryItems = useMemo(() => {
		if (!items || !currentCategory) return [];

		const validIds = new Set<string>();
		validIds.add(String(currentCategory.id));
		if (currentCategory.subcategories) {
			for (const sub of currentCategory.subcategories) {
				validIds.add(String(sub.id));
			}
		}

		let result = items.filter((item) => validIds.has(String(item.categoryId)));

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(item) =>
					item.title.toLowerCase().includes(query) ||
					item.author.username.toLowerCase().includes(query),
			);
		}

		const subCategoryFilter = filterValues.categoryId;
		if (subCategoryFilter) {
			const filterObj =
				typeof subCategoryFilter === "object" &&
				!Array.isArray(subCategoryFilter) &&
				"value" in subCategoryFilter
					? subCategoryFilter
					: { value: subCategoryFilter, operator: "is" };

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
	}, [items, currentCategory, searchQuery, filterValues]);

	const subcategoryOptions = useMemo(() => {
		if (!currentCategory?.subcategories) return [];
		return currentCategory.subcategories.map((sub) => ({
			id: sub.id,
			label: sub.name,
		}));
	}, [currentCategory]);

	const filterGroups: FilterGroup<MockShopItem>[] = useMemo(() => {
		if (subcategoryOptions.length === 0) return [];
		return [
			{
				id: "categoryId",
				label: "Subcategory",
				type: "select",
				icon: ListFilterIcon,
				getItemValue: (item) => item.categoryId,
				options: subcategoryOptions,
			},
		];
	}, [subcategoryOptions]);

	if (!currentCategory && !isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<Button
					variant="ghost"
					className="w-fit"
					onClick={() =>
						navigate({
							to: "/{-$locale}/shop",
							params: { locale },
						})
					}
				>
					<OutlineArrowLeft />
					Back to shop
				</Button>
				<EmptyPage title="Category not found" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-1 flex-col gap-6 px-5 lg:px-0 pb-5">
			<div className="flex items-center gap-4">
				<Button
					variant="ghost"
					size="icon"
					onClick={() =>
						navigate({
							to: "/{-$locale}/shop",
							params: { locale },
						})
					}
				>
					<OutlineArrowLeft />
				</Button>
				<Typography.Heading level={2}>
					{currentCategory?.name || "Category"}
				</Typography.Heading>
			</div>

			<FilterBar
				data={categoryItems}
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

			{isLoading ? (
				<div className="flex items-center justify-center p-12">
					<Typography className="text-muted-foreground">
						Loading items...
					</Typography>
				</div>
			) : categoryItems.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{categoryItems.map((item) => (
						<ShopItemCard key={item.id} item={item} />
					))}
				</div>
			) : (
				<EmptyPage title="No items in this category" />
			)}
		</div>
	);
}
