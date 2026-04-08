// types/pagable.ts
export type TSort = {
	empty: boolean;
	sorted: boolean;
	unsorted: boolean;
};

export type TPageableObject = {
	offset: number;
	paged: boolean;
	pageNumber: number;
	pageSize: number;
	sort: TSort;
	unpaged: boolean;
};

export type TPagination<T> = {
	totalElements: number;
	totalPages: number;
	size: number;
	content: T[];
	number: number;
	numberOfElements: number;
	pageable: TPageableObject;
	sort: TSort;
	first: boolean;
	last: boolean;
	empty: boolean;
};
