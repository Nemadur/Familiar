import { ScrollShadow, Typography } from "@heroui/react";
import {
	createFileRoute,
	Outlet,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
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
import { MOCK_CATEGORIES } from "mock/shop";
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
import { useCommissionCategories } from "@/hooks/commissions/use-commissions";
import i18n, { stripLocaleFromPathname } from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";
import type { MockShopItem } from "@/types/shop";

export const Route = createFileRoute("/{-$locale}/_main/shop")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.shop.title"),
			description: i18n.t("seo.shop.description"),
			image: `https://og-image.vercel.app/${encodeURIComponent(i18n.t(`seo.shop.title`))}.png`,
			keywords: i18n.t("seo.shop.keywords"),
			pathname: "/shop",
			locale: params.locale,
		}),
		links: getSeoLinks("/shop", params.locale),
	}),
	component: ShopPage,
});

function ShopPage() {
	const { locale } = Route.useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const isRootShop = stripLocaleFromPathname(location.pathname) === "/shop";

	const { data: backendCategories } = useCommissionCategories();
	const { data: items, isLoading: isLoadingItems } = useShopItems();

	const categories = useMemo(() => {
		if (backendCategories && backendCategories.length > 0) {
			return backendCategories;
		}
		return MOCK_CATEGORIES as any[];
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
		<div className="flex h-full flex-1 flex-col gap-6 pb-5">
			{isRootShop && (
				<>
					<div className="flex items-center justify-between px-4 lg:px-0">
						<Typography.Heading level={2}>Shop</Typography.Heading>
					</div>

					<FilterBar
						data={filteredItems}
						groups={filterGroups}
						values={filterValues}
						className="px-5 lg:px-0"
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
										className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full overflow-hidden"
									>
										<div className="px-4 lg:px-0 shrink-0 w-full lg:w-[260px]">
											<CategoryCard
												title={group.category.name}
												icon={group.icon}
												onSeeAll={() => {
													// Generate a URL-friendly slug from the category name
													const slug = group.category.name
														.toLowerCase()
														.replace(/[^a-z0-9]+/g, "-")
														.replace(/(^-|-$)/g, "");
													navigate({
														to: "/{-$locale}/shop/category/$slug",
														params: {
															locale,
															slug,
														},
													});
												}}
											/>
										</div>

										<div className="flex-1 min-w-0">
											<div className="w-full flex overflow-x-auto sm:grid sm:grid-cols-3 gap-3 pb-4 px-4 lg:px-0 lg:pb-0 snap-x snap-mandatory scrollbar-hide">
												{group.items.slice(0, 3).map((item) => (
													<div
														key={item.id}
														className="w-[85vw] sm:w-auto shrink-0 snap-center"
													>
														<ShopItemCard item={item} />
													</div>
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
				</>
			)}
			<Outlet />
		</div>
	);
}
