import type {
	FilterValue,
	ManagedFilterValue,
} from "@/components/layout/filter-bar";

export type ManagedFilterEntry = ManagedFilterValue;
export type ManagedFiltersState = Record<string, ManagedFilterEntry>;

export interface MyRequestsPageState {
	page: number;
	selectedRequestId: string | null;
	detailsOpen: boolean;
	searchQuery: string;
	filterState: ManagedFiltersState;
}

export type MyRequestsPageAction =
	| {
			type: "setPage";
			page: number;
	  }
	| {
			type: "setSearchQuery";
			searchQuery: string;
	  }
	| {
			type: "openDetails";
			requestId: string;
	  }
	| {
			type: "setDetailsOpen";
			open: boolean;
	  }
	| {
			type: "clearSelectedRequest";
	  }
	| {
			type: "setFilter";
			groupId: string;
			value: FilterValue;
			operator?: ManagedFilterValue["operator"];
	  }
	| {
			type: "clearAllFilters";
	  };

export const INITIAL_FILTER_STATE: ManagedFiltersState = {
	status: { value: [] },
	payment: { value: [] },
	timeline: { value: [] },
	submittedDate: {
		value: { from: undefined, to: undefined },
		operator: "is between",
	},
};

export const INITIAL_PAGE_STATE: MyRequestsPageState = {
	page: 1,
	selectedRequestId: null,
	detailsOpen: false,
	searchQuery: "",
	filterState: INITIAL_FILTER_STATE,
};

export function myRequestsPageReducer(
	state: MyRequestsPageState,
	action: MyRequestsPageAction,
): MyRequestsPageState {
	switch (action.type) {
		case "setPage":
			return {
				...state,
				page: action.page,
				selectedRequestId: null,
				detailsOpen: false,
			};

		case "setSearchQuery":
			return {
				...state,
				page: 1,
				searchQuery: action.searchQuery,
			};

		case "openDetails":
			return {
				...state,
				selectedRequestId: action.requestId,
				detailsOpen: true,
			};

		case "setDetailsOpen":
			return {
				...state,
				detailsOpen: action.open,
				selectedRequestId: action.open ? state.selectedRequestId : null,
			};

		case "clearSelectedRequest":
			return {
				...state,
				selectedRequestId: null,
				detailsOpen: false,
			};

		case "setFilter":
			return {
				...state,
				page: 1,
				filterState: {
					...state.filterState,
					[action.groupId]: {
						value: action.value,
						operator: action.operator,
					},
				},
			};

		case "clearAllFilters":
			return {
				...state,
				page: 1,
				filterState: INITIAL_FILTER_STATE,
			};

		default:
			return state;
	}
}
