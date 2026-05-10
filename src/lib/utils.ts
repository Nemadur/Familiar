import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import Cookies from "js-cookie";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function numberFormat(num: number | undefined | null) {
	if (num === undefined || num === null) return "0";
	return num.toLocaleString("en-US");
}

export function slugify(text: string) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w\-]+/g, "") // Remove all non-word chars
		.replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export function setCookie(name: string, value: string, maxAge: number) {
	if (typeof document === "undefined") return;
	Cookies.set(name, value, {
		expires: maxAge / (60 * 60 * 24), // Convert seconds to days
		path: "/",
	});
}

export const dateFormat = (date: Date) =>
	date.toLocaleDateString("en-US", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});

export type StaticListItem<TPrefix extends string = string> = {
	id: `${TPrefix}-${number}`;
	index: number;
};

export function createStaticList<TPrefix extends string>(
	prefix: TPrefix,
	length: number,
): StaticListItem<TPrefix>[] {
	return Array.from({ length }, (_, index) => ({
		id: `${prefix}-${index + 1}` as `${TPrefix}-${number}`,
		index,
	}));
}
