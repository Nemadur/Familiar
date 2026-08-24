import { apiFetch } from "@/lib/fetch";
import type { TPagableQuery } from "@/types/pagable";

import type {
	TChatConversation,
	TChatConversationPage,
	TChatMessage,
	TChatMessagePage,
	TSendChatMessageRequest,
} from "./chat-types";

export async function getChatConversations(params: TPagableQuery) {
	return apiFetch<TChatConversationPage>("chat/conversations", {
		params,
	});
}

export async function getChatMessages(
	conversationId: string,
	params: TPagableQuery,
) {
	return apiFetch<TChatMessagePage>(
		`chat/conversations/${conversationId}/messages`,
		{
			params,
		},
	);
}

export function postChatMessage(
	conversationId: string,
	data: TSendChatMessageRequest,
) {
	return apiFetch<TChatMessage>(
		`chat/conversations/${conversationId}/messages`,
		{
			method: "POST",
			body: JSON.stringify({
				body: data.body,
				...(data.jobIds?.length ? { jobIds: data.jobIds } : null),
			}),
		},
	);
}

export async function getChatMessagesSince(
	conversationId: string,
	after: Date,
) {
	return apiFetch<TChatMessagePage>(
		`chat/conversations/${conversationId}/messages/since`,
		{
			params: {
				after: after.toISOString(),
			},
		},
	);
}

export async function postConversationRead(conversationId: string) {
	return apiFetch<void>(`chat/conversations/${conversationId}/read`, {
		method: "POST",
	});
}

export async function postConversationDirect(otherUserId: string) {
	return apiFetch<TChatConversation>("chat/conversations/direct", {
		method: "POST",
		body: JSON.stringify({ otherUserId }),
	});
}

export async function postOpenConversationForRequest(
	commissionRequestId: string,
) {
	return apiFetch<TChatConversation>(
		`chat/conversations/for-request/${commissionRequestId}`,
		{
			method: "POST",
		},
	);
}