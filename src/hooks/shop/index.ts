import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MOCK_SHOP_ITEMS } from "@/api/shop/mock";
import { useCommissionCategories } from "@/hooks/use-commisions";
import type { MockShopItem } from "@/types/shop";

export function useShopItems(categoryId?: string) {
	const { data: categories } = useCommissionCategories();

	const itemsWithRealCategories = useMemo(() => {
		if (!categories || categories.length === 0) return MOCK_SHOP_ITEMS;

		return MOCK_SHOP_ITEMS.map((item) => {
			// Extract the number from "c1", "c2", etc.
			const cIndex = parseInt(item.categoryId.replace("c", ""), 10) - 1;
			// Default to the matching index, or fallback to the first category if out of bounds
			const realCategoryId = categories[cIndex]?.id || categories[0]?.id;

			return {
				...item,
				categoryId: realCategoryId || item.categoryId,
			};
		});
	}, [categories]);

	return useQuery<MockShopItem[]>({
		queryKey: ["shop-items", categoryId, categories?.length],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));
			if (categoryId) {
				return itemsWithRealCategories.filter(
					(item) => item.categoryId === categoryId,
				);
			}
			return itemsWithRealCategories;
		},
	});
}

export function useShopItem(id: string) {
	const { data: items } = useShopItems();
	
	return useQuery<MockShopItem | undefined>({
		queryKey: ["shop-item", id, items?.length],
		queryFn: async () => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return items?.find((item) => item.id === id) || MOCK_SHOP_ITEMS.find((item) => item.id === id);
		},
		enabled: !!id,
	});
}
