import type { RequestItem } from "@/components/layout/my-requests/helpers";
import {
	RequestList,
	type RequestListItem,
} from "@/components/layout/my-requests/list";
import {
	type TCommissionRequest,
	type TCommissionRequestResponse,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { TUserResponse } from "@/types/user";
import { TRoles } from "@/types/user/roles";

function createFixtureArtist(index: number): TUserResponse {
	return {
		userId: `00000000-0000-0000-0000-00000000010${index}`,
		username: `artist${index + 1}`,
		displayName:
			["Anna Kim", "Tom Lee", "Sara R.", "Nina Vale", "Chris Moon"][index] ??
			`Artist ${index + 1}`,
		pronouns: null,
		bio: null,
		avatarPath: null,
		accentColor: null,
		isVerified: index % 2 === 0,
		isPremium: false,
		roles: [TRoles.Artist],
		createdAt: "2026-04-08T10:00:00Z",
	};
}

function createFixtureCommission(index: number) {
	return {
		id: `00000000-0000-0000-0000-00000000020${index}`,
		title:
			[
				"Character illustration",
				"Reference sheet",
				"Live2D bust",
				"Scene artwork",
				"Sticker pack",
			][index] ?? `Commission ${index + 1}`,
		description:
			index % 2 === 0
				? "Polished art with soft background."
				: "Updated sheet with expressions and outfit notes.",
		multimedia: [],
	};
}

export const MY_REQUESTS_FIXTURE_RESPONSE: TCommissionRequestResponse = {
	totalElements: 5,
	totalPages: 1,
	size: 10,
	number: 0,
	numberOfElements: 5,
	first: true,
	last: true,
	empty: false,
	sort: {
		empty: false,
		sorted: true,
		unsorted: false,
	},
	pageable: {
		offset: 0,
		paged: true,
		pageNumber: 0,
		pageSize: 10,
		sort: {
			empty: false,
			sorted: true,
			unsorted: false,
		},
		unpaged: false,
	},
	content: [
		{
			id: "00000000-0000-0000-0000-000000000001",
			commissionId: "00000000-0000-0000-0000-000000000201",
			artistId: "00000000-0000-0000-0000-000000000101",
			clientId: "00000000-0000-0000-0000-000000000301",
			status: TCommissionRequestStatus.Pending,
			description:
				"Half-body illustration with simple background and soft lighting.",
			commissionVersion: 2,
			tosAcceptance: {
				tosId: "00000000-0000-0000-0000-000000000401",
				tosVersion: 1,
			},
			multimedia: [],
			createdAt: "2026-04-08T10:00:00Z",
			updatedAt: "2026-04-08T10:10:00Z",
			payment: {
				paymentStatus: TPaymentStatus.Pending,
				updatedAt: "2026-04-08T10:10:00Z",
			},
		},
		{
			id: "00000000-0000-0000-0000-000000000002",
			commissionId: "00000000-0000-0000-0000-000000000202",
			artistId: "00000000-0000-0000-0000-000000000102",
			clientId: "00000000-0000-0000-0000-000000000302",
			status: TCommissionRequestStatus.Accepted,
			description: "Reference update with 3 facial expressions.",
			commissionVersion: 1,
			tosAcceptance: {
				tosId: "00000000-0000-0000-0000-000000000402",
				tosVersion: 2,
			},
			multimedia: [],
			createdAt: "2026-04-07T18:30:00Z",
			updatedAt: "2026-04-07T19:00:00Z",
			payment: {
				paymentStatus: TPaymentStatus.Completed,
				updatedAt: "2026-04-07T19:00:00Z",
			},
		},
		{
			id: "00000000-0000-0000-0000-000000000003",
			commissionId: "00000000-0000-0000-0000-000000000203",
			artistId: "00000000-0000-0000-0000-000000000103",
			clientId: "00000000-0000-0000-0000-000000000303",
			status: TCommissionRequestStatus.In_Progress,
			description: "Bust commission for VTuber profile assets.",
			commissionVersion: 3,
			tosAcceptance: {
				tosId: "00000000-0000-0000-0000-000000000403",
				tosVersion: 1,
			},
			multimedia: [],
			createdAt: "2026-04-06T15:00:00Z",
			updatedAt: "2026-04-07T08:15:00Z",
			payment: {
				paymentStatus: TPaymentStatus.Completed,
				updatedAt: "2026-04-06T15:30:00Z",
			},
		},
		{
			id: "00000000-0000-0000-0000-000000000004",
			commissionId: "00000000-0000-0000-0000-000000000204",
			artistId: "00000000-0000-0000-0000-000000000104",
			clientId: "00000000-0000-0000-0000-000000000304",
			status: TCommissionRequestStatus.Delivered,
			description: "Scene artwork with evening city background.",
			commissionVersion: 4,
			tosAcceptance: {
				tosId: "00000000-0000-0000-0000-000000000404",
				tosVersion: 1,
			},
			multimedia: [],
			createdAt: "2026-04-05T12:00:00Z",
			updatedAt: "2026-04-07T20:45:00Z",
			payment: {
				paymentStatus: TPaymentStatus.Completed,
				updatedAt: "2026-04-05T12:05:00Z",
			},
		},
		{
			id: "00000000-0000-0000-0000-000000000005",
			commissionId: "00000000-0000-0000-0000-000000000205",
			artistId: "00000000-0000-0000-0000-000000000105",
			clientId: "00000000-0000-0000-0000-000000000305",
			status: TCommissionRequestStatus.Cancelled,
			description: "Sticker pack order cancelled by client.",
			commissionVersion: 1,
			tosAcceptance: {
				tosId: "00000000-0000-0000-0000-000000000405",
				tosVersion: 1,
			},
			multimedia: [],
			createdAt: "2026-04-04T09:20:00Z",
			updatedAt: "2026-04-04T10:00:00Z",
			payment: {
				paymentStatus: TPaymentStatus.Failed,
				updatedAt: "2026-04-04T10:00:00Z",
			},
		},
	],
};

export function toRequestListItems(
	requests: TCommissionRequest[],
): RequestListItem[] {
	return requests.map((request, index) => ({
		...(request as RequestItem),
		artist: createFixtureArtist(index),
		commission: createFixtureCommission(index),
	}));
}

export const REQUEST_FIXTURE_ITEMS = toRequestListItems(
	MY_REQUESTS_FIXTURE_RESPONSE.content,
);

export const REQUEST_FIXTURE = (
	<RequestList
		requests={REQUEST_FIXTURE_ITEMS}
		onRequestClick={() => undefined}
	/>
);
