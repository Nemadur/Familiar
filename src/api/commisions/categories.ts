import { apiFetch } from "@/lib/fetch";
import type { TCommissionCategory } from "@/types/commissions";

/**
 * Get commission categories
 * @param parentId
 * @returns TCommissionCategory[]
 */
export async function getCommissionCategories(parentId?: string) {
	const query = parentId ? `?parentId=${parentId}` : "";
	return apiFetch<TCommissionCategory[]>(`commission-categories${query}`);
}

export async function getCommissionCategoryById({
	categoryId,
}: {
	categoryId: string;
}) {
	return apiFetch<TCommissionCategory>(`commission-categories/${categoryId}`);
}
