import type { TUserResponse } from "../user";

export interface MockShopItem {
	id: string;
	categoryId: string;
	title: string;
	description: string;
	price: number;
	currencyCode: string;
	originalPrice?: number;
	discountPct?: number;
	coverImage: string;
	images: string[];
	badges: string[]; // e.g. "1 of a kind", "Digital"
	author: TUserResponse;
	salesCount: number;
	rating: number;
	isBookmarked?: boolean;
}
