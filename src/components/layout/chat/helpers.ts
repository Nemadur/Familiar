import type { TChatConversation, TChatMessage } from "@/api/chat/chat-types";
import {
	CHAT_SIDEBAR_SKELETON_DATE,
	CHAT_SIDEBAR_SKELETON_ROWS,
} from "./constants";

export function createSidebarLayoutConversations(): TChatConversation[] {
	return CHAT_SIDEBAR_SKELETON_ROWS.map((row, index) => ({
		id: `skeleton-${index}`,
		otherParticipant: {
			userId: `skeleton-user-${index}`,
			username: `skeleton-user-${index}`,
			displayName: "Skeleton User",
			avatarPath: null,
		},
		commissionRequestId: null,
		createdAt: CHAT_SIDEBAR_SKELETON_DATE,
		lastMessageAt: CHAT_SIDEBAR_SKELETON_DATE,
		lastMessagePreview: "Skeleton message preview",
		unreadCount: row.unread ? 2 : 0,
	}));
}

export function getConversationUser(conversation: TChatConversation) {
	return {
		userId: conversation.otherParticipant.userId,
		username: conversation.otherParticipant.username,
		displayName: conversation.otherParticipant.displayName,
		avatarPath: conversation.otherParticipant.avatarPath ?? "",
		createdAt: "",
		roles: [],
	};
}

export function getMessageDateLabel(message: TChatMessage) {
	return new Intl.DateTimeFormat(undefined, {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(message.createdAt));
}

export function formatMessageTime(value: string | null | undefined) {
	if (!value) {
		return "";
	}

	return new Intl.DateTimeFormat(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));
}
