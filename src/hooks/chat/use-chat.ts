import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	getChatConversations,
	getChatMessages,
	getChatMessagesSince,
	postChatMessage,
	postConversationDirect,
	postConversationRead,
	postOpenConversationForRequest,
} from "@/api/chat/chat";
import type {
	TChatConversation,
	TChatConversationPage,
	TChatMessage,
	TChatMessagePage,
	TSendChatMessageVariables,
} from "@/api/chat/chat-types";
import { uploadMediaAndGetJobIds } from "@/api/media/media";
import type { TPagableQuery } from "@/types/pagable";

export const chatQueryKeys = {
	all: ["chat"] as const,
	conversationsRoot: () => ["chat", "conversations"] as const,
	conversations: (params: TPagableQuery) =>
		["chat", "conversations", params] as const,
	messagesRoot: (conversationId: string) =>
		["chat", "messages", conversationId] as const,
	messages: (conversationId: string, params: TPagableQuery) =>
		["chat", "messages", conversationId, params] as const,
	messagesSince: (conversationId: string, after: Date) =>
		[
			"chat",
			"messages",
			conversationId,
			"since",
			after.toISOString(),
		] as const,
};

export function useGetChatConversations(params: TPagableQuery) {
	const query = useQuery<TChatConversationPage, Error>({
		queryKey: chatQueryKeys.conversations(params),
		queryFn: () => getChatConversations(params),
	});

	return {
		conversationsData: query.data,
		isConversationsPending: query.isPending,
		conversationsError: query.error,
		...query,
	};
}

export function useGetChatMessages(
	conversationId: string | null | undefined,
	params: TPagableQuery,
) {
	const query = useQuery<TChatMessagePage, Error>({
		queryKey: chatQueryKeys.messages(conversationId ?? "", params),
		queryFn: () => {
			if (!conversationId) {
				throw new Error("conversationId is required");
			}
			return getChatMessages(conversationId, params);
		},
		enabled: Boolean(conversationId),
	});

	return {
		messagesData: query.data,
		isMessagesPending: query.isPending,
		messagesError: query.error,
		...query,
	};
}

export function useGetChatMessagesSince(
	conversationId: string | null | undefined,
	after: Date | null | undefined,
) {
	const query = useQuery<TChatMessagePage, Error>({
		queryKey: chatQueryKeys.messagesSince(
			conversationId ?? "",
			after ?? new Date(0),
		),
		queryFn: () => {
			if (!conversationId || !after) {
				throw new Error("conversationId and after date are required");
			}
			return getChatMessagesSince(conversationId, after);
		},
		enabled: Boolean(conversationId && after),
	});

	return {
		messagesData: query.data,
		isMessagesPending: query.isPending,
		messagesError: query.error,
		...query,
	};
}

export function usePostChatMessage(conversationId: string) {
	const queryClient = useQueryClient();

	return useMutation<TChatMessage, Error, TSendChatMessageVariables>({
		mutationFn: async ({ files = [], jobIds = [], body }) => {
			const uploadedJobIds = await uploadMediaAndGetJobIds(files);
			const nextJobIds = [...jobIds, ...uploadedJobIds];

			return postChatMessage(conversationId, {
				body: body.trim(),
				...(nextJobIds.length ? { jobIds: nextJobIds } : null),
			});
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({
					queryKey: chatQueryKeys.conversationsRoot(),
				}),
				queryClient.invalidateQueries({
					queryKey: chatQueryKeys.messagesRoot(conversationId),
				}),
			]);
		},
	});
}

export function usePostConversationRead() {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: (conversationId) => postConversationRead(conversationId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: chatQueryKeys.conversationsRoot(),
			});
		},
	});
}

export function usePostConversationDirect() {
	const queryClient = useQueryClient();

	return useMutation<TChatConversation, Error, string>({
		mutationFn: (otherUserId) => postConversationDirect(otherUserId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: chatQueryKeys.conversationsRoot(),
			});
		},
	});
}

export function usePostOpenConversationForRequest() {
	const queryClient = useQueryClient();

	return useMutation<TChatConversation, Error, string>({
		mutationFn: (commissionRequestId) =>
			postOpenConversationForRequest(commissionRequestId),
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: chatQueryKeys.conversationsRoot(),
			});
		},
	});
}