import type { TPagination } from "@/types/pagable";

export type TChatParticipant = {
	userId: string;
	username: string;
	displayName: string;
	avatarPath: string | null;
};

export type TChatConversation = {
	id: string;
	otherParticipant: TChatParticipant;
	commissionRequestId: string | null;
	createdAt: string;
	lastMessageAt: string | null;
	lastMessagePreview: string | null;
	unreadCount: number;
};

export type TChatMessageAttachment = {
	position: number;
	thumbnailId?: string;
	thumbnailID?: string;
	thumbnailUrl: string;
	fullSizeId: string;
	fullSizeUrl: string;
};


export type TChatMessage = {
	id: string;
	conversationId: string;
	senderId: string;
	body: string;
	createdAt: string;
	isMine: boolean;
	attachments?: TChatMessageAttachment[];
};

export type TSendChatMessageRequest = {
	body: string;
	jobIds?: string[];
};

export type TSendChatMessageVariables = TSendChatMessageRequest & {
	files?: File[];
};

export type TOpenDirectConversationRequest = {
	otherUserId: string;
};

export type TChatConversationPage = TPagination<TChatConversation>;
export type TChatMessagePage = TPagination<TChatMessage>;
